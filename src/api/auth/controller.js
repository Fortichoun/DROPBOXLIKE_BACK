// eslint-disable-next-line
import fse from 'fs-extra';
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

export const register = ({ body }, res, next) =>
  User.create(body)
    .then((user) => {
      const fullPath = (`${rootPath}/${user.folderName}`);
      fse.ensureDir(fullPath);
      return sign(user)
        .then(token => ({ token, user: user.view() }))
        .then(success(res, 201));
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
