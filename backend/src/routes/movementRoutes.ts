import { Router } from 'express';
import {
  getAllMovements,
  createMovement,
  updateMovement,
  deleteMovement,
  getOverdueReturns,
} from '../controllers/movementController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllMovements);
router.get('/overdue', getOverdueReturns);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'), validate(schemas.movement), createMovement);
router.put('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'), validate(schemas.movement), updateMovement);
router.delete('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), deleteMovement);

export default router;

