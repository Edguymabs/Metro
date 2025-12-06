import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const getAllMaintenanceMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { isActive, type, priority, targetAudience } = req.query;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (targetAudience) {
      where.targetAudience = targetAudience as any;
    }

    const messages = await prisma.maintenanceMessage.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de maintenance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getActiveMaintenanceMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const now = new Date();

    const messages = await prisma.maintenanceMessage.findMany({
      where: {
        isActive: true,
        OR: [
          { targetAudience: 'ALL' },
          { targetAudience: userRole as any },
        ],
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages actifs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getMaintenanceMessageById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.maintenanceMessage.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message de maintenance non trouvé' });
    }

    res.json(message);
  } catch (error) {
    console.error('Erreur lors de la récupération du message de maintenance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createMaintenanceMessage = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      message,
      type,
      priority,
      targetAudience,
      isActive,
      startDate,
      endDate,
    } = req.body;

    const maintenanceMessage = await prisma.maintenanceMessage.create({
      data: {
        title,
        message,
        type,
        priority,
        targetAudience,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdById: req.user!.userId,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(maintenanceMessage);
  } catch (error) {
    console.error('Erreur lors de la création du message de maintenance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateMaintenanceMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      message,
      type,
      priority,
      targetAudience,
      isActive,
      startDate,
      endDate,
    } = req.body;

    const existingMessage = await prisma.maintenanceMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Message de maintenance non trouvé' });
    }

    const updatedMessage = await prisma.maintenanceMessage.update({
      where: { id },
      data: {
        title,
        message,
        type,
        priority,
        targetAudience,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message de maintenance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteMaintenanceMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingMessage = await prisma.maintenanceMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Message de maintenance non trouvé' });
    }

    await prisma.maintenanceMessage.delete({
      where: { id },
    });

    res.json({ message: 'Message de maintenance supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message de maintenance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const toggleMaintenanceMessageStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingMessage = await prisma.maintenanceMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Message de maintenance non trouvé' });
    }

    const updatedMessage = await prisma.maintenanceMessage.update({
      where: { id },
      data: {
        isActive: !existingMessage.isActive,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Erreur lors du changement de statut du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const duplicateMaintenanceMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingMessage = await prisma.maintenanceMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Message de maintenance non trouvé' });
    }

    const duplicatedMessage = await prisma.maintenanceMessage.create({
      data: {
        title: `${existingMessage.title} (Copie)`,
        message: existingMessage.message,
        type: existingMessage.type,
        priority: existingMessage.priority,
        targetAudience: existingMessage.targetAudience,
        isActive: false, // Copie désactivée par défaut
        startDate: existingMessage.startDate,
        endDate: existingMessage.endDate,
        createdById: req.user!.userId,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json(duplicatedMessage);
  } catch (error) {
    console.error('Erreur lors de la duplication du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
