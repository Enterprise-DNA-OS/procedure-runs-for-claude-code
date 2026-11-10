---
description: "Assign for the procedure desk"
---

# /assign

Read the run, record the new owner and reason, and show the next step.

```bash
npm run procedures -- assign --run=<run> --step=<step> --owner=<owner> --evidence=<evidence> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
