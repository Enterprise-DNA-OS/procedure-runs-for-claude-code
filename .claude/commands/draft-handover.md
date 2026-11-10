---
description: "Draft handover for the procedure desk"
---

# /draft-handover

Read the complete history, render the private draft, inspect its content and return its path. Never send it.

```bash
npm run procedures -- draft-handover --run=<run> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
