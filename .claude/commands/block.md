---
description: "Block for the procedure desk"
---

# /block

Read the run and record the exact blocker and named operator.

```bash
npm run procedures -- block --run=<run> --step=<step> --reason=<reason> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
