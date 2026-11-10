# Operate a private procedure desk

Use Node 22 or newer. PGlite is suitable for a single trusted operator. Keep .data, imports, exports, drafts and generated reports private and backed up. Do not commit actual business data or credentials. The supplied fixture and seed contain synthetic records only.

For a shared PostgreSQL database, apply migrations with its owner role through DATABASE_URL. The migration enables row-level security and grants no public access. The current CLI expects a trusted database owner connection. It has no application login, per-person permissions or tenant isolation. Never expose that connection through a public API. An operator-provided --actor records attribution, not proof of identity. Enterprise deployment requires a restricted service role, authenticated access, tested authorisation, backups and a restore exercise for your environment.

Use one database per business. Store the database connection outside version control. Local database directories and generated files use restrictive permissions where supported. Reports contain private records and load a web font; remove that link from the shared renderer for offline environments. Back up the database plus source attachments, and test restoring both before switching off a prior system.

Every import is a transaction. Dry runs roll back. Identical source bytes are idempotent within a workspace; newer snapshots retain older ones. Original CSV evidence is included in full exports. Export writes refuse to overwrite an existing file. An export is an archive, not an automated restore facility: use the database's supported backup and restore for recovery.

Use npm test only against temporary embedded storage. TEST_DATABASE_URL is for an empty disposable PostgreSQL database; the test refuses any public tables already present and leaves its test database for the enclosing CI service to discard. Never point it at production. npm run demo is for the local demo. A shared seed requires the explicit --demo-database flag on scripts/seed.mjs.

All clocks and vendor export times are UTC. Step deadlines are calendar dates, not business-day calculations. Launching uses the newest approved version for a procedure code. A later approved version does not change old runs. To correct completed evidence, preserve the original and record an explanatory note or create a new run; this base does not rewrite history.
