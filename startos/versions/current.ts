import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.6.0:1',
  releaseNotes: {
    en_US: `Updated Vikunja to 2.6.0. This also brings in 2.5.0, which was not packaged on its own.

**In this package**

- Backups now include the database's write-ahead log. Backups made by earlier versions of this package may be missing recent changes, so take a new backup after updating.
- New **Repair** action: fixes tasks that appear out of order or move on reload, projects stranded by a deleted parent project, attachments saved without a file type, and leftover ordering records. It runs as a dry run by default; run it once after this update.
- **Reset User Password** and **Delete User** pick the account from a list.
- A failed account action reports Vikunja's error.

**Security**

- 2.6.0 fixes 18 security issues, five of them rated high, and 2.5.0 fixed one more. Among them: a share link could act as another user or obtain an admin session; a crafted import, filter or image could crash the server by exhausting its memory; team members, email addresses and two-factor secrets were readable by users who should not see them; and some login endpoints, including CalDAV's, were not rate-limited. Please update.

**Features**

- Import from Planka: projects, boards, lists, cards, labels, comments and attachments.
- Attachments preview in place: images with zoom, plus video and audio playback.
- Changing your email address now waits for you to confirm the new one, so a typo no longer locks you out.
- Tasks you create are subscribed to automatically, and project subscribers hear about new tasks.
- Pasting a list into quick add magic creates every task at once, in the order you wrote them.

**Fixes**

- CalDAV, editor, archiving and notification fixes.

Full release notes: [2.5.0](https://vikunja.io/changelog/vikunja-2.5.0-was-released/), [2.6.0](https://vikunja.io/changelog/vikunja-2.6.0-was-released/)`,
    es_ES: `Vikunja actualizado a 2.6.0. Incluye también 2.5.0, que no se empaquetó por separado.

**En este paquete**

- Las copias de seguridad ahora incluyen el registro de escritura anticipada (WAL) de la base de datos. Las copias hechas con versiones anteriores de este paquete pueden omitir los cambios recientes, así que haga una copia nueva después de actualizar.
- Nueva acción **Reparar**: corrige las tareas que aparecen desordenadas o se mueven al recargar, los proyectos que quedaron sueltos al eliminarse su proyecto padre, los adjuntos guardados sin tipo de archivo y los registros de orden sobrantes. De forma predeterminada se ejecuta como simulación; ejecútela una vez después de esta actualización.
- **Restablecer contraseña de usuario** y **Eliminar usuario** eligen la cuenta de una lista.
- Una acción de cuentas que falla muestra el error de Vikunja.

**Seguridad**

- 2.6.0 corrige 18 problemas de seguridad, cinco de ellos de gravedad alta, y 2.5.0 corrigió uno más. Entre ellos: un enlace compartido podía actuar como otro usuario u obtener una sesión de administrador; una importación, un filtro o una imagen manipulados podían bloquear el servidor agotando su memoria; los miembros de equipos, las direcciones de correo y los secretos de doble factor eran visibles para usuarios que no debían verlos; y algunos puntos de inicio de sesión, incluido el de CalDAV, no limitaban los intentos. Actualice, por favor.

**Novedades**

- Importación desde Planka: proyectos, tableros, listas, tarjetas, etiquetas, comentarios y adjuntos.
- Vista previa de adjuntos: imágenes con zoom y reproducción de vídeo y audio.
- Al cambiar su dirección de correo, la nueva no se activa hasta que la confirme, así que una errata ya no le deja sin acceso.
- Se suscribe automáticamente a las tareas que crea, y los suscriptores de un proyecto reciben aviso de las tareas nuevas.
- Al pegar una lista en «quick add magic» se crean todas las tareas de una vez, en el orden en que las escribió.

**Correcciones**

- Correcciones de CalDAV, del editor, del archivado y de las notificaciones.

Notas de la versión completas: [2.5.0](https://vikunja.io/changelog/vikunja-2.5.0-was-released/), [2.6.0](https://vikunja.io/changelog/vikunja-2.6.0-was-released/)`,
    de_DE: `Vikunja auf 2.6.0 aktualisiert. Enthält auch 2.5.0, das nicht einzeln paketiert wurde.

**In diesem Paket**

- Sicherungen enthalten jetzt das Write-Ahead-Log der Datenbank. Mit früheren Versionen dieses Pakets erstellte Sicherungen können jüngste Änderungen auslassen. Erstellen Sie daher nach dem Update eine neue Sicherung.
- Neue Aktion **Reparieren**: behebt Aufgaben in falscher Reihenfolge oder solche, die sich beim Neuladen verschieben, Projekte ohne übergeordnetes Projekt, Anhänge ohne Dateityp und übrig gebliebene Sortierdatensätze. Standardmäßig läuft sie als Probelauf; führen Sie sie einmal nach diesem Update aus.
- **Benutzerpasswort zurücksetzen** und **Benutzer löschen** wählen das Konto aus einer Liste.
- Eine fehlgeschlagene Kontoaktion meldet den Fehler von Vikunja.

**Sicherheit**

- 2.6.0 behebt 18 Sicherheitsprobleme, fünf davon als hoch eingestuft, und 2.5.0 behob ein weiteres. Darunter: Ein Freigabelink konnte als anderer Benutzer handeln oder eine Administratorsitzung erlangen; ein präparierter Import, Filter oder ein Bild konnte den Server durch Speichererschöpfung zum Absturz bringen; Teammitglieder, E-Mail-Adressen und Zwei-Faktor-Geheimnisse waren für Benutzer lesbar, die sie nicht sehen sollten; und einige Anmeldeendpunkte, darunter der von CalDAV, begrenzten Versuche nicht. Bitte aktualisieren Sie.

**Neu**

- Import aus Planka: Projekte, Boards, Listen, Karten, Labels, Kommentare und Anhänge.
- Vorschau von Anhängen: Bilder mit Zoom sowie Video- und Audiowiedergabe.
- Beim Ändern der E-Mail-Adresse wird die neue erst nach Ihrer Bestätigung aktiv, sodass ein Tippfehler Sie nicht mehr aussperrt.
- Selbst erstellte Aufgaben werden automatisch abonniert, und Abonnenten eines Projekts erfahren von neuen Aufgaben.
- Eine in „Quick Add Magic" eingefügte Liste legt alle Aufgaben auf einmal an, in der geschriebenen Reihenfolge.

**Fehlerbehebungen**

- Korrekturen bei CalDAV, im Editor, beim Archivieren und bei Benachrichtigungen.

Vollständige Versionshinweise: [2.5.0](https://vikunja.io/changelog/vikunja-2.5.0-was-released/), [2.6.0](https://vikunja.io/changelog/vikunja-2.6.0-was-released/)`,
    pl_PL: `Zaktualizowano Vikunję do 2.6.0. Zawiera też wersję 2.5.0, która nie została spakowana osobno.

**W tym pakiecie**

- Kopie zapasowe zawierają teraz dziennik zapisu z wyprzedzeniem (WAL) bazy danych. Kopie wykonane poprzednimi wersjami tego pakietu mogą pomijać ostatnie zmiany, dlatego po aktualizacji wykonaj nową kopię zapasową.
- Nowa akcja **Napraw**: naprawia zadania w złej kolejności lub przesuwające się po odświeżeniu, projekty pozostawione po usunięciu projektu nadrzędnego, załączniki zapisane bez typu pliku oraz pozostawione rekordy kolejności. Domyślnie działa w trybie próbnym; uruchom ją raz po tej aktualizacji.
- **Resetuj hasło użytkownika** i **Usuń użytkownika** wybierają konto z listy.
- Nieudana akcja dotycząca kont pokazuje błąd Vikunji.

**Bezpieczeństwo**

- 2.6.0 naprawia 18 problemów bezpieczeństwa, z czego pięć oceniono jako poważne, a 2.5.0 naprawiła jeszcze jeden. Wśród nich: link udostępniania mógł działać jako inny użytkownik lub uzyskać sesję administratora; spreparowany import, filtr lub obraz mógł zawiesić serwer, wyczerpując jego pamięć; członkowie zespołów, adresy e-mail i sekrety uwierzytelniania dwuskładnikowego były widoczne dla użytkowników, którzy nie powinni ich widzieć; a niektóre punkty logowania, w tym CalDAV, nie ograniczały liczby prób. Prosimy o aktualizację.

**Nowości**

- Import z Planki: projekty, tablice, listy, karty, etykiety, komentarze i załączniki.
- Podgląd załączników: obrazy z powiększeniem oraz odtwarzanie wideo i dźwięku.
- Przy zmianie adresu e-mail nowy adres zaczyna działać dopiero po potwierdzeniu, więc literówka nie odcina już dostępu do konta.
- Tworzone przez Ciebie zadania są subskrybowane automatycznie, a subskrybenci projektu dostają powiadomienia o nowych zadaniach.
- Wklejenie listy do „quick add magic" tworzy wszystkie zadania naraz, w kolejności, w jakiej je napisano.

**Poprawki**

- Poprawki CalDAV, edytora, archiwizacji i powiadomień.

Pełne informacje o wydaniu: [2.5.0](https://vikunja.io/changelog/vikunja-2.5.0-was-released/), [2.6.0](https://vikunja.io/changelog/vikunja-2.6.0-was-released/)`,
    fr_FR: `Vikunja mis à jour vers 2.6.0. Inclut aussi la 2.5.0, qui n'a pas été empaquetée séparément.

**Dans ce paquet**

- Les sauvegardes incluent désormais le journal d'écriture anticipée (WAL) de la base de données. Les sauvegardes faites avec les versions précédentes de ce paquet peuvent omettre les modifications récentes ; faites donc une nouvelle sauvegarde après la mise à jour.
- Nouvelle action **Réparer** : corrige les tâches dans le mauvais ordre ou qui se déplacent au rechargement, les projets laissés sans parent après la suppression de celui-ci, les pièces jointes enregistrées sans type de fichier et les enregistrements de tri résiduels. Elle s'exécute par défaut en simulation ; lancez-la une fois après cette mise à jour.
- **Réinitialiser le mot de passe utilisateur** et **Supprimer l'utilisateur** choisissent le compte dans une liste.
- Une action sur les comptes qui échoue affiche l'erreur de Vikunja.

**Sécurité**

- La 2.6.0 corrige 18 problèmes de sécurité, dont cinq jugés graves, et la 2.5.0 en corrigeait un de plus. Parmi eux : un lien de partage pouvait agir en tant qu'un autre utilisateur ou obtenir une session administrateur ; un import, un filtre ou une image malveillants pouvaient faire planter le serveur en épuisant sa mémoire ; les membres d'équipe, les adresses e-mail et les secrets de double authentification étaient lisibles par des utilisateurs qui ne devaient pas les voir ; et certains points de connexion, dont celui de CalDAV, ne limitaient pas les tentatives. Mettez à jour, s'il vous plaît.

**Nouveautés**

- Import depuis Planka : projets, tableaux, listes, cartes, étiquettes, commentaires et pièces jointes.
- Aperçu des pièces jointes : images avec zoom, lecture vidéo et audio.
- Lors d'un changement d'adresse e-mail, la nouvelle n'est active qu'après votre confirmation ; une faute de frappe ne vous bloque donc plus.
- Vous êtes abonné automatiquement aux tâches que vous créez, et les abonnés d'un projet sont prévenus des nouvelles tâches.
- Coller une liste dans « quick add magic » crée toutes les tâches d'un coup, dans l'ordre où vous les avez écrites.

**Corrections**

- Corrections de CalDAV, de l'éditeur, de l'archivage et des notifications.

Notes de version complètes : [2.5.0](https://vikunja.io/changelog/vikunja-2.5.0-was-released/), [2.6.0](https://vikunja.io/changelog/vikunja-2.6.0-was-released/)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
