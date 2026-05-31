import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

router.post('/sepay/webhook', paymentController.receiveSepayWebhook);

export default router;
