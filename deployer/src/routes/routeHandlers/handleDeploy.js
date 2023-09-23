import path from 'path';
import { config } from '../../config/index.js';
import { ensureDirectory } from '../../helpers/fileHelper.js';
import { randomString } from '../../helpers/base64.js';

export default (req, res) => {

  const releaseDir = path.join(config.releasesDir, randomString());  // Adjust path as needed
  console.log('releasesDirectoryPathIs', releaseDir);
  ensureDirectory(releaseDir);

  const testMsg = `releasesDirectoryPathIs::<br />${ releaseDir }`;
  // console.log(testMsg);
  res.send(testMsg);
};
