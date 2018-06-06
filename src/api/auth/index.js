import { Router } from 'express';
import { register, login, googleLogin } from './controller';

const router = new Router();

/**
 * @api {post} /auth/register Register with email
 * @apiVersion 0.1.0
 * @apiName Register
 * @apiGroup Auth
 * @apiParam {String} firstname First name of the user.
 * @apiParam {String} lastname Last name of the user.
 * @apiParam {String} email Email of the user.
 * @apiSuccess (Success 201) {String} token User `access_token` to be passed to other requests.
 * @apiSuccess (Success 201) {Object} user Current user's data.
 * @apiError 409 Email already registered.
 */
router.post('/register', register);

/**
 * @api {post} /auth/login Login with email
 * @apiVersion 0.1.0
 * @apiName Login
 * @apiGroup Auth
 * @apiParam {String} email Email of the user.
 * @apiParam {String} password Password of the user.
 * @apiSuccess (Success 201) {String} token User `access_token` to be passed to other requests.
 * @apiSuccess (Success 201) {Object} user Current user's data.
 * @apiError 400UserNotFound The <code>email</code> of the user was not found.
 * @apiError 400WrongPassword The <code>password</code> of the user does not match the email.
 */
router.post('/login', login);

/**
 * @api {post} /auth/googleLogin Login with Google authentication
 * @apiVersion 0.1.0
 * @apiName GoogleLogin
 * @apiGroup Auth
 * @apiParam {String} email Google's email of the user.
 * @apiSuccess (Success 201) {String} token User `access_token` to be passed to other requests.
 * @apiSuccess (Success 201) {Object} user Current user's data.
 */
router.post('/googleLogin', googleLogin);

export default router;
