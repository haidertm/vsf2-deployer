import express from 'express';
import handleRoot from './routeHandlers/handleRoot.js';
import handleToken from './routeHandlers/handleWebToken.js';
import handleDeploy from './routeHandlers/handleDeploy.js';

const router = express.Router();

// Root
router.get('/', handleRoot);

// Token
router.get('/token/:token', handleToken);

// Deploy
router.post('/deploy', handleDeploy);

export default router;
