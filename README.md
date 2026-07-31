<p align="center">
  <img src="icon.svg" alt="Vikunja Logo" width="21%">
</p>

# Vikunja on StartOS

> **Upstream docs:** <https://vikunja.io/docs/>
> **Upstream repo:** <https://github.com/go-vikunja/vikunja>
>
> Everything not listed in this document should behave the same as upstream
> Vikunja. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

[Vikunja](https://vikunja.io) is an open-source, self-hostable to-do and project manager — kanban boards, gantt charts, table views, attachments, labels, filters, and CalDAV in one app.

This package wraps Vikunja for StartOS. The first user is created via a gated StartOS Action (public registration is disabled by default), SMTP can be sourced from either StartOS's system SMTP or a custom server, and CORS is managed automatically from every address the service is reachable at.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences from Upstream](#limitations-and-differences-from-upstream)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                    |
| ------------- | ---------------------------------------- |
| Image source  | Upstream `vikunja/vikunja`, unmodified   |
| Helper image  | `busybox` (init-time only)               |
| Architectures | `x86_64`, `aarch64`                      |
| Base          | `FROM scratch`, `USER 1000`              |
| Entrypoint    | Default upstream entrypoint (web server) |
| HTTP port     | 3456                                     |

The busybox helper image is invoked once during init to create `/data/db` and `/data/files` and chown `/data` to UID 1000. It is not part of the runtime daemon chain.

---

## Volume and Data Layout

| Volume    | Mount Point      | Purpose                                                              |
| --------- | ---------------- | -------------------------------------------------------------------- |
| `main`    | `/data`          | Vikunja's own persistent data: SQLite database and attachments       |
| `startos` | (not mounted in) | StartOS package state — `store.json` (read host-side via FileHelper) |

Vikunja's data and StartOS's package state are kept on separate volumes so the
two never share a tree: `main` mirrors what upstream Vikunja persists (the
database and the files directory), while `startos` holds only this package's
bookkeeping. Layout inside the `main` volume:

```
/data/
├── db/
│   └── vikunja.db        # SQLite database (VIKUNJA_DATABASE_PATH)
└── files/                # Task attachments (VIKUNJA_FILES_BASEPATH)
```

`store.json` (JWT secret, primary URL, toggles, SMTP) lives on the `startos`
volume and is read host-side through the SDK's FileHelper — it is never mounted
into the container.

The `main` volume root is mounted at `/data` so Vikunja can chown the entire subtree. Mounting `subpath: 'db'` directly does not work for scratch images — those host directories would be owned by UID 0 and could not be chown'd from inside the user-namespace subcontainer.

---

## Installation and First-Run Flow

After install, one **critical** task appears on the Vikunja service page:

1. **Create User.** Public registration is disabled by default, so this action is the only way to create the initial account. It accepts a username and email, generates a strong password (never prompts for one), runs `vikunja user create` inside a temporary subcontainer, and returns the credentials. The same action stays available afterward for adding more users; the critical task resolves once any user exists — including users created outside this action, since the check asks Vikunja rather than trusting the `initialUserCreated` flag alone.

The primary URL is auto-seeded to a `.local` address on install, so the service is reachable immediately — there is no setup task for it. It governs links in outgoing email, not access: the web UI works at every address the service is exposed at. Change it any time with the **Set Primary URL** action (e.g. to a Tor `.onion` or a custom domain); StartOS re-prompts with an `important` task if the chosen URL later becomes unreachable, which affects email links only and never stops the service.

A persistent JWT secret is stored in `store.json`, so container restarts and updates do not log everyone out.

`ensureSecret` runs on **every** init kind and generates one only when the store has none — the read-before-write is what preserves the secret across updates and restores. It deliberately does not also gate on `kind === 'install'`. That gate reads like a second layer of the same protection, but it was the only thing standing between an absent secret and one being minted: `main` throws when `VIKUNJA_SERVICE_SECRET` is empty, so any path reaching a later init without one — an upgrade whose stored value didn't survive, a restore from a store predating the field — left the service permanently unable to start, retrying every 10s with nothing able to fill the value in. Generating on demand costs one forced re-login in the case where the secret was already lost; gating on install costs the service.

Once a user exists, log in at any address the `webui` interface is exposed at — not only the primary URL.

---

## Configuration Management

| StartOS-Managed                                  | Upstream-Managed                                 |
| ------------------------------------------------ | ------------------------------------------------ |
| Primary URL → `VIKUNJA_SERVICE_PUBLICURL`        | All in-app preferences (theme, language, views)  |
| Persistent JWT secret → `VIKUNJA_SERVICE_SECRET` | Per-user account, profile, notifications         |
| Public registration on/off                       | Project / list / task management                 |
| Self-service user deletion on/off                | Sharing, teams, kanban, filters                  |
| Public link sharing on/off                       | Webhooks, API tokens                             |
| Email reminders on/off                           | TOTP enrollment                                  |
| Maximum attachment size                          | Migration imports (Todoist, Trello, Asana, etc.) |
| SMTP (disabled / system / custom)                |                                                  |
| CORS origins (every reachable address)           |                                                  |
| Time zone (fixed to UTC)                         |                                                  |
| CalDAV and TOTP toggles (both forced on)         |                                                  |

All Vikunja configuration is plumbed via environment variables (`VIKUNJA_<SECTION>_<KEY>`) — there is no on-disk `config.yml`. `getVikunjaEnv(store, smtp, cors)` in `startos/utils.ts` builds the env: the stored settings pass straight through, and the caller supplies the `VIKUNJA_MAILER_*` fragment. Only the daemon (`main.ts`) and the **Send Test Email** action send mail, so they resolve SMTP — reading StartOS system SMTP only when the user chose it as the source — and pass the result via `mailerEnv()`. The other CLI commands don't send email, so they pass `{}` and never touch SMTP.

### CORS and the primary URL

The web UI is a browser app calling the API on the same origin it was loaded from, so **every address the service is exposed at must be an accepted origin** — StartOS lets the user decide where a service is reachable, and several addresses are valid at once. `main.ts` reads them with `getWebuiUrls()` and passes the list as `VIKUNJA_CORS_ORIGINS`. The read is a `.const`, so enabling Tor or a tunnel later re-runs `main` with the new address already allowed.

Two Vikunja behaviors shape this (both in its `pkg/config/config.go`):

- **Origins are whitespace-separated**, not comma-separated. Vikunja stores an env value as a plain string and reads it back through viper's `GetStringSlice`, which splits with `strings.Fields`. Vikunja appends `publicurl` to the list itself, so it needs no entry of its own.
- **CORS on with an empty `publicurl` is fatal**: `log.Fatalf("service.publicurl is required when cors.enable is true")`, and CORS defaults on. Two consequences. `main.ts` falls back to any reachable address when the store has no primary URL, and drops CORS entirely if there is no address at all, so the daemon can never abort here. And CLI callers pass `cors: null` — which sets `VIKUNJA_CORS_ENABLE=false` — because CORS is meaningless for a command that serves no HTTP, and leaving it at the default would make every action inherit the same requirement. That matters at init, where the account check runs before the primary URL is seeded.

Mutable settings persist in `store.json` on the `startos` volume. Each setting is keyed by the **Vikunja env var it populates**, with the value stored in the exact form the env expects (`'true'`/`'false'`, size strings), so `getVikunjaEnv()` passes them straight through. The exceptions are `initialUserCreated` (internal package state, never an env var) and the SMTP config, which can't be a flat env value — system credentials are read from StartOS at runtime — so it stays structured and resolves to `VIKUNJA_MAILER_*`.

`initialUserCreated` is a cache, not the source of truth. Only the Create User action sets it, so on its own it records "did the user bootstrap through us", not "does an account exist" — an account created any other way (registration briefly enabled, a restore from a store that predates the flag) left it `false` and the critical task reappeared forever. Init now trusts the flag when it is set and otherwise asks Vikunja directly via `listVikunjaUsers()`, healing the flag when accounts turn out to exist. The CLI probe therefore runs only on a fresh install or a stale store, never on a steady-state service.

**A filed task does not retract itself.** StartOS keeps a task `active` until something clears it, so declining to re-create it on the next pass changes nothing — and a `critical` one blocks the service from starting at all. Whenever a user is known to exist, init therefore clears it explicitly with `sdk.action.clearTask(effects, '<id>:user-create')`; `createTask` derives that replay key as `` `${packageId}:${actionId}` `` when the caller supplies none. The call is a no-op when no task is filed, so it is safe on every init, and it runs on the cached-flag path too — a service that healed its flag under an earlier build still carries the stale task, and this is what releases it. Note the asymmetry in StartOS: the user-facing `clear-task` RPC refuses to clear a `critical` task without `--force`, while the service's own `clearTasks` effect has no such guard. A user should not be able to dismiss a critical task; the service that raised it may retract it.

Because these are init handlers, the self-heal runs when init runs — install, update, restore, or container rebuild — not on a plain `start`. That matters: a `critical` task blocks `start`, so a service that is already stuck cannot clear itself by being started. It clears on the next update, which is the path a stuck install actually arrives by.

| Key                                    | Default                                       | Mutated by                                        |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| `initialUserCreated`                   | `false`                                       | Create User (self-heals from `vikunja user list`) |
| `VIKUNJA_SERVICE_SECRET`               | generated on install                          | (internal — never overwritten)                    |
| `VIKUNJA_SERVICE_PUBLICURL`            | auto-seeded `.local` URL                      | Set Primary URL                                   |
| `VIKUNJA_SERVICE_ENABLEREGISTRATION`   | `'false'`                                     | Enable / Disable Registration                     |
| `VIKUNJA_SERVICE_ENABLEUSERDELETION`   | `'true'`                                      | Enable / Disable Self-Service User Deletion       |
| `VIKUNJA_SERVICE_ENABLELINKSHARING`    | `'false'`                                     | Enable / Disable Link Sharing                     |
| `VIKUNJA_SERVICE_ENABLEEMAILREMINDERS` | `'false'`                                     | Enable / Disable Email Reminders                  |
| `VIKUNJA_FILES_MAXSIZE`                | `'20MB'`                                      | Set Max Attachment Size                           |
| `smtp`                                 | `{ selection: 'disabled' }`                   | Configure SMTP                                    |
| `smtpAdvanced`                         | `{ skipTlsVerify: false, authType: 'plain' }` | Configure SMTP (Advanced group)                   |

A change to any of these triggers a daemon restart so the new env takes effect.

---

## Network Access and Interfaces

| Interface ID | Type | Port | Protocol | Path | Purpose         |
| ------------ | ---- | ---- | -------- | ---- | --------------- |
| `webui`      | UI   | 3456 | HTTP     | `/`  | Vikunja web app |

Single MultiHost (`'main'`) with one bound port. StartOS publishes the interface over LAN (`.local`), Tor (`.onion`), and any custom domains the operator adds; TLS is terminated at the StartOS edge.

CalDAV is reachable through the same web interface at `/dav/...` (`VIKUNJA_SERVICE_ENABLECALDAV=true`). It is not exposed as a separate StartOS interface card — point your CalDAV client at any address the `webui` interface serves. CORS is skipped for `/dav` and `/feeds` upstream (CalDAV needs its own `OPTIONS` handling), so the allowlist does not affect it.

---

## Actions

Three groups appear in the StartOS UI (sorted alphabetically): **Accounts**, **Email**, **Other**. Names below match the literal `i18n('...')` strings in the action source.

### Accounts

| Display name                                                           | Action ID              | Availability | Notes                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | ---------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create User                                                            | `user-create`          | any          | Username + email only — generates and returns a strong password (never prompts). Surfaced as the critical install task until a user exists (`initialUserCreated` flag, verified against `vikunja user list` when unset); stays available for additional users. |
| List Users                                                             | `user-list`            | any          | Parses Vikunja's `user list` table into per-user accordions (ID, username, email).                                                                                                                                                                             |
| Reset User Password                                                    | `user-reset-password`  | only running | `vikunja user reset-password --direct`. Generates and returns a strong password (never prompts). For lockout recovery.                                                                                                                                         |
| Delete User                                                            | `user-delete`          | only running | `vikunja user delete --now`. Immediate and irreversible (action `warning` is the confirmation).                                                                                                                                                                |
| Enable Registration / Disable Registration                             | `toggle-registration`  | any          | Dynamic label. Default disabled.                                                                                                                                                                                                                               |
| Enable Self-Service User Deletion / Disable Self-Service User Deletion | `toggle-user-deletion` | any          | Dynamic label. Default enabled.                                                                                                                                                                                                                                |

### Email

| Display name                                     | Action ID                | Availability | Notes                                                                                           |
| ------------------------------------------------ | ------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| Configure SMTP                                   | `manage-smtp`            | any          | Disabled / system / custom selector — visually mirrors `/system/email`. Advanced fields nested. |
| Send Test Email                                  | `testmail`               | any          | `vikunja testmail`. Takes a recipient address and confirms delivery via the configured SMTP.    |
| Enable Email Reminders / Disable Email Reminders | `toggle-email-reminders` | any          | Dynamic label. Default disabled. Warns if SMTP is not configured when enabling.                 |

### Other

| Display name                               | Action ID             | Availability | Notes                                                                                                                                                                                                                       |
| ------------------------------------------ | --------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Set Primary URL                            | `set-primary-url`     | any          | Change the primary URL used for links in outgoing email (`.local` is auto-seeded on install — no setup task). Does not gate access; the UI works at every reachable address. Reactive: the daemon restarts when it changes. |
| Enable Link Sharing / Disable Link Sharing | `toggle-link-sharing` | any          | Dynamic label. Default disabled. Warns about exposure when enabling.                                                                                                                                                        |
| Set Max Attachment Size                    | `max-attachment-size` | any          | Change `VIKUNJA_FILES_MAXSIZE` (string format like `20MB`, `200MB`, `2GB`).                                                                                                                                                 |
| Run Diagnostics                            | `doctor`              | any          | `vikunja doctor` output for troubleshooting install or startup issues.                                                                                                                                                      |

Every action that shells into Vikunja runs in a temporary subcontainer with `/etc/passwd` and `/etc/group` planted (the upstream `FROM scratch` image has neither) and the full env block plumbed in.

---

## Backups and Restore

`sdk.Backups.ofVolumes('main', 'startos')` snapshots both volumes — the `main` volume (SQLite database and every uploaded attachment) and the `startos` volume (`store.json`: JWT secret, primary URL, toggles, SMTP). SQLite's `-wal`, `-shm`, and `-journal` sidecar files are excluded, since capturing them mid-write could restore an inconsistent database.

Restore re-runs the standard init chain: `seedFiles → initVolumeLayout → ensureSecret` (no-op when a secret is already in the restored store) `→ watchInitialUser → setupPrimaryUrl`. No restore-specific migrations.

---

## Health Checks

| Check         | Type           | Verifies                          | Grace period |
| ------------- | -------------- | --------------------------------- | ------------ |
| Web Interface | daemon `ready` | `checkPortListening` on port 3456 | 30 s         |

Vikunja runs SQLite migrations on startup; the grace period accounts for migration time on slow disks. The success and failure messages shown in the StartOS UI are "The web interface is ready" and "The web interface is not ready".

---

## Dependencies

**None.** Vikunja runs against an embedded SQLite database — no Postgres, MySQL, or Redis sidecar is required.

---

## Limitations and Differences from Upstream

1. **No riscv64.** The upstream Docker image is published for `amd64` and `arm64` only.
2. **SQLite only.** PostgreSQL and MySQL/MariaDB backends are not exposed. Upstream recommends Postgres for instances with more than a handful of users and treats SQLite as the lighter option; we ship SQLite deliberately, because it fits the single-user / small-team home-server use case StartOS targets — one fewer daemon, and a backup/restore that is just a file copy.
3. **Public registration is disabled by default.** Upstream defaults to `enableregistration: true`; we override to `false`. Re-enable via the **Enable Registration** action if needed.
4. **Public link sharing is disabled by default.** Upstream defaults to `enablelinksharing: true`; we override to `false` because attachments on a shared project would otherwise be readable by anyone with the link.
5. **Email reminders are disabled by default.** Upstream defaults to `true`; without SMTP they would silently no-op, so we default off and warn if reminders are enabled before SMTP is configured.
6. **CalDAV is enabled but not surfaced as its own interface card.** Reachable at `https://<primary-url>/dav/...` — point your CalDAV client at that path.
7. **Time zone is fixed to UTC** (`VIKUNJA_SERVICE_TIMEZONE=UTC`). Per-user time zones in the Vikunja UI work as upstream.
8. **No on-disk `config.yml`.** Everything is wired through `VIKUNJA_*` environment variables. Anything documented as configurable only via `config.yml` and not exposed through env vars is not reachable on this package.

---

## What Is Unchanged from Upstream

The following work as documented upstream:

- Task management (kanban, gantt, table, list views; labels, filters, priorities, due dates, reminders, attachments)
- Project sharing, teams, and per-project permissions
- Migration imports from Todoist, Trello, Asana, Microsoft To Do, etc.
- API and personal API tokens (`/api/v1/...`)
- Webhooks
- TOTP / 2FA enrollment per user
- CalDAV access at `/dav/`
- Background jobs and recurring task scheduling
- All in-app user preferences (language, theme, default views, notification settings)
- Database migrations on startup
- The `vikunja` CLI's full behavior when invoked through actions (`user create`, `user list`, `user delete`, `user reset-password`, `testmail`, `doctor`)

---

## Contributing

Build and development workflow follow the StartOS packaging guide: <https://docs.start9.com/packaging>. Keep `README.md`, `instructions.md`, and `AGENTS.md` in sync with any change to user-visible behavior or package structure.

---

## Quick Reference for AI Consumers

```yaml
package_id: vikunja
architectures: [x86_64, aarch64]
volumes:
  main: /data # SQLite database + attachments
  startos: (not mounted) # store.json package state
ports:
  webui: 3456
dependencies: none
startos_managed_env_vars:
  - VIKUNJA_SERVICE_INTERFACE
  - VIKUNJA_SERVICE_ROOTPATH
  - VIKUNJA_SERVICE_PUBLICURL
  - VIKUNJA_SERVICE_SECRET
  - VIKUNJA_SERVICE_TIMEZONE
  - VIKUNJA_SERVICE_ENABLECALDAV
  - VIKUNJA_SERVICE_ENABLETOTP
  - VIKUNJA_SERVICE_ENABLEREGISTRATION
  - VIKUNJA_SERVICE_ENABLELINKSHARING
  - VIKUNJA_SERVICE_ENABLEUSERDELETION
  - VIKUNJA_SERVICE_ENABLEEMAILREMINDERS
  - VIKUNJA_DATABASE_TYPE
  - VIKUNJA_DATABASE_PATH
  - VIKUNJA_FILES_BASEPATH
  - VIKUNJA_FILES_MAXSIZE
  - VIKUNJA_MAILER_ENABLED
  - VIKUNJA_MAILER_HOST
  - VIKUNJA_MAILER_PORT
  - VIKUNJA_MAILER_FROMEMAIL
  - VIKUNJA_MAILER_USERNAME
  - VIKUNJA_MAILER_PASSWORD
  - VIKUNJA_MAILER_FORCESSL
  - VIKUNJA_MAILER_SKIPTLSVERIFY
  - VIKUNJA_MAILER_AUTHTYPE
actions:
  - user-create
  - user-list
  - user-delete
  - user-reset-password
  - toggle-registration
  - toggle-user-deletion
  - manage-smtp
  - toggle-email-reminders
  - testmail
  - set-primary-url
  - toggle-link-sharing
  - max-attachment-size
  - doctor
```

Maintainer pointers:

- Env vars are built in `getVikunjaEnv(store, smtp, cors)`; the mailer fragment comes from `mailerEnv()`, which only the daemon and Send Test Email build — all in `startos/utils.ts`. Only the daemon passes `cors`; CLI callers pass `null` and get CORS off.
- All actions register through `startos/actions/index.ts`; the action files themselves are grouped into `accounts/`, `email/`, and `other/` subfolders matching their UI group.
- All init steps register through `startos/init/index.ts`.
- All locale strings live in `startos/i18n/dictionaries/default.ts` and `translations.ts`.
- Pitfalls (scratch image, USER 1000, volume layout, JWT secret) are documented inline where they bite: `startos/utils.ts` (passwd plant, shared env), `startos/init/initVolumeLayout.ts` (volume root mount + chown), and `startos/init/ensureSecret.ts` (persistent JWT secret).
