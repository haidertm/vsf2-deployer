import deployerAction from '../../services/deployer.js';
import { config } from '../../config/index.js'

const deployFunction = async ({ user, repo, trigger, branch, commit, token }) => {

  console.log(`TimeOut Completed, Deployment Started for commit ${ commit }`);
  try {
    const result = await deployerAction({ token, commitHash: commit });
    if (result?.status === 200 && result.message) {
      console.log('Deployment has been completed Successfully!!!');
    } else {
      console.log(result)
    }
  } catch (err) {
    console.log('caught an error', err);
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

  console.log('Webhook deployment request received');
  // Initial response to acknowledge the request
  res.status(202).send('Webhook deployment request received, processing will be delayed a bit to ensure we have completed workflow.');

  setTimeout(async () => {
    await deployFunction({ user, repo, trigger, branch, commit, token });
  }, config.delayTheDeployment ?? 5000)
};
