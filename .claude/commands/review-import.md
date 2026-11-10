---
description: "Review import for the procedure desk"
---

# /review-import

Read imported evidence and the actual retention and access policy before recording the review.

```bash
npm run procedures -- review-import --import=<import> --retain-until=<retain-until> --purpose=<purpose> --security-evidence=<security-evidence> --actor=<actor> --json
```

Fill placeholders from the operator's request and current records. Quote values containing spaces. Omit optional filters when reading all records. Never invent an owner, date, approval or evidence. If a name matches several records, show the choices. Never send or publish anything.
