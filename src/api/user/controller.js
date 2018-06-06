import { success, notFound } from '../../services/response/';
import User from '../../models/user';
import {sign} from "../../services/jwt";


export const showMe = ({ user }, res) =>
  res.json(user.view());

export const update = ({ body, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null;
      const isAdmin = user.role === 'admin';
      const isSelfUpdate = user.id === result.id;
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: 'You can\'t change other user\'s data',
        });
        return null;
      }
      return result;
    })
    .then(userFound => (userFound ? Object.assign(userFound, body).save() : null))
    .then(userSaved => (userSaved ? userSaved.view(true) : null))
    .then(success(res))
    .catch(next);

export const confirmEmail = ({ body: { hash } }, res, next) =>
  User.findOne({urlToConfirm: hash})
    .then(notFound(res))
    .then(user => (user ? Object.assign(user, { isEmailConfirmed: true }).save() : null))
    .then(userSaved => (userSaved ? sign(userSaved)
        .then(token => ({ token, user: userSaved.view() }))
        .then(success(res, 201))
        : null))
    .catch(next);
