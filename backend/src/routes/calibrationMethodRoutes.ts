import { Router } from 'express';
import {
  getAllMethods,
  getMethodById,
  createMethod,
  updateMethod,
  deleteMethod,
  applyMethodToInstruments,
  getInstrumentsUsingMethod,
  removeMethodFromInstruments,
} from '../controllers/calibrationMethodController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Toutes les routes nécessitent d'être authentifié
router.use(authenticateToken);

router.get('/', getAllMethods);
router.get('/:id', getMethodById);
router.get('/:id/instruments', getInstrumentsUsingMethod);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.calibrationMethod), createMethod);
router.patch('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.calibrationMethod), updateMethod);
router.delete('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), deleteMethod);

// Routes pour la gestion en masse
router.post('/apply', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), applyMethodToInstruments);
router.post('/remove', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), removeMethodFromInstruments);

export default router;

