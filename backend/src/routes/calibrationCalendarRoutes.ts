import { Router } from 'express';
import {
  getAllCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  toggleCalendarActive,
} from '../controllers/calibrationCalendarController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Toutes les routes nécessitent d'être authentifié
router.use(authenticateToken);

router.get('/', getAllCalendars);
router.get('/:id', getCalendarById);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.calibrationCalendar), createCalendar);
router.patch('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.calibrationCalendar), updateCalendar);
router.patch('/:id/toggle', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), toggleCalendarActive);
router.delete('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), deleteCalendar);

export default router;

