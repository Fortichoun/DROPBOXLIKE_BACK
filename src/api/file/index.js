import { Router } from 'express';
import multer from 'multer';
import Grid from 'gridfs-stream';
// eslint-disable-next-line
import fse from 'fs-extra';
import fs from 'fs';
import getSize from 'get-folder-size';
import archiver from 'archiver';
import mime from 'mime-types'
import crypto from 'crypto';
import { mongo } from '../../config';
import mongoose from '../../services/mongoose';
import Link from '../../models/link';

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

router.get('/allFiles', (req, res, next) => {
  const filesInDirectory = [];
  const fullPath = req.query.path ?
    `${rootPath}/${req.query.userFolder}/${req.query.path}` :
    `${rootPath}/${req.query.userFolder}`;
  fs.readdir(fullPath, (err, files) => {
    if(err) {
      next(err);
      return res.json({ result: 'ERROR' });
    }
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
    res.set(`Content-Disposition`, `attachment; filename=${req.body.filename}`);
    res.attachment(file);
    res.set(`Content-Type`, `application/octet-stream`);
    return res.download(file, req.body.filename);
  }
  const archive = archiver('zip');

  archive.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });

  // on stream closed we can end the request
  archive.on('end', () => {
    console.log('Archive wrote %d bytes', archive.pointer());
  });

  res.attachment('download.zip');
  archive.pipe(res);

  archive.directory(file, req.body.filename);


  return archive.finalize();
});

router.post('/newFolder', (req, res, next) => {
  const fullPath = `${rootPath}/${req.body.userFolder}/${req.body.path}`;
  const folder = `${fullPath}/${req.body.folderName}`;
  fse.pathExists(folder)
    .then(exists => {
      if(!exists) {
        fse.ensureDir(folder, (err) => {
          if (err) return next(err);
          return res.json({ result: 'SUCCESS' });
        });
      } else {
        return res.json({ result: 'FILEEXISTS' })
      }
  });
});

router.get('/folderSize', (req, res, next) => {
  const fullPath = `${rootPath}/${req.query.userFolder}`;
  getSize(fullPath, (err, size) => {
    if (err) {
      next(err);
    }
    console.log(`${size} bytes`);
    console.log(`${(size / 1024 / 1024 / 1024).toFixed(5)} GB`);
    res.json({ folderSize: size});
  });
});

router.post('/move', (req, res, next) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const fileToMove = `${fullPath}/${req.body.sourceFile}`;
  const FolderDestination = `${fullPath}/${req.body.destinationFile}/${req.body.sourceFile}`;
  fse.pathExists(FolderDestination)
    .then(exists => {
      if(!exists) {
        fse.move(fileToMove, FolderDestination)
          .then(() => res.json({ result: 'SUCCESS' }))
          .catch((err) => {
            next(err);
            return res.json({ result: 'ERROR' });
          });
      } else {
        return res.json({ result: 'FILEEXISTS' })
      }
    });
});

router.post('/moveBackInFolder', (req, res, next) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const fileToMove = `${fullPath}/${req.body.sourceFile}`;
  const FolderDestination = `${rootPath}/${req.body.userFolder}/${req.body.destinationFile}${req.body.sourceFile}`;
  fse.pathExists(FolderDestination)
    .then(exists => {
      if(!exists) {
        fse.move(fileToMove, FolderDestination)
          .then(() => res.json({ result: 'SUCCESS' }))
          .catch((err) => {
            next(err);
            return res.json({ result: 'ERROR' });
          });
      } else {
        return res.json({ result: 'FILEEXISTS' })
      }
    });
});

router.post('/rename', (req, res, next) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const fileToRename = `${fullPath}/${req.body.filename}`;
  const fileRenamed = `${fullPath}/${req.body.newFileName}`;
  fse.pathExists(fileRenamed)
    .then(exists => {
      if(!exists) {
        fse.move(fileToRename, fileRenamed)
          .then(() => res.json({ result: 'SUCCESS' }))
          .catch((err) => {
            next(err);
            return res.json({ result: 'ERROR' });
          });
      } else {
        return res.json({ result: 'FILEEXISTS' })
      }
    });
});

router.get('/video', (req, res, next) => {
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

router.post('/shared', (req, res, next) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const filePath = `${fullPath}/${req.body.filename}`;

  crypto.createHash('md5').update('secret hash').digest('hex');
  const hash = crypto.randomBytes(26).toString('hex');
  console.log('newHash', hash);

  Link.create({hash, filePath, filename: req.body.filename}, function (error, link) {
    if (error) {
      return res.json({ result: 'ERROR' });
    }
    console.log('hey! ', link);
    return res.json({ linkHash: link.hash });
  });
});

router.get('/getSharedFile/:id', ({ params }, res, next) => {
  Link.findOne({hash: params.id }, function(error, link) {
    if (error || !link) {
      return res.status(403).json({ status: 'NOTFOUND', message: 'This link doesn\'t exist' });
    }
    if (!fs.statSync(link.filePath).isDirectory()) {
      return res.download(link.filePath);
    } else {

      const archive = archiver('zip');

      archive.on('error', (err) => {
        res.status(500).send({ error: err.message });
      });

      // on stream closed we can end the request
      archive.on('end', () => {
        console.log('Archive wrote %d bytes', archive.pointer());
      });

      res.attachment('download.zip');
      archive.pipe(res);

      archive.directory(link.filePath, link.filename);

      return archive.finalize();
    }
  }).catch(next)
});

export default router;
