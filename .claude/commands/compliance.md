---
description: "Compliance for the procedure desk"
---

# /compliance

Read docs/compliance.md. Report findings as evidence checks with their sources, never a compliance certificate.

```bash
npm run procedures -- compliance --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
