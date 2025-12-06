import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as interventionConfigController from '../controllers/interventionConfigController';

const router = express.Router();

// Routes publiques (authentifiées uniquement)
router.get('/', authenticateToken, interventionConfigController.getAllConfigs);
router.get('/active', authenticateToken, interventionConfigController.getActiveConfig);
router.get('/:id', authenticateToken, interventionConfigController.getConfigById);

// Routes protégées (admin uniquement)
router.post('/', authenticateToken, requireAdmin, interventionConfigController.createConfig);
router.put('/:id', authenticateToken, requireAdmin, interventionConfigController.updateConfig);
router.delete('/:id', authenticateToken, requireAdmin, interventionConfigController.deleteConfig);
router.post('/:id/activate', authenticateToken, requireAdmin, interventionConfigController.setActive);
router.post('/:id/duplicate', authenticateToken, requireAdmin, interventionConfigController.duplicateConfig);
router.post('/from-template', authenticateToken, requireAdmin, interventionConfigController.createFromTemplate);
router.post('/validate', authenticateToken, requireAdmin, interventionConfigController.validateConfig);

export default router;




