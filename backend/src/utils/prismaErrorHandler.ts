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

