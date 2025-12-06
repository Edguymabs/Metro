import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { getCalibrationStatus } from '../services/calibrationDateService';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Statistiques générales
    const [
      totalInstruments,
      totalInterventions,
      totalSuppliers,
      totalSites,
    ] = await Promise.all([
      prisma.instrument.count({ where: { active: true } }),
      prisma.intervention.count(),
      prisma.supplier.count({ where: { active: true } }),
      prisma.site.count({ where: { active: true } }),
    ]);

    // Instruments par statut
    const instrumentsByStatus = await prisma.instrument.groupBy({
      by: ['status'],
      where: { active: true },
      _count: true,
    });

    // Interventions par type
    const interventionsByType = await prisma.intervention.groupBy({
      by: ['type'],
      _count: true,
    });

    // Interventions récentes
    const recentInterventions = await prisma.intervention.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        instrument: { select: { name: true, serialNumber: true } },
        supplier: { select: { name: true } },
      },
    });

    // Instruments nécessitant un étalonnage (30 prochains jours)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcomingCalibrations = await prisma.instrument.findMany({
      where: {
        active: true,
        nextCalibrationDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      orderBy: { nextCalibrationDate: 'asc' },
      take: 10,
      include: {
        type: { select: { name: true } },
        site: { select: { name: true } },
      },
    });

    // Instruments en retard d'étalonnage
    const overdueInstruments = await prisma.instrument.findMany({
      where: {
        active: true,
        nextCalibrationDate: {
          lt: now,
        },
      },
      orderBy: { nextCalibrationDate: 'asc' },
      include: {
        type: { select: { name: true } },
        site: { select: { name: true } },
      },
    });

    res.json({
      general: {
        totalInstruments,
        totalInterventions,
        totalSuppliers,
        totalSites,
      },
      instrumentsByStatus,
      interventionsByType,
      recentInterventions,
      upcomingCalibrations,
      overdueInstruments,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCalibrationToleranceStats = async (req: AuthRequest, res: Response) => {
  try {
    const instruments = await prisma.instrument.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        serialNumber: true,
        nextCalibrationDate: true,
        toleranceExpiryDate: true,
        type: { select: { name: true } },
      },
    });

    const stats = {
      onTime: [] as any[],
      overdueTolerated: [] as any[],
      overdueCritical: [] as any[],
      notSet: [] as any[],
    };

    instruments.forEach((instrument: any) => {
      const status = getCalibrationStatus(
        instrument.nextCalibrationDate,
        instrument.toleranceExpiryDate
      );

      const item = {
        id: instrument.id,
        name: instrument.name,
        serialNumber: instrument.serialNumber,
        nextCalibrationDate: instrument.nextCalibrationDate,
        toleranceExpiryDate: instrument.toleranceExpiryDate,
        type: instrument.type?.name,
      };

      switch (status) {
        case 'ON_TIME':
          stats.onTime.push(item);
          break;
        case 'OVERDUE_TOLERATED':
          stats.overdueTolerated.push(item);
          break;
        case 'OVERDUE_CRITICAL':
          stats.overdueCritical.push(item);
          break;
        case 'NOT_SET':
          stats.notSet.push(item);
          break;
      }
    });

    res.json({
      summary: {
        onTime: stats.onTime.length,
        overdueTolerated: stats.overdueTolerated.length,
        overdueCritical: stats.overdueCritical.length,
        notSet: stats.notSet.length,
        total: instruments.length,
      },
      details: stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats de tolérance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCalibrationTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string);

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysNum);

    const calibrations = await prisma.instrument.findMany({
      where: {
        active: true,
        nextCalibrationDate: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { nextCalibrationDate: 'asc' },
      include: {
        type: { select: { name: true } },
        site: { select: { name: true } },
      },
    });

    // Grouper par date
    const timeline: Record<string, any[]> = {};

    calibrations.forEach((instrument: any) => {
      if (!instrument.nextCalibrationDate) return;

      const dateKey = instrument.nextCalibrationDate.toISOString().split('T')[0];

      if (!timeline[dateKey]) {
        timeline[dateKey] = [];
      }

      const status = getCalibrationStatus(
        instrument.nextCalibrationDate,
        instrument.toleranceExpiryDate
      );

      timeline[dateKey].push({
        id: instrument.id,
        name: instrument.name,
        serialNumber: instrument.serialNumber,
        type: instrument.type?.name,
        site: instrument.site?.name,
        status,
        toleranceExpiryDate: instrument.toleranceExpiryDate,
      });
    });

    res.json({ timeline, totalCalibrations: calibrations.length });
  } catch (error) {
    console.error('Erreur lors de la récupération de la timeline:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getConformityStats = async (req: AuthRequest, res: Response) => {
  try {
    // Interventions par résultat de conformité
    const conformityResults = await prisma.intervention.groupBy({
      by: ['conformityResult'],
      where: {
        conformityResult: { not: null },
      },
      _count: true,
    });

    // Taux de conformité par type d'instrument
    const instrumentTypes = await prisma.instrumentType.findMany({
      include: {
        instruments: {
          include: {
            interventions: {
              where: {
                type: 'ETALONNAGE',
                conformityResult: { not: null },
              },
              orderBy: { scheduledDate: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const conformityByType = instrumentTypes.map((type: any) => {
      const instruments = type.instruments;
      const totalWithInterventions = instruments.filter(
        (i: any) => i.interventions.length > 0
      ).length;

      const conformCount = instruments.filter(
        (i: any) =>
          i.interventions.length > 0 &&
          i.interventions[0].conformityResult === 'CONFORME'
      ).length;

      return {
        typeName: type.name,
        totalInstruments: instruments.length,
        totalWithInterventions,
        conformCount,
        conformityRate:
          totalWithInterventions > 0
            ? (conformCount / totalWithInterventions) * 100
            : 0,
      };
    });

    // Coût moyen par étalonnage
    const avgCost = await prisma.intervention.aggregate({
      where: {
        type: 'ETALONNAGE',
        cost: { not: null },
      },
      _avg: { cost: true },
      _count: true,
    });

    res.json({
      conformityResults,
      conformityByType,
      averageCost: avgCost._avg.cost || 0,
      totalCalibrations: avgCost._count,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats de conformité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

