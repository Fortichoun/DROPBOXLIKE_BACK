import { Router } from 'express'
import { login } from './controller'
import { register } from './controller'
import { github } from '../../services/passport'

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
router.post('/github',
  github(),
  login);

router.post('/auth/register', register);

export default router
