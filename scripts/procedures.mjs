#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table as textTable} from './lib/format.mjs';
import {page,table as htmlTable,writeOut} from './lib/render.mjs';

export const spec={
 help:[],procedures:[],runs:[],tasks:['run'],'handover':[],'owner-load':[],attention:[],compliance:[],
 'weekly-review':[],history:['run'],audit:[],imports:[],'import-review':[], 'source-history':['source','process'],'source-record':['source','process'],
 'add-procedure':['file','actor'],launch:['procedure','code','name','owner','due','purpose','retain-until','actor'],
 complete:['run','step','evidence','actor'],waive:['run','step','evidence','actor'],block:['run','step','reason','actor'],
 unblock:['run','step','evidence','actor'],assign:['run','step','owner','evidence','actor'],log:['run','note','actor'],
 'review-retention':['run','retain-until','purpose','evidence','actor'],
 'review-import':['import','retain-until','purpose','security-evidence','actor'],
 import:['file','source','exported-at','actor','dry-run'],export:['out'],'draft-handover':['run']
};
const writable=new Set(['add-procedure','launch','complete','waive','block','unblock','assign','log','review-retention','review-import','import']);
const required=(o,k)=>{const v=o[k];if(typeof v!=='string'||!v.trim())throw Error(`Required --${k}=value`);return v.trim();};
const code=v=>{if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v))throw Error('Code must use letters, numbers, hyphens or underscores');return v.toUpperCase();};
const date=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`Invalid date: ${v}`);return v;};
const int=v=>{if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v)))throw Error(`Expected nonnegative integer: ${v}`);return Number(v);};
function stamp(v,{vendor=false}={}){
 if(vendor&&(!v||/^nan|null$/i.test(v)))return null;
 let s=String(v);if(vendor&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s))s=s.replace(' ','T')+'Z';
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(s))throw Error(`Invalid timestamp with timezone: ${v}`);
 date(s.slice(0,10));if(!Number.isFinite(Date.parse(s)))throw Error(`Invalid timestamp: ${v}`);return new Date(s).toISOString();
}
async function match(db,t,selector,extra='',params=[]){
 const rows=await db.query(`select * from ${t} ${extra?`where ${extra}`:''}`,params);const s=String(selector).toLowerCase();
 const exact=rows.filter(r=>r.id.toLowerCase()===s||String(r.code||'').toLowerCase()===s);
 const hits=exact.length?exact:rows.filter(r=>r.id.toLowerCase().startsWith(s)||String(r.name||'').toLowerCase().includes(s));
 if(hits.length!==1)throw Error(`${hits.length?'Ambiguous':'No match'} ${t}: ${selector}\n${(hits.length?hits:rows).map(r=>`${r.id} ${r.code||''} ${r.name||''}`).join('\n')}`);
 return hits[0];
}
async function event(db,o,action,detail,run=null,task=null){await db.query('insert into events(actor,action,detail,run_id,task_id) values($1,$2,$3,$4,$5)',[required(o,'actor'),action,JSON.stringify(detail),run,task]);}
const counts=async db=>Object.fromEntries(await Promise.all(['procedures','runs','tasks','events','imports','source_runs','source_tasks'].map(async t=>[t,Number((await db.query(`select count(*) n from ${t}`))[0].n)])));

