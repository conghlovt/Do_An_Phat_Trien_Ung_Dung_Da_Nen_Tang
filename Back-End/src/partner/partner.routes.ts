import { Router } from 'express';
import { authenticate, authorize } from '../login/middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorize(['partner']));

export default router;
