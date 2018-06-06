import { Router } from 'express';
import user from './user';
import auth from './auth';
import file from './file';

const router = new Router();

router.use('/users', user);
router.use('/auth', auth);
router.use('/file', file);

export default router;
