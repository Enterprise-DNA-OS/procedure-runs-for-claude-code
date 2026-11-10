# Replace Tallyfy: bring the evidence first

Checked 10 November 2026 against the vendor's [process export guide](https://tallyfy.com/products/pro/tracking-and-tasks/processes/how-can-i-export-tallyfy-processes-to-csv/) and [CSV column reference](https://tallyfy.com/products/pro/integrations/analytics/how-is-the-csv-file-structured-in-tallyfy/).

## Export

Open a process you can view using an Admin or Standard member account. In its More menu select Export CSV. The help page also describes an Export CSV button in Summary. Light members cannot use this export. For multiple processes, the vendor links a bulk export script from its help page; this project makes no account connections.

Keep the original download. Do not let a spreadsheet convert identifiers or timestamps. The documented format has 49 named columns. Its process_task rows are tasks; process_task_data, process_task_comment and kick_off_task rows hold related evidence. Keep all rows, including hidden tasks. The timestamp column guide identifies timezone-free dates as UTC.

## One import command

```bash
npm run procedures -- import tallyfy --file=imports/tallyfy.csv --source=your-workspace --exported-at=2026-11-01T00:00:00Z --actor="Your name" --dry-run
```

Use the actual file, workspace and time you exported it. Run the same command without --dry-run after checking the counts. The entire batch commits together. An identical file in the same workspace adds nothing. A changed snapshot of an existing process requires a strictly later export timestamp. Do not use another workspace name just to avoid a conflict.

## Mapping

| Vendor fields | Stored meaning |
|---|---|
| process_id, process_name, process_owner | Source run identity and owner, scoped to the supplied workspace |
| blueprint_id, blueprint_version | Original template identity and revision |
| process_status, process_completed_at | Vendor run state and recorded completion |
| total_tasks_in_process, tasks_completed | Reconciled against distinct task rows and completion timestamps |
| process_task_id, process_task_alias | Task identity and stable source step reference |
| process_task_status | shown or hidden; this is visibility, not completion |
| completed_on, completed_by | Source completion evidence; empty and NaN timestamps remain absent |
| assigned_or_shown_on, due_by | UTC source timing |
| user_assigned, guest_assigned | Named source assignees, retained as text |
| Form answers, comments, milestones and other columns | Original rows retained in the batch CSV; field and comment rows exposed by source-record |

The importer rejects missing identity columns, unknown row types or states, duplicate task identities, orphan field/comment rows, inconsistent process metadata, invalid dates and incomplete task counts. Every rejected or previewed batch leaves no database changes. The fixture follows the documented format and is synthetic, not an export from a customer account.

## Reconcile and start local work

Run /import-review for counts and overdue source work, /source-record for tasks, fields and comments, and /source-history for snapshot history. Record the import's purpose, retention review date and access safeguards with /review-import. Compare counts and several task records to the source before retiring anything.

The CSV is an execution record, not a runnable procedure definition. Author an approved procedure with /add-procedure, test its sequence with /launch and /complete, and check the generated execution document. Conditional branches, guest access, identity controls, notifications, integrations and schedules need your own design and acceptance tests. Attachments need separate retrieval: the export includes file names only, not file contents. No existing automation runs here merely because its history was imported.

For a clean, complete export, loading and reviewing records is a one-command task. Moving every automation and replacing shared access is separate work. Keep the existing service until your actual workflows and access arrangements pass your checks.
