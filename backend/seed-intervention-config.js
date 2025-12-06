const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_INTERVENTION_CONFIG = {
  name: 'Configuration par défaut',
  description: 'Configuration standard pour les interventions métrologiques',
  isDefault: true,
  isActive: true,
  interventionTypes: [
    { value: 'ETALONNAGE', label: 'Étalonnage', description: "Étalonnage de l'instrument", color: '#10b981', icon: 'settings', isActive: true },
    { value: 'VERIFICATION', label: 'Vérification', description: 'Vérification de conformité', color: '#3b82f6', icon: 'check-circle', isActive: true },
    { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintenance préventive ou corrective', color: '#f59e0b', icon: 'wrench', isActive: true },
    { value: 'REPARATION', label: 'Réparation', description: "Réparation de l'instrument", color: '#ef4444', icon: 'tool', isActive: true },
  ],
  statuses: [
    { value: 'PLANIFIEE', label: 'Planifiée', description: 'Intervention planifiée', color: '#6b7280', icon: 'calendar', isActive: true },
    { value: 'EN_COURS', label: 'En cours', description: 'Intervention en cours', color: '#3b82f6', icon: 'play', isActive: true },
    { value: 'TERMINEE', label: 'Terminée', description: 'Intervention terminée', color: '#10b981', icon: 'check', isActive: true },
    { value: 'ANNULEE', label: 'Annulée', description: 'Intervention annulée', color: '#ef4444', icon: 'x', isActive: true },
  ],
  conformityResults: [
    { value: 'CONFORME', label: 'Conforme', description: 'Instrument conforme', color: '#10b981', icon: 'check-circle', isActive: true },
    { value: 'NON_CONFORME', label: 'Non conforme', description: 'Instrument non conforme', color: '#ef4444', icon: 'x-circle', isActive: true },
    { value: 'AVEC_RESERVES', label: 'Avec réserves', description: 'Conforme avec conditions', color: '#f59e0b', icon: 'alert-triangle', isActive: true },
  ],
  conditionalFields: {
    showNextCalibrationDate: ['ETALONNAGE', 'VERIFICATION'],
    showCertificateNumber: ['ETALONNAGE', 'VERIFICATION'],
    showCost: ['ETALONNAGE', 'VERIFICATION', 'MAINTENANCE', 'REPARATION'],
    showObservations: ['ETALONNAGE', 'VERIFICATION', 'MAINTENANCE', 'REPARATION']
  },
  validations: {
    requireSupplier: ['ETALONNAGE', 'VERIFICATION'],
    requireConformityResult: ['TERMINEE'],
    requireCompletedDate: ['TERMINEE']
  }
};

async function main() {
  try {
    console.log('🔧 Vérification de la configuration d\'intervention...');
    
    const existingConfig = await prisma.interventionConfig.findFirst();
    
    if (existingConfig) {
      console.log('ℹ️  Une configuration d\'intervention existe déjà');
      process.exit(0);
    }
    
    console.log('🔧 Création de la configuration d\'intervention par défaut...');
    
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.error('❌ Aucun administrateur trouvé');
      process.exit(1);
    }
    
    await prisma.interventionConfig.create({
      data: {
        ...DEFAULT_INTERVENTION_CONFIG,
        createdById: admin.id
      }
    });
    
    console.log('✅ Configuration d\'intervention par défaut créée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();




