#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   PHASE 4 : CONFIGURATION POST-DÉMARRAGE"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

echo "📁 1. Créer/vérifier dossier backups DANS le conteneur"
echo "────────────────────────────────────────────────────────────────"
docker-compose exec -T backend sh -c "mkdir -p /app/backups && chmod 755 /app/backups && ls -la /app/backups"
echo ""

echo "🔧 2. Vérifier postgresql-client"
echo "────────────────────────────────────────────────────────────────"
docker-compose exec -T backend sh -c "which pg_dump && pg_dump --version"
PG_DUMP_OK=$?
echo ""

echo "🔌 3. Tester connexion DB depuis le conteneur"
echo "────────────────────────────────────────────────────────────────"
docker-compose exec -T backend sh -c 'psql $DATABASE_URL -c "SELECT 1 as test;"'
DB_OK=$?
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "📊 RÉSUMÉ CONFIGURATION"
echo "════════════════════════════════════════════════════════════════"

if [ $PG_DUMP_OK -eq 0 ]; then
    echo "✅ postgresql-client installé et fonctionnel"
else
    echo "❌ pg_dump non disponible - Installation requise:"
    echo "   docker-compose exec backend apk add --no-cache postgresql-client"
fi

if [ $DB_OK -eq 0 ]; then
    echo "✅ Connexion base de données OK"
else
    echo "❌ Connexion base de données échouée"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE 4 TERMINÉE - Configuration validée"
echo "════════════════════════════════════════════════════════════════"
echo ""
read -p "Continuer vers Phase 5 (Tests) ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    bash plan-guerre-phase5-tests.sh
fi

