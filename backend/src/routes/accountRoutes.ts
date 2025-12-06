import { Router } from 'express';
import {
  changePassword,
  getPreferences,
  updatePreferences,
  getMyProfile,
  updateMyProfile,
} from '../controllers/accountController';
import { authenticateToken } from '../middleware/auth';
import Joi from 'joi';
import { validate } from '../middleware/validation';

const router = Router();

// Toutes les routes nécessitent d'être authentifié
router.use(authenticateToken);

// Schéma de validation pour le changement de mot de passe
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Le mot de passe actuel est requis',
    'string.empty': 'Le mot de passe actuel ne peut pas être vide'
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'any.required': 'Le nouveau mot de passe est requis',
      'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    })
});

// Schéma de validation pour les préférences
const preferencesSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  darkMode: Joi.boolean().optional()
}).min(1);

// Schéma de validation pour le profil
const profileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional()
}).min(1);

// Routes
router.get('/profile', getMyProfile);
router.patch('/profile', validate(profileSchema), updateMyProfile);
router.post('/change-password', validate(changePasswordSchema), changePassword);
router.get('/preferences', getPreferences);
router.patch('/preferences', validate(preferencesSchema), updatePreferences);

export default router;


