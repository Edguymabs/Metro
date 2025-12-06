import { Router } from 'express';
import {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
} from '../controllers/siteController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllSites);
router.get('/:id', getSiteById);
router.post('/', authorize('ADMIN'), validate(schemas.site), createSite);
router.put('/:id', authorize('ADMIN'), validate(schemas.site), updateSite);
router.delete('/:id', authorize('ADMIN'), deleteSite);

export default router;

