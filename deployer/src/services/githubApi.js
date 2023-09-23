import axios from 'axios';

const getArtifacts = async ({ token, repo }) => {
  const url = `https://api.github.com/repos/${ repo }/actions/artifacts`;
  const headers = {
    Authorization: `token ${token}`
  };
  return axios.get(url, { headers });
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
