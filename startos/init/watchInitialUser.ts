import { userCreate } from '../actions/accounts/userCreate'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { listVikunjaUsers } from '../utils'

/** Replay key StartOS files the Create User task under — `createTask` derives it
 * as `<packageId>:<actionId>` when the caller supplies none, and `clearTask`
 * takes the same key. */
const createUserTaskId = `${manifest.id}:${userCreate.id}`

/**
 * Watch the store on every init and surface a critical task pointing at the
 * Create User action when no Vikunja user exists yet. Public registration is
 * disabled by default, so this is the only way to bootstrap the first account.
 *
 * `initialUserCreated` is only ever set by the Create User action, so on its
 * own it answers "did the user bootstrap through us", not "does an account
 * exist" — an account made any other way (registration temporarily enabled, a
 * restore whose store predates the flag) left it false and the task nagged
 * forever. The flag is therefore treated as a cache, not as the truth: when it
 * is set we trust it and skip the work, and when it is not we ask Vikunja
 * itself before nagging, healing the flag if accounts turn out to exist.
 *
 * A task StartOS has already filed stays `active` until something retracts it —
 * declining to re-create it on the next pass does nothing, and a `critical` one
 * blocks the service from starting. So whenever a user is known to exist this
 * clears the task explicitly. `clearTask` removes by replay key and is a no-op
 * when nothing is filed, so the call is safe on every init. It runs on the
 * cached-flag path too: a service that healed its flag under an earlier build
 * still has the stale task, and this is what finally releases it.
 */
export const watchInitialUser = sdk.setupOnInit(
  async (effects, _kind, progress) => {
    const done = await storeJson
      .read((s) => s.initialUserCreated)
      .const(effects)

    if (!done) {
      // Booting Vikunja's runtime just to list users is slow enough to be worth
      // its own weight in the bar. Re-runs driven by the `.const` watcher above
      // are handed a detached tracker by the init harness, so this phase reports
      // during the install pass and is inert for the rest of the container's life.
      const phase = progress.addPhase(
        i18n('Checking for existing accounts'),
        20,
      )

      // Only reached before the first account exists, so the cost of booting a
      // CLI subcontainer is paid on fresh installs and on stores whose flag is
      // stale — never on a steady-state service.
      let users: { id: string }[]
      try {
        users = (await listVikunjaUsers(effects, await storeJson.read().once()))
          .users
      } catch (e) {
        // A fresh install has no database yet, so `user list` is expected to
        // fail here. Anything else that breaks the CLI lands in the same place,
        // and the safe reading is the same: assume nobody has bootstrapped.
        console.info(
          `Could not list Vikunja users, assuming none exist yet: ${String(e)}`,
        )
        users = []
      }

      phase.complete()

      if (users.length === 0) {
        await sdk.action.createOwnTask(effects, userCreate, 'critical', {
          reason: i18n(
            'Create your first Vikunja user account. Public registration is disabled by default, so this is the only way to create the initial account.',
          ),
        })
        return
      }

      await storeJson.merge(
        effects,
        { initialUserCreated: true },
        { allowWriteAfterConst: true },
      )
    }

    await sdk.action.clearTask(effects, createUserTaskId)
  },
)
