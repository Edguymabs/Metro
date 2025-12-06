import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

interface SecurityEvent {
  timestamp: string;
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'SQL_INJECTION' | 'BRUTE_FORCE';
  ip: string;
  userAgent: string;
  endpoint: string;
  details: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class SecurityMonitor {
  private logFile: string;
  private alertThresholds: Map<string, number>;
  private ipCounts: Map<string, number>;
  private lastReset: number;

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'security.log');
    this.alertThresholds = new Map([
      ['AUTH_FAILURE', 5],
      ['RATE_LIMIT', 10],
      ['SUSPICIOUS_ACTIVITY', 3],
      ['SQL_INJECTION', 1],
      ['BRUTE_FORCE', 3]
    ]);
    this.ipCounts = new Map();
    this.lastReset = Date.now();
    
    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private logEvent(event: SecurityEvent): void {
    const logEntry = JSON.stringify(event) + '\n';
    fs.appendFileSync(this.logFile, logEntry);
    
    // Vérifier les seuils d'alerte
    this.checkAlertThresholds(event);
  }

  private checkAlertThresholds(event: SecurityEvent): void {
    const key = `${event.type}_${event.ip}`;
    const currentCount = this.ipCounts.get(key) || 0;
    const newCount = currentCount + 1;
    this.ipCounts.set(key, newCount);

    const threshold = this.alertThresholds.get(event.type) || 0;
    
    if (newCount >= threshold) {
      this.sendAlert(event, newCount);
    }
  }

  private sendAlert(event: SecurityEvent, count: number): void {
    const alert = {
      timestamp: new Date().toISOString(),
      type: 'SECURITY_ALERT',
      event: event.type,
      ip: event.ip,
      count,
      severity: event.severity,
      message: `Seuil de sécurité dépassé: ${event.type} (${count} occurrences)`
    };

    console.error('🚨 ALERTE DE SÉCURITÉ:', alert);
    
    // Ici vous pourriez envoyer des notifications par email, Slack, etc.
    this.sendNotification(alert);
  }

  private sendNotification(alert: any): void {
    // Implémentation pour envoyer des notifications
    // Exemple: email, Slack, webhook, etc.
    console.log('📧 Notification envoyée:', alert.message);
  }

  public recordEvent(
    type: SecurityEvent['type'],
    req: Request,
    details: any = {},
    severity: SecurityEvent['severity'] = 'MEDIUM'
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      type,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      endpoint: req.originalUrl,
      details,
      severity
    };

    this.logEvent(event);
  }

  public getSecurityStats(): any {
    return {
      totalEvents: this.ipCounts.size,
      topIPs: Array.from(this.ipCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      lastReset: new Date(this.lastReset).toISOString()
    };
  }

  public resetCounts(): void {
    this.ipCounts.clear();
    this.lastReset = Date.now();
  }
}

// Instance globale du moniteur
export const securityMonitor = new SecurityMonitor();

// Middleware de surveillance des requêtes
export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Intercepter la réponse pour enregistrer les métriques
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    
    // Enregistrer les métriques
    if (res.statusCode >= 400) {
      securityMonitor.recordEvent(
        'SUSPICIOUS_ACTIVITY',
        req,
        { statusCode: res.statusCode, duration },
        res.statusCode >= 500 ? 'HIGH' : 'MEDIUM'
      );
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware de surveillance des échecs d'authentification
export const authFailureMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      securityMonitor.recordEvent(
        'AUTH_FAILURE',
        req,
        { statusCode: res.statusCode, body: data },
        'MEDIUM'
      );
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware de surveillance des tentatives de brute force
export const bruteForceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `brute_force_${ip}`;
  const currentCount = securityMonitor['ipCounts'].get(key) || 0;
  
  if (currentCount > 10) {
    securityMonitor.recordEvent(
      'BRUTE_FORCE',
      req,
      { attemptCount: currentCount },
      'HIGH'
    );
  }
  
  next();
};

// Endpoint pour obtenir les statistiques de sécurité
export const getSecurityStats = (req: Request, res: Response) => {
  try {
    const stats = securityMonitor.getSecurityStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};
