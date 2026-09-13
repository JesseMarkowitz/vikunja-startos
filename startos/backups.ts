import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  // 'main' holds the SQLite database and file attachments; 'startos' holds
  // store.json (JWT secret, primary URL, toggles, SMTP). The WAL holds
  // committed data — Vikunja never checkpoints on shutdown — so it is included.
  sdk.Backups.ofVolumes('main', 'startos').setOptions({
    exclude: ['*-shm'],
  }),
)
