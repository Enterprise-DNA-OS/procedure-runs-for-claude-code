---
description: "History for the procedure desk"
---

# /history

Read the current records and report the result, with record identifiers and any unresolved evidence.

```bash
npm run procedures -- history --run=<run> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
