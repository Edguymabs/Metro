import { Router } from 'express';
import {
  getAllInterventions,
  getInterventionById,
  createIntervention,
  updateIntervention,
  deleteIntervention,
  getInterventionStats,
} from '../controllers/interventionController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllInterventions);
router.get('/stats', getInterventionStats);
router.get('/:id', getInterventionById);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'), validate(schemas.intervention), createIntervention);
router.put('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'), validate(schemas.intervention), updateIntervention);
router.delete('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), deleteIntervention);

export default router;

