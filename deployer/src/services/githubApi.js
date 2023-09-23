import axios from 'axios';

const getArtifacts = async ({ token, repo }) => {
  const url = `https://api.github.com/repos/${ repo }/actions/artifacts`;
  const headers = {
    Authorization: `token ${token}`
  };

  const TIMEOUT = 15000; // 10 seconds

  try {
    console.log('------------------------');
    console.log('Fetching Artifacts List');
    console.log('URL:', url);
    console.log('------------------------');

    const response = await axios.get(url, { headers, timeout: TIMEOUT });

    console.log('--------------------------');
    console.log('Artifacts List fetched successfully');
    console.log(response?.data);
    console.log('--------------------------');

    return response;
  } catch (err) {
    console.log('Fetching Artifacts Failed', err);
    return {
      error: true,
      status: 500,
      message: 'Something went wrong with Artifacts Download'
    };
  }
};

const deleteArtifact = async ({ token, repo, artifactId }) => {
  const url = `https://api.github.com/repos/${ repo }/actions/artifacts/${ artifactId }`;
  const headers = {
    Authorization: `token ${token}`
  };

  try {
    const response = await axios.delete(url, { headers });
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

export default {
  getArtifacts,
  deleteArtifact
};
