import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Loguer les données pour déboguer (seulement en développement)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Validation des données', { body: req.body });
    }
    
    const { error } = schema.validate(req.body, { 
      abortEarly: false, // Afficher toutes les erreurs, pas seulement la première
      allowUnknown: false, // ⚠️ STRICT: rejeter champs inconnus
      stripUnknown: true,  // Supprimer champs non définis
      presence: 'optional' // Par défaut optionnel (sauf required)
    });
    
    if (error) {
      logger.warn('Erreurs de validation', { 
        errors: error.details,
        path: req.path,
        method: req.method
      });
      return res.status(400).json({
        message: 'Données invalides',
        errors: error.details.map((detail: Joi.ValidationErrorItem) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Validation réussie');
    }
    next();
  };
};

// Schémas de validation communs
export const schemas = {
  // Authentification
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN', 'LECTURE_SEULE').optional()
  }),
  
  // Instruments
  instrument: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    serialNumber: Joi.string().min(1).max(50).required(),
    internalReference: Joi.string().max(50).optional().allow(''),
    brand: Joi.string().max(50).optional().allow(''),
    model: Joi.string().max(50).optional().allow(''),
    typeId: Joi.string().uuid().required(),
    siteId: Joi.string().uuid().required(),
    status: Joi.string().valid('CONFORME', 'NON_CONFORME', 'EN_MAINTENANCE', 'CASSE').optional(),
    location: Joi.string().max(100).optional().allow('', null),
    purchaseDate: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('', null),
      Joi.allow(null)
    ).optional(),
    purchasePrice: Joi.alternatives().try(
      Joi.number().min(0),
      Joi.string().allow(''),
      Joi.allow(null)
    ).optional(),
    observations: Joi.string().max(1000).optional().allow('', null),
    // Champs d'étalonnage
    calibrationFrequencyValue: Joi.alternatives().try(
      Joi.number().integer().min(1).max(999),
      Joi.allow(null)
    ).optional(),
    calibrationFrequencyUnit: Joi.string().valid('DAYS', 'WEEKS', 'MONTHS', 'YEARS').optional().allow(null),
    nextCalibrationDate: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('', null),
      Joi.allow(null)
    ).optional(),
    // Configuration de récurrence
    recurrenceType: Joi.string().valid('FIXED_INTERVAL', 'CALENDAR_DAILY', 'CALENDAR_WEEKLY', 'CALENDAR_MONTHLY', 'CALENDAR_YEARLY').optional(),
    daysOfWeek: Joi.array().items(Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')).optional(),
    dayOfMonth: Joi.number().integer().min(1).max(31).optional().allow(null),
    monthOfYear: Joi.number().integer().min(1).max(12).optional().allow(null),
    dayOfYear: Joi.number().integer().min(1).max(366).optional().allow(null),
    // Tolérance
    toleranceValue: Joi.alternatives().try(
      Joi.number().integer().min(0).max(999),
      Joi.allow(null)
    ).optional(),
    toleranceUnit: Joi.string().valid('DAYS', 'WEEKS', 'MONTHS').optional().allow(null),
    // Méthode d'étalonnage
    calibrationMethodId: Joi.alternatives().try(
      Joi.string().uuid(),
      Joi.string().allow('', null),
      Joi.allow(null)
    ).optional()
  }),
  
  // Interventions
  intervention: Joi.object({
    instrumentId: Joi.string().uuid().required(),
    type: Joi.string().valid('ETALONNAGE', 'MAINTENANCE', 'REPARATION', 'VERIFICATION').required(),
    status: Joi.string().valid('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE').optional(),
    scheduledDate: Joi.date().iso().required(),
    completedDate: Joi.date().iso().optional().allow(null),
    conformityResult: Joi.string().valid('CONFORME', 'NON_CONFORME', 'AVEC_RESERVES').optional().allow(null),
    cost: Joi.number().min(0).optional().allow(null),
    observations: Joi.string().max(1000).optional().allow('', null),
    certificateNumber: Joi.string().max(100).optional().allow('', null),
    nextCalibrationDate: Joi.date().iso().optional().allow(null),
    supplierId: Joi.string().uuid().optional().allow(null)
  }),
  
  // Sites
  site: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    address: Joi.string().max(200).optional().allow('', null),
    city: Joi.string().max(50).optional().allow('', null),
    postalCode: Joi.string().max(10).optional().allow('', null),
    country: Joi.string().max(50).optional().allow('', null),
    active: Joi.boolean().optional()
  }),
  
  // Fournisseurs
  supplier: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    contactName: Joi.string().max(100).optional().allow('', null),
    email: Joi.string().email().optional().allow('', null),
    phone: Joi.string().max(20).optional().allow('', null),
    address: Joi.string().max(200).optional().allow('', null),
    city: Joi.string().max(50).optional().allow('', null),
    postalCode: Joi.string().max(10).optional().allow('', null),
    country: Joi.string().max(50).optional().allow('', null),
    accreditations: Joi.array().items(Joi.string()).optional(),
    accreditationDoc: Joi.string().optional().allow('', null),
    notes: Joi.string().max(1000).optional().allow('', null),
    active: Joi.boolean().optional()
  }),
  
  // Utilisateurs
  user: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).optional()
      .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('ADMIN', 'RESPONSABLE_METROLOGIE', 'TECHNICIEN', 'LECTURE_SEULE').required(),
    isActive: Joi.boolean().optional()
  }),
  
  // Types d'instruments
  instrumentType: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional()
  }),
  
  // Mouvements
  movement: Joi.object({
    instrumentId: Joi.string().uuid().required(),
    type: Joi.string().valid('ENTREE', 'SORTIE', 'TRANSFERT', 'MISE_EN_SERVICE', 'MISE_HORS_SERVICE').required(),
    fromSiteId: Joi.string().uuid().optional().allow(null),
    toSiteId: Joi.string().uuid().optional().allow(null),
    date: Joi.date().iso().required(),
    notes: Joi.string().max(500).optional()
  }),
  
  // Méthodes d'étalonnage
  calibrationMethod: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    procedure: Joi.string().optional(),
    frequencyValue: Joi.number().integer().min(1).max(999).required(),
    frequencyUnit: Joi.string().valid('DAYS', 'WEEKS', 'MONTHS', 'YEARS').required(),
    toleranceValue: Joi.number().integer().min(0).max(999).optional(),
    toleranceUnit: Joi.string().valid('DAYS', 'WEEKS', 'MONTHS').optional(),
    estimatedDuration: Joi.number().integer().min(1).optional(),
    requiredEquipment: Joi.string().optional()
  }),
  
  // Calendriers d'étalonnage
  calibrationCalendar: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    recurrenceType: Joi.string().valid('FIXED_INTERVAL', 'CALENDAR_DAILY', 'CALENDAR_WEEKLY', 'CALENDAR_MONTHLY', 'CALENDAR_YEARLY').required(),
    frequencyValue: Joi.number().integer().min(1).max(999).optional(),
    frequencyUnit: Joi.string().valid('DAYS', 'WEEKS', 'MONTHS', 'YEARS').optional(),
    daysOfWeek: Joi.array().items(Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')).optional(),
    dayOfMonth: Joi.number().integer().min(1).max(31).optional().allow(null),
    monthOfYear: Joi.number().integer().min(1).max(12).optional().allow(null),
    dayOfYear: Joi.number().integer().min(1).max(366).optional().allow(null),
    toleranceValue: Joi.number().integer().min(0).max(999).optional(),
    toleranceUnit: Joi.string().valid('DAYS', 'WEEKS', 'MONTHS').optional(),
    active: Joi.boolean().optional(),
    calibrationMethodId: Joi.string().uuid().optional().allow(null, ''),
    instrumentIds: Joi.array().items(Joi.string().uuid()).optional()
  }),
  
  // Messages de maintenance
  maintenanceMessage: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(5000).required(),
    type: Joi.string().valid('INFO', 'WARNING', 'ERROR', 'MAINTENANCE', 'UPDATE').required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required(),
    targetAudience: Joi.string().valid('ALL', 'ADMINS', 'ROLES', 'SPECIFIC_USERS').required(),
    targetRoles: Joi.array().items(Joi.string()).optional(),
    targetUsers: Joi.array().items(Joi.string().uuid()).optional(),
    isActive: Joi.boolean().required(),
    startDate: Joi.date().iso().optional().allow(null),
    endDate: Joi.date().iso().optional().allow(null)
  }),
  
  // Configuration des interventions
  interventionConfig: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional().allow(null, ''),
    isDefault: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    interventionTypes: Joi.array().items(Joi.object({
      value: Joi.string().required(),
      label: Joi.string().required(),
      description: Joi.string().optional().allow(null, ''),
      color: Joi.string().optional().allow(null, ''),
      icon: Joi.string().optional().allow(null, ''),
      isActive: Joi.boolean().optional()
    })).min(1).required(),
    statuses: Joi.array().items(Joi.object({
      value: Joi.string().required(),
      label: Joi.string().required(),
      description: Joi.string().optional().allow(null, ''),
      color: Joi.string().optional().allow(null, ''),
      icon: Joi.string().optional().allow(null, ''),
      isActive: Joi.boolean().optional()
    })).min(1).required(),
    conformityResults: Joi.array().items(Joi.object({
      value: Joi.string().required(),
      label: Joi.string().required(),
      description: Joi.string().optional().allow(null, ''),
      color: Joi.string().optional().allow(null, ''),
      icon: Joi.string().optional().allow(null, ''),
      isActive: Joi.boolean().optional()
    })).min(1).required(),
    conditionalFields: Joi.object({
      showNextCalibrationDate: Joi.array().items(Joi.string()).optional(),
      showCertificateNumber: Joi.array().items(Joi.string()).optional(),
      showCost: Joi.array().items(Joi.string()).optional(),
      showObservations: Joi.array().items(Joi.string()).optional()
    }).optional(),
    validations: Joi.object({
      requireSupplier: Joi.array().items(Joi.string()).optional(),
      requireConformityResult: Joi.array().items(Joi.string()).optional(),
      requireCompletedDate: Joi.array().items(Joi.string()).optional()
    }).optional()
  })
};
