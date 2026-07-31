import { setPrimaryUrl } from '../actions/other/setPrimaryUrl'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getWebuiUrls } from '../utils'

/** Vikunja appends a trailing slash to publicurl internally; the address list
 * carries none. Compare without one so an otherwise-identical URL doesn't read
 * as missing. */
const sameUrl = (a: string, b: string) =>
  a.replace(/\/+$/, '') === b.replace(/\/+$/, '')

/**
 * Manage the primary URL across the container lifetime.
 *
 * Two responsibilities:
 *
 * 1. Auto-seed. If the stored VIKUNJA_SERVICE_PUBLICURL is empty, merge in a
 *    .local URL so the daemon has a usable public URL out of the box. The
 *    operator can change it any time via the Set Primary URL action — we do
 *    not nag them with a task on install.
 *
 * 2. Re-surface on breakage. If the stored URL is set but no longer reachable
 *    (e.g. the operator disabled the LAN gateway), prompt for a new one. This
 *    is `important`, not `critical`: the daemon allows every reachable address
 *    as a CORS origin and falls back to one for publicurl, so a stale value
 *    costs correct links in outgoing email, not access to the service.
 *
 * `.const(effects)` on both reads registers the reactive watcher for the
 * container lifetime — when URLs or the store change, this re-runs.
 */
export const setupPrimaryUrl = sdk.setupOnInit(
  async (effects, _kind, progress) => {
    // Reads host state and at most writes one store key — quick, so it carries
    // little weight. Like the account check, `.const` re-runs get a detached
    // tracker, so this reports only on the install pass.
    const phase = progress.addPhase(i18n('Resolving primary URL'), 2)

    const urls = await getWebuiUrls(effects)
    const current = await storeJson
      .read((s) => s.VIKUNJA_SERVICE_PUBLICURL)
      .const(effects)

    if (!current) {
      const seeded = urls.find((u) => u.includes('.local')) ?? urls[0] ?? ''
      if (seeded) {
        await storeJson.merge(
          effects,
          { VIKUNJA_SERVICE_PUBLICURL: seeded },
          { allowWriteAfterConst: true },
        )
      }
    } else if (urls.length > 0 && !urls.some((u) => sameUrl(u, current))) {
      await sdk.action.createOwnTask(effects, setPrimaryUrl, 'important', {
        reason: i18n(
          'Your Vikunja primary URL is no longer available. Pick a new one so email links point somewhere reachable.',
        ),
      })
    }

    phase.complete()
  },
)
