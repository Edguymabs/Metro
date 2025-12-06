import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { backupManager } from '../utils/backup';
import { importFromCSV, importFromJSON, importFromExcel } from '../utils/dataImporter';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// POST /api/backup/create - Créer un backup SQL complet
export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    console.log(`🔐 Admin ${req.user?.email} crée un backup SQL complet`);
    
    const result = await backupManager.createFullBackup();

    if (result.success) {
      res.status(200).json({
        message: 'Backup créé avec succès',
        filename: result.filename
      });
    } else {
      res.status(500).json({
        message: 'Erreur lors de la création du backup',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erreur dans createBackup:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/backup/export/:entity/:format - Export sélectif d'une entité
export const exportEntity = async (req: AuthRequest, res: Response) => {
  try {
    const { entity, format } = req.params;
    
    console.log(`📊 Admin ${req.user?.email} exporte ${entity} en ${format}`);

    // Mapper les entités vers les modèles Prisma
    const entityModels: { [key: string]: any } = {
      instruments: prisma.instrument,
      sites: prisma.site,
      suppliers: prisma.supplier,
      users: prisma.user,
      interventions: prisma.intervention,
      movements: prisma.movement,
      instrumentTypes: prisma.instrumentType,
      calibrationMethods: prisma.calibrationMethod,
      calibrationCalendars: prisma.calibrationCalendar,
    };

    const model = entityModels[entity];
    if (!model) {
      return res.status(400).json({ message: 'Entité non reconnue' });
    }

    // Récupérer toutes les données de l'entité
    const data = await model.findMany();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée à exporter' });
    }

    // Exporter selon le format
    let result;
    if (format === 'excel') {
      result = await backupManager.exportToExcel(entity, data);
    } else if (format === 'csv') {
      result = await backupManager.exportToCSV(entity, data);
    } else if (format === 'json') {
      result = await backupManager.exportToJSON(entity, data);
    } else {
      return res.status(400).json({ message: 'Format non supporté' });
    }

    if (result.success) {
      res.status(200).json({
        message: `Export ${format} créé avec succès`,
        filename: result.filename,
        count: data.length
      });
    } else {
      res.status(500).json({
        message: 'Erreur lors de l\'export',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erreur dans exportEntity:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/backup/export-all/:format - Export complet de toutes les entités
export const exportAll = async (req: AuthRequest, res: Response) => {
  try {
    const { format } = req.params;
    
    console.log(`📦 Admin ${req.user?.email} exporte toutes les données en ${format}`);

    // Récupérer toutes les données
    const entitiesData = {
      instruments: await prisma.instrument.findMany(),
      sites: await prisma.site.findMany(),
      suppliers: await prisma.supplier.findMany(),
      users: await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
          // Ne pas exporter les mots de passe
        }
      }),
      interventions: await prisma.intervention.findMany(),
      movements: await prisma.movement.findMany(),
      instrumentTypes: await prisma.instrumentType.findMany(),
      calibrationMethods: await prisma.calibrationMethod.findMany(),
      calibrationCalendars: await prisma.calibrationCalendar.findMany(),
    };

    const result = await backupManager.exportAllEntities(format as 'excel' | 'csv' | 'json', entitiesData);

    if (result.success) {
      res.status(200).json({
        message: `Export complet ${format} créé avec succès`,
        filename: result.filename
      });
    } else {
      res.status(500).json({
        message: 'Erreur lors de l\'export complet',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erreur dans exportAll:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET /api/backup/list - Lister tous les backups disponibles
export const listBackups = async (req: AuthRequest, res: Response) => {
  try {
    const backups = backupManager.listBackups();

    res.status(200).json({
      backups,
      count: backups.length
    });
  } catch (error: any) {
    console.error('Erreur dans listBackups:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/backup/restore - Restaurer un backup SQL
export const restoreBackup = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ message: 'Nom de fichier requis' });
    }

    console.log(`⚠️  Admin ${req.user?.email} restaure le backup ${filename}`);

    const result = await backupManager.restoreBackup(filename);

    if (result.success) {
      res.status(200).json({
        message: 'Backup restauré avec succès'
      });
    } else {
      res.status(500).json({
        message: 'Erreur lors de la restauration',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erreur dans restoreBackup:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /api/backup/import/:entity - Importer des données CSV/JSON/Excel
export const importData = async (req: AuthRequest, res: Response) => {
  try {
    const { entity } = req.params;
    
    if (!req.files || Array.isArray(req.files)) {
      return res.status(400).json({ message: 'Fichier requis' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.file || files.file.length === 0) {
      return res.status(400).json({ message: 'Fichier requis' });
    }

    const file = files.file[0];
    const filePath = (file as any).tempFilePath || file.path;

    console.log(`📥 Admin ${req.user?.email} importe des données pour ${entity}`);

    // Vérifier la taille du fichier (limite 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ message: 'Fichier trop volumineux (max 50MB)' });
    }

    // Déterminer le format du fichier
    const ext = path.extname(file.originalname).toLowerCase();
    
    let result;
    if (ext === '.csv') {
      result = await importFromCSV(entity, filePath);
    } else if (ext === '.json') {
      result = await importFromJSON(entity, filePath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      result = await importFromExcel(entity, filePath);
    } else {
      return res.status(400).json({ message: 'Format de fichier non supporté' });
    }

    // Nettoyer le fichier temporaire
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (result.success) {
      res.status(200).json({
        message: 'Import réussi',
        imported: result.imported,
        errors: result.errors
      });
    } else {
      res.status(500).json({
        message: 'Erreur lors de l\'import',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erreur dans importData:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET /api/backup/download/:filename - Télécharger un fichier de backup
export const downloadBackup = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;

    console.log(`⬇️  Admin ${req.user?.email} télécharge ${filename}`);

    const filePath = backupManager.getBackupPath(filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier introuvable' });
    }

    // Définir les en-têtes pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error: any) {
    console.error('Erreur dans downloadBackup:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// DELETE /api/backup/:filename - Supprimer un backup
export const deleteBackup = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;

    console.log(`🗑️  Admin ${req.user?.email} supprime ${filename}`);

    const result = backupManager.deleteBackup(filename);

    if (result.success) {
      res.status(200).json({
        message: 'Backup supprimé avec succès'
      });
    } else {
      res.status(500).json({
        message: 'Erreur lors de la suppression',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erreur dans deleteBackup:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

