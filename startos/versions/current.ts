import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.6.0:2',
  releaseNotes: {
    en_US:
      'Installs, updates and restores no longer fail on servers with many attachments or slower disks.',
    es_ES:
      'Las instalaciones, actualizaciones y restauraciones ya no fallan en servidores con muchos adjuntos o discos más lentos.',
    de_DE:
      'Installationen, Updates und Wiederherstellungen schlagen auf Servern mit vielen Anhängen oder langsameren Datenträgern nicht mehr fehl.',
    pl_PL:
      'Instalacje, aktualizacje i przywracanie nie kończą się już błędem na serwerach z wieloma załącznikami lub wolniejszymi dyskami.',
    fr_FR:
      "Les installations, mises à jour et restaurations n'échouent plus sur les serveurs comportant de nombreuses pièces jointes ou des disques plus lents.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
