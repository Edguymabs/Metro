import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { encrypt, decrypt } from './encryption';
import ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';

const execAsync = promisify(exec);

interface BackupConfig {
  databaseUrl: string;
  backupDir: string;
  retentionDays: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
}

class SecureBackupManager {
  private config: BackupConfig;

  constructor() {
    this.config = {
      databaseUrl: process.env.DATABASE_URL || '',
      backupDir: process.env.BACKUP_DIR || './backups',
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      encryptionEnabled: process.env.BACKUP_ENCRYPTION === 'true',
      compressionEnabled: process.env.BACKUP_COMPRESSION === 'true'
    };

    // Créer le dossier de backup s'il n'existe pas
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  // Créer un backup complet de la base de données
  public async createFullBackup(): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `metro_backup_${timestamp}.sql`;
      const filepath = path.join(this.config.backupDir, filename);

      // Extraire les informations de connexion depuis DATABASE_URL
      // Format: postgresql://user:password@host:port/database?schema=public
      const urlMatch = this.config.databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
      
      if (!urlMatch) {
        throw new Error('Format DATABASE_URL invalide');
      }

      const [, dbUser, dbPassword, dbHost, dbPort, dbName] = urlMatch;

      // Utiliser pg_dump avec PGPASSWORD pour éviter l'exposition du mot de passe dans la commande
      const command = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${filepath}"`;
      
      console.log('🔄 Création du backup...');
      await execAsync(command, {
        env: { ...process.env, PGPASSWORD: dbPassword }
      });

      // Compresser si activé
      let finalFilepath = filepath;
      if (this.config.compressionEnabled) {
        const compressedFilepath = filepath + '.gz';
        await execAsync(`gzip "${filepath}"`);
        finalFilepath = compressedFilepath;
        console.log('📦 Backup compressé');
      }

      // Chiffrer si activé
      if (this.config.encryptionEnabled) {
        const encryptedFilepath = finalFilepath + '.enc';
        const backupData = fs.readFileSync(finalFilepath);
        const encrypted = encrypt(backupData.toString());
        
        fs.writeFileSync(encryptedFilepath, JSON.stringify(encrypted));
        fs.unlinkSync(finalFilepath); // Supprimer le fichier non chiffré
        finalFilepath = encryptedFilepath;
        console.log('🔐 Backup chiffré');
      }

      // Nettoyer les anciens backups
      await this.cleanupOldBackups();

      console.log('✅ Backup créé avec succès:', finalFilepath);
      return { success: true, filename: path.basename(finalFilepath) };

    } catch (error) {
      console.error('❌ Erreur lors de la création du backup:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Restaurer un backup
  public async restoreBackup(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const filepath = path.join(this.config.backupDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return { success: false, error: 'Fichier de backup introuvable' };
      }

      let actualFilepath = filepath;
      let isEncrypted = false;
      let isCompressed = false;

      // Déterminer le type de fichier
      if (filename.endsWith('.enc')) {
        isEncrypted = true;
      } else if (filename.endsWith('.gz')) {
        isCompressed = true;
      }

      // Déchiffrer si nécessaire
      if (isEncrypted) {
        const encryptedData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        const decrypted = decrypt(encryptedData);
        const decryptedFilepath = filepath.replace('.enc', '');
        fs.writeFileSync(decryptedFilepath, decrypted);
        actualFilepath = decryptedFilepath;
      }

      // Décompresser si nécessaire
      if (isCompressed) {
        const decompressedFilepath = actualFilepath.replace('.gz', '');
        await execAsync(`gunzip "${actualFilepath}"`);
        actualFilepath = decompressedFilepath;
      }

      // Restaurer la base de données
      // Extraire les informations de connexion depuis DATABASE_URL (sans ?schema=public)
      const urlMatch = this.config.databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
      
      if (!urlMatch) {
        throw new Error('Format DATABASE_URL invalide');
      }

      const [, dbUser, dbPassword, dbHost, dbPort, dbName] = urlMatch;
      
      // Utiliser psql avec PGPASSWORD pour éviter l'exposition du mot de passe
      const command = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} < "${actualFilepath}"`;
      await execAsync(command, {
        env: { ...process.env, PGPASSWORD: dbPassword }
      });

      // Nettoyer les fichiers temporaires
      if (isEncrypted || isCompressed) {
        fs.unlinkSync(actualFilepath);
      }

      console.log('✅ Backup restauré avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Lister les backups disponibles
  public listBackups(): { filename: string; size: number; created: Date; type: string }[] {
    const files = fs.readdirSync(this.config.backupDir);
    const backups = files
      .filter(file => file.startsWith('metro_backup_'))
      .map(file => {
        const filepath = path.join(this.config.backupDir, file);
        const stats = fs.statSync(filepath);
        
        let type = 'plain';
        if (file.endsWith('.enc')) type = 'encrypted';
        else if (file.endsWith('.gz')) type = 'compressed';
        else if (file.endsWith('.enc.gz')) type = 'encrypted-compressed';

        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          type
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    return backups;
  }

  // Nettoyer les anciens backups
  private async cleanupOldBackups(): Promise<void> {
    const backups = this.listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    for (const backup of backups) {
      if (backup.created < cutoffDate) {
        const filepath = path.join(this.config.backupDir, backup.filename);
        fs.unlinkSync(filepath);
        console.log('🗑️ Backup supprimé:', backup.filename);
      }
    }
  }

  // Vérifier l'intégrité d'un backup
  public async verifyBackup(filename: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const filepath = path.join(this.config.backupDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return { valid: false, error: 'Fichier introuvable' };
      }

      // Vérifier la taille du fichier
      const stats = fs.statSync(filepath);
      if (stats.size === 0) {
        return { valid: false, error: 'Fichier vide' };
      }

      // Vérifier la structure du fichier SQL
      const content = fs.readFileSync(filepath, 'utf8');
      if (!content.includes('-- PostgreSQL database dump')) {
        return { valid: false, error: 'Format de fichier invalide' };
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Erreur de vérification' };
    }
  }

  // Planifier des backups automatiques
  public scheduleBackups(intervalHours: number = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      console.log('🔄 Backup automatique démarré...');
      const result = await this.createFullBackup();
      if (result.success) {
        console.log('✅ Backup automatique terminé:', result.filename);
      } else {
        console.error('❌ Échec du backup automatique:', result.error);
      }
    }, intervalMs);

    console.log(`📅 Backups automatiques programmés toutes les ${intervalHours}h`);
  }

  // Export vers Excel
  public async exportToExcel(entityName: string, data: any[]): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      if (!data || data.length === 0) {
        return { success: false, error: 'Aucune donnée à exporter' };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${entityName}_export_${timestamp}.xlsx`;
      const filepath = path.join(this.config.backupDir, filename);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(entityName);

      // Extraire les colonnes du premier objet
      const columns = Object.keys(data[0]).map(key => ({
        header: key,
        key: key,
        width: 15
      }));

      worksheet.columns = columns;

      // Ajouter les données
      data.forEach(row => {
        worksheet.addRow(row);
      });

      // Styling
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4B5563' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      await workbook.xlsx.writeFile(filepath);

      console.log('✅ Export Excel créé:', filename);
      return { success: true, filename };

    } catch (error) {
      console.error('❌ Erreur lors de l\'export Excel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Export vers CSV
  public async exportToCSV(entityName: string, data: any[]): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      if (!data || data.length === 0) {
        return { success: false, error: 'Aucune donnée à exporter' };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${entityName}_export_${timestamp}.csv`;
      const filepath = path.join(this.config.backupDir, filename);

      // Extraire les colonnes
      const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: headers
      });

      await csvWriter.writeRecords(data);

      console.log('✅ Export CSV créé:', filename);
      return { success: true, filename };

    } catch (error) {
      console.error('❌ Erreur lors de l\'export CSV:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Export vers JSON
  public async exportToJSON(entityName: string, data: any[]): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      if (!data || data.length === 0) {
        return { success: false, error: 'Aucune donnée à exporter' };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${entityName}_export_${timestamp}.json`;
      const filepath = path.join(this.config.backupDir, filename);

      const jsonContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filepath, jsonContent, 'utf8');

      console.log('✅ Export JSON créé:', filename);
      return { success: true, filename };

    } catch (error) {
      console.error('❌ Erreur lors de l\'export JSON:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Export de toutes les entités
  public async exportAllEntities(format: 'excel' | 'csv' | 'json', entitiesData: { [key: string]: any[] }): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (format === 'excel') {
        const filename = `complete_export_${timestamp}.xlsx`;
        const filepath = path.join(this.config.backupDir, filename);
        const workbook = new ExcelJS.Workbook();

        // Créer une feuille par entité
        for (const [entityName, data] of Object.entries(entitiesData)) {
          if (data && data.length > 0) {
            const worksheet = workbook.addWorksheet(entityName);
            const columns = Object.keys(data[0]).map(key => ({
              header: key,
              key: key,
              width: 15
            }));
            worksheet.columns = columns;
            data.forEach(row => worksheet.addRow(row));
            
            // Styling
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF4B5563' }
            };
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
          }
        }

        await workbook.xlsx.writeFile(filepath);
        console.log('✅ Export complet Excel créé:', filename);
        return { success: true, filename };

      } else {
        // Pour CSV et JSON, créer un fichier par entité dans un zip ou dossier
        const folderName = `complete_export_${timestamp}`;
        const folderPath = path.join(this.config.backupDir, folderName);
        
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        for (const [entityName, data] of Object.entries(entitiesData)) {
          if (data && data.length > 0) {
            if (format === 'csv') {
              const filename = `${entityName}.csv`;
              const filepath = path.join(folderPath, filename);
              const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
              const csvWriter = createObjectCsvWriter({
                path: filepath,
                header: headers
              });
              await csvWriter.writeRecords(data);
            } else if (format === 'json') {
              const filename = `${entityName}.json`;
              const filepath = path.join(folderPath, filename);
              fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
            }
          }
        }

        // Créer un fichier zip du dossier
        const zipFilename = `${folderName}.zip`;
        const zipFilepath = path.join(this.config.backupDir, zipFilename);
        await execAsync(`cd "${this.config.backupDir}" && zip -r "${zipFilename}" "${folderName}"`);
        
        // Supprimer le dossier temporaire
        await execAsync(`rm -rf "${folderPath}"`);

        console.log('✅ Export complet créé:', zipFilename);
        return { success: true, filename: zipFilename };
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'export complet:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Supprimer un backup
  public deleteBackup(filename: string): { success: boolean; error?: string } {
    try {
      const filepath = path.join(this.config.backupDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return { success: false, error: 'Fichier introuvable' };
      }

      fs.unlinkSync(filepath);
      console.log('🗑️ Backup supprimé:', filename);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Obtenir le chemin d'un backup
  public getBackupPath(filename: string): string {
    return path.join(this.config.backupDir, filename);
  }
}

export const backupManager = new SecureBackupManager();
