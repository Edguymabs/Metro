import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { cleanOptionalFields } from '../utils/dataTransformers';

export const getAllSites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { active } = req.query;

    const where: any = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const sites = await prisma.site.findMany({
      where,
      include: {
        _count: {
          select: { instruments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(sites);
  } catch (error) {
    next(error);
  }
};

export const getSiteById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        instruments: {
          include: {
            type: true,
          },
        },
      },
    });

    if (!site) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }

    res.json(site);
  } catch (error) {
    next(error);
  }
};

export const createSite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, address, city, postalCode, country } = req.body;

    const cleanedData = cleanOptionalFields({
      name,
      address,
      city,
      postalCode,
      country: country || 'France',
    }, {
      stringFields: ['address', 'city', 'postalCode', 'country']
    });

    const site = await prisma.site.create({
      data: cleanedData,
    });

    res.status(201).json(site);
  } catch (error) {
    next(error);
  }
};

export const updateSite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, address, city, postalCode, country, active } = req.body;

    const existingSite = await prisma.site.findUnique({ where: { id } });
    if (!existingSite) {
      return res.status(404).json({ message: 'Site non trouvé' });
    }

    const cleanedData = cleanOptionalFields({
      name,
      address,
      city,
      postalCode,
      country,
      active,
    }, {
      stringFields: ['address', 'city', 'postalCode', 'country']
    });

    const site = await prisma.site.update({
      where: { id },
      data: cleanedData,
    });

    res.json(site);
  } catch (error) {
    next(error);
  }
};

export const deleteSite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.site.update({
      where: { id },
      data: { active: false },
    });

    res.json({ message: 'Site désactivé avec succès' });
  } catch (error) {
    next(error);
  }
};

