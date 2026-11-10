# Procedure Runs for Claude Code

Keep the evidence behind recurring work. Run a month-end pack, supplier review or client handover from an approved checklist. See the next owner, the blocked step and the record that supports each completion.

## Three ways to use it

- **Do it yourself:** free MIT source. Install the demo, import your Tallyfy exports and author your own procedure versions.
- **We customise it:** Enterprise DNA brings your records across and builds your fields, deadlines, connections and shared screens. One setup fee, then a retainer for ongoing work.
- **We run it for you:** installed, connected and operated through **Omni by Enterprise DNA**, for one setup fee then a retainer. [Talk to Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=tallyfy&utm_medium=readme).

## Start with the demo

Node 22 or newer. Windows and Linux. No database service is required: PGlite stores local records under .data. DATABASE_URL selects PostgreSQL. Claude Code, Codex, OpenCode and Cursor use the same instructions and command recipes.

```bash
npm install
npm run demo
npm run procedures -- handover
npm run procedures -- owner-load
npm run procedures -- weekly-review
npm run procedures -- import-review
npm run view
npm run docs
npm test
```

Use the demo in an empty local folder. Its people, businesses and evidence are synthetic. Seed refuses a shared database unless the operator explicitly selects a disposable demo database. [Deployment and access](docs/operations.md).

## The weekly rituals

/handover names the next person and any blocked step. /attention finds overdue tasks, quiet runs and reviews. /owner-load shows where unfinished work is concentrated. /weekly-review combines those three reports. /compliance checks recorded privacy safeguards, retention dates and internal review requirements. /draft-handover writes a private document and sends nothing.

Every command accepts --json. Database writes require --actor, which records the operator's supplied name, not an authenticated signature. Codes match exactly without regard to case. Names and partial IDs must identify one record; ambiguous matches list the candidates and exit 1. Tasks can also be selected by position within a run. Run `npm run procedures -- help` for the complete interface.

## Start and finish a procedure

```bash
npm run procedures -- add-procedure --file=fixtures/procedure.json --actor="Your name"
npm run procedures -- launch --procedure=SUPPLIER-PACK --code=SUP-001 --name="Supplier review" --owner="Rae Morgan" --due=2098-01-01 --purpose="Supplier review evidence" --retain-until=2099-01-01 --actor="Your name"
npm run procedures -- complete --run=SUP-001 --step=1 --evidence="Reference to the checked document" --actor="Your name"
```

The fixture dates are demonstration values. Set the actual review, run and retention dates before real use. An approved version needs an owner, a different named reviewer, approval evidence and access safeguards evidence. Add a new version when the instructions change. Existing runs keep their original steps. Later steps cannot close until earlier ones are completed or explicitly waived. A blocked step needs an evidenced release before completion. Waivers remain visible in the compliance review.

## Bring your Tallyfy history

```bash
npm run procedures -- import tallyfy --file=fixtures/tallyfy.csv --source=your-workspace --exported-at=2026-11-01T00:00:00Z --actor="Your name" --dry-run
```

Use your own export file, workspace name and export time. Repeat without --dry-run after reconciliation. The importer understands Tallyfy's documented 49-column process CSV. It checks task counts, hidden states, completed timestamps and child-row references; retains the complete original CSV; and makes repeated identical imports harmless. A changed snapshot needs a later export time. [Export instructions and exact mapping](docs/replace-tallyfy.md).

Imported runs stay in a separate evidence register. Form answers and comments remain readable through /source-record. File fields contain names, not the underlying files. Procedure definitions, conditional rules, permissions and connections need explicit reconstruction and testing before local execution starts. Your source history is never labelled as a new local approval.

## Ten questions your own procedure desk answers

1. Which step can each owner take next? `handover`
2. Which blocked step is holding a run? `handover`
3. Which unresolved tasks are overdue? `attention`
4. Which active run has had no recorded activity for a week? `attention`
5. Which owner carries the most overdue work? `owner-load`
6. Which procedure version did this run follow? `runs`
7. Which steps were waived, and what evidence was recorded? `history` and `compliance`
8. Which records need a retention or access review? `compliance`
9. Which imported tasks were hidden rather than completed? `source-record`
10. What changed between two source exports? `source-history` and `export`

These are supported questions, not a claim that Tallyfy cannot answer similar questions. The value is keeping your own review evidence, rules and history together and being able to change the analysis.

## Documents in your name

Set business name, colours and logo in brand.json. `npm run docs` produces approved procedure sheets and execution records with step evidence and decision history. `npm run view` produces handover, attention and import review snapshots. These are escaped, read-only HTML files. /new-view adds another report from your database.

## Your first hour: ten things to ask for

1. Put our business name on the execution record.
2. Show the blocked October close in the demo.
3. Show whose work can move today.
4. Explain the overdue procedure review.
5. Preview a complete Tallyfy export.
6. Check hidden tasks against actual completions.
7. Draft the handover with unresolved evidence listed.
8. Write our first approved procedure version.
9. Set a retention review date from our actual policy.
10. Add a department field with /customise and a migration.

## Scope and proof

This is a trusted-operator procedure desk. It records work and evidence; it does not perform the underlying reconciliation, send messages, schedule itself, provide guest links or enforce a shared identity system. A recorded completion is an operator assertion with evidence, not an independently verified signature. [Why no front end](docs/why-no-front-end.md). [Rules and sources](docs/compliance.md).

`npm test` creates a temporary database, exercises every CLI command and checks sequencing, immutable versions, import reconciliation, rollback, snapshot history, exports, ambiguous names and escaped reports. CI checks Linux, Windows and PostgreSQL. A workflow definition is not itself proof of a successful run.

[Research and selection](docs/research.md). MIT. Not affiliated with Tallyfy or Anthropic. Database hosting, agent use and operation remain your costs.
