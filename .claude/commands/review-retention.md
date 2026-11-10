---
description: "Review retention for the procedure desk"
---

# /review-retention

Read the run and the actual retention policy. Record the reviewed purpose and date with evidence.

```bash
npm run procedures -- review-retention --run=<run> --retain-until=<retain-until> --purpose=<purpose> --evidence=<evidence> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
