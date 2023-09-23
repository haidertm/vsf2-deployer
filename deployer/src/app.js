import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import { config } from './config/index.js';

const app = express();

app.use(bodyParser.json());
app.use('/', routes);

const port = config.port;
app.listen(port, () => {
  console.log('Webhook listener running on port ' + port);
});
