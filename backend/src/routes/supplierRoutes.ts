import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.supplier), createSupplier);
router.put('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), validate(schemas.supplier), updateSupplier);
router.delete('/:id', authorize('ADMIN', 'RESPONSABLE_METROLOGIE'), deleteSupplier);

export default router;

