import { config } from '../../config/index.js';
import { deleteOldestRelease } from '../../helpers/fileHelper.js';

export default async (req, res) => {
  const testMsg = `Deployer is Active`;
  console.log(testMsg);
  res.send(testMsg);
};
