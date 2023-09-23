import deployerAction from '../../services/deployer.js';
import { config } from '../../config/index.js'

export default async (req, res) => {
  try {
    const { user, repo, trigger, branch, commit, token } = req.body;
    console.log(`Trigger: ${ trigger }`);
    console.log(`repo: ${ repo }`);
    console.log(`Branch: ${ branch }`);
    console.log(`Commit: ${ commit }`);
    res.status(200).send(req.body);
  } catch (err) {
    res.status(500).send(err);
  }


  // const result = await deployerAction({ token, commitHash: commit });
  // if (result.status && result.message) {
  //   res.status(result.status).send(result.message);
  // } else {
  //   res.send(result);
  // }
};
