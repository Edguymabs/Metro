import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const getAllCalendars = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { calibrationMethodId, active } = req.query;

    const where: any = {};
    if (calibrationMethodId) {
      where.calibrationMethodId = calibrationMethodId;
    }
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const calendars = await prisma.calibrationCalendar.findMany({
      where,
      include: {
        calibrationMethod: {
          include: {
            instrumentType: true,
          },
        },
        _count: {
          select: { instruments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(calendars);
  } catch (error) {
    next(error);
  }
};

export const getCalendarById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const calendar = await prisma.calibrationCalendar.findUnique({
      where: { id },
      include: {
        calibrationMethod: {
          include: {
            instrumentType: true,
          },
        },
        instruments: {
          include: {
            type: true,
            site: true,
          },
        },
      },
    });

    if (!calendar) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }

    res.json(calendar);
  } catch (error) {
    next(error);
  }
};

export const createCalendar = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      active,
      calibrationMethodId,
      instrumentIds,
    } = req.body;

    // Vérifier calibrationMethod si fourni
    if (calibrationMethodId && calibrationMethodId !== '') {
      const method = await prisma.calibrationMethod.findUnique({ where: { id: calibrationMethodId } });
      if (!method) {
        return res.status(404).json({ message: "Méthode d'étalonnage non trouvée" });
      }
    }

    // Vérifier instruments existent
    if (instrumentIds && instrumentIds.length > 0) {
      const instruments = await prisma.instrument.findMany({
        where: { id: { in: instrumentIds } }
      });
      if (instruments.length !== instrumentIds.length) {
        return res.status(404).json({ message: 'Un ou plusieurs instruments non trouvés' });
      }
    }

    const calendar = await prisma.calibrationCalendar.create({
      data: {
        name,
        description,
        recurrenceType,
        frequencyValue,
        frequencyUnit,
        daysOfWeek: daysOfWeek || [],
        dayOfMonth: dayOfMonth || undefined,
        monthOfYear: monthOfYear || undefined,
        dayOfYear: dayOfYear || undefined,
        toleranceValue: toleranceValue || 0,
        toleranceUnit: toleranceUnit || 'DAYS',
        active: active !== undefined ? active : true,
        calibrationMethodId: calibrationMethodId && calibrationMethodId !== '' ? calibrationMethodId : undefined,
      },
      include: {
        calibrationMethod: {
          include: {
            instrumentType: true,
          },
        },
      },
    });

    // Associer les instruments au calendrier
    if (instrumentIds && instrumentIds.length > 0) {
      await prisma.instrument.updateMany({
        where: {
          id: { in: instrumentIds },
        },
        data: {
          calibrationCalendarId: calendar.id,
        },
      });
    }

    res.status(201).json(calendar);
  } catch (error) {
    next(error);
  }
};

export const updateCalendar = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      active,
      calibrationMethodId,
      instrumentIds,
    } = req.body;

    // Vérifier calibrationMethod si fourni
    if (calibrationMethodId && calibrationMethodId !== '') {
      const method = await prisma.calibrationMethod.findUnique({ where: { id: calibrationMethodId } });
      if (!method) {
        return res.status(404).json({ message: "Méthode d'étalonnage non trouvée" });
      }
    }

    // Vérifier instruments existent si fournis
    if (instrumentIds && instrumentIds.length > 0) {
      const instruments = await prisma.instrument.findMany({
        where: { id: { in: instrumentIds } }
      });
      if (instruments.length !== instrumentIds.length) {
        return res.status(404).json({ message: 'Un ou plusieurs instruments non trouvés' });
      }
    }

    const calendar = await prisma.calibrationCalendar.update({
      where: { id },
      data: {
        name,
        description,
        recurrenceType,
        frequencyValue,
        frequencyUnit,
        daysOfWeek: daysOfWeek || [],
        dayOfMonth: dayOfMonth || undefined,
        monthOfYear: monthOfYear || undefined,
        dayOfYear: dayOfYear || undefined,
        toleranceValue,
        toleranceUnit,
        active,
        calibrationMethodId: calibrationMethodId && calibrationMethodId !== '' ? calibrationMethodId : null,
      },
      include: {
        calibrationMethod: {
          include: {
            instrumentType: true,
          },
        },
      },
    });

    // Mettre à jour les associations d'instruments si fourni
    if (instrumentIds !== undefined) {
      // Retirer le calendrier des instruments non sélectionnés
      await prisma.instrument.updateMany({
        where: {
          calibrationCalendarId: id,
          id: { notIn: instrumentIds },
        },
        data: {
          calibrationCalendarId: null,
        },
      });

      // Associer les nouveaux instruments
      if (instrumentIds.length > 0) {
        await prisma.instrument.updateMany({
          where: {
            id: { in: instrumentIds },
          },
          data: {
            calibrationCalendarId: id,
          },
        });
      }
    }

    res.json(calendar);
  } catch (error) {
    next(error);
  }
};

export const deleteCalendar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Retirer le calendrier des instruments associés
    await prisma.instrument.updateMany({
      where: { calibrationCalendarId: id },
      data: { calibrationCalendarId: null },
    });

    await prisma.calibrationCalendar.delete({
      where: { id },
    });

    res.json({ message: 'Calendrier supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

export const toggleCalendarActive = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const calendar = await prisma.calibrationCalendar.update({
      where: { id },
      data: { active },
      include: {
        calibrationMethod: {
          include: {
            instrumentType: true,
          },
        },
      },
    });

    res.json(calendar);
  } catch (error) {
    next(error);
  }
};

