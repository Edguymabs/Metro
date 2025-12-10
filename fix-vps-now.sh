#!/bin/bash
# Script de correction IMMÉDIATE pour le VPS
# Copiez-collez ce script sur le VPS et exécutez-le

set -e

cd ~/apps/Metro

echo "🔧 Correction IMMÉDIATE en cours..."
echo ""

# 1. Corriger les fichiers sources
echo "1. Correction des fichiers sources..."
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/api.ts 2>/dev/null || echo "  ⚠️ api.ts non trouvé"
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/interventionConfigService.ts 2>/dev/null || echo "  ⚠️ interventionConfigService.ts non trouvé"

# 2. Arrêter et nettoyer
echo "2. Arrêt et nettoyage..."
docker-compose down frontend backend 2>/dev/null || true
docker rmi metro-frontend metro-backend 2>/dev/null || true

# 3. Rebuild
echo "3. Reconstruction (cela peut prendre 2-3 minutes)..."
docker-compose build --no-cache frontend backend

# 4. Démarrer
echo "4. Démarrage..."
docker-compose up -d frontend backend

# 5. Attendre
echo "5. Attente du démarrage (15 secondes)..."
sleep 15

# 6. Vérification
echo ""
echo "6. Vérification..."
docker-compose ps
echo ""
echo "Test API:"
curl -s http://localhost:5001/api/health | head -1
echo ""
echo "Test Frontend:"
curl -I http://localhost:3000 2>&1 | head -3
echo ""

# 7. Vérifier les JS
echo "7. Vérification des fichiers JS..."
if docker-compose exec -T frontend grep -r "localhost:5001" /usr/share/nginx/html/assets/ 2>/dev/null | head -1 > /dev/null; then
    echo "  ⚠️ ATTENTION: Des références à localhost:5001 sont encore présentes!"
    echo "  Le rebuild n'a peut-être pas fonctionné correctement."
else
    echo "  ✅ Aucune référence à localhost:5001 trouvée"
fi

echo ""
echo "✅ Terminé !"
echo "Ouvrez http://beta-test-metro.mabstudio.fr et vérifiez la console (F12)"


