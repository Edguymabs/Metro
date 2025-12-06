import { Router } from 'express';
import {
  getDashboardStats,
  getCalibrationToleranceStats,
  getCalibrationTimeline,
  getConformityStats,
} from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent d'être authentifié
router.use(authenticateToken);

router.get('/stats', getDashboardStats);
router.get('/tolerance-stats', getCalibrationToleranceStats);
router.get('/timeline', getCalibrationTimeline);
router.get('/conformity-stats', getConformityStats);

export default router;

