# TODO

Nothing outstanding for the current change. Both fixes, the JWT-secret fix, and
the init progress reporting were verified against running services on StartOS
0.4.0.1 — see the verification log in Start9-Community/vikunja-startos#3.

Everything below is **deferred work, not in flight.** It was found while fixing
something else and recorded rather than chased. Ordered by value.

## Investigate next

### 1. The backup is unsound for SQLite

`startos/backups.ts` rsyncs the live database and excludes its sidecar files:

```js
sdk.Backups.ofVolumes('main', 'startos').setOptions({
  exclude: ['*-journal', '*-wal', '*-shm'],
})
```

The comment there justifies the exclusion as avoiding an inconsistent restore.
That reasoning is backwards. In WAL mode the `-wal` file holds **committed
transactions not yet checkpointed into the main database**, so excluding it does
not make the copy consistent — it discards committed data. Separately, rsyncing
`vikunja.db` while the daemon writes to it can tear the copy no matter what is
excluded.

Start9 has already moved away from this pattern elsewhere. From the SDK
changelog: `Backups.withPgDump()` is "dump-based PostgreSQL backup using
`pg_dump`/`pg_restore`, **replacing raw volume rsync of PG data directories**".
There is no `withSqliteDump`, but Vikunja ships its own (confirmed against the
2.4.0 binary):

```
dump      Dump all vikunja data into a zip file. Includes config, files and db.
restore   Restores all vikunja data from a vikunja dump.
```

So the shape is `setPreBackup` / `setPreRestore` hooks running `vikunja dump` /
`vikunja restore`, mirroring what `withPgDump` does for Postgres.

**Resolve before building:**

- `dump` bundles config + files + db into one zip, which overlaps what the volume
  backup already captures. Decide deliberately whether to dump everything and
  drop the volume backup, or dump only the database and keep attachments on the
  volume. This is a design decision, not a mechanical swap.
- **Stage the dump in the subcontainer rootfs and `cp` it through to the backup
  target.** SDK 1.5.2 fixed exactly this trap for `withPgDump`/`withMysqlDump`:
  writes made _directly_ to the backup-fs FUSE mount were silently dropped and
  produced 0-byte dumps that nobody noticed until a restore.
- Confirm `dump` is safe to run against a live service, or arrange for the
  daemon to be quiescent during it.

**This was a deliberate choice, not an oversight.** The exclusion was introduced
in `c47bf26` ("Audit and conform package for community-registry listing"), whose
message calls it out explicitly: _"back up main + startos, excluding SQLite
-wal/-shm/-journal"_. Someone may have had a reason that isn't captured here, so
treat this as a question to raise rather than a defect to go fix — ask before
changing it.

**Confidence:** this is reasoning from SQLite's WAL semantics plus Start9's own
stated direction — a corrupt restore has **not** been demonstrated. Verifying it
means taking a backup under sustained write load and restoring from it. Do that
first; it decides whether this is urgent, merely correct, or already fine for
reasons not written down.

### 2. Init depends on positional column parsing

`parseUserTable` (`startos/utils.ts`) reads Vikunja's box-drawing table by fixed
cell index — 0/1/2 for ID/username/email. Verified correct against real 2.4.0
output, but the first-account fix made **init** depend on it, so a future column
reorder stops being a cosmetic display bug and becomes a bad init decision.

Init only needs "are there any data rows", which is a much weaker question than
"which column is the email". Splitting that out — a row-count check for init,
the positional parse for display only — decouples init from the table layout
entirely.

### 3. Health check only proves a socket is open

`main.ts` uses `sdk.healthCheck.checkPortListening`, which confirms something
bound the port, not that Vikunja is serving. `/api/v1/info` returns real JSON and
is cheap over HTTP.

Note there is also a `vikunja healthcheck` subcommand, but `ready` polls
frequently and booting a CLI subcontainer per poll would be far too expensive —
if this is done, do it over HTTP.

Low value: the port check has not misled us in practice.

### 4. Add a Repair action

`vikunja repair` — "Repair and fix data integrity issues" — sits naturally beside
the existing **Run Diagnostics** action (`startos/actions/other/doctor.ts`, which
wraps `vikunja doctor`). Plausibly what you want after a bad shutdown. Roughly 20
lines, following `doctor.ts` as the template.

## Known and accepted (no action planned)

- **`user-list` cannot distinguish "no users" from "parser failed".** With zero
  users, `parseUserTable` returns `[]` and the action falls into its
  parser-failure branch, printing the raw empty table instead of "No users
  found." Pre-existing, cosmetic, and harmless to init (which only reads
  `users.length`). Worth folding into item 2 if that gets done.
- **Duplicate CORS origin.** Vikunja appends `publicurl` to `cors.origins`
  itself, and that URL is already in the list this package passes, so it appears
  twice in the startup log. Harmless — matching is a linear scan — and removing
  it would couple this package to Vikunja's append behavior.

## Upstream, not this package

- `npm audit` reports 2 high findings (`brace-expansion`, `js-yaml`) inside the
  SDK's own bundled eslint toolchain — not this package's dependencies and not
  shipped code. Upstream `@start9labs/start-sdk` issue; `npm audit fix` here
  would be wrong.
- `start-cli auth login` honors a `PASSWORD` env var but documents no options at
  all in `--help`. `setup.rs` has a named `read_password_env_or_prompt` helper
  for exactly this while `auth.rs` inlines it undocumented. Small upstream PR.
- **A package whose `main` rejects restart-loops silently** — the error reaches
  neither the service log nor `statusInfo.error`. This is what turned the
  JWT-secret one-liner into a multi-hour diagnosis. Filed as
  Start9Labs/start-technologies#3614; the JSON-RPC half is
  Start9Labs/start-technologies#3613.
