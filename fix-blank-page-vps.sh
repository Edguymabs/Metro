#!/bin/bash
# Script de correction pour la page blanche sur le VPS
# À exécuter sur le VPS : bash fix-blank-page-vps.sh

set -e

echo "🔧 Correction de la page blanche - Metro VPS"
echo "=============================================="

cd ~/apps/Metro || { echo "❌ Erreur: Répertoire ~/apps/Metro introuvable"; exit 1; }

echo ""
echo "1️⃣  Vérification de la configuration actuelle..."
echo ""

# Vérifier docker-compose.yml
if ! grep -q "VITE_API_URL=/api" docker-compose.yml; then
    echo "⚠️  VITE_API_URL n'est pas configuré dans docker-compose.yml"
    echo "   Correction en cours..."
    sed -i '/frontend:/,/networks:/ {
        /build:/,/dockerfile:/ {
            /dockerfile:/a\
      args:\
        - VITE_API_URL=/api
        }
    }' docker-compose.yml
    echo "✅ docker-compose.yml corrigé"
else
    echo "✅ VITE_API_URL est déjà configuré"
fi

# Vérifier les fichiers frontend
echo ""
echo "2️⃣  Correction des fichiers frontend..."
echo ""

# Corriger api.ts
if [ -f "frontend/src/services/api.ts" ]; then
    sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/api.ts
    echo "✅ frontend/src/services/api.ts corrigé"
fi

# Corriger interventionConfigService.ts
if [ -f "frontend/src/services/interventionConfigService.ts" ]; then
    sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/interventionConfigService.ts
    echo "✅ frontend/src/services/interventionConfigService.ts corrigé"
fi

# Vérifier Dockerfile frontend
if [ -f "frontend/Dockerfile" ]; then
    if ! grep -q "ARG VITE_API_URL=/api" frontend/Dockerfile; then
        echo "⚠️  ARG VITE_API_URL manquant dans frontend/Dockerfile"
        sed -i '/COPY \. \./a\
# Build de l'\''application avec variable d'\''environnement\
ARG VITE_API_URL=/api\
ENV VITE_API_URL=$VITE_API_URL' frontend/Dockerfile
        echo "✅ frontend/Dockerfile corrigé"
    else
        echo "✅ frontend/Dockerfile correct"
    fi
fi

# Vérifier backend Dockerfile pour curl
if [ -f "backend/Dockerfile.simple" ]; then
    if ! grep -q "curl" backend/Dockerfile.simple; then
        echo "⚠️  curl manquant dans backend/Dockerfile.simple"
        sed -i 's|RUN apk add --no-cache openssl openssl-dev ca-certificates postgresql-client|RUN apk add --no-cache openssl openssl-dev ca-certificates postgresql-client curl|g' backend/Dockerfile.simple
        echo "✅ backend/Dockerfile.simple corrigé"
    else
        echo "✅ backend/Dockerfile.simple correct"
    fi
fi

echo ""
echo "3️⃣  Reconstruction des conteneurs..."
echo ""

# Arrêter les conteneurs
echo "   Arrêt des conteneurs..."
docker-compose down frontend backend 2>/dev/null || true

# Rebuild sans cache
echo "   Reconstruction du frontend (sans cache)..."
docker-compose build --no-cache frontend

echo "   Reconstruction du backend (sans cache)..."
docker-compose build --no-cache backend

# Redémarrer
echo "   Redémarrage des services..."
docker-compose up -d frontend backend

echo ""
echo "4️⃣  Vérification de l'état..."
echo ""

sleep 5

# Vérifier les conteneurs
echo "   Statut des conteneurs:"
docker-compose ps

echo ""
echo "   Logs backend (dernières 10 lignes):"
docker-compose logs backend --tail=10

echo ""
echo "   Logs frontend (dernières 10 lignes):"
docker-compose logs frontend --tail=10

echo ""
echo "5️⃣  Test de l'API..."
echo ""

# Tester l'API
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "✅ Backend API accessible"
    curl -s http://localhost:5001/api/health | head -1
else
    echo "❌ Backend API non accessible"
fi

echo ""
echo "6️⃣  Vérification du frontend..."
echo ""

# Tester le frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend accessible"
    echo "   Vérifiez http://beta-test-metro.mabstudio.fr dans votre navigateur"
else
    echo "❌ Frontend non accessible"
fi

echo ""
echo "=============================================="
echo "✅ Correction terminée !"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Ouvrez http://beta-test-metro.mabstudio.fr dans votre navigateur"
echo "   2. Ouvrez la console du navigateur (F12) pour voir les erreurs éventuelles"
echo "   3. Vérifiez les logs: docker-compose logs -f frontend backend"
echo ""


