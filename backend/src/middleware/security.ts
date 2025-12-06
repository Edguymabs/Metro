import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import ExpressBrute from 'express-brute';
import { Request, Response, NextFunction } from 'express';

// Configuration Helmet pour la sécurité maximale
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// Rate limiting général
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de requêtes',
      message: 'Veuillez attendre avant de faire une nouvelle requête',
      retryAfter: Math.round(15 * 60 * 1000 / 1000)
    });
  }
});

// Rate limiting pour l'authentification (plus strict)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Augmenté de 5 à 20 tentatives de connexion par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de tentatives de connexion',
      message: 'Votre compte est temporairement bloqué. Réessayez dans 15 minutes.',
      retryAfter: Math.round(15 * 60 * 1000 / 1000)
    });
  }
});

// Slow down pour les requêtes répétées
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Commence à ralentir après 50 requêtes
  delayMs: 500, // Ajoute 500ms de délai par requête supplémentaire
  maxDelayMs: 20000, // Délai maximum de 20 secondes
});

// Brute force protection pour l'authentification
export const bruteForce = new ExpressBrute({
  freeRetries: 10, // Augmenté de 3 à 10 tentatives gratuites
  minWait: 2 * 60 * 1000, // Réduit de 5 à 2 minutes
  maxWait: 15 * 60 * 1000, // 15 minutes
  lifetime: 24 * 60 * 60 * 1000, // 24 heures
  refreshOnSuccess: true,
  attachResetToRequest: true,
  resetOnSuccess: true,
  handleStoreError: (error: any) => {
    console.error('Erreur brute force store:', error);
  }
});

// Middleware de sécurité des headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Supprimer le header X-Powered-By
  res.removeHeader('X-Powered-By');
  
  // Headers de sécurité supplémentaires
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Middleware de validation IP
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (process.env.NODE_ENV === 'production' && allowedIPs.length > 0) {
      if (!allowedIPs.includes(clientIP)) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Votre adresse IP n\'est pas autorisée'
        });
      }
    }
    
    next();
  };
};

// Middleware de détection d'attaques
export const attackDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
    /havij/i,
    /sqlninja/i
  ];
  
  // Détecter les outils d'attaque
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    // Utiliser le logger pour les événements de sécurité
    const { logger } = require('../utils/logger');
    logger.security('Tentative d\'attaque détectée', { userAgent, ip: req.ip, path: req.path });
    
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Requête suspecte détectée'
    });
  }
  
  // Détecter les tentatives d'injection SQL basiques
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /or\s+1=1/i,
    /and\s+1=1/i
  ];
  
  const queryString = JSON.stringify(req.query);
  const bodyString = JSON.stringify(req.body);
  
  if (sqlPatterns.some(pattern => 
    pattern.test(queryString) || pattern.test(bodyString)
  )) {
    const { logger } = require('../utils/logger');
    logger.security('Tentative d\'injection SQL détectée', { ip: req.ip, path: req.path });
    
    return res.status(400).json({
      error: 'Requête invalide',
      message: 'Caractères non autorisés détectés'
    });
  }
  
  next();
};
