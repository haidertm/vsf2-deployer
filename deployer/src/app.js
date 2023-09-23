import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import { config } from './config/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(bodyParser.json());

//Using a middleware to identify issue.
app.use((req, res, next) => {
  console.log('Incoming Request Body:', req.body);
  next();
});

app.use('/', routes);

const port = config.port;
app.listen(port, () => {
  console.log('Webhook listener running on port ' + port);
});
