import { config } from '../../config/index.js';
import githubApi from '../../services/githubApi.js';

export default async (req, res) => {
  console.log('deleteArtifactsRouteIsHit');
  try {
    const { status, data } = await githubApi.getArtifacts({ token: config.gh_token, repo: config.repo });

    if (!data) {
      return {
        error: true,
        status,
        message: 'Something went wrong with data, We dont have data in response'
      };
    }

    const { artifacts, total_count } = data;

    console.log('currentTotalArtifactsAre', artifacts, total_count);

    if (!artifacts || total_count === 0) {
      const noArtifactsMessage = `We have no artifacts to delete, total count is:: ${ total_count }`;
      return res.send(noArtifactsMessage);
    }

    const deletePromises = artifacts.map((artifact) => {
      return githubApi.deleteArtifact({
        token: config.gh_token,
        repo: config.repo,
        artifactId: artifact.id
      });
    });

    const results = Promise.all(deletePromises);

    results.forEach((result, index) => {
      if (result.success) {
        console.log(`Successfully deleted artifact with ID: ${artifacts[index].id}`);
      } else {
        console.error(`Failed to delete artifact with ID: ${artifacts[index].id}. Error: ${result.error}`);
      }
    });

    res.send('Artifacts deletion attempted. Check logs for details.');
  } catch (err) {
    console.log({ token: config.gh_token, token2: process.env.GH_TOKEN });
    res.send(err);
  }
};
