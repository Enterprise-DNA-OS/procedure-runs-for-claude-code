---
description: "Import for the procedure desk"
---

# /import

Read docs/replace-tallyfy.md. Preview the complete original export with --dry-run, reconcile counts, then import the authorised file. Preserve source evidence separately.

```bash
npm run procedures -- import tallyfy --file=<file> --source=<source> --exported-at=<exported-at> --actor=<actor> --dry-run --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
