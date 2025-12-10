#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   PHASE 9 : TESTS DE RÉGRESSION"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Tests manuels requis sur: https://beta-test-metro.mabstudio.fr"
echo ""

cd ~/apps/Metro

declare -a TESTS=(
    "Login: Se connecter/déconnecter"
    "Liste instruments: Affichage correct"
    "Modifier instrument: Édition fonctionne"
    "Supprimer instrument: Suppression soft fonctionne"
    "Créer intervention: Sur un instrument existant"
    "Créer site: Nouveau site"
    "Dashboard: Statistiques s'affichent"
)

PASSED=0
TOTAL=${#TESTS[@]}

for i in "${!TESTS[@]}"; do
    TEST_NUM=$((i+1))
    echo "────────────────────────────────────────────────────────────────"
    echo "TEST $TEST_NUM/$TOTAL: ${TESTS[$i]}"
    echo "────────────────────────────────────────────────────────────────"
    echo ""
    read -p "Test réussi ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo "✅ Test $TEST_NUM OK"
        PASSED=$((PASSED+1))
    else
        echo "❌ Test $TEST_NUM ÉCHEC"
        echo "Notez les détails de l'erreur:"
        read -p "Appuyez sur Entrée pour continuer..."
    fi
    echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ TESTS DE RÉGRESSION"
echo "════════════════════════════════════════════════════════════════"
echo "Tests réussis: $PASSED/$TOTAL"
echo ""

if [ $PASSED -eq $TOTAL ]; then
    echo "✅ TOUS LES TESTS DE RÉGRESSION PASSÉS"
else
    echo "⚠️  $((TOTAL-PASSED)) test(s) échoué(s)"
    echo "Vérifiez les logs pour plus de détails"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE 9 TERMINÉE - Tests régression"
echo "════════════════════════════════════════════════════════════════"
echo ""
read -p "Continuer vers Phase 10 (Documentation) ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    bash plan-guerre-phase10-doc.sh
fi