export async function dispatch(db,command,o={},args=[]){
 if(!(command in spec))throw Error(`Unknown command ${command}. Run help.`);
 for(const k of Object.keys(o))if(!spec[command].includes(k))throw Error(`Unknown option --${k} for ${command}`);
 if(command!=='import'&&args.length)throw Error('Unexpected positional arguments');
 const write=writable.has(command);if(write)required(o,'actor');
 if(write)await db.exec('BEGIN');
 try{const result=await execute(db,command,o,args);if(write)await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;}
 catch(e){if(write)await db.exec('ROLLBACK');throw e;}
}
async function execute(db,cmd,o,args){
 const query=(s,p=[])=>db.query(s,p);
 const read={procedures:'select id,code,version,name,owner,approved_by,review_due from procedures order by code,version',runs:'select * from v_run_desk order by code',handover:'select * from v_handover','owner-load':'select * from v_owner_load order by overdue desc,owner',attention:'select * from v_attention order by due,code,reason',audit:'select * from events order by created_at,id',imports:'select id,source,sha256,exported_at,row_count,purpose,retain_until from imports order by created_at','import-review':'select * from v_import_review order by source,source_id'};
 if(cmd in read)return query(read[cmd]);
 if(cmd==='help')return {commands:spec,usage:'npm run procedures -- COMMAND --key=value [--json]',writes:'Every database write needs --actor. Import supports --dry-run.'};
 if(cmd==='tasks'){if(!o.run)return query('select * from v_task_desk order by run,position');const r=await match(db,'runs',o.run);return query('select * from v_task_desk where run_id=$1 order by position',[r.id]);}
 if(cmd==='history'){const r=await match(db,'runs',required(o,'run'));return {run:r,tasks:await query('select * from tasks where run_id=$1 order by position',[r.id]),events:await query('select * from events where run_id=$1 order by created_at,id',[r.id])};}
 if(cmd==='source-record'){const rs=await query('select * from v_latest_source_runs where source=$1 and source_id=$2',[required(o,'source'),required(o,'process')]);if(rs.length!==1)throw Error('Source process not found');const r=rs[0];const [batch]=await query('select raw_csv from imports where id=$1',[r.import_id]);return {run:r,tasks:await query('select * from source_tasks where run_id=$1 order by source_id',[r.id]),fields_and_comments:parseCsv(batch.raw_csv).filter(x=>x.process_id===r.source_id&&x.type!=='process_task')};}
 if(cmd==='source-history')return query(`select sr.*,i.source,i.exported_at from source_runs sr join imports i on i.id=sr.import_id where i.source=$1 and sr.source_id=$2 order by i.exported_at`,[required(o,'source'),required(o,'process')]);
 if(cmd==='compliance')return query(`select 'RETENTION-01' rule,code record,'Review the recorded retention purpose and date' finding,'https://www.privacy.org.nz/privacy-principles/9/' source from runs where retain_until<current_date
 union all select 'ACCESS-02',code||' v'||version,'Record access safeguards evidence','https://www.privacy.org.nz/privacy-principles/5/' from procedures where security_evidence=''
 union all select 'REVIEW-03',code||' v'||version,'Procedure review is overdue (internal policy)','docs/compliance.md#internal-controls' from procedures where review_due<current_date
 union all select 'WAIVER-04',r.code,'Review a waived step: '||t.name,'docs/compliance.md#internal-controls' from tasks t join runs r on r.id=t.run_id where t.state='waived'
 union all select 'IMPORT-05',source||':'||id,'Imported personal records need purpose, retention and access review','https://www.privacy.org.nz/privacy-principles/9/' from imports where purpose='' or retain_until is null or retain_until<current_date or security_evidence=''`);
 if(cmd==='weekly-review')return {handover:await execute(db,'handover',{},[]),attention:await execute(db,'attention',{},[]),owners:await execute(db,'owner-load',{},[])};
 if(cmd==='add-procedure'){
  const d=JSON.parse(fs.readFileSync(required(o,'file'),'utf8'));
  for(const k of ['code','name','owner','approved_by','approval_evidence','security_evidence','review_due'])required(d,k);
  d.code=code(d.code);d.version=int(d.version);if(d.version<1)throw Error('Version must be positive');date(d.review_due);
  if(!Array.isArray(d.steps)||!d.steps.length)throw Error('Procedure needs steps');
  d.steps=d.steps.map(s=>({name:required(s,'name'),owner:required(s,'owner'),days:int(s.days)}));
  if(d.steps.some((s,i)=>i&&s.days<d.steps[i-1].days))throw Error('Step deadlines must be nondecreasing');
  const [p]=await query('insert into procedures(code,version,name,owner,steps,approved_by,approval_evidence,review_due,security_evidence) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *',[d.code,d.version,d.name,d.owner,JSON.stringify(d.steps),d.approved_by,d.approval_evidence,d.review_due,d.security_evidence]);
  await event(db,o,cmd,{procedure_id:p.id,code:p.code,version:p.version});return p;
 }
 if(cmd==='launch'){
  const s=required(o,'procedure');const all=await query('select distinct on (code) * from procedures order by code,version desc');
  const exact=all.filter(p=>p.code.toLowerCase()===s.toLowerCase()||p.id===s);const hits=exact.length?exact:all.filter(p=>p.name.toLowerCase().includes(s.toLowerCase())||p.id.startsWith(s));
  if(hits.length!==1)throw Error(`Ambiguous or missing procedure: ${s}\n${(hits.length?hits:all).map(x=>`${x.id} ${x.code} ${x.name}`).join('\n')}`);
  const p=hits[0];const today=new Date().toISOString().slice(0,10);if(p.review_due<today)throw Error('Procedure review overdue: add an approved new version');
  const due=date(required(o,'due'));if(due<today)throw Error('Run due date is in the past');
  const retention=date(required(o,'retain-until'));if(retention<due)throw Error('Retention date must be on or after run due date');
  const startDue=new Date(`${today}T00:00:00Z`);startDue.setUTCDate(startDue.getUTCDate()+Math.max(...p.steps.map(s=>s.days)));
  if(startDue.toISOString().slice(0,10)>due)throw Error('Run due date precedes a step deadline');
  const [r]=await query('insert into runs(code,name,procedure_id,owner,due_on,purpose,retain_until) values($1,$2,$3,$4,$5,$6,$7) returning *',[code(required(o,'code')),required(o,'name'),p.id,required(o,'owner'),due,required(o,'purpose'),retention]);
  for(let i=0;i<p.steps.length;i++){const s=p.steps[i];await query('insert into tasks(run_id,position,name,owner,due_on) values($1,$2,$3,$4,current_date+$5::integer)',[r.id,i+1,s.name,s.owner,s.days]);}
  await event(db,o,cmd,{procedure:p.code,version:p.version},r.id);return r;
 }
 if(['complete','waive','block','unblock','assign'].includes(cmd)){
  const r=await match(db,'runs',required(o,'run'));await query('select id from runs where id=$1 for update',[r.id]);
  const selector=required(o,'step');let t;
  if(/^\d+$/.test(selector)) [t]=await query('select * from tasks where run_id=$1 and position=$2',[r.id,Number(selector)]);
  else t=await match(db,'tasks',selector,'run_id=$1',[r.id]);
  if(!t)throw Error('Step not found');if(['done','waived'].includes(t.state))throw Error('Step already resolved; evidence stays intact');
  const evidence=['complete','waive','unblock','assign'].includes(cmd)?required(o,'evidence'):'';
  if(cmd==='complete'||cmd==='waive'){
   if(t.state==='blocked')throw Error('Unblock the step before resolving it');
   if((await query("select id from tasks where run_id=$1 and position<$2 and state not in ('done','waived')",[r.id,t.position])).length)throw Error('Earlier steps are unresolved');
   await query('update tasks set state=$2,evidence=$3,completed_at=now() where id=$1',[t.id,cmd==='complete'?'done':'waived',evidence]);
   if(!(await query("select id from tasks where run_id=$1 and state not in ('done','waived')",[r.id])).length)await query("update runs set status='complete',completed_at=now() where id=$1",[r.id]);
  }else if(cmd==='block'){
   if(t.state==='blocked')throw Error('Step already blocked');await query("update tasks set state='blocked',block_reason=$2 where id=$1",[t.id,required(o,'reason')]);
  }else if(cmd==='unblock'){
   if(t.state!=='blocked')throw Error('Step is not blocked');await query("update tasks set state='waiting',block_reason='' where id=$1",[t.id]);
  }else await query('update tasks set owner=$2 where id=$1',[t.id,required(o,'owner')]);
  await event(db,o,cmd,{evidence,reason:o.reason||'',previous_owner:t.owner,owner:o.owner||t.owner},r.id,t.id);return (await query('select * from v_task_desk where id=$1',[t.id]))[0];
 }
 if(cmd==='log'){const r=await match(db,'runs',required(o,'run'));await event(db,o,cmd,{note:required(o,'note')},r.id);await query('update runs set updated_at=now() where id=$1',[r.id]);return {logged:true,run:r.code};}
 if(cmd==='review-retention'){
  const r=await match(db,'runs',required(o,'run'));const until=date(required(o,'retain-until'));if(until<new Date().toISOString().slice(0,10))throw Error('Retention review date is in the past');
  await query('update runs set retain_until=$2,purpose=$3 where id=$1',[r.id,until,required(o,'purpose')]);await event(db,o,cmd,{until,evidence:required(o,'evidence'),previous:r.retain_until},r.id);return {run:r.code,retain_until:until};
 }
 if(cmd==='review-import'){
  const i=await match(db,'imports',required(o,'import'));const until=date(required(o,'retain-until'));if(until<new Date().toISOString().slice(0,10))throw Error('Retention review date is in the past');
  await query('update imports set purpose=$2,retain_until=$3,security_evidence=$4 where id=$1',[i.id,required(o,'purpose'),until,required(o,'security-evidence')]);await event(db,o,cmd,{import_id:i.id,until});return {import_id:i.id,reviewed:true};
 }
 if(cmd==='import'){
  if(args.length!==1||args[0]!=='tallyfy')throw Error('Use import tallyfy');return importTallyfy(db,o);
 }
 if(cmd==='export'){
  const out=path.resolve(required(o,'out'));const data={format:'procedure-runs-v1',exported_at:new Date().toISOString()};
  await db.exec('BEGIN READ ONLY');try{for(const t of ['procedures','runs','tasks','events','imports','source_runs','source_tasks'])data[t]=await query(`select * from ${t} order by id`);}finally{await db.exec('ROLLBACK');}
  fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});return {file:out,counts:await counts(db)};
 }
 if(cmd==='draft-handover'){
  const h=await execute(db,'history',o,[]);const html=page({title:'Procedure handover draft',subtitle:h.run.name,sections:[{title:'Run',html:htmlTable([h.run],['code','name','owner','status','due_on'])},{title:'Steps and evidence',html:htmlTable(h.tasks,['position','name','owner','state','evidence','block_reason'])},{title:'Recorded actions',html:htmlTable(h.events,['actor','action','detail','created_at'])}]});
  return {file:writeOut('drafts',`${h.run.code}-${randomUUID()}`,html),sent:false};
 }
 throw Error(`Unimplemented command ${cmd}`);
}

