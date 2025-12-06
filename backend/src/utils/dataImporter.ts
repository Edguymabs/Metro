import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ImportResult {
  success: boolean;
  imported?: number;
  errors?: string[];
  error?: string;
}

// Mapper les noms d'entités vers les modèles Prisma
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

// Import depuis CSV
export async function importFromCSV(entity: string, filePath: string): Promise<ImportResult> {
  try {
    const model = entityModels[entity];
    if (!model) {
      return { success: false, error: `Entité '${entity}' non reconnue` };
    }

    const results: any[] = [];
    const errors: string[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      return { success: false, error: 'Aucune donnée trouvée dans le fichier CSV' };
    }

    // Nettoyer et valider les données
    const cleanedData = results.map(row => cleanRowData(row));

    // Importer en transaction
    let imported = 0;
    for (const data of cleanedData) {
      try {
        await model.create({ data });
        imported++;
      } catch (error: any) {
        errors.push(`Erreur ligne ${imported + 1}: ${error.message}`);
      }
    }

    console.log(`✅ Import CSV terminé: ${imported}/${results.length} entrées importées`);
    
    return {
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'import CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Import depuis JSON
export async function importFromJSON(entity: string, filePath: string): Promise<ImportResult> {
  try {
    const model = entityModels[entity];
    if (!model) {
      return { success: false, error: `Entité '${entity}' non reconnue` };
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data)) {
      return { success: false, error: 'Le fichier JSON doit contenir un tableau d\'objets' };
    }

    if (data.length === 0) {
      return { success: false, error: 'Aucune donnée trouvée dans le fichier JSON' };
    }

    // Nettoyer et valider les données
    const cleanedData = data.map(row => cleanRowData(row));

    const errors: string[] = [];
    let imported = 0;

    // Importer en transaction
    for (const item of cleanedData) {
      try {
        await model.create({ data: item });
        imported++;
      } catch (error: any) {
        errors.push(`Erreur entrée ${imported + 1}: ${error.message}`);
      }
    }

    console.log(`✅ Import JSON terminé: ${imported}/${data.length} entrées importées`);

    return {
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'import JSON:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Import depuis Excel
export async function importFromExcel(entity: string, filePath: string): Promise<ImportResult> {
  try {
    const model = entityModels[entity];
    if (!model) {
      return { success: false, error: `Entité '${entity}' non reconnue` };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Prendre la première feuille ou celle qui correspond au nom de l'entité
    let worksheet = workbook.getWorksheet(entity) || workbook.getWorksheet(1);
    
    if (!worksheet) {
      return { success: false, error: 'Aucune feuille de calcul trouvée' };
    }

    const rows: any[] = [];
    const headers: string[] = [];

    // Extraire les en-têtes (première ligne)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || '';
    });

    // Extraire les données
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value;
        }
      });

      if (Object.keys(rowData).length > 0) {
        rows.push(rowData);
      }
    });

    if (rows.length === 0) {
      return { success: false, error: 'Aucune donnée trouvée dans le fichier Excel' };
    }

    // Nettoyer et valider les données
    const cleanedData = rows.map(row => cleanRowData(row));

    const errors: string[] = [];
    let imported = 0;

    // Importer en transaction
    for (const data of cleanedData) {
      try {
        await model.create({ data });
        imported++;
      } catch (error: any) {
        errors.push(`Erreur ligne ${imported + 2}: ${error.message}`); // +2 car ligne 1 = header
      }
    }

    console.log(`✅ Import Excel terminé: ${imported}/${rows.length} entrées importées`);

    return {
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'import Excel:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Nettoyer et transformer les données brutes
function cleanRowData(row: any): any {
  const cleaned: any = {};

  for (const [key, value] of Object.entries(row)) {
    // Skip empty values
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // Convertir les booléens
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        cleaned[key] = true;
        continue;
      }
      if (value.toLowerCase() === 'false') {
        cleaned[key] = false;
        continue;
      }
    }

    // Convertir les dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        cleaned[key] = date;
        continue;
      }
    }

    // Convertir les nombres
    if (key.toLowerCase().includes('price') || 
        key.toLowerCase().includes('value') || 
        key.toLowerCase().includes('period') ||
        key.toLowerCase().includes('frequency')) {
      const num = parseFloat(value as string);
      if (!isNaN(num)) {
        cleaned[key] = num;
        continue;
      }
    }

    // Gérer les tableaux (pour daysOfWeek, etc.)
    if (key === 'daysOfWeek' && typeof value === 'string') {
      try {
        cleaned[key] = JSON.parse(value);
        continue;
      } catch {
        cleaned[key] = value.split(',').map((s: string) => s.trim());
        continue;
      }
    }

    cleaned[key] = value;
  }

  return cleaned;
}

// Valider les données avant import
export function validateImportData(entity: string, data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation basique
  if (!Array.isArray(data)) {
    errors.push('Les données doivent être un tableau');
    return { valid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Aucune donnée à importer');
    return { valid: false, errors };
  }

  // Validation spécifique par entité
  const requiredFields: { [key: string]: string[] } = {
    instruments: ['serialNumber', 'name', 'typeId', 'siteId'],
    sites: ['name'],
    suppliers: ['name'],
    users: ['email', 'password', 'firstName', 'lastName', 'role'],
    instrumentTypes: ['name'],
  };

  const required = requiredFields[entity] || [];

  data.forEach((row, index) => {
    required.forEach(field => {
      if (!row[field]) {
        errors.push(`Ligne ${index + 1}: champ requis '${field}' manquant`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

