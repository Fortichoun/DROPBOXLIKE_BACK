import http from 'http';
import cors from 'cors';
import { env, mongo, port, ip, apiRoot } from './config';
import mongoose from './services/mongoose';
import express from './services/express';
import api from './api';

const app = express(apiRoot, api);
app.use(cors());
const server = http.createServer(app);

mongoose.connect(mongo.uri, { useMongoClient: true });
mongoose.Promise = Promise;


setImmediate(() => {
  server.listen(port, ip, () => {
    // eslint-disable-next-line no-console
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env);
  });
});

export default app;
