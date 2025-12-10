#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "   FIX BUILD DOCKER - NETTOYAGE CACHE"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd ~/apps/Metro

echo "🧹 1. Arrêt des conteneurs"
docker-compose down

echo ""
echo "🗑️  2. Nettoyage du cache Docker"
docker builder prune -af
docker system prune -af

echo ""
echo "⬇️  3. Pull de l'image de base explicitement"
docker pull node:20-alpine

echo ""
echo "🔨 4. Rebuild backend sans cache"
docker-compose build --no-cache --pull backend

echo ""
echo "🚀 5. Démarrage"
docker-compose up -d

echo ""
echo "⏳ 6. Attente stabilisation (20s)"
sleep 20

echo ""
echo "📊 7. Vérification état"
docker-compose ps

echo ""
echo "🏥 8. Test API"
curl -s http://localhost:5001/api/health | jq . || curl -s http://localhost:5001/api/health

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ BUILD DOCKER CORRIGÉ"
echo "════════════════════════════════════════════════════════════════"

