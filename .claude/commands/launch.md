---
description: "Launch for the procedure desk"
---

# /launch

Read the current procedure, confirm the named run and policy dates from the request, then start it.

```bash
npm run procedures -- launch --procedure=<procedure> --code=<code> --name=<name> --owner=<owner> --due=<due> --purpose=<purpose> --retain-until=<retain-until> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
