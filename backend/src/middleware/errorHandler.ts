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

