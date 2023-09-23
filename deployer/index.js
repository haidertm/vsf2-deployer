import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// const AdmZip = require('adm-zip');
import AdmZip from 'adm-zip';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
// require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const testMsg = `Deployer is Active`;
  console.log(testMsg);
  res.send(testMsg);
});

/**
 * This is for test purposes
 */
app.get('/token/:token', async (req, res) => {

  const token = req.params.token;

  try {
    const {
      status,
      statusText,
      data,
      error
    } = await axios.get(`https://api.github.com/repos/tilemountainuk/vsf2-nuxt3/actions/artifacts`, {
      headers: {
        Authorization: `token ${ token }`
      }
    });


    if (!data) {
      res.status(status || 500).send('Something went wrong with data, We dont have data in response');
      return;
    }

    const { artifacts, total_count } = data;

    if (total_count === 0 || artifacts.length === 0) {
      res.status(404).send('No artifacts were found to deploy');
    }

    // Sort artifacts by most recently updated
    const sortedArtifacts = artifacts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const appArtifactName = 'apps-artifacts';
    const artifact = sortedArtifacts.find(artifact => artifact.name === appArtifactName); // Replace with your artifact name

    if (artifact && artifact.archive_download_url) {
      const downloadUrl = artifact.archive_download_url;

      const { data: fileData } = await axios.get(downloadUrl, {
        headers: {
          Authorization: `token ${ token }`
        },
        responseType: 'arraybuffer'
      });

      // Ensure the 'artifacts' directory exists
      const artifactsDir = path.join(__dirname, 'artifacts');
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir);
      }

      const zipPath = path.join(artifactsDir, `downloaded_artifact.zip`);
      fs.writeFileSync(zipPath, fileData);

      // Unzipping to get the TAR.GZ file
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(artifactsDir, true, true);

      // Delete the ZIP file after extracting
      try {
        fs.unlinkSync(zipPath);
      } catch (err) {
        console.error(`Error while deleting the ZIP file: ${err}`);
      }

      // Create the 'apps' directory relative to 'artifacts'
      const targetDirectory = path.join(__dirname, '..', 'apps');
      if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory);
      }

      const tarGzRegex = /\.tar\.gz$/;

      fs.readdir(artifactsDir, (err, files) => {
        if (err) {
          console.error(`Error reading artifacts directory: ${err}`);
          return;
        }

        files.forEach(file => {
          const isTarGz = tarGzRegex.test(file);
          console.log(`Full path: ${path.join(artifactsDir, file)}, isTarGz: ${isTarGz}`);
        });

        // Find the first file with a .tar.gz extension
        const tarFile = files.find(file => tarGzRegex.test(file));

        if (!tarFile) {
          console.error('No .tar.gz file found in the artifacts directory.');
          return;
        }

        const tarFilePath = path.join(artifactsDir, tarFile);

        // Execute the tar command
        exec(`tar -xvpzf "${tarFilePath}" -C "${targetDirectory}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error extracting file: ${error}`);
            return;
          }
          console.log(`Extraction successful: ${stdout}`);

          // Delete the tar file after successful extraction
          fs.unlinkSync(tarFilePath);
        });
      });
    }

    console.log('artifactIs', artifact);

    res.status(status).send({ data });
  } catch (error) {
    console.error(`Failed to download artifact: ${ error }`);
    res.status(500).send(error);
  }
});

app.post('/deploy', async (req, res) => {
  const { user, repo, trigger, branch, commit } = req.body;

  console.log(`Trigger: ${trigger}`);
  console.log(`Branch: ${branch}`);
  console.log(`Commit: ${commit}`);

  const appArtifactName = 'app-artifacts';
  const serverArtifactName = 'server-artifacts';

  const token = process.env.GH_TOKEN;

  try {
    const {
      status,
      statusText,
      data,
      error
    } = await axios.get(`https://api.github.com/repos/tilemountainuk/vsf2-nuxt3/actions/artifacts`, {
      headers: {
        Authorization: `token ${ req.params.token }`
      }
    });

    if (!data) {
      res.status(status || 500).send('Something went wrong with data, We dont have data in response');
      return;
    }

    const { artifacts, total_count } = data;

    if (total_count === 0 || artifacts.length === 0) {
      res.status(404).send('No artifacts were found to deploy');
    }

    const artifact = artifacts.find(artifact => artifact.name === appArtifactName); // Replace with your artifact name



    if (artifact) {
      const downloadUrl = artifact.archive_download_url;

      const { data: fileData } = await axios.get(downloadUrl, {
        headers: {
          Authorization: `token ${token}`,
        },
        responseType: 'arraybuffer',
      });

      const filePath = path.join(__dirname, 'artifact.zip');
      fs.writeFileSync(filePath, fileData);

      // Proceed with your deployment script
      exec('./deploy.sh', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
    }

  } catch (error) {
    console.error(`Failed to download artifact: ${error}`);
    res.status(500).send(error);
    return;
  }

  // const githubRepo = 'tilemountainuk/vsf2-nuxt3'; // Replace with your GitHub username and repo name

  // exec('./deploy.sh', (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing script: ${error}`);
  //     return;
  //   }
  //   console.log(`stdout: ${stdout}`);
  //   console.error(`stderr: ${stderr}`);
  // });

  // res.status(200).send('Received');
  res.status(200).send(req.body);
});

const port = process.env.PORT || 9191;
app.listen(port, () => {
  console.log('Webhook listener running on port ' + port);
});
