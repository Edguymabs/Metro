import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { cleanDateField, cleanDateFieldForPrisma, cleanStringField } from '../utils/dataTransformers';

export const getAllMovements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { instrumentId, type } = req.query;

    const where: any = {};

    if (instrumentId) {
      where.instrumentId = instrumentId;
    }

    if (type) {
      where.type = type;
    }

    const movements = await prisma.movement.findMany({
      where,
      include: {
        instrument: {
          include: {
            type: true,
            site: true,
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { movementDate: 'desc' },
    });

    res.json(movements);
  } catch (error) {
    next(error);
  }
};

export const createMovement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      instrumentId,
      type,
      movementDate,
      expectedReturn,
      actualReturn,
      deliveryNote,
      receptionNote,
      destination,
      observations,
    } = req.body;

    // Vérifier que l'instrument existe
    const instrument = await prisma.instrument.findUnique({ where: { id: instrumentId } });
    if (!instrument) {
      return res.status(404).json({ message: 'Instrument non trouvé' });
    }

    // Validation logique métier: ENLEVEMENT nécessite expectedReturn
    if (type === 'ENLEVEMENT' && !expectedReturn) {
      return res.status(400).json({ message: 'Un enlèvement nécessite une date de retour prévue' });
    }

    // Validation logique métier: TRANSFERT nécessite une destination
    if (type === 'TRANSFERT' && !destination) {
      return res.status(400).json({ message: 'Un transfert nécessite une destination' });
    }

    const movement = await prisma.movement.create({
      data: {
        instrumentId,
        type,
        movementDate: cleanDateField(movementDate) || new Date(),
        expectedReturn: cleanDateField(expectedReturn),
        actualReturn: cleanDateField(actualReturn),
        deliveryNote: cleanStringField(deliveryNote),
        receptionNote: cleanStringField(receptionNote),
        destination: cleanStringField(destination),
        observations: cleanStringField(observations),
        createdById: req.user!.userId,
      },
      include: {
        instrument: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(movement);
  } catch (error) {
    next(error);
  }
};

export const updateMovement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      type,
      movementDate,
      expectedReturn,
      actualReturn,
      deliveryNote,
      receptionNote,
      destination,
      observations,
    } = req.body;

    const movement = await prisma.movement.update({
      where: { id },
      data: {
        type,
        movementDate: cleanDateFieldForPrisma(movementDate),
        expectedReturn: cleanDateFieldForPrisma(expectedReturn),
        actualReturn: cleanDateFieldForPrisma(actualReturn),
        deliveryNote: cleanStringField(deliveryNote),
        receptionNote: cleanStringField(receptionNote),
        destination: cleanStringField(destination),
        observations: cleanStringField(observations),
      },
      include: {
        instrument: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(movement);
  } catch (error) {
    next(error);
  }
};

export const deleteMovement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.movement.delete({
      where: { id },
    });

    res.json({ message: 'Mouvement supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

export const getOverdueReturns = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();

    const overdueMovements = await prisma.movement.findMany({
      where: {
        type: 'ENLEVEMENT',
        actualReturn: null,
        expectedReturn: {
          lt: today,
        },
      },
      include: {
        instrument: {
          include: {
            type: true,
            site: true,
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { expectedReturn: 'asc' },
    });

    res.json(overdueMovements);
  } catch (error) {
    next(error);
  }
};

