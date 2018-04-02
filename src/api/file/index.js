import { Router } from 'express';
import multer from 'multer';
import Grid from 'gridfs-stream';
// eslint-disable-next-line
import fse from 'fs-extra';
import fs from 'fs';
import { mongo } from '../../config';
import mongoose from '../../services/mongoose';

const router = new Router();
const rootPath = 'D:/SupFiles';

let gfs;
const conn = mongoose.createConnection(mongo.uri);

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = multer.diskStorage({
  async destination(req, file, cb, next) {
    const fullPath = `${rootPath}/${req.query.username}/${req.query.path}`;
    try {
      await fse.ensureDir(fullPath);
      cb(null, fullPath);
    } catch (err) {
      next(err);
    }
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post('/upload', upload.array('file', 12), async (req, res) => {
  res.json({ files: req.files });
});

router.get('/allFiles', (req, res) => {
  const filesInDirectory = [];
  const fullPath = `${rootPath}/${req.query.username}/${req.query.path}`;
  fs.readdir(fullPath, (err, files) => {
    if (files) {
      files.forEach((file) => {
        const isDirectory = fs.statSync(`${fullPath}/${file}`).isDirectory();
        filesInDirectory.push({ filename: file, isDirectory });
      });
      return res.json(filesInDirectory);
    }
    return res.json({});
  });
});

router.post('/remove', (req, res, next) => {
  const fullPath = `${rootPath}/${req.body.username}/${req.body.path}`;
  const file = `${fullPath}/${req.body.filename}`;
  fse.remove(file, (err) => {
    if (err) return next(err);
    return res.json({ result: 'SUCCESS' });
  });
});

router.post('/download', (req, res) => {
  const fullPath = `${rootPath}/${req.body.username}/${req.body.path}`;
  const file = `${fullPath}/${req.body.filename}`;
  return res.download(file);
});

export default router;
