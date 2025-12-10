#!/bin/bash
set -e

echo "🔧 Résolution des conflits Git et mise à jour..."

cd ~/apps/Metro

# 1. Sauvegarder les modifications locales
echo "📦 Sauvegarde des modifications locales..."
git stash push -m "Auto-stash avant pull $(date +%Y%m%d-%H%M%S)"

# 2. Supprimer les fichiers non trackés qui posent problème
echo "🗑️  Nettoyage des fichiers temporaires..."
rm -f fix-blank-page-simple.sh
rm -f fix-blank-page-vps.sh
rm -f fix-vps-now.sh
rm -f fix-typescript-errors.sh

# 3. Pull les dernières modifications
echo "⬇️  Récupération du code depuis GitHub..."
git pull origin main

# 4. Rebuild backend avec les nouvelles corrections
echo "🔨 Rebuild du backend..."
docker-compose build --no-cache backend

# 5. Redémarrer le backend
echo "🔄 Redémarrage du backend..."
docker-compose up -d backend

# 6. Attendre le démarrage
echo "⏳ Attente du démarrage (15s)..."
sleep 15

# 7. Vérifier l'état
echo ""
echo "📊 État des services:"
docker-compose ps

echo ""
echo "📋 Logs backend (dernières lignes):"
docker-compose logs backend --tail=10

echo ""
echo "✅ MISE À JOUR TERMINÉE!"
echo ""
echo "🧪 Testez maintenant:"
echo "   https://beta-test-metro.mabstudio.fr"
echo ""
echo "📝 Créez un instrument avec SEULEMENT:"
echo "   - Numéro de série: TEST-FINAL"
echo "   - Nom: Test Final"
echo "   (laissez Type et Site vides)"

