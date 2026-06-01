import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { authenticateProfile } from '../../login/middlewares/profile-auth.middleware';

const router = Router();

router.get("/me", authenticateProfile, profileController.getMyProfile);
router.patch("/me", authenticateProfile, profileController.updateMyProfile);

export default router;
