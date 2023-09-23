import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: process.env.PORT || 9191,
  repo: process.env.REPO || 'tilemountainuk/vsf2-nuxt3',
  artifactName: process.env.ARTIFACT_NAME || 'apps-artifacts',
  artifactsDirectory: path.join(__dirname, '..', '..', 'artifacts'),
  releasesDir: path.join(__dirname, '..', '..', '..', process.env.RELEASES_DIR_NAME || 'releases'),
  liveDirectory: path.join(__dirname, '..', '..', '..', process.env.RELEASES_DIR_NAME || 'live')
};
