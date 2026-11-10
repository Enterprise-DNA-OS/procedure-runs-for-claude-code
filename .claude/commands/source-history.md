---
description: "Source history for the procedure desk"
---

# /source-history

Read every retained snapshot for the exact source workspace and process identifier.

```bash
npm run procedures -- source-history --source=<source> --process=<process> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