async function importTallyfy(db,o){
 const source=required(o,'source'),exported=stamp(required(o,'exported-at'));if(Date.parse(exported)>Date.now())throw Error('Export timestamp cannot be in the future');
 const raw=fs.readFileSync(required(o,'file'),'utf8');const rows=parseCsv(raw);if(!rows.length)throw Error('Empty export');
 const sha=createHash('sha256').update(raw).digest('hex');const existing=await db.query('select id from imports where source=$1 and sha256=$2',[source,sha]);
 if(existing.length)return {unchanged:true,import_id:existing[0].id,dry_run:!!o['dry-run']};
 const cols=['type','process_id','process_name','blueprint_id','blueprint_version','process_owner','process_status','total_tasks_in_process','tasks_completed','process_task_id','process_task_name','process_task_status','completed_on','due_by','assigned_or_shown_on','process_last_modified','process_completed_at'];
 for(const k of cols)if(!(k in rows[0]))throw Error(`Missing vendor column ${k}`);
 const groups=new Map();for(const row of rows){
  if(!['process_task','process_task_data','process_task_comment','kick_off_task'].includes(row.type))throw Error(`Unknown row type ${row.type}`);
  if(!row.process_id||!row.process_name||!row.blueprint_id)throw Error('Missing process identity');
  if(!groups.has(row.process_id))groups.set(row.process_id,[]);groups.get(row.process_id).push(row);
 }
 const prepared=[];for(const [id,rs] of groups){
  const r=rs[0];const stable=['process_name','blueprint_id','blueprint_version','process_owner','process_status','total_tasks_in_process','tasks_completed','process_last_modified','process_completed_at'];
  if(rs.some(x=>stable.some(k=>x[k]!==r[k])))throw Error(`Conflicting process metadata ${id}`);
  if(!['active','problem','complete','archived'].includes(r.process_status))throw Error(`Unknown process status ${r.process_status}`);
  const ts=rs.filter(x=>x.type==='process_task');const ids=new Set(ts.map(t=>t.process_task_id));
  if(ids.size!==ts.length||ids.has(''))throw Error(`Duplicate or missing task identity ${id}`);
  const total=int(r.total_tasks_in_process),done=int(r.tasks_completed);
  if(total!==ts.length)throw Error(`Incomplete export ${id}: expected ${total} tasks, found ${ts.length}`);
  for(const x of rs)if(x.type!=='kick_off_task'&&!ids.has(x.process_task_id))throw Error(`Orphan field or comment in ${id}`);
  const tasks=ts.map(t=>{
   if(!['shown','hidden'].includes(t.process_task_status))throw Error(`Unknown task visibility ${t.process_task_status}`);
   if(!t.process_task_name)throw Error('Missing task name');
   const shown=stamp(t.assigned_or_shown_on,{vendor:true}),due=stamp(t.due_by,{vendor:true}),completed=stamp(t.completed_on,{vendor:true});
   if(completed&&shown&&completed<shown)throw Error('Task completion precedes assignment');
   if(completed&&completed>exported)throw Error('Task completion is after export');
   return {...t,shown,due,completed};
  });
  if(done!==tasks.filter(t=>t.completed).length)throw Error(`Completed task count mismatch ${id}`);
  const modified=stamp(r.process_last_modified,{vendor:true}),completed=stamp(r.process_completed_at,{vendor:true});
  if((modified&&modified>exported)||(completed&&completed>exported))throw Error('Source dates are after export');
  if(r.process_status==='complete'&&!completed)throw Error('Complete source run has no completion timestamp');
  const latest=await db.query('select exported_at from v_latest_source_runs where source=$1 and source_id=$2',[source,id]);
  if(latest.length&&new Date(latest[0].exported_at).toISOString()>=exported)throw Error('Conflicting or older snapshot; use a later export time');
  prepared.push({r,tasks,total,done,modified,completed});
 }
 const [batch]=await db.query('insert into imports(source,sha256,exported_at,actor,raw_csv,row_count) values($1,$2,$3,$4,$5,$6) returning id',[source,sha,exported,required(o,'actor'),raw,rows.length]);
 let n=0;for(const {r,tasks,total,done,modified,completed} of prepared){
  const [run]=await db.query('insert into source_runs(import_id,source_id,name,blueprint_id,blueprint_version,owner,status,total_tasks,completed_tasks,modified_at,completed_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id',[batch.id,r.process_id,r.process_name,r.blueprint_id,r.blueprint_version,r.process_owner,r.process_status,total,done,modified,completed]);
  for(const t of tasks){await db.query('insert into source_tasks(run_id,source_id,name,step_alias,visibility,owner,shown_at,due_at,completed_at,completed_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[run.id,t.process_task_id,t.process_task_name,t.process_task_alias||'',t.process_task_status,[t.user_assigned,t.guest_assigned].filter(Boolean).join(', '),t.shown,t.due,t.completed,t.completed_by||'']);n++;}
 }
 await event(db,o,'import',{import_id:batch.id,source,rows:rows.length,runs:prepared.length,tasks:n});
 return {import_id:batch.id,source,rows:rows.length,runs:prepared.length,tasks:n,dry_run:!!o['dry-run'],note:'Source evidence preserved separately. Review controls and author procedure steps before launching local work.'};
}

export function parseArgs(argv){const positional=[],options={};let json=false;for(const a of argv){if(a==='--json'){json=true;continue;}if(a.startsWith('--')){const [k,...v]=a.slice(2).split('=');if(k in options)throw Error(`Repeated option --${k}`);options[k]=v.length?v.join('='):true;}else positional.push(a);}return {command:positional.shift()||'help',args:positional,options,json};}
function format(result){if(Array.isArray(result)){if(!result.length)return '(none)';const cols=Object.keys(result[0]).filter(k=>!['id','run_id','procedure_id','rn'].includes(k));return textTable(result,cols.map(k=>({key:k,label:k.replaceAll('_',' '),format:v=>v instanceof Date?v.toISOString():typeof v==='object'?JSON.stringify(v):String(v??'')})));}if(result&&typeof result==='object')return Object.entries(result).map(([k,v])=>Array.isArray(v)?`${k}\n${format(v)}`:`${k}: ${typeof v==='object'?JSON.stringify(v):v}`).join('\n');return String(result);}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{const a=parseArgs(process.argv.slice(2));db=await getDb();const r=await dispatch(db,a.command,a.options,a.args);console.log(a.json?JSON.stringify(r,null,2):format(r));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
