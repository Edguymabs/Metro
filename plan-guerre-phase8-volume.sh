#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   PHASE 8 : AJOUTER VOLUME DOCKER (OPTIONNEL)"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

echo "⚠️  ATTENTION: Cette phase modifie docker-compose.yml"
echo "Voulez-vous vraiment ajouter le volume pour persistence backups ?"
echo ""
read -p "Continuer ? (o/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "Phase 8 ignorée"
    exit 0
fi

echo ""
echo "📝 Vérification de docker-compose.yml"
echo "────────────────────────────────────────────────────────────────"

if grep -q "backend_backups:/app/backups" docker-compose.yml; then
    echo "✅ Volume backend_backups déjà configuré"
    exit 0
fi

echo "Ajout du volume backend_backups..."
echo ""

# Backup du fichier original
cp docker-compose.yml docker-compose.yml.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup créé: docker-compose.yml.backup-*"

# Ajouter le volume dans la section backend
sed -i.tmp '/backend_uploads:\/app\/uploads/a\
      - backend_backups:/app/backups' docker-compose.yml

# Ajouter le volume dans la section volumes
sed -i.tmp '/^volumes:/a\
  backend_backups:' docker-compose.yml

rm docker-compose.yml.tmp

echo "✅ Volume backend_backups ajouté à docker-compose.yml"
echo ""

echo "🔄 Appliquer les changements"
echo "────────────────────────────────────────────────────────────────"
docker-compose down
docker-compose up -d

echo ""
echo "⏳ Attendre 15 secondes"
for i in {15..1}; do
    echo -ne "Attente... $i secondes\r"
    sleep 1
done
echo -ne '\n'
echo ""

echo "📊 Vérifier l'état"
docker-compose ps
echo ""

echo "✅ Vérifier que le volume est monté"
docker volume ls | grep backend_backups && echo "✅ Volume backend_backups créé"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE 8 TERMINÉE - Volume Docker configuré"
echo "════════════════════════════════════════════════════════════════"
echo ""
read -p "Continuer vers Phase 9 (Tests régression) ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    bash plan-guerre-phase9-regression.sh
fi

