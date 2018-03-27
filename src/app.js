import http from 'http';
import Grid from 'gridfs-stream';
import { env, mongo, port, ip, apiRoot } from './config';
import mongoose from './services/mongoose';
import express from './services/express';
import api from './api';

const app = express(apiRoot, api);
const server = http.createServer(app);

const conn = mongoose.connect(mongo.uri, { useMongoClient: true });
mongoose.Promise = Promise;

let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

setImmediate(() => {
  server.listen(port, ip, () => {
    // eslint-disable-next-line no-console
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env);
  });
});

export default app;
