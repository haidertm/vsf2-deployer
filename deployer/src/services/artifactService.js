import axios from 'axios';
import path from 'path';
import { deleteOldestRelease, ensureDirectory, extractTarGz, updateSymlink, writeToFile } from '../helpers/fileHelper.js';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { config } from '../config/index.js';


const { artifactsDirectory } = config;
const tarGzRegex = /\.tar\.gz$/;

export const downloadArtifact = async ({ artifact, token, commitHash }) => {
  try {
    if (!artifact || !artifact.archive_download_url) {
      return {
        error: true,
        status: 404,
        message: 'No artifact or download URL provided.'
      };
    }

    // Your Axios call for downloading the artifact
    const downloadUrl = artifact.archive_download_url;

    let fileData;
    await axios.get(downloadUrl, {
      headers: {
        Authorization: `token ${ token }`
      },
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total > 0) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Download progress: ${percentCompleted}%`);
        } else {
          const downloadedMB = (progressEvent.loaded / (1024 * 1024)).toFixed(2);
          console.log(`Downloaded: ${downloadedMB} MB`);
        }
      }
    })
      .then(({ data }) => fileData = data)
      .catch((err) => {
        return {
          error: true,
          status: 500,
          message: 'Failed to download Artifact'
        };
      })

    // Ensure the 'artifacts' directory exists
    ensureDirectory(artifactsDirectory);

    // Save the ZIP file
    const zipPath = path.join(artifactsDirectory, 'downloaded_artifact.zip');
    writeToFile(zipPath, fileData);

    // Unzipping to get the TAR.GZ file
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(artifactsDirectory, true, true, undefined);

    // Delete the ZIP file after extracting
    try {
      fs.unlinkSync(zipPath);
    } catch (err) {
      console.error(`Error while deleting the ZIP file: ${ err }`);
    }

    return {
      error: false,
      status: 200,
      message: 'Artifact downloaded successfully.'
    };
  } catch (err) {
    return {
      error: true,
      status: 500,
      message: err
    };
  }
};
export const handleArtifacts = async ({ artifact, token, commitHash }) => {

  console.log('insideHandling Artifacts', artifact);

  const { status, message: downloadArtifactMessage } = await downloadArtifact({ artifact, token, commitHash })

  console.log('downloadStatus', { status, message: downloadArtifactMessage })

  if (status !== 200) {
    return {
      error: true,
      status,
      message: downloadArtifactMessage
    }
  }

  try {
    // Create a new directory under 'releases' for this commit hash
    const releaseDir = path.join(config.releasesDir, commitHash);  // Adjust path as needed
    console.log('releasesDirectoryPathIs', releaseDir);
    ensureDirectory(releaseDir);

    // Extract to the apps directory under the current commit hash
    const appsDir = path.join(releaseDir, 'apps');
    ensureDirectory(appsDir);

    const files = await fs.promises.readdir(artifactsDirectory);
    const tarFile = files.find(file => tarGzRegex.test(file));


    if (!tarFile) {
      return {
        error: true,
        status: 404,
        message: `No .tar.gz file found in the artifacts directory.`
      }
    }

    const tarFilePath = path.join(artifactsDirectory, tarFile);

    console.log('tarFilePathWouldBe', tarFilePath)
    console.log('appsDirPathWouldBe', appsDir)

    // Use your helper to extract tar.gz
    await extractTarGz({
      tarFilePath: tarFilePath,
      targetDirectory: appsDir,
      unlink: true
    });

    // Update the 'live' symlink to point to the latest release
    updateSymlink(appsDir, config.liveDirectory);  // Adjust path as needed

    // Delete the oldest release if there are more than 3
    await deleteOldestRelease(config.releasesDir);  // Adjust path as needed


    return {
      error: false,
      status: 200,
      message: 'Artifact handled successfully.'
    };

  } catch (err) {
    const message = `Error reading artifacts directory: ${ err }`;
    console.error(message);
    return {
      error: true,
      status: 500,
      message: `Error reading artifacts directory: ${ err }`
    }
  }
}


