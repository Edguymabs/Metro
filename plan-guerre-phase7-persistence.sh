#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   PHASE 7 : PERSISTENCE & ROBUSTESSE"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

echo "📋 1. Lister backups avant restart"
echo "────────────────────────────────────────────────────────────────"
BACKUPS_BEFORE=$(docker-compose exec -T backend ls /app/backups | wc -l)
echo "Nombre de fichiers: $BACKUPS_BEFORE"
docker-compose exec -T backend ls -lh /app/backups
echo ""

echo "🔄 2. Restart backend"
echo "────────────────────────────────────────────────────────────────"
docker-compose restart backend
echo ""

echo "⏳ 3. Attendre 15 secondes"
echo "────────────────────────────────────────────────────────────────"
for i in {15..1}; do
    echo -ne "Attente... $i secondes\r"
    sleep 1
done
echo -ne '\n'
echo ""

echo "📋 4. Vérifier que backups sont toujours là"
echo "────────────────────────────────────────────────────────────────"
BACKUPS_AFTER=$(docker-compose exec -T backend ls /app/backups | wc -l)
echo "Nombre de fichiers: $BACKUPS_AFTER"
docker-compose exec -T backend ls -lh /app/backups
echo ""

if [ "$BACKUPS_BEFORE" -eq "$BACKUPS_AFTER" ]; then
    echo "✅ Backups persistés après restart"
    echo "Même nombre de fichiers: $BACKUPS_AFTER"
else
    echo "⚠️  Backups perdus après restart"
    echo "Avant: $BACKUPS_BEFORE | Après: $BACKUPS_AFTER"
    echo ""
    echo "RECOMMANDATION: Ajouter volume Docker (Phase 8)"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE 7 TERMINÉE - Persistence testée"
echo "════════════════════════════════════════════════════════════════"
echo ""
read -p "Continuer vers Phase 8 (Volume Docker) ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    bash plan-guerre-phase8-volume.sh
fi

