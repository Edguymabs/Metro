import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const getAllMethods = async (req: AuthRequest, res: Response) => {
  try {
    const { instrumentTypeId } = req.query;

    const where: any = {};
    if (instrumentTypeId) {
      where.instrumentTypeId = instrumentTypeId;
    }

    const methods = await prisma.calibrationMethod.findMany({
      where,
      include: {
        instrumentType: true,
        _count: {
          select: { calendars: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(methods);
  } catch (error) {
    console.error('Erreur lors de la récupération des méthodes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getMethodById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const method = await prisma.calibrationMethod.findUnique({
      where: { id },
      include: {
        instrumentType: true,
        calendars: {
          include: {
            _count: {
              select: { instruments: true },
            },
          },
        },
      },
    });

    if (!method) {
      return res.status(404).json({ message: 'Méthode non trouvée' });
    }

    res.json(method);
  } catch (error) {
    console.error('Erreur lors de la récupération de la méthode:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createMethod = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      recurrenceType,
      frequencyValue,
      frequencyUnit,
      daysOfWeek,
      dayOfMonth,
      monthOfYear,
      dayOfYear,
      toleranceValue,
      toleranceUnit,
      procedure,
      requiredEquipment,
      estimatedDuration,
      instrumentTypeId,
    } = req.body;

    const method = await prisma.calibrationMethod.create({
      data: {
        name,
        description,
        recurrenceType,
        frequencyValue,
        frequencyUnit,
        daysOfWeek: daysOfWeek || [],
        dayOfMonth,
        monthOfYear,
        dayOfYear,
        toleranceValue: toleranceValue || 0,
        toleranceUnit: toleranceUnit || 'DAYS',
        procedure,
        requiredEquipment,
        estimatedDuration,
        instrumentTypeId,
      },
      include: {
        instrumentType: true,
      },
    });

    res.status(201).json(method);
  } catch (error) {
    console.error('Erreur lors de la création de la méthode:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      recurrenceType,
      frequencyValue,
      frequencyUnit,
      daysOfWeek,
      dayOfMonth,
      monthOfYear,
      dayOfYear,
      toleranceValue,
      toleranceUnit,
      procedure,
      requiredEquipment,
      estimatedDuration,
      instrumentTypeId,
    } = req.body;

    const method = await prisma.calibrationMethod.update({
      where: { id },
      data: {
        name,
        description,
        recurrenceType,
        frequencyValue,
        frequencyUnit,
        daysOfWeek: daysOfWeek || [],
        dayOfMonth,
        monthOfYear,
        dayOfYear,
        toleranceValue,
        toleranceUnit,
        procedure,
        requiredEquipment,
        estimatedDuration,
        instrumentTypeId,
      },
      include: {
        instrumentType: true,
      },
    });

    res.json(method);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la méthode:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la méthode est utilisée par des calendriers
    const method = await prisma.calibrationMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { calendars: true },
        },
      },
    });

    if (!method) {
      return res.status(404).json({ message: 'Méthode non trouvée' });
    }

    if (method._count.calendars > 0) {
      return res.status(400).json({
        message: `Cette méthode est utilisée par ${method._count.calendars} calendrier(s). Supprimez d'abord les calendriers associés.`,
      });
    }

    await prisma.calibrationMethod.delete({
      where: { id },
    });

    res.json({ message: 'Méthode supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la méthode:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Appliquer une méthode d'étalonnage à plusieurs instruments
export const applyMethodToInstruments = async (req: AuthRequest, res: Response) => {
  try {
    const { methodId, instrumentIds, calendarName } = req.body;

    if (!methodId || !instrumentIds || !Array.isArray(instrumentIds) || instrumentIds.length === 0) {
      return res.status(400).json({ message: 'Méthode et instruments requis' });
    }

    // Vérifier que la méthode existe
    const method = await prisma.calibrationMethod.findUnique({
      where: { id: methodId },
      include: { instrumentType: true },
    });

    if (!method) {
      return res.status(404).json({ message: 'Méthode non trouvée' });
    }

    // Vérifier que tous les instruments existent
    const instruments = await prisma.instrument.findMany({
      where: { id: { in: instrumentIds } },
      include: { type: true },
    });

    if (instruments.length !== instrumentIds.length) {
      return res.status(400).json({ message: 'Certains instruments n\'existent pas' });
    }

    // Créer un calendrier d'étalonnage pour cette méthode
    const calendar = await prisma.calibrationCalendar.create({
      data: {
        name: calendarName || `${method.name} - Calendrier automatique`,
        description: `Calendrier créé automatiquement pour appliquer la méthode ${method.name}`,
        recurrenceType: method.recurrenceType,
        frequencyValue: method.frequencyValue,
        frequencyUnit: method.frequencyUnit,
        daysOfWeek: method.daysOfWeek,
        dayOfMonth: method.dayOfMonth,
        monthOfYear: method.monthOfYear,
        dayOfYear: method.dayOfYear,
        toleranceValue: method.toleranceValue,
        toleranceUnit: method.toleranceUnit,
        calibrationMethodId: methodId,
        active: true,
      },
    });

    // Appliquer le calendrier aux instruments sélectionnés
    await prisma.instrument.updateMany({
      where: { id: { in: instrumentIds } },
      data: { calibrationCalendarId: calendar.id },
    });

    // Récupérer les instruments mis à jour avec leurs informations
    const updatedInstruments = await prisma.instrument.findMany({
      where: { id: { in: instrumentIds } },
      include: {
        type: true,
        site: true,
        calibrationCalendar: true,
      },
    });

    res.status(201).json({
      message: `Méthode appliquée avec succès à ${updatedInstruments.length} instrument(s)`,
      calendar,
      instruments: updatedInstruments,
    });
  } catch (error) {
    console.error('Erreur lors de l\'application de la méthode:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les instruments utilisant une méthode spécifique
export const getInstrumentsUsingMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const method = await prisma.calibrationMethod.findUnique({
      where: { id },
      include: {
        instrumentType: true,
        calendars: {
          include: {
            instruments: {
              include: {
                type: true,
                site: true,
              },
            },
          },
        },
      },
    });

    if (!method) {
      return res.status(404).json({ message: 'Méthode non trouvée' });
    }

    // Flatten les instruments de tous les calendriers
    const instruments = method.calendars.flatMap((calendar: any) => 
      calendar.instruments.map((instrument: any) => ({
        ...instrument,
        calendarName: calendar.name,
        calendarId: calendar.id,
      }))
    );

    res.json({
      method,
      instruments,
      totalCount: instruments.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des instruments:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Retirer une méthode d'étalonnage de plusieurs instruments
export const removeMethodFromInstruments = async (req: AuthRequest, res: Response) => {
  try {
    const { methodId, instrumentIds } = req.body;

    if (!methodId || !instrumentIds || !Array.isArray(instrumentIds) || instrumentIds.length === 0) {
      return res.status(400).json({ message: 'Méthode et instruments requis' });
    }

    // Vérifier que la méthode existe
    const method = await prisma.calibrationMethod.findUnique({
      where: { id: methodId },
    });

    if (!method) {
      return res.status(404).json({ message: 'Méthode non trouvée' });
    }

    // Retirer le calendrier des instruments spécifiés
    const result = await prisma.instrument.updateMany({
      where: {
        id: { in: instrumentIds },
        calibrationCalendar: {
          calibrationMethodId: methodId,
        },
      },
      data: { calibrationCalendarId: null },
    });

    res.json({
      message: `Méthode retirée avec succès de ${result.count} instrument(s)`,
      affectedCount: result.count,
    });
  } catch (error) {
    console.error('Erreur lors du retrait de la méthode:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

