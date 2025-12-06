import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  helmetConfig, 
  generalLimiter, 
  authLimiter, 
  speedLimiter,
  securityHeaders,
  attackDetection 
} from './middleware/security';
import { 
  requestMonitoring, 
  authFailureMonitoring, 
  bruteForceMonitoring,
  getSecurityStats 
} from './middleware/monitoring';
import { sanitize } from './middleware/sanitization';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import instrumentRoutes from './routes/instrumentRoutes';
import interventionRoutes from './routes/interventionRoutes';
import supplierRoutes from './routes/supplierRoutes';
import documentRoutes from './routes/documentRoutes';
import siteRoutes from './routes/siteRoutes';
import instrumentTypeRoutes from './routes/instrumentTypeRoutes';
import movementRoutes from './routes/movementRoutes';
import userRoutes from './routes/userRoutes';
import calibrationMethodRoutes from './routes/calibrationMethodRoutes';
import calibrationCalendarRoutes from './routes/calibrationCalendarRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import securityRoutes from './routes/securityRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import accountRoutes from './routes/accountRoutes';
import backupRoutes from './routes/backupRoutes';
import interventionConfigRoutes from './routes/interventionConfigRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy pour les IPs réelles
app.set('trust proxy', 1);

// Headers de sécurité avancés
app.use(helmetConfig);
app.use(securityHeaders);

// CORS sécurisé
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));

// Middleware de surveillance
app.use(requestMonitoring);
app.use(attackDetection);

// Rate limiting et slow down
app.use(generalLimiter);
app.use(speedLimiter);

// Parsing sécurisé
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Vérification de la taille du payload
    if (buf.length > 10 * 1024 * 1024) {
      throw new Error('Payload trop volumineux');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));

// Sanitization des données (AVANT validation)
app.use(sanitize);

// Routes avec surveillance spécialisée
app.use('/api/auth', authLimiter, authFailureMonitoring, bruteForceMonitoring, authRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/instrument-types', instrumentTypeRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/calibration-methods', calibrationMethodRoutes);
app.use('/api/calibration-calendars', calibrationCalendarRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/intervention-configs', interventionConfigRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Metro API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Route de surveillance de sécurité (admin seulement)
app.get('/api/security/stats', getSecurityStats);

// Gestion centralisée des erreurs (DOIT être en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
});

export default app;

