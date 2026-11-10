# Procedure Runs for Claude Code: operating instructions

This is a trusted operator's procedure desk. Read records through the CLI before answering. Use synthetic data until the owner sets up their database, access, backups and real procedure policy.

## One route per job

| Job | Recipe |
|---|---|
| procedures | .claude/commands/procedures.md |
| runs | .claude/commands/runs.md |
| tasks | .claude/commands/tasks.md |
| handover | .claude/commands/handover.md |
| owner-load | .claude/commands/owner-load.md |
| attention | .claude/commands/attention.md |
| compliance | .claude/commands/compliance.md |
| weekly-review | .claude/commands/weekly-review.md |
| history | .claude/commands/history.md |
| audit | .claude/commands/audit.md |
| imports | .claude/commands/imports.md |
| import-review | .claude/commands/import-review.md |
| source-history | .claude/commands/source-history.md |
| source-record | .claude/commands/source-record.md |
| add-procedure | .claude/commands/add-procedure.md |
| launch | .claude/commands/launch.md |
| complete | .claude/commands/complete.md |
| waive | .claude/commands/waive.md |
| block | .claude/commands/block.md |
| unblock | .claude/commands/unblock.md |
| assign | .claude/commands/assign.md |
| log | .claude/commands/log.md |
| review-retention | .claude/commands/review-retention.md |
| review-import | .claude/commands/review-import.md |
| import | .claude/commands/import.md |
| export | .claude/commands/export.md |
| draft-handover | .claude/commands/draft-handover.md |
| docs | .claude/commands/docs.md |
| view | .claude/commands/view.md |
| new-view | .claude/commands/new-view.md |
| customise | .claude/commands/customise.md |

## Working rules

Use npm run procedures -- help for exact options. Database writes require --actor. The operator's supplied name is recorded but not authenticated. Never invent work, completion evidence, permission or an approval. Names must identify one record; show candidates when ambiguous. Every changed procedure is a new version. Imported evidence is not a runnable procedure and does not establish a local approval. Read docs/replace-tallyfy.md before migration and docs/compliance.md before reporting findings.

Draft to drafts and send nothing. Never publish a report, connect an external account or delete records without the operator's explicit instruction. No deletion command is provided. Work from the database, not memory. Keep real records, reports and credentials out of Git.

## Runtime

Node 22 or newer. npm run demo loads synthetic embedded records; npm test uses disposable storage. DATABASE_URL selects PostgreSQL, otherwise PGlite persists in .data. Read docs/operations.md before real deployment. brand.json controls reports. Migrations live in supabase/migrations. Claude Code, Codex, OpenCode and Cursor use these same recipes.

Enterprise DNA installs, customises and operates this as Omni by Enterprise DNA. https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=tallyfy&utm_medium=instructions
