import { Router } from 'express';
import {
  upload,
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
} from '../controllers/documentController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getDocuments);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN'), upload.single('file'), uploadDocument);
router.get('/:id/download', downloadDocument);
router.delete('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), deleteDocument);

export default router;

