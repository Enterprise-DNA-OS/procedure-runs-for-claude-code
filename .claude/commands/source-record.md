---
description: "Source record for the procedure desk"
---

# /source-record

Read the latest source tasks, form answers and comments. Imported status is not a local approval.

```bash
npm run procedures -- source-record --source=<source> --process=<process> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
