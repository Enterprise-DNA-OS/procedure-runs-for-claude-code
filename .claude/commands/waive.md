---
description: "Waive for the procedure desk"
---

# /waive

Read the run history. Record the operator's waiver reason and approval reference as evidence. Do not treat waived work as completed work.

```bash
npm run procedures -- waive --run=<run> --step=<step> --evidence=<evidence> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
