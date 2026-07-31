import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

/**
 * Persistent JWT secret.
 *
 * Vikunja's `service.secret` defaults to a random value generated at each
 * startup. That invalidates every existing JWT on every container restart —
 * so every user gets logged out. We generate a persistent secret once on
 * install, store it, and inject via VIKUNJA_SERVICE_SECRET.
 *
 * On 'restore' the restored store.json already contains a secret.
 * On 'update' we preserve the existing secret (don't regenerate — that
 * would cause the post-update logout).
 */
export const ensureSecret = sdk.setupOnInit(async (effects, kind, progress) => {
  if (kind !== 'install') return

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
