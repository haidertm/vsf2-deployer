import deployerAction from '../../services/deployer.js';
import { config } from '../../config/index.js'

export default async (req, res) => {
  try {
    const { user, repo, trigger, branch, commit, token } = req.body;
    console.log(`Trigger: ${ trigger }`);
    console.log(`repo: ${ repo }`);
    console.log(`Branch: ${ branch }`);
    console.log(`Commit: ${ commit }`);
    console.log(`token: ${ token }`);

    if (!token) {
      console.log('token not defined');
      return res.send('Token not provided, Github token is required to fetch the related artifact.')
    }

    const result = await deployerAction({ token, commitHash: commit });
    if (result?.status === 200 && result.message) {
      // res.status(result.status).send(result.message);
      res.send(result.message);
    } else {
      // res.status(result.status ?? 500).send(result);
      res.send(result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
};
