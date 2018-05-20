import { Router } from 'express';
import { register, login, googleLogin } from './controller';
import { github } from '../../services/passport';

const router = new Router();

/**
 * @api {post} /auth/github Authenticate with Github
 * @apiName AuthenticateGithub
 * @apiGroup Auth
 * @apiParam {String} access_token Github user accessToken.
 * @apiSuccess (Success 201) {String} token User `access_token` to be passed to other requests.
 * @apiSuccess (Success 201) {Object} user Current user's data.
 * @apiError 401 Invalid credentials.
 */
router.post(
  '/github',
  github(),
  login,
);

router.post('/register', register);
router.post('/login', login);
router.post('/googleLogin', googleLogin);

export default router;
