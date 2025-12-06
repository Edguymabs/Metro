import { Router } from 'express';
import {
  getAllInstrumentTypes,
  createInstrumentType,
  updateInstrumentType,
  deleteInstrumentType,
} from '../controllers/instrumentTypeController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllInstrumentTypes);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.instrumentType), createInstrumentType);
router.put('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.instrumentType), updateInstrumentType);
router.delete('/:id', authorize('ADMIN'), deleteInstrumentType);

export default router;

