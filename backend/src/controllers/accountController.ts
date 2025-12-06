import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

// Changer le mot de passe de l'utilisateur connecté
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    logger.info(`Mot de passe changé pour l'utilisateur ${user.email}`);

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    logger.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les préférences de l'utilisateur
export const getPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        darkMode: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Erreur lors de la récupération des préférences:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour les préférences de l'utilisateur
export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { emailNotifications, pushNotifications, darkMode } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const updateData: any = {};
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
    if (darkMode !== undefined) updateData.darkMode = darkMode;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        emailNotifications: true,
        pushNotifications: true,
        darkMode: true,
      }
    });

    logger.info(`Préférences mises à jour pour l'utilisateur ${userId}`);

    res.json(user);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer le profil de l'utilisateur connecté
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        emailNotifications: true,
        pushNotifications: true,
        darkMode: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, email } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    logger.info(`Profil mis à jour pour l'utilisateur ${user.email}`);

    res.json(user);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


