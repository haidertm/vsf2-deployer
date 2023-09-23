import express from 'express';
import handleRoot from './routeHandlers/handleRoot.js';
import handleToken from './routeHandlers/handleWebToken.js';
import handleDeploy from './routeHandlers/handleDeploy.js';
import deleteGithubArtifacts from './routeHandlers/deleteGithubArtifacts.js';
import listGithubArtifacts from './routeHandlers/listGithubArtifacts.js';

const router = express.Router();

// Root
router.get('/', handleRoot);

// Token
router.get('/token/:token', handleToken);

// Deploy
router.post('/deploy', handleDeploy);

// Delete All Artifacts
router.get('/artifacts/delete', deleteGithubArtifacts)
router.get('/artifacts/list/:token?', listGithubArtifacts)

export default router;
