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
import Link from '../../models/link';

const router = new Router();
const rootPath = 'D:/SupFiles';

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

/**
 * @api {post} /file/upload Upload files
 * @apiVersion 0.1.0
 * @apiName Upload
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {Object[]} postFormData The files that'll be uploaded to server.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiSuccess (Success 201) {Object[]} files All files in current folder.
 */
router.post('/upload', upload.array('file', 12), async (req, res) => {
  res.json({ files: req.files });
});

/**
 * @api {post} /file/allFiles Retrieve files & folder
 * @apiVersion 0.1.0
 * @apiName AllFiles
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiSuccess (Success 200) {Object[]} filesInDirectory User's files & folders in current directory.
 * @apiError (Error 5xx) 500 An error occurred when reading the user's folder.
 */
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

/**
 * @api {post} /file/remove Remove a file or a folder
 * @apiVersion 0.1.0
 * @apiName Remove
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} filename The file/folder's name to remove.
 * @apiSuccess (Success 200) {String} result Success message
 */
router.post('/remove', (req, res, next) => {
  const fullPath = `${rootPath}/${req.body.userFolder}/${req.body.path}`;
  const file = `${fullPath}/${req.body.filename}`;
  fse.remove(file, (err) => {
    if (err) return next(err);
    return res.json({ result: 'SUCCESS' });
  });
});

/**
 * @api {get} /file/download Download a file or a folder
 * @apiVersion 0.1.0
 * @apiName Download
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} filename The file's name to download.
 * @apiSuccess (Success 200) {String} stream File/folder's stream to download.
 * @apiError (Error 5xx) 500 Error when archiving folder.
 */
router.get('/download', (req, res) => {
  const fullPath = req.query.path ?
    `${rootPath}/${req.query.userFolder}/${req.query.path}` :
    `${rootPath}/${req.query.userFolder}`;
  const file = `${fullPath}/${req.query.filename}`;
  if (req.query.isFolder == 'false') {
    console.log('file', req.query.filename);
    res.set(`Content-Disposition`, `attachment; filename=${req.query.filename.replace(/[^\x00-\x7F]/g, "")}`);
    res.attachment(file);
    res.set(`Content-Type`, `application/octet-stream`);
    return res.download(file, req.query.filename);
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

  archive.directory(file, req.query.filename);


  return archive.finalize();
});

/**
 * @api {post} /file/newFolder Create a folder
 * @apiVersion 0.1.0
 * @apiName Create
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} folderName The folder's name to create.
 * @apiSuccess (Success 201) {String} result Success message.
 * @apiError 400 The folder's name the user try to create is already used.
 */
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

/**
 * @api {get} /file/folderSize Get user's folder size
 * @apiVersion 0.1.0
 * @apiName GetSize
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiSuccess (Success 200) {String} folderSize The user's folder size (in gigabytes).
 */
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

/**
 * @api {post} /file/move Move a file or a folder in another folder
 * @apiVersion 0.1.0
 * @apiName Move
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} sourceFile The file/folder's name to move.
 * @apiParam {String} destinationFile The folder in which the user tries to move his file/folder.
 * @apiSuccess (Success 200) {String} result Success message.
 * @apiError (Error 5xx) 500 An error occurred when moving the file/folder.
 * @apiError 400 The folder in which the user try to move his file/folder already contains a file/folder with this name.
 */
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

/**
 * @api {post} /file/moveBackInFolder Move a file or a folder back in the parent folder
 * @apiVersion 0.1.0
 * @apiName MoveBack
 * @apiGroup File
 * @apiExample For example
 * home
 *   |-- test
 *   |-- toto
 *         |-- textFile.txt
 *         |-- otherRandomFile.txt
 *
 * if you use this function on the file textFile.txt (which is in folder toto),
 * it will puts it back in the folder below in folder`s tree which is home.
 *
 * result :
 *
 * home
 *   |-- test
 *   |-- toto
 *   |     |-- otherRandomFile.txt
 *   |-- textFile.txt
 *
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} sourceFile The file/folder's name to move.
 * @apiParam {String} destinationFile The folder in which the user tries to move his file/folder.
 * @apiSuccess (Success 200) {String} result Success message.
 * @apiError (Error 5xx) 500 An error occurred when moving the file/folder.
 * @apiError 400 The folder in which the user try to move his file/folder already contains a file/folder with this name.
 */
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

/**
 * @api {post} /file/rename Rename a file or a folder
 * @apiVersion 0.1.0
 * @apiName Rename
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} filename The file/folder's name to rename.
 * @apiParam {String} newFileName The new file/folder's name.
 * @apiSuccess (Success 200) {String} result Success message.
 * @apiError (Error 5xx) 500 An error occurred when renaming the file/folder.
 * @apiError 400 The new file/folder's name the user try to set is already used.
 */
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

/**
 * @api {get} /file/video Download video to stream it
 * @apiVersion 0.1.0
 * @apiName AllFiles
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} videoName The video's name to download.
 * @apiSuccess (Success 200) {String} stream Video's stream to download.
 */
router.get('/video', (req, res) => {
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

/**
 * @api {post} /file/shared Share a file or a folder
 * @apiVersion 0.1.0
 * @apiName Share
 * @apiGroup File
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} filename The file/folder's name to share.
 * @apiSuccess (Success 201) {String} linkHash The link to share with people.
 * @apiError (Error 5xx) 500 An error occurred when creating the link.
 */
router.post('/shared', (req, res, next) => {
  const fullPath = req.body.path ?
    `${rootPath}/${req.body.userFolder}/${req.body.path}` :
    `${rootPath}/${req.body.userFolder}`;
  const filePath = `${fullPath}/${req.body.filename}`;

  crypto.createHash('md5').update('secret hash').digest('hex');
  const hash = crypto.randomBytes(26).toString('hex');

  Link.create({hash, filePath, filename: req.body.filename}, function (error, link) {
    if (error) {
      next(error);
      return res.json({ result: 'ERROR' });
    }
    return res.json({ linkHash: link.hash });
  });
});

/**
 * @api {get} /file/getSharedFile/:id Get shared files
 * @apiVersion 0.1.0
 * @apiName SharedFiles
 * @apiGroup File
 * @apiParam {String} userFolder The user's personal folder which contains every of his files & folders.
 * @apiParam {String} path Current folder in which the user is.
 * @apiParam {String} id Link unique ID.
 * @apiSuccess (Success 200) {String} stream File/folder's stream to download.
 * @apiError 400 The link does not exist.
 * @apiError (Error 5xx) 500 An error occurred archiving the files to download.
 */
router.get('/getSharedFile/:id', ({ params }, res, next) => {
  Link.findOne({hash: params.id }, function(error, link) {
    if (error || !link) {
      return res.status(400).json({ status: 'NOTFOUND', message: 'This link doesn\'t exist' });
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
