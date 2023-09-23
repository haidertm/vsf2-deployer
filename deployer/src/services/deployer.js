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

    const message = {
      error: true,
      status,
      message: 'Something went wrong with data, We dont have data in response'
    };
    console.log(message)
    return message;
  }

  const { artifacts, total_count } = data;

  if (total_count === 0 || artifacts.length === 0) {
    const message = {
      error: true,
      status: 404,
      message: 'No artifacts were found to deploy'
    };
    // res.status(404).send('No artifacts were found to deploy');
    console.log({ message });
    return message;
  }

  console.log('Handling Deployment');

  const artifact = artifacts.find(artifact => artifact?.workflow_run?.head_sha && artifact.workflow_run.head_sha === commitHash); // Replace with your artifact name

  if (!artifact) {
    const message = {
      error: true,
      status: 404,
      message: `Artifact was not found for workflow commit ${ commitHash }`
    };
    console.log({ message })
    return message;
  }

  console.log('We have the artifact, Handling the ArtifactNow');

  return handleArtifacts({ artifact, token, commitHash })
};
