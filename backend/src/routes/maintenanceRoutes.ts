import { Router } from 'express';
import {
  getAllMaintenanceMessages,
  getActiveMaintenanceMessages,
  getMaintenanceMessageById,
  createMaintenanceMessage,
  updateMaintenanceMessage,
  deleteMaintenanceMessage,
  toggleMaintenanceMessageStatus,
  duplicateMaintenanceMessage,
} from '../controllers/maintenanceController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Route publique (pour les notifications)
router.get('/active', authenticateToken, getActiveMaintenanceMessages);

// Routes administratives (nécessitent une autorisation ADMIN)
router.use(authenticateToken, authorize('ADMIN'));

router.get('/', getAllMaintenanceMessages);
router.get('/:id', getMaintenanceMessageById);
router.post('/', validate(schemas.maintenanceMessage), createMaintenanceMessage);
router.put('/:id', validate(schemas.maintenanceMessage), updateMaintenanceMessage);
router.delete('/:id', deleteMaintenanceMessage);
router.patch('/:id/toggle', toggleMaintenanceMessageStatus);
router.post('/:id/duplicate', duplicateMaintenanceMessage);

export default router;
