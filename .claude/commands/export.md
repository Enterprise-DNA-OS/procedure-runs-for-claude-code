---
description: "Export for the procedure desk"
---

# /export

Write a complete archive to a new private file and report record counts. Never overwrite an existing export.

```bash
npm run procedures -- export --out=<out> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
