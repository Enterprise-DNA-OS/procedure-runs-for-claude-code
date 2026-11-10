---
description: "Unblock for the procedure desk"
---

# /unblock

Read the blocker and record the evidence showing it is resolved.

```bash
npm run procedures -- unblock --run=<run> --step=<step> --evidence=<evidence> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
