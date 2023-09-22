import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
app.get('/{token}', async (req, res) => {


  const response = await axios.get(`https://api.github.com/repos/${repo}/actions/artifacts`, {
    headers: {
      Authorization: `token ${req.params.token}`,
    },
  });

  console.log('responseWouldBe', response);
  res.send(response);
});

app.post('/deploy', async (req, res) => {
  const { user, repo, trigger, branch, commit } = req.body;

  console.log(`Trigger: ${trigger}`);
  console.log(`Branch: ${branch}`);
  console.log(`Commit: ${commit}`);

  const token = process.env.GH_TOKEN;

  try {
    const { data } = await axios.get(`https://api.github.com/repos/${repo}/actions/artifacts`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });


    console.log('artifacts', data, data?.artifacts);

    const artifact = data.artifacts.find(artifact => artifact.name === 'YOUR_ARTIFACT_NAME'); // Replace with your artifact name

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
