import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const getAllConfigs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const configs = await prisma.interventionConfig.findMany({
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    res.json(configs);
  } catch (error) {
    next(error);
  }
};

export const getConfigById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const config = await prisma.interventionConfig.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const getActiveConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Chercher d'abord une config active par défaut
    let config = await prisma.interventionConfig.findFirst({
      where: {
        isActive: true,
        isDefault: true,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Si pas de config par défaut, prendre la première config active
    if (!config) {
      config = await prisma.interventionConfig.findFirst({
        where: { isActive: true },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!config) {
      return res.status(404).json({ message: 'Aucune configuration active trouvée' });
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const createConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      isDefault,
      isActive,
      interventionTypes,
      statuses,
      conformityResults,
      conditionalFields,
      validations,
    } = req.body;

    // Si cette config est définie comme défaut, désactiver les autres
    if (isDefault) {
      await prisma.interventionConfig.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const config = await prisma.interventionConfig.create({
      data: {
        name,
        description,
        isDefault: isDefault || false,
        isActive: isActive !== undefined ? isActive : true,
        interventionTypes,
        statuses,
        conformityResults,
        conditionalFields,
        validations,
        createdById: req.user!.userId,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(config);
  } catch (error) {
    next(error);
  }
};

export const updateConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      isDefault,
      isActive,
      interventionTypes,
      statuses,
      conformityResults,
      conditionalFields,
      validations,
    } = req.body;

    const existingConfig = await prisma.interventionConfig.findUnique({ where: { id } });
    if (!existingConfig) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }

    // Si cette config est définie comme défaut, désactiver les autres
    if (isDefault && !existingConfig.isDefault) {
      await prisma.interventionConfig.updateMany({
        where: {
          id: { not: id },
          isDefault: true
        },
        data: { isDefault: false },
      });
    }

    const config = await prisma.interventionConfig.update({
      where: { id },
      data: {
        name,
        description,
        isDefault,
        isActive,
        interventionTypes,
        statuses,
        conformityResults,
        conditionalFields,
        validations,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const deleteConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingConfig = await prisma.interventionConfig.findUnique({ where: { id } });
    if (!existingConfig) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }

    // Ne pas supprimer la config par défaut
    if (existingConfig.isDefault) {
      return res.status(400).json({ message: 'Impossible de supprimer la configuration par défaut' });
    }

    await prisma.interventionConfig.delete({
      where: { id },
    });

    res.json({ message: 'Configuration supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};

export const setActive = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingConfig = await prisma.interventionConfig.findUnique({ where: { id } });
    if (!existingConfig) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }

    // Désactiver toutes les autres configs par défaut
    await prisma.interventionConfig.updateMany({
      where: {
        id: { not: id },
        isDefault: true
      },
      data: { isDefault: false },
    });

    // Activer cette config et la définir comme défaut
    const config = await prisma.interventionConfig.update({
      where: { id },
      data: {
        isActive: true,
        isDefault: true,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const duplicateConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingConfig = await prisma.interventionConfig.findUnique({ where: { id } });
    if (!existingConfig) {
      return res.status(404).json({ message: 'Configuration non trouvée' });
    }

    const config = await prisma.interventionConfig.create({
      data: {
        name: name || `${existingConfig.name} (copie)`,
        description: existingConfig.description,
        isDefault: false,
        isActive: false,
        interventionTypes: existingConfig.interventionTypes,
        statuses: existingConfig.statuses,
        conformityResults: existingConfig.conformityResults,
        conditionalFields: existingConfig.conditionalFields,
        validations: existingConfig.validations,
        createdById: req.user!.userId,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(config);
  } catch (error) {
    next(error);
  }
};

export const createFromTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { templateId, name, description } = req.body;

    // Templates par défaut (correspondant au frontend)
    const templates: Record<string, any> = {
      default: {
        interventionTypes: [
          { value: 'ETALONNAGE', label: 'Étalonnage', description: "Étalonnage de l'instrument", color: '#10b981', icon: 'settings', isActive: true },
          { value: 'VERIFICATION', label: 'Vérification', description: 'Vérification de conformité', color: '#3b82f6', icon: 'check-circle', isActive: true },
          { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintenance préventive ou corrective', color: '#f59e0b', icon: 'wrench', isActive: true },
          { value: 'REPARATION', label: 'Réparation', description: "Réparation de l'instrument", color: '#ef4444', icon: 'tool', isActive: true },
        ],
        statuses: [
          { value: 'PLANIFIEE', label: 'Planifiée', color: '#6b7280', isActive: true },
          { value: 'EN_COURS', label: 'En cours', color: '#3b82f6', isActive: true },
          { value: 'TERMINEE', label: 'Terminée', color: '#10b981', isActive: true },
          { value: 'ANNULEE', label: 'Annulée', color: '#ef4444', isActive: true },
        ],
        conformityResults: [
          { value: 'CONFORME', label: 'Conforme', color: '#10b981', isActive: true },
          { value: 'NON_CONFORME', label: 'Non conforme', color: '#ef4444', isActive: true },
          { value: 'AVEC_RESERVES', label: 'Avec réserves', color: '#f59e0b', isActive: true },
        ],
        conditionalFields: {
          showNextCalibrationDate: ['ETALONNAGE', 'VERIFICATION'],
          showCertificateNumber: ['ETALONNAGE', 'VERIFICATION'],
          showCost: ['ETALONNAGE', 'VERIFICATION', 'MAINTENANCE', 'REPARATION'],
          showObservations: ['ETALONNAGE', 'VERIFICATION', 'MAINTENANCE', 'REPARATION']
        },
        validations: {
          requireSupplier: ['ETALONNAGE', 'VERIFICATION'],
          requireConformityResult: ['TERMINEE'],
          requireCompletedDate: ['TERMINEE']
        }
      }
    };

    const template = templates[templateId] || templates.default;

    const config = await prisma.interventionConfig.create({
      data: {
        name,
        description,
        isDefault: false,
        isActive: false,
        interventionTypes: template.interventionTypes,
        statuses: template.statuses,
        conformityResults: template.conformityResults,
        conditionalFields: template.conditionalFields,
        validations: template.validations,
        createdById: req.user!.userId,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(config);
  } catch (error) {
    next(error);
  }
};

export const validateConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const config = req.body;
    const errors: string[] = [];

    // Validation basique
    if (!config.name || config.name.trim() === '') {
      errors.push('Le nom est requis');
    }

    if (!config.interventionTypes || !Array.isArray(config.interventionTypes) || config.interventionTypes.length === 0) {
      errors.push('Au moins un type d\'intervention est requis');
    }

    if (!config.statuses || !Array.isArray(config.statuses) || config.statuses.length === 0) {
      errors.push('Au moins un statut est requis');
    }

    if (!config.conformityResults || !Array.isArray(config.conformityResults) || config.conformityResults.length === 0) {
      errors.push('Au moins un résultat de conformité est requis');
    }

    res.json({
      isValid: errors.length === 0,
      errors
    });
  } catch (error) {
    next(error);
  }
};




