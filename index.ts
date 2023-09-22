const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.get('/deployer', (req, res) => {
  const testMsg = `its a deployer test`;
  console.log(testMsg);
  res.send(testMsg);
});
app.post('/deploy', (req, res) => {
  const { trigger, branch, commit } = req.body;

  console.log(`Trigger: ${trigger}`);
  console.log(`Branch: ${branch}`);
  console.log(`Commit: ${commit}`);

  exec('./deploy.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  res.status(200).send('Received');
});

const port = process.env.PORT || 9191;
app.listen(port, () => {
  console.log('Webhook listener running on port 3000');
});
