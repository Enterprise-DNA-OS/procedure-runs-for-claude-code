---
description: "Add procedure for the procedure desk"
---

# /add-procedure

Read the proposed procedure file and approval evidence. Add a new immutable version; never replace an old approved version.

```bash
npm run procedures -- add-procedure --file=<file> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
