---
description: "Complete for the procedure desk"
---

# /complete

Read the run history first. Record only completion the operator states happened, with its evidence reference.

```bash
npm run procedures -- complete --run=<run> --step=<step> --evidence=<evidence> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
