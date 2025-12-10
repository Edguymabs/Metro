#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   PHASE 5 : TESTS FONCTIONNELS EXHAUSTIFS"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

# Variables de résultats
TEST1_OK=0
TEST2_OK=0
TEST3_OK=0

echo "🏥 TEST 1 : API Health"
echo "────────────────────────────────────────────────────────────────"
HEALTH_RESPONSE=$(curl -s http://localhost:5001/api/health)
echo "$HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo "✅ API Health OK"
    TEST1_OK=1
else
    echo "❌ API Health échec"
fi
echo ""

echo "📝 TEST 2 : Validation Instruments (via Frontend)"
echo "────────────────────────────────────────────────────────────────"
echo "Action manuelle requise:"
echo "1. Allez sur https://beta-test-metro.mabstudio.fr"
echo "2. Connexion avec compte admin"
echo "3. Instruments → Nouveau"
echo "4. Remplir UNIQUEMENT:"
echo "   - Numéro de série: TEST-WAR-001"
echo "   - Nom: Test Plan Guerre"
echo "5. Laisser Type et Site VIDES"
echo "6. Cliquer Créer"
echo ""
read -p "Test validation réussi ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    TEST2_OK=1
    echo "✅ Test validation instruments OK"
else
    echo "❌ Test validation instruments échec"
    echo "Vérifiez les logs: docker-compose logs backend --tail=50"
fi
echo ""

echo "💾 TEST 3 : Backup SQL"
echo "────────────────────────────────────────────────────────────────"
echo "Test manuel pg_dump:"
docker-compose exec -T backend sh -c '
  cd /app
  DATABASE_URL=$DATABASE_URL
  DBURL_CLEAN=$(echo $DATABASE_URL | cut -d"?" -f1)
  pg_dump $DBURL_CLEAN > /app/backups/test_manual.sql 2>&1
  ls -lh /app/backups/test_manual.sql
' && TEST3_OK=1 || echo "❌ pg_dump échec"

if [ $TEST3_OK -eq 1 ]; then
    echo "✅ Backup SQL manuel OK"
    echo ""
    echo "Test via API (nécessite token JWT):"
    echo "Pour tester via API, exécutez:"
    echo ""
    echo "TOKEN=\"votre_token_jwt\""
    echo "curl -X POST http://localhost:5001/api/backup/create \\"
    echo "  -H \"Authorization: Bearer \$TOKEN\" \\"
    echo "  -H \"Content-Type: application/json\""
    echo ""
else
    echo "❌ Backup SQL échec"
fi
echo ""

echo "📊 TEST 4 : Export Excel"
echo "────────────────────────────────────────────────────────────────"
echo "Test manuel requis via Frontend:"
echo "1. Paramètres → Sauvegardes"
echo "2. Export sélectif → Instruments → Excel"
echo "3. Vérifier téléchargement .xlsx"
echo ""
read -p "Test export réussi ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo "✅ Test export OK"
else
    echo "❌ Test export échec"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ DES TESTS"
echo "════════════════════════════════════════════════════════════════"
echo "Test 1 (API Health): $([ $TEST1_OK -eq 1 ] && echo '✅ OK' || echo '❌ ÉCHEC')"
echo "Test 2 (Validation Instruments): $([ $TEST2_OK -eq 1 ] && echo '✅ OK' || echo '❌ ÉCHEC')"
echo "Test 3 (Backup SQL): $([ $TEST3_OK -eq 1 ] && echo '✅ OK' || echo '❌ ÉCHEC')"
echo ""

TOTAL_OK=$((TEST1_OK + TEST2_OK + TEST3_OK))
echo "Total: $TOTAL_OK/3 tests réussis"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE 5 TERMINÉE - Tests fonctionnels"
echo "════════════════════════════════════════════════════════════════"
echo ""
read -p "Continuer vers Phase 6 ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    bash plan-guerre-phase6-logs.sh
fi

