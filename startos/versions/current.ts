import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.4.0:4',
  releaseNotes: {
    en_US: `Vikunja now works at every address you expose it at.

- Fixes an upgrade from 2.3.0 that could leave Vikunja unable to start, restarting every few seconds. If your service is stuck this way, this update recovers it. You may need to log in again afterward.
- The web interface previously only worked at the one address stored as the primary URL; reaching it over Tor, a tunnel, or a second LAN address broke the interface. Every address Vikunja is reachable at is now accepted, and new addresses are picked up automatically.
- The primary URL setting now only affects links in outgoing email. It can no longer stop the service from starting.
- The "create your first user" prompt no longer appears when accounts already exist — for example accounts created through the web interface, or restored from a backup.
- Installing and updating now report step-by-step progress.`,
    es_ES: `Vikunja ahora funciona en todas las direcciones en las que lo publique.

- Corrige una actualización desde 2.3.0 que podía dejar Vikunja sin poder arrancar, reiniciándose cada pocos segundos. Si su servicio está en ese estado, esta actualización lo recupera. Puede que tenga que volver a iniciar sesión.
- Antes la interfaz web solo funcionaba en la dirección guardada como URL principal; acceder por Tor, un túnel o una segunda dirección LAN rompía la interfaz. Ahora se aceptan todas las direcciones en las que Vikunja es accesible, y las nuevas se detectan automáticamente.
- El ajuste de URL principal ahora solo afecta a los enlaces de los correos salientes. Ya no puede impedir que el servicio arranque.
- El aviso de «cree su primer usuario» ya no aparece cuando ya existen cuentas — por ejemplo, cuentas creadas desde la interfaz web o restauradas desde una copia de seguridad.
- La instalación y la actualización ahora muestran el progreso paso a paso.`,
    de_DE: `Vikunja funktioniert jetzt unter jeder Adresse, unter der Sie es bereitstellen.

- Behebt ein Upgrade von 2.3.0, nach dem Vikunja nicht mehr starten konnte und sich alle paar Sekunden neu startete. Ist Ihr Dienst davon betroffen, stellt dieses Update ihn wieder her. Möglicherweise müssen Sie sich danach erneut anmelden.
- Die Weboberfläche funktionierte bisher nur unter der als primäre URL gespeicherten Adresse; ein Zugriff über Tor, einen Tunnel oder eine zweite LAN-Adresse führte zu Fehlern. Jetzt wird jede Adresse akzeptiert, unter der Vikunja erreichbar ist, und neue Adressen werden automatisch übernommen.
- Die Einstellung „primäre URL" wirkt sich jetzt nur noch auf Links in ausgehenden E-Mails aus. Sie kann den Start des Dienstes nicht mehr verhindern.
- Die Aufforderung „Ersten Benutzer anlegen" erscheint nicht mehr, wenn bereits Konten existieren — etwa über die Weboberfläche angelegte oder aus einer Sicherung wiederhergestellte Konten.
- Installation und Aktualisierung zeigen jetzt den Fortschritt Schritt für Schritt an.`,
    pl_PL: `Vikunja działa teraz pod każdym adresem, pod którym ją udostępniasz.

- Naprawia aktualizację z 2.3.0, po której Vikunja mogła nie uruchamiać się, restartując się co kilka sekund. Jeśli Twoja usługa jest w tym stanie, ta aktualizacja ją przywraca. Może być konieczne ponowne zalogowanie.
- Wcześniej interfejs webowy działał tylko pod adresem zapisanym jako główny; dostęp przez Tor, tunel lub drugi adres LAN psuł interfejs. Teraz akceptowany jest każdy adres, pod którym Vikunja jest osiągalna, a nowe adresy są wykrywane automatycznie.
- Ustawienie głównego adresu URL wpływa teraz tylko na linki w wysyłanych wiadomościach e-mail. Nie może już uniemożliwić uruchomienia usługi.
- Monit „utwórz pierwszego użytkownika" nie pojawia się już, gdy konta już istnieją — na przykład konta utworzone przez interfejs webowy lub odtworzone z kopii zapasowej.
- Instalacja i aktualizacja pokazują teraz postęp krok po kroku.`,
    fr_FR: `Vikunja fonctionne désormais à chaque adresse où vous l'exposez.

- Corrige une mise à jour depuis 2.3.0 qui pouvait empêcher Vikunja de démarrer, avec un redémarrage toutes les quelques secondes. Si votre service est bloqué ainsi, cette mise à jour le rétablit. Vous devrez peut-être vous reconnecter ensuite.
- L'interface web ne fonctionnait auparavant qu'à l'adresse enregistrée comme URL principale ; y accéder via Tor, un tunnel ou une seconde adresse LAN cassait l'interface. Toutes les adresses auxquelles Vikunja est joignable sont maintenant acceptées, et les nouvelles sont prises en compte automatiquement.
- Le réglage de l'URL principale n'affecte plus que les liens des e-mails sortants. Il ne peut plus empêcher le service de démarrer.
- L'invitation à « créer votre premier utilisateur » n'apparaît plus lorsque des comptes existent déjà — par exemple des comptes créés depuis l'interface web ou restaurés depuis une sauvegarde.
- L'installation et la mise à jour affichent désormais la progression étape par étape.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
