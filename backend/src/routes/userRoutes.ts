import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticateToken, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Toutes les routes nécessitent d'être authentifié et admin
router.use(authenticateToken);
router.use(authorize('ADMIN'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validate(schemas.user), createUser);
router.patch('/:id', validate(schemas.user), updateUser);
router.delete('/:id', deleteUser);

export default router;

