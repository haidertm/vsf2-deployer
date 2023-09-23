import axios from 'axios';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import { ensureDirectory, writeToFile } from './fileHelper'; // Importing your utility functions

export const downloadAndProcessArtifact = async (artifact, token) => {
  if (!artifact || !artifact.archive_download_url) {
    return {
      success: false,
      message: 'No artifact or download URL provided.'
    };
  }

  // Your Axios call for downloading the artifact
  const downloadUrl = artifact.archive_download_url;

  const { data: fileData } = await axios.get(downloadUrl, {
    headers: {
      Authorization: `token ${token}`
    },
    responseType: 'arraybuffer'
  });

  // Ensure the 'artifacts' directory exists
  const artifactsDir = path.join(__dirname, 'artifacts');
  ensureDirectory(artifactsDir); // Using your utility function

  // Save the ZIP file
  const zipPath = path.join(artifactsDir, 'downloaded_artifact.zip');
  writeToFile(zipPath, fileData); // Using your utility function

  // ... rest of the logic for unzipping and processing the artifact

  return {
    success: true,
    message: 'Artifact downloaded and processed successfully.'
  };
};
