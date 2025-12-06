import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

// Fonction pour nettoyer et encoder correctement les noms de fichiers
const sanitizeFileName = (filename: string): string => {
  // Décoder les caractères mal encodés
  try {
    // Essayer de décoder les caractères UTF-8 mal encodés
    const decoded = Buffer.from(filename, 'latin1').toString('utf8');
    return decoded;
  } catch (error) {
    // Si le décodage échoue, retourner le nom original
    return filename;
  }
};

// Configuration de Multer pour l'upload
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1 // Maximum 1 fichier à la fois
  },
  fileFilter: (req, file, cb) => {
    // Validation stricte des types MIME
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    // Validation de l'extension du fichier
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.xls', '.xlsx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      // Validation supplémentaire du nom de fichier (pas de caractères dangereux)
      const safeNamePattern = /^[a-zA-Z0-9._\-\s()]+$/;
      const fileNameWithoutExt = path.basename(file.originalname, fileExtension);
      
      if (safeNamePattern.test(fileNameWithoutExt)) {
        cb(null, true);
      } else {
        cb(new Error('Nom de fichier contient des caractères non autorisés'));
      }
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  },
});

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { instrumentId, interventionId, description } = req.body;

    if (!instrumentId && !interventionId) {
      return res.status(400).json({
        message: 'Un instrumentId ou interventionId est requis',
      });
    }

    const document = await prisma.document.create({
      data: {
        filename: req.file.filename,
        originalName: sanitizeFileName(req.file.originalname),
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        description,
        instrumentId: instrumentId || null,
        interventionId: interventionId || null,
      },
    });

    res.status(201).json(document);
  } catch (error) {
    logger.error('Erreur lors de l\'upload du document', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { instrumentId, interventionId } = req.query;

    const where: any = {};

    if (instrumentId) {
      where.instrumentId = instrumentId;
    }

    if (interventionId) {
      where.interventionId = interventionId;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    logger.error('Erreur lors de la récupération des documents', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Sécurité : vérifier que le chemin est bien dans le répertoire d'uploads
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const absoluteUploadDir = path.resolve(uploadDir);
    const absoluteFilePath = path.resolve(document.path);
    
    if (!absoluteFilePath.startsWith(absoluteUploadDir)) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ message: 'Fichier non trouvé sur le disque' });
    }

    // Encoder correctement le nom de fichier pour le téléchargement
    const encodedFileName = Buffer.from(document.originalName, 'utf8').toString('latin1');
    res.download(document.path, encodedFileName);
  } catch (error) {
    logger.error('Erreur lors du téléchargement du document', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Supprimer le fichier du disque
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Supprimer l'entrée de la base de données
    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression du document', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

