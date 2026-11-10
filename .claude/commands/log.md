---
description: "Log for the procedure desk"
---

# /log

Append the operator's factual note to the run history.

```bash
npm run procedures -- log --run=<run> --note=<note> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
