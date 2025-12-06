import { Router } from 'express';
import {
  getAllInstruments,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  getInstrumentStats,
} from '../controllers/instrumentController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllInstruments);
router.get('/stats', getInstrumentStats);
router.get('/:id', getInstrumentById);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'), validate(schemas.instrument), createInstrument);
router.put('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'), validate(schemas.instrument), updateInstrument);
router.delete('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), deleteInstrument);

export default router;

