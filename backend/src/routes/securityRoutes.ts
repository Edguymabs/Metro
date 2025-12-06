import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import { backupManager } from '../utils/backup';
import { securityMonitor } from '../middleware/monitoring';
import { validatePasswordStrength, generateSecurePassword } from '../utils/encryption';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Statistiques de sécurité (admin seulement)
router.get('/stats', authorize('ADMIN'), (req, res) => {
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
});

// Créer un backup (admin seulement)
router.post('/backup', authorize('ADMIN'), async (req, res) => {
  try {
    const result = await backupManager.createFullBackup();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Backup créé avec succès',
        filename: result.filename
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du backup'
    });
  }
});

// Lister les backups (admin seulement)
router.get('/backups', authorize('ADMIN'), (req, res) => {
  try {
    const backups = backupManager.listBackups();
    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des backups'
    });
  }
});

// Restaurer un backup (admin seulement)
router.post('/restore/:filename', authorize('ADMIN'), async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await backupManager.restoreBackup(filename);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Backup restauré avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la restauration'
    });
  }
});

// Vérifier l'intégrité d'un backup (admin seulement)
router.get('/verify/:filename', authorize('ADMIN'), async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await backupManager.verifyBackup(filename);
    
    res.json({
      success: true,
      valid: result.valid,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification'
    });
  }
});

// Tester la force d'un mot de passe
router.post('/password-strength', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe requis'
      });
    }

    const result = validatePasswordStrength(password);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la validation'
    });
  }
});

// Générer un mot de passe sécurisé (admin seulement)
router.post('/generate-password', authorize('ADMIN'), (req, res) => {
  try {
    const { length = 16 } = req.body;
    const password = generateSecurePassword(length);
    
    res.json({
      success: true,
      password,
      length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération'
    });
  }
});

// Réinitialiser les compteurs de sécurité (admin seulement)
router.post('/reset-counters', authorize('ADMIN'), (req, res) => {
  try {
    securityMonitor.resetCounts();
    
    res.json({
      success: true,
      message: 'Compteurs de sécurité réinitialisés'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation'
    });
  }
});

// Planifier des backups automatiques (admin seulement)
router.post('/schedule-backups', authorize('ADMIN'), (req, res) => {
  try {
    const { intervalHours = 24 } = req.body;
    
    if (intervalHours < 1 || intervalHours > 168) {
      return res.status(400).json({
        success: false,
        error: 'Intervalle invalide (1-168 heures)'
      });
    }

    backupManager.scheduleBackups(intervalHours);
    
    res.json({
      success: true,
      message: `Backups automatiques programmés toutes les ${intervalHours}h`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la programmation'
    });
  }
});

export default router;
