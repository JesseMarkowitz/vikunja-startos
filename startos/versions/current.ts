import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.5.0:0',
  releaseNotes: {
    en_US: `Updated Vikunja to 2.5.0.

**Security**

- A share link could act as another user. Update if you have ever enabled link sharing.

**Features**

- Pasting a list into quick add magic now creates every task in one go, in the order you wrote them.

**Fixes**

- A number of CalDAV, notification, and import fixes.

[Full release notes](https://vikunja.io/changelog/vikunja-2.5.0-was-released/)`,
    es_ES: `Vikunja actualizado a 2.5.0.

**Seguridad**

- Un enlace compartido podía actuar como otro usuario. Actualice si alguna vez ha activado el uso compartido por enlace.

**Novedades**

- Al pegar una lista en «quick add magic» ahora se crean todas las tareas de una vez, en el orden en que las escribió.

**Correcciones**

- Varias correcciones de CalDAV, notificaciones e importación.

[Notas de la versión completas](https://vikunja.io/changelog/vikunja-2.5.0-was-released/)`,
    de_DE: `Vikunja auf 2.5.0 aktualisiert.

**Sicherheit**

- Ein Freigabelink konnte im Namen eines anderen Benutzers handeln. Aktualisieren Sie, wenn Sie Linkfreigaben jemals aktiviert hatten.

**Neu**

- Das Einfügen einer Liste in „Quick Add Magic“ erstellt jetzt alle Aufgaben auf einmal, in der geschriebenen Reihenfolge.

**Fehlerbehebungen**

- Diverse Korrekturen bei CalDAV, Benachrichtigungen und Import.

[Vollständige Versionshinweise](https://vikunja.io/changelog/vikunja-2.5.0-was-released/)`,
    pl_PL: `Zaktualizowano Vikunję do 2.5.0.

**Bezpieczeństwo**

- Link udostępniania mógł działać jako inny użytkownik. Zaktualizuj, jeśli kiedykolwiek włączałeś udostępnianie linkiem.

**Nowości**

- Wklejenie listy do „quick add magic” tworzy teraz wszystkie zadania naraz, w podanej kolejności.

**Poprawki**

- Szereg poprawek w CalDAV, powiadomieniach i imporcie.

[Pełne informacje o wydaniu](https://vikunja.io/changelog/vikunja-2.5.0-was-released/)`,
    fr_FR: `Vikunja mis à jour en 2.5.0.

**Sécurité**

- Un lien de partage pouvait agir au nom d'un autre utilisateur. Mettez à jour si vous avez déjà activé le partage par lien.

**Nouveautés**

- Coller une liste dans « quick add magic » crée désormais toutes les tâches d'un coup, dans l'ordre saisi.

**Corrections**

- Plusieurs corrections CalDAV, notifications et import.

[Notes de version complètes](https://vikunja.io/changelog/vikunja-2.5.0-was-released/)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
