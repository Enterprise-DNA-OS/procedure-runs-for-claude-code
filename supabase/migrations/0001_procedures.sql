create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table procedures (
 id uuid primary key default gen_random_uuid(), code text not null, version integer not null check(version>0),
 name text not null, owner text not null, steps jsonb not null check(jsonb_typeof(steps)='array' and jsonb_array_length(steps)>0),
 approved_by text not null, approval_evidence text not null, review_due date not null, security_evidence text not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(code,version),
 check(length(trim(owner))>0 and length(trim(name))>0 and length(trim(approval_evidence))>0),check(lower(owner)<>lower(approved_by))
);
create table runs (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, procedure_id uuid not null references procedures(id),
 owner text not null, started_at timestamptz not null default now(),due_on date not null,
 status text not null default 'active' check(status in ('active','complete')),completed_at timestamptz,
 purpose text not null,retain_until date not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(length(trim(owner))>0 and length(trim(purpose))>0),check((status='complete')=(completed_at is not null))
);
create table tasks (
 id uuid primary key default gen_random_uuid(),run_id uuid not null references runs(id),position integer not null check(position>0),
 name text not null,owner text not null,due_on date not null,
 state text not null default 'waiting' check(state in ('waiting','blocked','done','waived')),
 evidence text not null default '',block_reason text not null default '',completed_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(run_id,position),
 check(state not in ('done','waived') or (length(trim(evidence))>0 and completed_at is not null)),
 check(state<>'blocked' or length(trim(block_reason))>0)
);
create table events (
 id uuid primary key default gen_random_uuid(),run_id uuid references runs(id),task_id uuid references tasks(id),actor text not null,
 action text not null,detail jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(),source text not null,sha256 text not null,exported_at timestamptz not null,
 actor text not null,raw_csv text not null,row_count integer not null,purpose text not null default '',retain_until date,security_evidence text not null default '',
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(source,sha256)
);
create table source_runs (
 id uuid primary key default gen_random_uuid(),import_id uuid not null references imports(id),source_id text not null,name text not null,
 blueprint_id text not null,blueprint_version text not null,owner text not null,status text not null,total_tasks integer not null,
 completed_tasks integer not null,modified_at timestamptz,completed_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(import_id,source_id)
);
create table source_tasks (
 id uuid primary key default gen_random_uuid(),run_id uuid not null references source_runs(id),source_id text not null,name text not null,
 step_alias text not null,visibility text not null check(visibility in ('shown','hidden')),owner text not null,
 shown_at timestamptz,due_at timestamptz,completed_at timestamptz,completed_by text not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(run_id,source_id)
);
create index tasks_run_position on tasks(run_id,position);
create index events_run_time on events(run_id,created_at);
create view v_task_desk as select t.id,t.run_id,r.code as run,r.name as run_name,t.position,t.name,t.owner,t.due_on,t.state,t.evidence,t.block_reason,t.completed_at,
 case when t.state in ('done','waived','blocked') then t.state
 when exists(select 1 from tasks prior where prior.run_id=t.run_id and prior.position<t.position and prior.state not in ('done','waived')) then 'waiting'
 else 'ready' end as readiness,
 case when t.state not in ('done','waived') then greatest(0,current_date-t.due_on) else 0 end overdue_days
 from tasks t join runs r on r.id=t.run_id;
create view v_run_desk as select r.id,r.code,r.name,r.owner,p.code as procedure,p.version,r.status,r.due_on,
 count(t.id)::integer task_count,count(t.id) filter(where t.state='done')::integer done,
 count(t.id) filter(where t.state='waived')::integer waived,count(t.id) filter(where t.state='blocked')::integer blocked,
 count(t.id) filter(where t.state not in ('done','waived') and t.due_on<current_date)::integer overdue,
 r.retain_until,r.purpose,r.started_at,r.completed_at,
 greatest(r.updated_at,coalesce(max(t.updated_at),r.updated_at)) last_activity
 from runs r join procedures p on p.id=r.procedure_id left join tasks t on t.run_id=r.id group by r.id,p.id;
create view v_handover as select run,position,name,owner,readiness,due_on,overdue_days,block_reason from v_task_desk where readiness in ('ready','blocked') order by due_on,run,position;
create view v_attention as
 select 'overdue-task' reason,run as code,name,owner,due_on::text as due from v_task_desk where overdue_days>0
 union all select 'blocked-step',run,name,owner,due_on::text from v_task_desk where state='blocked'
 union all select 'quiet-run',code,name,owner,last_activity::date::text from v_run_desk where status='active' and last_activity<now()-interval '7 days'
 union all select 'procedure-review',code,name,owner,review_due::text from procedures where review_due<current_date
 union all select 'retention-review',code,name,owner,retain_until::text from runs where retain_until<current_date;
create view v_owner_load as select owner,count(*)::integer open_steps,count(*) filter(where readiness='ready')::integer ready,
 count(*) filter(where state='blocked')::integer blocked,count(*) filter(where overdue_days>0)::integer overdue
 from v_task_desk where state not in ('done','waived') group by owner;
create view v_latest_source_runs as select * from (
 select sr.*,i.source,i.exported_at,row_number() over(partition by i.source,sr.source_id order by i.exported_at desc,i.created_at desc,i.id) as rn
 from source_runs sr join imports i on i.id=sr.import_id
) a where rn=1;
create view v_import_review as select r.source,r.source_id,r.name,r.owner,r.status,r.total_tasks,r.completed_tasks,
 count(t.id) filter(where t.visibility='hidden')::integer hidden,
 count(t.id) filter(where t.visibility='shown' and t.completed_at is null and t.due_at<now())::integer overdue,
 count(t.id) filter(where t.visibility='shown' and t.owner='')::integer unassigned,r.exported_at
 from v_latest_source_runs r left join source_tasks t on t.run_id=r.id
 group by r.id,r.source,r.source_id,r.name,r.owner,r.status,r.total_tasks,r.completed_tasks,r.exported_at;
create function immutable_record() returns trigger language plpgsql as $$ begin raise exception 'Immutable evidence: append a new record'; end $$;
create trigger immutable before update or delete on procedures for each row execute function immutable_record();
create trigger immutable before update or delete on events for each row execute function immutable_record();
create trigger immutable before update or delete on source_runs for each row execute function immutable_record();
create trigger immutable before update or delete on source_tasks for each row execute function immutable_record();
do $$ declare t text; begin foreach t in array array['procedures','runs','tasks','events','imports','source_runs','source_tasks'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);execute format('revoke all on %I from public',t);
 end loop;end $$;
revoke all on v_task_desk,v_run_desk,v_handover,v_attention,v_owner_load,v_latest_source_runs,v_import_review from public;
