import { Router } from 'express';
import { OffersController } from '../controllers/offers.controller';
import { authenticateCustomer } from '../middlewares/auth.middleware';

const router = Router();
const offersController = new OffersController();

router.get('/', offersController.getGroupedOffers.bind(offersController));
router.get('/wallet', authenticateCustomer, offersController.getWalletVouchers.bind(offersController));
router.post('/:offerId/collect', authenticateCustomer, offersController.collectOffer.bind(offersController));

export default router;
