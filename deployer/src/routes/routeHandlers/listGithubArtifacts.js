import { config } from '../../config/index.js';
import githubApi from '../../services/githubApi.js';

export default async (req, res) => {
  const token = req.params.token ?? config.gh_token;
  try {
    const { status, data } = await githubApi.getArtifacts({ token, repo: config.repo });

    if (!data) {
      return res.send({
        error: true,
        status,
        message: 'Something went wrong with data, We dont have data in response of artifacts'
      })
    }
    const { artifacts, total_count } = data;
    return res.send({ artifacts, total_count });
  } catch (err) {
    console.log({ token: config.gh_token, token2: process.env.GH_TOKEN });
    res.send(err);
  }
};
