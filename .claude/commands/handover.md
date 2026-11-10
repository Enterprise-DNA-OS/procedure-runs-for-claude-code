---
description: "Handover for the procedure desk"
---

# /handover

Show ready and blocked steps, who owns them and what is holding the handover.

```bash
npm run procedures -- handover --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
