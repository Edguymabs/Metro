#!/bin/bash
# Version rapide NON-INTERACTIVE du plan de guerre
# Exécute toutes les phases critiques sans pause
set -e

echo "🚀 PLAN DE GUERRE RAPIDE (NON-INTERACTIF)"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

# Phase 1: Diagnostic
echo "📋 Phase 1: Diagnostic..."
git log --oneline -1
docker-compose ps
curl -s http://localhost:5001/api/health | jq . || true

# Phase 2: Git Update
echo ""
echo "⬇️  Phase 2: Mise à jour code..."
git stash push -m "Save-$(date +%Y%m%d-%H%M%S)" || true
rm -f fix-*.sh
git pull origin main
git log -1 --oneline

# Phase 3: Rebuild
echo ""
echo "🔨 Phase 3: Rebuild backend..."
mkdir -p backend/backups
chmod 755 backend/backups
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
sleep 20

# Phase 4: Configuration
echo ""
echo "⚙️  Phase 4: Configuration..."
docker-compose exec -T backend sh -c "mkdir -p /app/backups && chmod 755 /app/backups"
docker-compose exec -T backend which pg_dump || echo "⚠️  pg_dump manquant"
docker-compose exec -T backend sh -c 'psql $DATABASE_URL -c "SELECT 1;"' || echo "⚠️  DB non accessible"

# Phase 5: Test rapide
echo ""
echo "🧪 Phase 5: Tests..."
curl -s http://localhost:5001/api/health | jq .

# Test backup manuel
docker-compose exec -T backend sh -c '
  DBURL_CLEAN=$(echo $DATABASE_URL | cut -d"?" -f1)
  pg_dump $DBURL_CLEAN > /app/backups/test_auto.sql 2>&1
  ls -lh /app/backups/test_auto.sql
' && echo "✅ Backup test OK" || echo "❌ Backup test échec"

# Phase 6: Logs
echo ""
echo "📋 Phase 6: Vérification logs..."
docker-compose logs backend --tail=50 | grep -i "error" | tail -10 || echo "Pas d'erreurs"

# Phase 7: Persistence
echo ""
echo "🔄 Phase 7: Test persistence..."
BACKUPS_BEFORE=$(docker-compose exec -T backend ls /app/backups | wc -l)
docker-compose restart backend
sleep 15
BACKUPS_AFTER=$(docker-compose exec -T backend ls /app/backups | wc -l)

if [ "$BACKUPS_BEFORE" -eq "$BACKUPS_AFTER" ]; then
    echo "✅ Persistence OK"
else
    echo "⚠️  Backups perdus - Ajoutez volume Docker"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ PLAN DE GUERRE RAPIDE TERMINÉ"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "État final:"
docker-compose ps
echo ""
echo "🧪 TESTS MANUELS REQUIS:"
echo "  1. https://beta-test-metro.mabstudio.fr"
echo "  2. Créer instrument sans type/site"
echo "  3. Créer backup depuis le frontend"
echo ""

