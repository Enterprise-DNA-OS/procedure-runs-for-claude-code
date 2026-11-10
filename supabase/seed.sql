do $$ declare p uuid; q uuid; r uuid; t uuid; begin
 if exists(select 1 from procedures where code='MONTH-END') then return; end if;
 insert into procedures(code,version,name,owner,steps,approved_by,approval_evidence,review_due,security_evidence) values
 ('MONTH-END',1,'Month-end evidence pack','Ana Lee','[{"name":"Collect ledger evidence","owner":"Ana Lee","days":0},{"name":"Reconcile review pack","owner":"Ben Patel","days":1},{"name":"Record independent sign-off","owner":"Cara Wilson","days":2}]','Cara Wilson','Demo review minute ME-01',current_date+30,'Demo access review SEC-01') returning id into p;
 insert into procedures(code,version,name,owner,steps,approved_by,approval_evidence,review_due,security_evidence) values
 ('CLIENT-FILE',1,'Client file handover','Ben Patel','[{"name":"Check supplied records","owner":"Ben Patel","days":0},{"name":"Record consent evidence","owner":"Ana Lee","days":1},{"name":"Prepare handover note","owner":"Cara Wilson","days":2}]','Cara Wilson','Demo control review CF-01',current_date-3,'') returning id into q;
 insert into runs(code,name,procedure_id,owner,started_at,due_on,purpose,retain_until,created_at,updated_at) values
 ('RUN-101','October close (demo)',p,'Ana Lee',now()-interval '10 days',current_date-2,'Demo month-end operational record',current_date+365,now()-interval '10 days',now()-interval '10 days') returning id into r;
 insert into tasks(run_id,position,name,owner,due_on,state,evidence,completed_at,created_at,updated_at) values
 (r,1,'Collect ledger evidence','Ana Lee',current_date-9,'done','Demo ledger reference L-01',now()-interval '9 days',now()-interval '10 days',now()-interval '9 days');
 insert into tasks(run_id,position,name,owner,due_on,state,block_reason,created_at,updated_at) values
 (r,2,'Reconcile review pack','Ben Patel',current_date-8,'blocked','Waiting for supplier statement',now()-interval '10 days',now()-interval '9 days'),
 (r,3,'Record independent sign-off','Cara Wilson',current_date-7,'waiting','',now()-interval '10 days',now()-interval '9 days');
 insert into runs(code,name,procedure_id,owner,started_at,due_on,purpose,retain_until) values
 ('RUN-102','Harbour file (demo)',q,'Ben Patel',now()-interval '4 days',current_date+1,'Demo client handover evidence',current_date-1) returning id into r;
 insert into tasks(run_id,position,name,owner,due_on) values
 (r,1,'Check supplied records','Ben Patel',current_date-2),(r,2,'Record consent evidence','Ana Lee',current_date),(r,3,'Prepare handover note','Cara Wilson',current_date+1);
 insert into runs(code,name,procedure_id,owner,due_on,purpose,retain_until) values
 ('RUN-103','November close (demo)',p,'Ana Lee',current_date+5,'Demo month-end operational record',current_date+365) returning id into r;
 insert into tasks(run_id,position,name,owner,due_on) values
 (r,1,'Collect ledger evidence','Ana Lee',current_date+3),(r,2,'Reconcile review pack','Ben Patel',current_date+4),(r,3,'Record independent sign-off','Cara Wilson',current_date+5);
insert into events(run_id,task_id,actor,action,detail,created_at)
 select r.id,t.id,'Demo operator','demo-'||t.state,jsonb_build_object('synthetic',true,'evidence',t.evidence,'block_reason',t.block_reason),now()-interval '9 days'
 from runs r join tasks t on t.run_id=r.id where r.code='RUN-101' and t.state in ('done','blocked');
end $$;
