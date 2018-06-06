import { Router } from 'express';
import { token } from '../../services/passport';
import { showMe, update, confirmEmail } from './controller';
import { User } from "../../models/user";

const router = new Router();

/**
 * @api {get} /users/me Retrieve current user
 * @apiVersion 0.1.0
 * @apiName RetrieveCurrentUser
 * @apiGroup User
 * @apiHeader {String} Authorization User unique token.
 * @apiSuccess {Object} user User's data.
 */
router.get(
  '/me',
  token({ required: true }),
  showMe,
);

/**
 * @api {put} /users/:id Update user
 * @apiVersion 0.1.0
 * @apiName UpdateUser
 * @apiGroup User
 * @apiHeader {String} Authorization User unique token.
 * @apiParam {String} id User unique ID.
 * @apiSuccess {Object} user User's data.
 * @apiError 400 User not found.
 */
router.put(
  '/:id',
  token({ required: true }),
  update,
);

/**
 * @api {post} /users/confirmEmail Confirm user's email
 * @apiVersion 0.1.0
 * @apiName ConfirmEmail
 * @apiGroup User
 * @apiParam {String} hash Unique hash that have been sent to user's mailbox.
 * @apiSuccess {Object} user User's data.
 * @apiError 400 Invalid hash.
 */
router.post(
  '/confirmEmail',
  confirmEmail,
);


export default router;
