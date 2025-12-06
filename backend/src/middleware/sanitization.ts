import { Request, Response, NextFunction } from 'express';
import { trimAllStrings, emptyStringsToNull } from '../utils/dataTransformers';

/**
 * Middleware de sanitization qui nettoie les données entrantes
 * - Trim toutes les strings
 * - Convertit les chaînes vides en null
 * - S'applique AVANT la validation Joi
 */
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    // Log les données originales
    console.log('🧹 Sanitization - Données originales:', JSON.stringify(req.body, null, 2));
    
    // Trim toutes les strings
    let sanitized = trimAllStrings(req.body);
    
    // Convertir chaînes vides en null
    sanitized = emptyStringsToNull(sanitized);
    
    // Remplacer req.body avec les données nettoyées
    req.body = sanitized;
    
    // Log les données nettoyées
    console.log('✨ Sanitization - Données nettoyées:', JSON.stringify(req.body, null, 2));
  }
  
  next();
};

/**
 * Middleware de sanitization pour les query params
 */
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query && typeof req.query === 'object') {
    const sanitized = trimAllStrings(req.query as Record<string, any>);
    req.query = sanitized;
  }
  
  next();
};

