import passport from 'passport'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { jwtSecret, masterKey } from '../../config'
import * as githubService from '../github'
import User from '../../models/user.js'

export const github = () =>
  passport.authenticate('github', { session: false });

export const master = () =>
  passport.authenticate('master', { session: false });

export const token = ({ required, roles = User.roles } = {}) => (req, res, next) =>
  passport.authenticate('token', { session: false }, (err, user, info) => {
    if (err || (required && !user) || (required && !~roles.indexOf(user.role))) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end();
      next()
    })
  })(req, res, next);

passport.use('github', new BearerStrategy((token, done) => {
  githubService.getUser(token).then((user) => {
    return User.createFromService(user)
  }).then((user) => {
    done(null, user);
    return null
  }).catch(done)
}));

passport.use('master', new BearerStrategy((token, done) => {
  if (token === masterKey) {
    done(null, {})
  } else {
    done(null, false)
  }
}));

passport.use('token', new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromBodyField('access_token'),
    ExtractJwt.fromAuthHeaderWithScheme('Bearer')
  ])
}, ({ id }, done) => {
  User.findById(id).then((user) => {
    done(null, user);
    return null
  }).catch(done)
}));
