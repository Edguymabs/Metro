#!/bin/bash
# Script de correction des erreurs TypeScript pour Metro
# Exécuter ce script dans le répertoire ~/apps/Metro sur le VPS

echo "🔧 Correction des erreurs TypeScript..."
echo ""

cd ~/apps/Metro || { echo "❌ Répertoire ~/apps/Metro introuvable"; exit 1; }

# ============================================
# 1. Correction errorHandler.ts
# ============================================
echo "📝 1/8 - Correction errorHandler.ts..."
cat > backend/src/middleware/errorHandler.ts << 'EOF'
import { Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import { parsePrismaError } from '../utils/prismaErrorHandler';
import { logger } from '../utils/logger';
import { AuthRequest } from './auth';

export const errorHandler = (
  err: Error | AppError,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Log l'erreur complète pour le débogage
  logger.error('Erreur interceptée', {
    route: `${req.method} ${req.path}`,
    userId: req.user?.userId || 'Non authentifié',
    errorType: err.constructor.name,
    message: err.message,
    stack: err.stack,
    // En développement seulement, inclure le body
    ...(process.env.NODE_ENV === 'development' && { body: req.body })
  });

  // Si c'est une erreur AppError personnalisée
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // Si c'est une erreur Prisma
  if (err.constructor.name.includes('Prisma')) {
    const { statusCode, message } = parsePrismaError(err);
    return res.status(statusCode).json({
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Erreur par défaut
  res.status(500).json({
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

// Wrapper async pour automatiquement catch les erreurs des controllers
export const asyncHandler = (
  fn: (req: any, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: any, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
EOF
echo "✅ errorHandler.ts corrigé"

# ============================================
# 2. Correction prismaErrorHandler.ts
# ============================================
echo "📝 2/8 - Correction prismaErrorHandler.ts..."
cat > backend/src/utils/prismaErrorHandler.ts << 'EOF'
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError, PrismaClientValidationError, PrismaClientInitializationError } from '@prisma/client/runtime/library';

interface PrismaErrorResult {
  statusCode: number;
  message: string;
}

export const parsePrismaError = (error: any): PrismaErrorResult => {
  // Erreurs Prisma Client
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2000':
        return {
          statusCode: 400,
          message: `La valeur fournie pour la colonne est trop longue: ${error.meta?.column_name || 'inconnue'}`,
        };

      case 'P2001':
        return {
          statusCode: 404,
          message: `L'enregistrement recherché n'existe pas: ${error.meta?.model_name || 'ressource'}`,
        };

      case 'P2002':
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target.join(', ') : 'champ';
        return {
          statusCode: 409,
          message: `Conflit: un enregistrement avec ce ${field} existe déjà`,
        };

      case 'P2003':
        const fieldName = error.meta?.field_name as string | undefined;
        return {
          statusCode: 400,
          message: `Référence invalide: ${fieldName || 'relation'} n'existe pas`,
        };

      case 'P2004':
        return {
          statusCode: 400,
          message: 'Une contrainte a échoué sur la base de données',
        };

      case 'P2011':
        const constraintName = error.meta?.constraint as string | undefined;
        return {
          statusCode: 400,
          message: `Contrainte NULL violée: ${constraintName || 'champ requis'}`,
        };

      case 'P2012':
        return {
          statusCode: 400,
          message: 'Valeur manquante pour un champ obligatoire',
        };

      case 'P2013':
        return {
          statusCode: 400,
          message: 'Argument requis manquant',
        };

      case 'P2014':
        return {
          statusCode: 400,
          message: 'La modification violerait une relation requise',
        };

      case 'P2015':
        return {
          statusCode: 404,
          message: 'Enregistrement associé non trouvé',
        };

      case 'P2016':
        return {
          statusCode: 400,
          message: 'Erreur d\'interprétation de la requête',
        };

      case 'P2017':
        return {
          statusCode: 400,
          message: 'Les enregistrements de la relation ne sont pas connectés',
        };

      case 'P2018':
        return {
          statusCode: 400,
          message: 'Les enregistrements connectés requis n\'ont pas été trouvés',
        };

      case 'P2019':
        return {
          statusCode: 400,
          message: 'Erreur de saisie',
        };

      case 'P2020':
        return {
          statusCode: 400,
          message: 'Valeur hors limites pour le type de données',
        };

      case 'P2021':
        return {
          statusCode: 500,
          message: 'La table n\'existe pas dans la base de données',
        };

      case 'P2022':
        return {
          statusCode: 500,
          message: 'La colonne n\'existe pas dans la base de données',
        };

      case 'P2023':
        return {
          statusCode: 400,
          message: 'Données de colonne incohérentes',
        };

      case 'P2024':
        return {
          statusCode: 408,
          message: 'Délai d\'attente de connexion à la base de données dépassé',
        };

      case 'P2025':
        return {
          statusCode: 404,
          message: 'Ressource non trouvée pour la mise à jour ou la suppression',
        };

      default:
        return {
          statusCode: 500,
          message: `Erreur de base de données (${error.code}): ${error.message}`,
        };
    }
  }

  // Erreur de validation Prisma
  if (error instanceof PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: 'Erreur de validation des données',
    };
  }

  // Erreur d'initialisation Prisma
  if (error instanceof PrismaClientInitializationError) {
    return {
      statusCode: 503,
      message: 'Impossible de se connecter à la base de données',
    };
  }

  // Erreur inconnue
  return {
    statusCode: 500,
    message: 'Erreur serveur interne',
  };
};
EOF
echo "✅ prismaErrorHandler.ts corrigé"

# ============================================
# 3. Ajout cleanDateFieldForPrisma dans dataTransformers.ts
# ============================================
echo "📝 3/8 - Ajout cleanDateFieldForPrisma dans dataTransformers.ts..."
# Vérifier si la fonction existe déjà
if ! grep -q "cleanDateFieldForPrisma" backend/src/utils/dataTransformers.ts; then
  # Ajouter la fonction après cleanDateField
  sed -i 's/return date;$/return date;\n};\n\n\/**\n * Nettoie une date pour Prisma (convertit null en undefined)\n *\/\nexport const cleanDateFieldForPrisma = (value: any): Date | undefined => {\n  const cleaned = cleanDateField(value);\n  return cleaned ?? undefined;/' backend/src/utils/dataTransformers.ts
fi
echo "✅ dataTransformers.ts corrigé"

# ============================================
# 4. Correction instrumentController.ts
# ============================================
echo "📝 4/8 - Correction instrumentController.ts..."
# Remplacer "data: cleanedData," par "data: cleanedData as any,"
sed -i 's/data: cleanedData,$/data: cleanedData as any,/' backend/src/controllers/instrumentController.ts
# Ajouter next à getInstrumentStats
sed -i 's/export const getInstrumentStats = async (req: AuthRequest, res: Response) =>/export const getInstrumentStats = async (req: AuthRequest, res: Response, next: NextFunction) =>/' backend/src/controllers/instrumentController.ts
echo "✅ instrumentController.ts corrigé"

# ============================================
# 5. Correction siteController.ts
# ============================================
echo "📝 5/8 - Correction siteController.ts..."
sed -i 's/data: cleanedData,$/data: cleanedData as any,/' backend/src/controllers/siteController.ts
echo "✅ siteController.ts corrigé"

# ============================================
# 6. Correction interventionController.ts
# ============================================
echo "📝 6/8 - Correction interventionController.ts..."
# Ajouter import
sed -i "s/import { cleanDateField,/import { cleanDateField, cleanDateFieldForPrisma,/" backend/src/controllers/interventionController.ts
# Remplacer cleanDateField par cleanDateFieldForPrisma dans les updates
sed -i 's/scheduledDate: cleanDateField(scheduledDate),/scheduledDate: cleanDateFieldForPrisma(scheduledDate),/g' backend/src/controllers/interventionController.ts
sed -i 's/completedDate: cleanDateField(completedDate),/completedDate: cleanDateFieldForPrisma(completedDate),/g' backend/src/controllers/interventionController.ts
sed -i 's/nextCalibrationDate: cleanDateField(nextCalibrationDate),/nextCalibrationDate: cleanDateFieldForPrisma(nextCalibrationDate),/g' backend/src/controllers/interventionController.ts
echo "✅ interventionController.ts corrigé"

# ============================================
# 7. Correction movementController.ts
# ============================================
echo "📝 7/8 - Correction movementController.ts..."
sed -i "s/import { cleanDateField,/import { cleanDateField, cleanDateFieldForPrisma,/" backend/src/controllers/movementController.ts
sed -i 's/movementDate: cleanDateField(movementDate),/movementDate: cleanDateFieldForPrisma(movementDate),/g' backend/src/controllers/movementController.ts
sed -i 's/expectedReturn: cleanDateField(expectedReturn),/expectedReturn: cleanDateFieldForPrisma(expectedReturn),/g' backend/src/controllers/movementController.ts
sed -i 's/actualReturn: cleanDateField(actualReturn),/actualReturn: cleanDateFieldForPrisma(actualReturn),/g' backend/src/controllers/movementController.ts
echo "✅ movementController.ts corrigé"

# ============================================
# 8. Correction interventionConfigController.ts
# ============================================
echo "📝 8/8 - Correction interventionConfigController.ts..."
sed -i 's/interventionTypes: existingConfig.interventionTypes,/interventionTypes: existingConfig.interventionTypes as any,/g' backend/src/controllers/interventionConfigController.ts
sed -i 's/statuses: existingConfig.statuses,/statuses: existingConfig.statuses as any,/g' backend/src/controllers/interventionConfigController.ts
sed -i 's/conformityResults: existingConfig.conformityResults,/conformityResults: existingConfig.conformityResults as any,/g' backend/src/controllers/interventionConfigController.ts
sed -i 's/conditionalFields: existingConfig.conditionalFields,/conditionalFields: existingConfig.conditionalFields as any,/g' backend/src/controllers/interventionConfigController.ts
sed -i 's/validations: existingConfig.validations,/validations: existingConfig.validations as any,/g' backend/src/controllers/interventionConfigController.ts
echo "✅ interventionConfigController.ts corrigé"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Toutes les corrections appliquées !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Prochaine étape: Rebuild Docker"
echo ""
echo "   docker-compose build --no-cache"
echo "   docker-compose up -d"
echo ""

