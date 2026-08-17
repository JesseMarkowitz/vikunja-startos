# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **`plantPasswd` must run before anything executes in a subcontainer.** The upstream image is `FROM scratch` with `USER 1000` and ships no `/etc/passwd` or `/etc/group`, so start-container's user resolution fails without it — daemon and every CLI action alike.
- **`busybox` exists because the app image has no shell.** `initVolumeLayout` needs one for `mkdir -p` + `chown -R`.
- **Mount the volume ROOT, not `subpath: 'db'`.** StartOS auto-creates a mounted subpath as uid 0, which a user-namespaced subcontainer cannot chown. Mounting the root and steering Vikunja's paths via `VIKUNJA_*_PATH` is what makes the ownership fixable.
- **`main` logs before it throws on a missing secret.** StartOS retries a failed `main` on a timer and surfaces nothing anywhere, so without the `console.error` it reads as an unexplained 10-second restart loop.
- **CORS on with an empty `publicurl` aborts Vikunja at startup.** `publicurl` therefore falls back to any reachable address, and with no address at all CORS is switched **off** rather than left at its default. Origins are whitespace-separated — viper reads the env value back through `GetStringSlice`, which splits on `strings.Fields`.
- **Every reachable address is a CORS origin**, read reactively — enabling Tor later re-runs `main` with the new address already allowed. The primary URL is a separate concern: outbound links only.
- **Backups exclude `*-wal`/`*-journal`/`*-shm`.** Capturing SQLite's sidecars mid-write can restore a database that disagrees with itself.
