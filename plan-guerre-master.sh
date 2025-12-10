#!/bin/bash
set -e

cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║          🎯 PLAN DE GUERRE - CORRECTION DÉFINITIVE METRO         ║
║                                                                  ║
║  Ce script exécute automatiquement toutes les phases du plan    ║
║  pour corriger les problèmes de validation et de backup SQL     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF

echo ""
echo "📋 PHASES DU PLAN:"
echo "  Phase 1: Diagnostic complet VPS"
echo "  Phase 2: Mise à jour forcée du code"
echo "  Phase 3: Reconstruction propre backend"
echo "  Phase 4: Configuration post-démarrage"
echo "  Phase 5: Tests fonctionnels exhaustifs"
echo "  Phase 6: Vérifications logs & sécurité"
echo "  Phase 7: Persistence & robustesse"
echo "  Phase 8: Améliorations recommandées (optionnel)"
echo "  Phase 9: Tests de régression"
echo "  Phase 10: Documentation finale"
echo ""
echo "⏱️  Temps estimé total: 45 minutes"
echo ""
echo "⚠️  ATTENTION:"
echo "  - Ce script doit être exécuté sur le VPS"
echo "  - Certains tests nécessitent une interaction manuelle"
echo "  - Assurez-vous d'avoir les accès admin au frontend"
echo ""

read -p "Voulez-vous commencer le Plan de Guerre ? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "Plan de Guerre annulé"
    exit 0
fi

echo ""
echo "🚀 DÉMARRAGE DU PLAN DE GUERRE"
echo "════════════════════════════════════════════════════════════════"
echo ""

START_TIME=$(date +%s)

# Exécuter Phase 1
bash plan-guerre-phase1-diagnostic.sh

# Note: Les phases suivantes s'enchaînent via les scripts individuels
# grâce aux prompts "Continuer vers Phase X ?"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎉 PLAN DE GUERRE TERMINÉ"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Durée totale: ${MINUTES}m ${SECONDS}s"
echo ""
echo "📊 Prochaines étapes:"
echo "  1. Vérifiez le rapport: RAPPORT_TESTS_$(date +%Y%m%d).md"
echo "  2. Testez le site: https://beta-test-metro.mabstudio.fr"
echo "  3. Signalez tout problème restant"
echo ""

