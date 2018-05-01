import { Router } from 'express';
import multer from 'multer';
import Grid from 'gridfs-stream';
// eslint-disable-next-line
import fse from 'fs-extra';
import fs from 'fs';
import getSize from 'get-folder-size';
import archiver from 'archiver';
var mime = require('mime-types')
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
    const fullPath = `${rootPath}/${req.query.userFolder}/${req.query.path}`;
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
  const fullPath = req.query.path ?
    `${rootPath}/${req.query.userFolder}/${req.query.path}` :
    `${rootPath}/${req.query.userFolder}`;
  fs.readdir(fullPath, (err, files) => {
    if (files) {
      files.forEach((file) => {
        let imageBuffer = '';
        let isVideo = false;
        if (mime.lookup(file) && mime.lookup(file).includes('image')) {
          imageBuffer = new Buffer(fs.readFileSync(`${fullPath}/${file}`)).toString("base64");
        }
        if (mime.lookup(file) && mime.lookup(file).includes('video')) {
          isVideo = true;
        }
        const isFolder = fs.statSync(`${fullPath}/${file}`).isDirectory();
        filesInDirectory.push({ filename: file, isFolder, imageBuffer, isVideo });
      });
      return res.json(filesInDirectory);
    }
    return res.json({});
  });
});

router.post('/remove', (req, res, next) => {
  const fullPath = `${rootPath}/${req.body.userFolder}/${req.body.path}`;
  const file = `${fullPath}/${req.body.filename}`;
  fse.remove(file, (err) => {
    if (err) return next(err);
    return res.json({ result: 'SUCCESS' });
  });
});

router.post('/download', (req, res) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const file = `${fullPath}/${req.body.filename}`;
  if (!req.body.isFolder) {
    return res.download(file);
  }
  const archive = archiver('zip');

  archive.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });

  // on stream closed we can end the request
  archive.on('end', () => {
    console.log('Archive wrote %d bytes', archive.pointer());
  });

  res.attachment('archive-name.zip');
  archive.pipe(res);

  archive.directory(file, req.body.filename);


  return archive.finalize();
});

router.post('/newFolder', (req, res, next) => {
  const fullPath = `${rootPath}/${req.body.userFolder}/${req.body.path}`;
  const folder = `${fullPath}/${req.body.folderName}`;
  fse.ensureDir(folder, (err) => {
    if (err) return next(err);
    return res.json({ result: 'SUCCESS' });
  });
});

router.get('/folderSize', (req, res, next) => {
  const fullPath = `${rootPath}/${req.query.userFolder}`;
  getSize(fullPath, (err, size) => {
    if (err) {
      next(err);
    }
    console.log(`${size} bytes`);
    console.log(`${(size / 1024 / 1024).toFixed(2)} MB`);
    res.json({ folderSize: size });
  });
});

router.post('/move', (req, res, next) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const fileToMove = `${fullPath}/${req.body.sourceFile}`;
  const FolderDestination = `${fullPath}/${req.body.destinationFile}/${req.body.sourceFile}`;
  fse.move(fileToMove, FolderDestination)
    .then(() => res.json({ result: 'SUCCESS' }))
    .catch((err) => {
      next(err);
      return res.json({ result: 'ERROR' });
    });
});

router.post('/rename', (req, res, next) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const fileToRename = `${fullPath}/${req.body.filename}`;
  // const fileExtension = req.body.filename.split('.').slice(1).join('.');
  // const fileRenamed = fileExtension ?
  //   `${fullPath}/${req.body.newFileName}.${fileExtension}` :
  //   `${fullPath}/${req.body.newFileName}`;
  const fileRenamed = `${fullPath}/${req.body.newFileName}`;
  fse.move(fileToRename, fileRenamed)
    .then(() => res.json({ result: 'SUCCESS' }))
    .catch((err) => {
      next(err);
      return res.json({ result: 'ERROR' });
    });
});

router.get('/video', (req, res, next) => {
  console.log('req.query', req.query);
  const fullPath = req.query.path ?
    `${rootPath}/${req.query.userFolder}/${req.query.path}` :
    `${rootPath}/${req.query.userFolder}`;
  const path = `${fullPath}/${req.query.videoName}`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1;
    const chunksize = (end-start)+1;
    const file = fs.createReadStream(path, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res)
  }
});
export default router;
