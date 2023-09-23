import path from 'path';
import { config } from '../../config/index.js';
import { deleteOldestRelease, ensureDirectory } from '../../helpers/fileHelper.js';
import { randomString } from '../../helpers/base64.js';

export default async (req, res) => {

  const response = await deleteOldestRelease(config.releasesDir)

  // const testMsg = `releasesDirectoryPathIs::<br />${ releaseDir }`;
  console.log(response);
  res.send(response);
};
