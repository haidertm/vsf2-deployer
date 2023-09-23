// import axios from 'axios';
// import fs from 'fs';
// import path from 'path';
// ...and other dependencies you might need

import deployerAction from '../../services/deployer.js';
import { config } from '../../config/index.js'
import { randomString, toBase64 } from '../../helpers/base64.js';

export default async (req, res) => {
  try {
    const token = req.params.token;
    const result = await deployerAction({ token, commitHash: randomString() });
    if(result.status && result.message){
      res.status(result.status).send(result.message);
    }else{
      res.send(result);
    }
  } catch (err) {
    console.error(`Failed to download artifact: ${ err }`);
    res.status(500).send(err);
  }
};
