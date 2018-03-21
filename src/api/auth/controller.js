import { sign } from '../../services/jwt'
import { success } from '../../services/response/'
import User from '../../models/user'

export const login = ({ body }, res, next) => {
  User.findOne({
    email: body.email
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.status(401).json({ message: 'Authentication failed. User not found.' });
    } else if (user) {
      if (user.password !== body.password) {
        res.status(401).json({ message: 'Authentication failed. Wrong password.' });
      } else {
        return sign(user)
          .then((token) => ({ token, user: user.view() }))
          .then(success(res, 201))
      }
    }
  }).catch(next);
};


export const register = ({ body }, res, next) =>
  User.create(body)
    .then((user) => user.view(true))
    .then(success(res, 201))
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'email',
          message: 'email already registered'
        })
      } else {
        next(err)
      }
    });
