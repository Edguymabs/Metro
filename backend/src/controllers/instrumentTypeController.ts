import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const getAllInstrumentTypes = async (req: AuthRequest, res: Response) => {
  try {
    const types = await prisma.instrumentType.findMany({
      include: {
        _count: {
          select: { instruments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(types);
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'instruments:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createInstrumentType = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    const type = await prisma.instrumentType.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(type);
  } catch (error) {
    console.error('Erreur lors de la création du type d\'instrument:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateInstrumentType = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const type = await prisma.instrumentType.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.json(type);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type d\'instrument:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteInstrumentType = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.instrumentType.delete({
      where: { id },
    });

    res.json({ message: 'Type d\'instrument supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du type d\'instrument:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

