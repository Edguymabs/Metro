#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   PHASE 6 : VÉRIFICATIONS LOGS & SÉCURITÉ"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

echo "🔍 1. Vérifier absence de console.log (remplacés par logger)"
echo "────────────────────────────────────────────────────────────────"
CONSOLE_COUNT=$(docker-compose logs backend --tail=200 | grep -i "console\." | wc -l || echo "0")

if [ "$CONSOLE_COUNT" -eq 0 ]; then
    echo "✅ Pas de console.log en production"
else
    echo "⚠️  $CONSOLE_COUNT console.log trouvés dans les logs"
    docker-compose logs backend --tail=200 | grep -i "console\." | head -5
fi
echo ""

echo "💾 2. Vérifier logs backup"
echo "────────────────────────────────────────────────────────────────"
docker-compose logs backend | grep -i "backup" | tail -20 || echo "Aucun log backup"
echo ""

echo "❌ 3. Vérifier absence d'erreurs TypeScript"
echo "────────────────────────────────────────────────────────────────"
TS_ERRORS=$(docker-compose logs backend | grep -i "error TS" | wc -l || echo "0")

if [ "$TS_ERRORS" -eq 0 ]; then
    echo "✅ Pas d'erreurs TypeScript"
else
    echo "⚠️  $TS_ERRORS erreurs TypeScript trouvées:"
    docker-compose logs backend | grep -i "error TS" | tail -10
fi
echo ""

echo "🔐 4. Vérifier erreurs critiques récentes"
echo "────────────────────────────────────────────────────────────────"
CRITICAL_ERRORS=$(docker-compose logs backend --tail=100 | grep -i "error\|critical\|fatal" | grep -v "No errors" | wc -l || echo "0")

if [ "$CRITICAL_ERRORS" -eq 0 ]; then
    echo "✅ Pas d'erreurs critiques"
else
    echo "⚠️  $CRITICAL_ERRORS erreurs critiques:"
    docker-compose logs backend --tail=100 | grep -i "error\|critical\|fatal" | grep -v "No errors" | tail -10
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE 6 TERMINÉE - Logs vérifiés"
echo "════════════════════════════════════════════════════════════════"
echo ""
read -p "Continuer vers Phase 7 ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    bash plan-guerre-phase7-persistence.sh
fi

