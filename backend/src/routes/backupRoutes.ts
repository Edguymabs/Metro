import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  createBackup,
  exportEntity,
  exportAll,
  listBackups,
  restoreBackup,
  importData,
  downloadBackup,
  deleteBackup
} from '../controllers/backupController';

const router = express.Router();

// Middleware : toutes les routes nécessitent authentification + droits admin
router.use(authenticateToken);
router.use(requireAdmin);

// POST /api/backup/create - Créer un backup SQL complet
router.post('/create', createBackup);

// POST /api/backup/export/:entity/:format - Export sélectif
// Exemple: POST /api/backup/export/instruments/excel
router.post('/export/:entity/:format', exportEntity);

// POST /api/backup/export-all/:format - Export complet
// Exemple: POST /api/backup/export-all/excel
router.post('/export-all/:format', exportAll);

// GET /api/backup/list - Lister les backups disponibles
router.get('/list', listBackups);

// POST /api/backup/restore - Restaurer un backup SQL
router.post('/restore', restoreBackup);

// POST /api/backup/import/:entity - Importer des données
// Exemple: POST /api/backup/import/instruments (avec fichier multipart)
router.post('/import/:entity', importData);

// GET /api/backup/download/:filename - Télécharger un backup
router.get('/download/:filename', downloadBackup);

// DELETE /api/backup/:filename - Supprimer un backup
router.delete('/:filename', deleteBackup);

export default router;

