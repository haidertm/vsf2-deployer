import deployerAction from '../../services/deployer.js';
import { config } from '../../config/index.js'
import { deleteOldestRelease, runShellCommand } from '../../helpers/fileHelper.js';
import path from 'path';
import { logError, logInfo } from '../../utils/logger.js';


const deployFunction = async ({ user, repo, trigger, branch, commit, token }) => {

  logInfo(`TimeOut Completed, Deployment Started for commit ${ commit }`);
  try {
    const result = await deployerAction({ token, commitHash: commit });
    if (result?.status === 200 && result.message) {

      try {
        const activeReleaseDirectory = config.liveDirectory;

        // Create the full path for the server subdirectory
        const serverDir = path.join(activeReleaseDirectory, 'server');

        // Create the parent directory for running pm2 commands
        const parentDir = path.resolve(activeReleaseDirectory, '..');

        // Run yarn install or yarn command of your choice
        await runShellCommand('yarn install', serverDir);

        // Read the ecosystem.config.js file
        // const ecosystemConfig = require('../../../../ecosystem.config.js');  // Replace with the actual path to your ecosystem.config.js

        // Extract the app names
        // const appNames = ecosystemConfig.apps.map(app => app.name).join(',');

        // // Run PM2 commands using Promise.all
        // Promise.all([
        //   runShellCommand(`pm2 startOrRestart ecosystem.config.js --only "${appNames}"`)
        // ]).then(results => {
        //   console.log('All PM2 commands executed successfully:', results);
        // }).catch(err => {
        //   console.log('An error occurred:', err);
        // });

        // Run pm2 restart or pm2 command of your choice
        await runShellCommand('pm2 startOrRestart ecosystem.config.js', parentDir);
      } catch (err) {
        logError('some error occurred');
      }

      // We now need to also execute the yarn and pm2 command to activate new version.
      logInfo('Deployment has been completed Successfully!!!');
      return true; //Successful
    } else {
      logError(result)
      return false;
    }
  } catch (err) {
    logError('caught an error', err);
    return false;
  }
}

export default async (req, res) => {

  const { user, repo, trigger, branch, commit, token } = req.body;

  if (!token) {
    const message = `Token not provided, Github token is required to fetch the related artifact.`;
    console.log(message);
    return res.send(message)
  }

  if (!commit) {
    const message = `Commit not provided, Github commit is required to fetch the related artifact.`;
    console.log(message);
    return res.send(message)
  }

  const delayMessage = `Webhook deployment request received, processing will be delayed a bit to ensure we have completed workflow.`;
  console.log(delayMessage);
  // Initial response to acknowledge the request
  res.status(202).send(delayMessage);

  setTimeout(async () => {
    // Deploy the latest release
    const deployResult = await deployFunction({ user, repo, trigger, branch, commit, token });

    if (deployResult) {
      // Delete the oldest release if there are more than 3
      await deleteOldestRelease(config.releasesDir);  // Adjust path as needed
    }
  }, config.delayTheDeployment ?? 5000)
};
