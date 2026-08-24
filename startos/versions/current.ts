import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.4.0:5',
  releaseNotes: {
    en_US: `The "Run Diagnostics" action no longer repeats its report in a second field.`,
    es_ES: `La acción «Ejecutar diagnósticos» ya no repite su informe en un segundo campo.`,
    de_DE: `Die Aktion „Diagnose ausführen" wiederholt ihren Bericht nicht mehr in einem zweiten Feld.`,
    pl_PL: `Akcja „Uruchom diagnostykę" nie powtarza już swojego raportu w drugim polu.`,
    fr_FR: `L'action « Lancer le diagnostic » ne répète plus son rapport dans un second champ.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
