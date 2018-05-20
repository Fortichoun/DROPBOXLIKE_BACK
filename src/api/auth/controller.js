// eslint-disable-next-line
import fse from 'fs-extra';
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { sign } from '../../services/jwt';
import { success } from '../../services/response/';
import User from '../../models/user';

const rootPath = 'D:/SupFiles';

export const login = ({ body }, res, next) =>
  User.findOne({
    email: body.email,
  }, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.status(403).json({ status: 'NOTFOUND', message: 'Authentication failed. User not found.' });
    }
    if (user.password !== body.password) {
      return res.status(403).json({ status: 'BADPASS', message: 'Authentication failed. Wrong password.' });
    }
    return sign(user)
      .then(token => ({ token, user: user.view() }))
      .then(success(res, 201));
  }).catch(next);

export const register = (req, res, next) =>
  User.create(req.body)
    .then((user) => {
      const fullPath = (`${rootPath}/${user.folderName}`);
      crypto.createHash('md5').update('secret hash').digest('hex');
      const hash = crypto.randomBytes(26).toString('hex');
      const urlToConfirm = `${req.get('origin')}/confirmEmail/${hash}`;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'supfiles.no.reply@gmail.com',
          pass: '#SupFiles!'
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      const mailOptions = {
        from: 'supfiles.no.reply@gmail.com',
        to: user.email,
        subject: 'Please confirm your address email',
        text: `Welcome to SupFiles !\nPlease click on this link to confirm your address email :\n${urlToConfirm}`
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      fse.ensureDir(fullPath);
      user.urlToConfirm = hash;
      user.save().then(() =>
      sign(user)
        .then(token => ({ token, user: user.view() }))
        .then(success(res, 201))
      );
    })
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'email',
          message: 'email already registered',
        });
      } else {
        next(err);
      }
    });

export const googleLogin = ({ body }, res, next) =>
  User.findOne({
    email: body.email,
  }, (err, user) => {
    if (err) throw err;
    if (!user) {
      User.create(body)
        .then((user) => {
          const fullPath = (`${rootPath}/${user.folderName}`);
          fse.ensureDir(fullPath);
          user.isEmailConfirmed = true;
          user.save().then(() =>
            sign(user)
              .then(token => ({ token, user: user.view() }))
              .then(success(res, 201))
          );
        })
        .catch((err) => {
          /* istanbul ignore else */
          if (err.name === 'MongoError' && err.code === 11000) {
            res.status(409).json({
              valid: false,
              param: 'email',
              message: 'email already registered',
            });
          } else {
            next(err);
          }
        });
    } else {
      return sign(user)
        .then(token => ({ token, user: user.view() }))
        .then(success(res, 201));
    }
  }).catch(next);
