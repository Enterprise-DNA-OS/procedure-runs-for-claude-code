---
description: "Imports for the procedure desk"
---

# /imports

Read the current records and report the result, with record identifiers and any unresolved evidence.

```bash
npm run procedures -- imports --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
