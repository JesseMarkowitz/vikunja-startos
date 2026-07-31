# TODO

Nothing outstanding for the current change. Both fixes and the init progress
reporting were verified against a running service on StartOS 0.4.0.1 at `2.4.0:3`
— see the verification log in the PR description.

## Deferred

- **`user-list` cannot distinguish "no users" from "parser failed".** With zero
  users, `parseUserTable` returns `[]` and the action falls into its
  parser-failure branch, printing the raw empty table instead of "No users
  found." Pre-existing, cosmetic, and harmless to init (which only reads
  `users.length`), so it was left alone rather than widen this change.
- **Duplicate CORS origin.** Vikunja appends `publicurl` to `cors.origins`
  itself, and that URL is already in the list this package passes, so it appears
  twice in the startup log. Harmless — matching is a linear scan — and removing
  it would couple this package to Vikunja's append behavior, so it stands.
- `npm audit` reports 2 high findings (`brace-expansion`, `js-yaml`) inside the
  SDK's own bundled eslint toolchain — not this package's dependencies and not
  shipped code. Upstream `@start9labs/start-sdk` issue; `npm audit fix` here
  would be wrong.
- `start-cli auth login` honors a `PASSWORD` env var but documents no options at
  all in `--help`. `setup.rs` has a named `read_password_env_or_prompt` helper
  for exactly this while `auth.rs` inlines it undocumented. Small upstream PR.
