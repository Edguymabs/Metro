import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { cleanStringField, cleanOptionalFields } from '../utils/dataTransformers';

export const getAllSuppliers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, active } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { contactName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        interventions: {
          take: 5,
          orderBy: { scheduledDate: 'desc' },
        },
        _count: {
          select: { interventions: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        interventions: {
          include: {
            instrument: true,
          },
          orderBy: { scheduledDate: 'desc' },
        },
        _count: {
          select: { interventions: true },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      contactName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      accreditations,
      accreditationDoc,
      notes,
    } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName: cleanStringField(contactName),
        email: cleanStringField(email),
        phone: cleanStringField(phone),
        address: cleanStringField(address),
        city: cleanStringField(city),
        postalCode: cleanStringField(postalCode),
        country: country || 'France',
        accreditations: accreditations || [],
        accreditationDoc: cleanStringField(accreditationDoc),
        notes: cleanStringField(notes),
      },
    });

    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      contactName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      accreditations,
      accreditationDoc,
      active,
      notes,
    } = req.body;

    const existingSupplier = await prisma.supplier.findUnique({ where: { id } });
    if (!existingSupplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const cleanedData = cleanOptionalFields({
      name,
      contactName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      accreditations,
      accreditationDoc,
      active,
      notes,
    }, {
      stringFields: ['contactName', 'email', 'phone', 'address', 'city', 'postalCode', 'country', 'accreditationDoc', 'notes']
    });

    const supplier = await prisma.supplier.update({
      where: { id },
      data: cleanedData,
    });

    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Soft delete
    await prisma.supplier.update({
      where: { id },
      data: { active: false },
    });

    res.json({ message: 'Fournisseur désactivé avec succès' });
  } catch (error) {
    next(error);
  }
};

