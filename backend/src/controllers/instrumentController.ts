import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { cleanStringField, cleanDateField, cleanNumberField, cleanOptionalFields } from '../utils/dataTransformers';

export const getAllInstruments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status, siteId, typeId } = req.query;

    const where: any = { active: true };

    if (search) {
      where.OR = [
        { serialNumber: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } },
        { model: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (siteId) {
      where.siteId = siteId;
    }

    if (typeId) {
      where.typeId = typeId;
    }

    const instruments = await prisma.instrument.findMany({
      where,
      include: {
        type: true,
        site: true,
        interventions: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(instruments);
  } catch (error) {
    next(error);
  }
};

export const getInstrumentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const instrument = await prisma.instrument.findUnique({
      where: { id },
      include: {
        type: true,
        site: true,
        interventions: {
          include: {
            supplier: true,
            createdBy: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { scheduledDate: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        movements: {
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { movementDate: 'desc' },
        },
      },
    });

    if (!instrument) {
      return res.status(404).json({ message: 'Instrument non trouvé' });
    }

    res.json(instrument);
  } catch (error) {
    next(error);
  }
};

export const createInstrument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      serialNumber,
      internalReference,
      name,
      brand,
      model,
      status,
      calibrationPeriod,
      calibrationFrequencyValue,
      calibrationFrequencyUnit,
      nextCalibrationDate,
      location,
      purchaseDate,
      purchasePrice,
      observations,
      typeId,
      siteId,
      recurrenceType,
      daysOfWeek,
      dayOfMonth,
      monthOfYear,
      dayOfYear,
      toleranceValue,
      toleranceUnit,
      calibrationCalendarId,
    } = req.body ?? {};

    // Validation basique - seuls serialNumber et name sont requis
    if (!serialNumber || !name) {
      return res.status(400).json({ message: "Certains champs requis sont manquants (serialNumber, name)" });
    }

    // Vérifier que le type d'instrument existe (si fourni)
    if (typeId) {
      const instrumentType = await prisma.instrumentType.findUnique({ where: { id: typeId } });
      if (!instrumentType) {
        return res.status(404).json({ message: "Type d'instrument non trouvé" });
      }
    }

    // Vérifier que le site existe (si fourni)
    if (siteId) {
      const site = await prisma.site.findUnique({ where: { id: siteId } });
      if (!site) {
        return res.status(404).json({ message: 'Site non trouvé' });
      }
    }

    // Vérifier si le numéro de série existe déjà
    const existingInstrument = await prisma.instrument.findUnique({
      where: { serialNumber },
    });

    if (existingInstrument) {
      return res.status(409).json({ message: 'Un instrument avec ce numéro de série existe déjà' });
    }

    const cleanedData = cleanOptionalFields({
      serialNumber,
      internalReference,
      name,
      brand,
      model,
      status: status || 'CONFORME',
      calibrationPeriod: calibrationPeriod ?? calibrationFrequencyValue ?? 12,
      calibrationFrequencyValue: calibrationFrequencyValue ?? calibrationPeriod ?? 12,
      calibrationFrequencyUnit: calibrationFrequencyUnit || 'MONTHS',
      nextCalibrationDate,
      location,
      purchaseDate,
      purchasePrice,
      observations,
      typeId,
      siteId,
      recurrenceType: recurrenceType || 'FIXED_INTERVAL',
      daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [],
      dayOfMonth: dayOfMonth ?? null,
      monthOfYear: monthOfYear ?? null,
      dayOfYear: dayOfYear ?? null,
      toleranceValue: toleranceValue !== undefined && toleranceValue !== null && toleranceValue !== "" ? toleranceValue : 0,
      toleranceUnit: toleranceUnit || 'DAYS',
      calibrationCalendarId: calibrationCalendarId ?? null,
    }, {
      stringFields: ['internalReference', 'brand', 'model', 'location', 'observations'],
      dateFields: ['nextCalibrationDate', 'purchaseDate'],
      numberFields: ['purchasePrice'],
      uuidFields: ['typeId', 'siteId', 'calibrationCalendarId']
    });

    const instrument = await prisma.instrument.create({
      data: cleanedData as any,
      include: {
        type: true,
        site: true,
      },
    });

    res.status(201).json(instrument);
  } catch (error) {
    next(error);
  }
};

export const updateInstrument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      serialNumber,
      internalReference,
      name,
      brand,
      model,
      status,
      calibrationPeriod,
      calibrationFrequencyValue,
      calibrationFrequencyUnit,
      nextCalibrationDate,
      location,
      purchaseDate,
      purchasePrice,
      observations,
      typeId,
      siteId,
      recurrenceType,
      daysOfWeek,
      dayOfMonth,
      monthOfYear,
      dayOfYear,
      toleranceValue,
      toleranceUnit,
      calibrationCalendarId,
    } = req.body;

    // Vérifier si l'instrument existe
    const existingInstrument = await prisma.instrument.findUnique({ where: { id } });
    if (!existingInstrument) {
      return res.status(404).json({ message: 'Instrument non trouvé' });
    }

    // Vérifier si le nouveau numéro de série est déjà utilisé
    if (serialNumber && serialNumber !== existingInstrument.serialNumber) {
      const duplicateInstrument = await prisma.instrument.findUnique({
        where: { serialNumber },
      });
      if (duplicateInstrument) {
        return res.status(409).json({ message: 'Ce numéro de série existe déjà' });
      }
    }

    // Vérifier que le type existe si fourni
    if (typeId) {
      const instrumentType = await prisma.instrumentType.findUnique({ where: { id: typeId } });
      if (!instrumentType) {
        return res.status(404).json({ message: "Type d'instrument non trouvé" });
      }
    }

    // Vérifier que le site existe si fourni
    if (siteId) {
      const site = await prisma.site.findUnique({ where: { id: siteId } });
      if (!site) {
        return res.status(404).json({ message: 'Site non trouvé' });
      }
    }

    const instrument = await prisma.instrument.update({
      where: { id },
      data: {
        serialNumber,
        internalReference,
        name,
        brand,
        model,
        status,
        calibrationPeriod: calibrationPeriod ? parseInt(calibrationPeriod) : undefined,
        calibrationFrequencyValue: calibrationFrequencyValue ? parseInt(calibrationFrequencyValue) : undefined,
        calibrationFrequencyUnit: calibrationFrequencyUnit || undefined,
        nextCalibrationDate: nextCalibrationDate ? new Date(nextCalibrationDate) : null,
        location,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        observations,
        typeId,
        siteId,
        recurrenceType: recurrenceType || undefined,
        daysOfWeek: daysOfWeek || undefined,
        dayOfMonth: dayOfMonth || undefined,
        monthOfYear: monthOfYear || undefined,
        dayOfYear: dayOfYear || undefined,
        toleranceValue: toleranceValue ? parseInt(toleranceValue) : undefined,
        toleranceUnit: toleranceUnit || undefined,
        calibrationCalendarId: calibrationCalendarId || undefined,
      },
      include: {
        type: true,
        site: true,
      },
    });

    res.json(instrument);
  } catch (error) {
    next(error);
  }
};

export const deleteInstrument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Soft delete
    await prisma.instrument.update({
      where: { id },
      data: { active: false },
    });

    res.json({ message: 'Instrument supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

export const getInstrumentStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalInstruments = await prisma.instrument.count({ where: { active: true } });

    const instrumentsByStatus = await prisma.instrument.groupBy({
      by: ['status'],
      where: { active: true },
      _count: true,
    });

    const today = new Date();
    const overdueCalibrations = await prisma.instrument.count({
      where: {
        active: true,
        nextCalibrationDate: {
          lt: today,
        },
      },
    });

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const upcomingCalibrations = await prisma.instrument.count({
      where: {
        active: true,
        nextCalibrationDate: {
          gte: today,
          lte: nextMonth,
        },
      },
    });

    res.json({
      totalInstruments,
      instrumentsByStatus,
      overdueCalibrations,
      upcomingCalibrations,
    });
  } catch (error) {
    next(error);
  }
};

