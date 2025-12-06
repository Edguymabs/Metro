// Types pour la configuration des menus d'intervention
export interface MenuOption {
  value: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface InterventionMenuConfig {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Configuration des types d'intervention
  interventionTypes: MenuOption[];
  
  // Configuration des statuts
  statuses: MenuOption[];
  
  // Configuration des résultats de conformité
  conformityResults: MenuOption[];
  
  // Configuration des champs conditionnels
  conditionalFields: {
    showNextCalibrationDate: string[]; // Types qui affichent ce champ
    showCertificateNumber: string[];   // Types qui affichent ce champ
    showCost: string[];                 // Types qui affichent ce champ
    showObservations: string[];         // Types qui affichent ce champ
  };
  
  // Configuration des validations
  validations: {
    requireSupplier: string[];          // Types qui nécessitent un fournisseur
    requireConformityResult: string[]; // Statuts qui nécessitent un résultat
    requireCompletedDate: string[];     // Statuts qui nécessitent une date de fin
  };
}

// Configuration par défaut
export const DEFAULT_INTERVENTION_CONFIG: InterventionMenuConfig = {
  id: 'default',
  name: 'Configuration par défaut',
  description: 'Configuration standard pour les interventions métrologiques',
  isDefault: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  interventionTypes: [
    { value: 'ETALONNAGE', label: 'Étalonnage', description: 'Étalonnage de l\'instrument', color: '#10b981', icon: 'settings', isActive: true },
    { value: 'VERIFICATION', label: 'Vérification', description: 'Vérification de conformité', color: '#3b82f6', icon: 'check-circle', isActive: true },
    { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintenance préventive ou corrective', color: '#f59e0b', icon: 'wrench', isActive: true },
    { value: 'REPARATION', label: 'Réparation', description: 'Réparation de l\'instrument', color: '#ef4444', icon: 'tool', isActive: true },
    { value: 'CONTROLE_QUALITE', label: 'Contrôle qualité', description: 'Contrôle qualité interne', color: '#8b5cf6', icon: 'shield-check', isActive: true }
  ],
  
  statuses: [
    { value: 'PLANIFIEE', label: 'Planifiée', description: 'Intervention planifiée', color: '#6b7280', icon: 'calendar', isActive: true },
    { value: 'EN_COURS', label: 'En cours', description: 'Intervention en cours', color: '#3b82f6', icon: 'play', isActive: true },
    { value: 'TERMINEE', label: 'Terminée', description: 'Intervention terminée', color: '#10b981', icon: 'check', isActive: true },
    { value: 'ANNULEE', label: 'Annulée', description: 'Intervention annulée', color: '#ef4444', icon: 'x', isActive: true },
    { value: 'REPORTEE', label: 'Reportée', description: 'Intervention reportée', color: '#f59e0b', icon: 'clock', isActive: true }
  ],
  
  conformityResults: [
    { value: 'CONFORME', label: 'Conforme', description: 'Instrument conforme', color: '#10b981', icon: 'check-circle', isActive: true },
    { value: 'NON_CONFORME', label: 'Non conforme', description: 'Instrument non conforme', color: '#ef4444', icon: 'x-circle', isActive: true },
    { value: 'CONFORME_AVEC_RESERVES', label: 'Conforme avec réserves', description: 'Conforme avec conditions', color: '#f59e0b', icon: 'alert-triangle', isActive: true },
    { value: 'NON_TESTE', label: 'Non testé', description: 'Test non effectué', color: '#6b7280', icon: 'help-circle', isActive: true }
  ],
  
  conditionalFields: {
    showNextCalibrationDate: ['ETALONNAGE', 'VERIFICATION'],
    showCertificateNumber: ['ETALONNAGE', 'VERIFICATION', 'CONTROLE_QUALITE'],
    showCost: ['ETALONNAGE', 'VERIFICATION', 'MAINTENANCE', 'REPARATION'],
    showObservations: ['ETALONNAGE', 'VERIFICATION', 'MAINTENANCE', 'REPARATION', 'CONTROLE_QUALITE']
  },
  
  validations: {
    requireSupplier: ['ETALONNAGE', 'VERIFICATION', 'MAINTENANCE', 'REPARATION'],
    requireConformityResult: ['TERMINEE'],
    requireCompletedDate: ['TERMINEE']
  }
};

// Types pour les templates de configuration
export interface InterventionConfigTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  config: Partial<InterventionMenuConfig>;
}

export const INTERVENTION_CONFIG_TEMPLATES: InterventionConfigTemplate[] = [
  {
    id: 'laboratory',
    name: 'Laboratoire',
    description: 'Configuration pour laboratoires d\'analyse',
    industry: 'Laboratoire',
    config: {
      interventionTypes: [
        { value: 'ETALONNAGE', label: 'Étalonnage', description: 'Étalonnage des équipements', color: '#10b981', icon: 'settings', isActive: true },
        { value: 'VERIFICATION', label: 'Vérification', description: 'Vérification de conformité', color: '#3b82f6', icon: 'check-circle', isActive: true },
        { value: 'CONTROLE_QUALITE', label: 'Contrôle qualité', description: 'Contrôle qualité interne', color: '#8b5cf6', icon: 'shield-check', isActive: true },
        { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintenance préventive', color: '#f59e0b', icon: 'wrench', isActive: true }
      ],
      conformityResults: [
        { value: 'CONFORME', label: 'Conforme', description: 'Équipement conforme', color: '#10b981', icon: 'check-circle', isActive: true },
        { value: 'NON_CONFORME', label: 'Non conforme', description: 'Équipement non conforme', color: '#ef4444', icon: 'x-circle', isActive: true },
        { value: 'CONFORME_AVEC_RESERVES', label: 'Conforme avec réserves', description: 'Conforme avec conditions', color: '#f59e0b', icon: 'alert-triangle', isActive: true }
      ]
    }
  },
  {
    id: 'manufacturing',
    name: 'Industrie manufacturière',
    description: 'Configuration pour l\'industrie manufacturière',
    industry: 'Manufacturing',
    config: {
      interventionTypes: [
        { value: 'ETALONNAGE', label: 'Étalonnage', description: 'Étalonnage des instruments', color: '#10b981', icon: 'settings', isActive: true },
        { value: 'VERIFICATION', label: 'Vérification', description: 'Vérification de conformité', color: '#3b82f6', icon: 'check-circle', isActive: true },
        { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintenance préventive', color: '#f59e0b', icon: 'wrench', isActive: true },
        { value: 'REPARATION', label: 'Réparation', description: 'Réparation corrective', color: '#ef4444', icon: 'tool', isActive: true },
        { value: 'CONTROLE_QUALITE', label: 'Contrôle qualité', description: 'Contrôle qualité production', color: '#8b5cf6', icon: 'shield-check', isActive: true }
      ],
      statuses: [
        { value: 'PLANIFIEE', label: 'Planifiée', description: 'Intervention planifiée', color: '#6b7280', icon: 'calendar', isActive: true },
        { value: 'EN_COURS', label: 'En cours', description: 'Intervention en cours', color: '#3b82f6', icon: 'play', isActive: true },
        { value: 'TERMINEE', label: 'Terminée', description: 'Intervention terminée', color: '#10b981', icon: 'check', isActive: true },
        { value: 'ANNULEE', label: 'Annulée', description: 'Intervention annulée', color: '#ef4444', icon: 'x', isActive: true }
      ]
    }
  },
  {
    id: 'pharmaceutical',
    name: 'Pharmaceutique',
    description: 'Configuration pour l\'industrie pharmaceutique',
    industry: 'Pharmaceutique',
    config: {
      interventionTypes: [
        { value: 'ETALONNAGE', label: 'Étalonnage', description: 'Étalonnage des équipements', color: '#10b981', icon: 'settings', isActive: true },
        { value: 'VERIFICATION', label: 'Vérification', description: 'Vérification de conformité', color: '#3b82f6', icon: 'check-circle', isActive: true },
        { value: 'QUALIFICATION', label: 'Qualification', description: 'Qualification des équipements', color: '#8b5cf6', icon: 'shield-check', isActive: true },
        { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintenance préventive', color: '#f59e0b', icon: 'wrench', isActive: true }
      ],
      conformityResults: [
        { value: 'CONFORME', label: 'Conforme', description: 'Équipement conforme', color: '#10b981', icon: 'check-circle', isActive: true },
        { value: 'NON_CONFORME', label: 'Non conforme', description: 'Équipement non conforme', color: '#ef4444', icon: 'x-circle', isActive: true },
        { value: 'CONFORME_AVEC_RESERVES', label: 'Conforme avec réserves', description: 'Conforme avec conditions', color: '#f59e0b', icon: 'alert-triangle', isActive: true },
        { value: 'NON_TESTE', label: 'Non testé', description: 'Test non effectué', color: '#6b7280', icon: 'help-circle', isActive: true }
      ]
    }
  }
];
