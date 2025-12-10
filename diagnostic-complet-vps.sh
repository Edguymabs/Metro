#!/bin/bash
# Script de diagnostic complet pour le VPS
# À exécuter sur le VPS : bash diagnostic-complet-vps.sh

set -e

cd ~/apps/Metro || { echo "❌ Erreur: Répertoire ~/apps/Metro introuvable"; exit 1; }

echo "🔍 Diagnostic complet - Metro VPS"
echo "=================================="
echo ""

echo "1️⃣  Vérification des conteneurs..."
docker-compose ps
echo ""

echo "2️⃣  Vérification du contenu du frontend buildé..."
echo "   Fichier index.html:"
docker-compose exec frontend head -30 /usr/share/nginx/html/index.html
echo ""
echo "   Fichiers JavaScript (premiers 5):"
docker-compose exec frontend find /usr/share/nginx/html/assets -name "*.js" -type f | head -5
echo ""

echo "3️⃣  Recherche de l'URL API dans les fichiers JS..."
echo "   Recherche de 'localhost:5001' dans les JS:"
docker-compose exec frontend grep -r "localhost:5001" /usr/share/nginx/html/assets/ 2>/dev/null | head -5 || echo "   ✅ Aucune référence à localhost:5001 trouvée"
echo ""
echo "   Recherche de 'VITE_API_URL' dans les JS:"
docker-compose exec frontend grep -r "VITE_API_URL" /usr/share/nginx/html/assets/ 2>/dev/null | head -5 || echo "   ℹ️  VITE_API_URL devrait être remplacé par Vite"
echo ""

echo "4️⃣  Vérification des fichiers sources frontend..."
echo "   Contenu de api.ts:"
docker-compose exec frontend cat /usr/share/nginx/html/../src/services/api.ts 2>/dev/null || echo "   ⚠️  Fichiers sources non disponibles (normal en production)"
echo ""

echo "5️⃣  Test de l'API backend..."
echo "   Health check:"
curl -s http://localhost:5001/api/health | jq . 2>/dev/null || curl -s http://localhost:5001/api/health
echo ""

echo "6️⃣  Test du frontend..."
echo "   Headers:"
curl -I http://localhost:3000 2>&1 | head -10
echo ""

echo "7️⃣  Vérification de la configuration Nginx..."
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api"
echo ""

echo "8️⃣  Logs backend (dernières 10 lignes)..."
docker-compose logs backend --tail=10
echo ""

echo "9️⃣  Logs frontend (dernières 10 lignes)..."
docker-compose logs frontend --tail=10
echo ""

echo "🔟 Vérification de la connectivité backend-frontend..."
docker-compose exec frontend ping -c 2 metro-backend 2>&1 | tail -3
echo ""

echo "=================================="
echo "✅ Diagnostic terminé"
echo ""


