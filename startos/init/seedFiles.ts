import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, _kind, progress) => {
  const phase = progress.addPhase(i18n('Seeding configuration'), 1)
  await storeJson.merge(effects, {})
  phase.complete()
})
