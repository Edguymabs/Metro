import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { cleanDateField, cleanNumberField, cleanStringField } from '../utils/dataTransformers';

export const getAllInterventions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { instrumentId, status, type, supplierId, startDate, endDate } = req.query;

    const where: any = {};

    if (instrumentId) {
      where.instrumentId = instrumentId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate as string);
      }
    }

    const interventions = await prisma.intervention.findMany({
      where,
      include: {
        instrument: {
          include: {
            type: true,
            site: true,
          },
        },
        supplier: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    res.json(interventions);
  } catch (error) {
    next(error);
  }
};

export const getInterventionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const intervention = await prisma.intervention.findUnique({
      where: { id },
      include: {
        instrument: {
          include: {
            type: true,
            site: true,
          },
        },
        supplier: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        documents: true,
      },
    });

    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }

    res.json(intervention);
  } catch (error) {
    next(error);
  }
};

export const createIntervention = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      instrumentId,
      type,
      status,
      scheduledDate,
      completedDate,
      conformityResult,
      cost,
      observations,
      certificateNumber,
      nextCalibrationDate,
      supplierId,
    } = req.body;

    // Valider scheduledDate
    const scheduledDateObj = cleanDateField(scheduledDate);
    if (!scheduledDateObj) {
      return res.status(400).json({ message: 'Date planifiée invalide' });
    }

    // Vérifier que l'instrument existe
    const instrument = await prisma.instrument.findUnique({ where: { id: instrumentId } });
    if (!instrument) {
      return res.status(404).json({ message: 'Instrument non trouvé' });
    }

    // Vérifier que le fournisseur existe si fourni
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }
    }

    const intervention = await prisma.intervention.create({
      data: {
        instrumentId,
        type,
        status: status || 'PLANIFIEE',
        scheduledDate: scheduledDateObj,
        completedDate: cleanDateField(completedDate),
        conformityResult: conformityResult || null,
        cost: cleanNumberField(cost),
        observations: cleanStringField(observations),
        certificateNumber: cleanStringField(certificateNumber),
        nextCalibrationDate: cleanDateField(nextCalibrationDate),
        supplierId: supplierId || null,
        createdById: req.user!.userId,
      },
      include: {
        instrument: true,
        supplier: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Mettre à jour la prochaine date d'étalonnage de l'instrument si fournie
    const nextCalibrationDateObj = cleanDateField(nextCalibrationDate);
    if (nextCalibrationDateObj) {
      await prisma.instrument.update({
        where: { id: instrumentId },
        data: { nextCalibrationDate: nextCalibrationDateObj },
      });
    }

    res.status(201).json(intervention);
  } catch (error) {
    next(error);
  }
};

export const updateIntervention = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      type,
      status,
      scheduledDate,
      completedDate,
      conformityResult,
      cost,
      observations,
      certificateNumber,
      nextCalibrationDate,
      supplierId,
    } = req.body;

    const existingIntervention = await prisma.intervention.findUnique({
      where: { id },
    });

    if (!existingIntervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }

    // Vérifier que le fournisseur existe si fourni
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }
    }

    const intervention = await prisma.intervention.update({
      where: { id },
      data: {
        type,
        status,
        scheduledDate: cleanDateField(scheduledDate),
        completedDate: cleanDateField(completedDate),
        conformityResult: conformityResult || null,
        cost: cleanNumberField(cost),
        observations: cleanStringField(observations),
        certificateNumber: cleanStringField(certificateNumber),
        nextCalibrationDate: cleanDateField(nextCalibrationDate),
        supplierId: supplierId || null,
      },
      include: {
        instrument: true,
        supplier: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Mettre à jour la prochaine date d'étalonnage de l'instrument
    const nextCalibrationDateObj = cleanDateField(nextCalibrationDate);
    if (nextCalibrationDateObj) {
      await prisma.instrument.update({
        where: { id: existingIntervention.instrumentId },
        data: { nextCalibrationDate: nextCalibrationDateObj },
      });
    }

    res.json(intervention);
  } catch (error) {
    next(error);
  }
};

export const deleteIntervention = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.intervention.delete({
      where: { id },
    });

    res.json({ message: 'Intervention supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};

export const getInterventionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalInterventions = await prisma.intervention.count();

    const interventionsByStatus = await prisma.intervention.groupBy({
      by: ['status'],
      _count: true,
    });

    const interventionsByType = await prisma.intervention.groupBy({
      by: ['type'],
      _count: true,
    });

    const nonConformities = await prisma.intervention.count({
      where: {
        conformityResult: 'NON_CONFORME',
      },
    });

    const totalCost = await prisma.intervention.aggregate({
      _sum: {
        cost: true,
      },
    });

    const today = new Date();
    const overdueInterventions = await prisma.intervention.count({
      where: {
        status: 'PLANIFIEE',
        scheduledDate: {
          lt: today,
        },
      },
    });

    res.json({
      totalInterventions,
      interventionsByStatus,
      interventionsByType,
      nonConformities,
      totalCost: totalCost._sum.cost || 0,
      overdueInterventions,
    });
  } catch (error) {
    next(error);
  }
};

