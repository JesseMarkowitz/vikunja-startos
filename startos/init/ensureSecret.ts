import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

/**
 * Persistent JWT secret.
 *
 * Vikunja's `service.secret` defaults to a random value generated at each
 * startup. That invalidates every existing JWT on every container restart —
 * so every user gets logged out. We generate a persistent secret once, store
 * it, and inject it via VIKUNJA_SERVICE_SECRET.
 *
 * Runs on every init kind, not just 'install'. The `existing` check below is
 * what preserves the secret across updates and restores — regenerating would
 * log everyone out, and reading it first means we never do. Gating on
 * `kind === 'install'` as well used to look like a second layer of the same
 * protection, but it was the only thing standing between an absent secret and
 * one being minted: any path that reached a later init without one — an
 * upgrade whose stored value didn't survive, a restore from a store that
 * predates this field — left it empty forever, and `main` hard-throws on an
 * empty secret. The service then restart-looped with no recoverable path,
 * because nothing outside install could ever fill it in.
 */
export const ensureSecret = sdk.setupOnInit(async (effects, kind, progress) => {
  const existing = await storeJson.read((s) => s.VIKUNJA_SERVICE_SECRET).once()
  if (existing) return

  // Generating 64 characters is instant — this phase exists to name the step,
  // not to occupy the bar, so it contributes the minimum.
  const phase = progress.addPhase(i18n('Generating session secret'), 1)
  const secret = utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 64,
  })
  await storeJson.merge(effects, { VIKUNJA_SERVICE_SECRET: secret })
  phase.complete()
})
