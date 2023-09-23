import githubApi from './githubApi.js';
import { config } from '../config/index.js'
import { handleArtifacts } from './artifactService.js';

export default async ({ token, commitHash }) => {

  if (!token) {
    return {
      error: true,
      status: 404,
      message: 'Token not provided, Github token is required to fetch the related artifact.'
    };
  }

  const { status, data } = await githubApi.getArtifacts({ token, repo: config.repo });

  if (!data) {
    return {
      error: true,
      status,
      message: 'Something went wrong with data, We dont have data in response'
    };
  }

  const { artifacts, total_count } = data;

  if (total_count === 0 || artifacts.length === 0) {
    // res.status(404).send('No artifacts were found to deploy');
    return {
      error: true,
      status: 404,
      message: 'No artifacts were found to deploy'
    };
  }

  console.log('Handling Deployment');

  // Sort artifacts by most recently updated
  // const sortedArtifacts = artifacts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  // const artifact = sortedArtifacts.find(artifact => artifact.name === config.artifactName); // Replace with your artifact name
  const artifact = artifacts.find(artifact => artifact?.workflow_run?.head_sha && artifact.workflow_run.head_sha === commitHash); // Replace with your artifact name

  if (!artifact) {
    return {
      error: true,
      status: 404,
      message: `Artifact was not found for workflow commit ${ commitHash }`
    };
  }

  return handleArtifacts({ artifact, token, commitHash })
};
