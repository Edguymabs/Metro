#!/bin/bash
# Script de correction COMPLÈTE pour le VPS
# À exécuter sur le VPS : bash fix-complet-vps.sh

set -e

cd ~/apps/Metro || { echo "❌ Erreur: Répertoire ~/apps/Metro introuvable"; exit 1; }

echo "🔧 Correction COMPLÈTE - Metro VPS"
echo "==================================="
echo ""

# 1. Arrêter les conteneurs
echo "1️⃣  Arrêt des conteneurs..."
docker-compose down frontend backend 2>/dev/null || true
echo ""

# 2. Vérifier et corriger les fichiers sources
echo "2️⃣  Correction des fichiers sources..."
echo ""

# Corriger api.ts
if [ -f "frontend/src/services/api.ts" ]; then
    echo "   Correction de api.ts..."
    sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/api.ts
    echo "   ✅ api.ts corrigé"
    
    # Vérifier la correction
    if grep -q "import.meta.env.VITE_API_URL" frontend/src/services/api.ts; then
        echo "   ✅ Vérification: api.ts utilise bien import.meta.env.VITE_API_URL"
    else
        echo "   ⚠️  Attention: La correction n'a peut-être pas fonctionné"
        echo "   Contenu actuel:"
        grep "API_URL" frontend/src/services/api.ts | head -1
    fi
else
    echo "   ⚠️  frontend/src/services/api.ts introuvable"
fi

# Corriger interventionConfigService.ts
if [ -f "frontend/src/services/interventionConfigService.ts" ]; then
    echo "   Correction de interventionConfigService.ts..."
    sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/interventionConfigService.ts
    echo "   ✅ interventionConfigService.ts corrigé"
else
    echo "   ⚠️  frontend/src/services/interventionConfigService.ts introuvable"
fi

echo ""

# 3. Vérifier docker-compose.yml
echo "3️⃣  Vérification de docker-compose.yml..."
if grep -q "VITE_API_URL=/api" docker-compose.yml; then
    echo "   ✅ VITE_API_URL est configuré dans docker-compose.yml"
else
    echo "   ⚠️  VITE_API_URL manquant, ajout en cours..."
    # Ajouter VITE_API_URL dans les build args
    sed -i '/frontend:/,/networks:/ {
        /build:/,/dockerfile:/ {
            /dockerfile:/a\
      args:\
        - VITE_API_URL=/api
        }
    }' docker-compose.yml
    echo "   ✅ VITE_API_URL ajouté"
fi

# 4. Vérifier frontend/Dockerfile
echo "4️⃣  Vérification de frontend/Dockerfile..."
if [ -f "frontend/Dockerfile" ]; then
    if grep -q "ARG VITE_API_URL" frontend/Dockerfile; then
        echo "   ✅ ARG VITE_API_URL présent dans Dockerfile"
    else
        echo "   ⚠️  ARG VITE_API_URL manquant, ajout en cours..."
        # Ajouter ARG VITE_API_URL avant RUN npm run build
        sed -i '/COPY \. \./a\
# Build avec variable d'\''environnement\
ARG VITE_API_URL=/api\
ENV VITE_API_URL=$VITE_API_URL' frontend/Dockerfile
        echo "   ✅ ARG VITE_API_URL ajouté"
    fi
else
    echo "   ⚠️  frontend/Dockerfile introuvable"
fi

echo ""

# 5. Vérifier backend/Dockerfile.simple pour curl
echo "5️⃣  Vérification de backend/Dockerfile.simple..."
if [ -f "backend/Dockerfile.simple" ]; then
    if grep -q "curl" backend/Dockerfile.simple; then
        echo "   ✅ curl est installé dans backend/Dockerfile.simple"
    else
        echo "   ⚠️  curl manquant, ajout en cours..."
        sed -i 's|RUN apk add --no-cache openssl openssl-dev ca-certificates postgresql-client|RUN apk add --no-cache openssl openssl-dev ca-certificates postgresql-client curl|g' backend/Dockerfile.simple
        echo "   ✅ curl ajouté"
    fi
else
    echo "   ⚠️  backend/Dockerfile.simple introuvable"
fi

echo ""

# 6. Nettoyer les anciens builds
echo "6️⃣  Nettoyage des anciens builds..."
docker-compose rm -f frontend backend 2>/dev/null || true
docker rmi metro-frontend metro-backend 2>/dev/null || true
echo "   ✅ Nettoyage terminé"
echo ""

# 7. Rebuild COMPLET sans cache
echo "7️⃣  Reconstruction COMPLÈTE (sans cache)..."
echo "   Backend..."
docker-compose build --no-cache backend
echo "   Frontend..."
docker-compose build --no-cache frontend
echo "   ✅ Reconstruction terminée"
echo ""

# 8. Démarrer les services
echo "8️⃣  Démarrage des services..."
docker-compose up -d frontend backend
echo "   ✅ Services démarrés"
echo ""

# 9. Attendre que les services soient prêts
echo "9️⃣  Attente du démarrage (15 secondes)..."
sleep 15
echo ""

# 10. Vérification
echo "🔟 Vérification finale..."
echo ""

echo "   Statut des conteneurs:"
docker-compose ps
echo ""

echo "   Test API backend:"
if curl -f -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend API accessible"
    curl -s http://localhost:5001/api/health | head -1
else
    echo "   ❌ Backend API non accessible"
fi
echo ""

echo "   Test Frontend:"
if curl -f -I http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend accessible"
    curl -I http://localhost:3000 2>&1 | head -5
else
    echo "   ❌ Frontend non accessible"
fi
echo ""

echo "   Vérification de l'URL API dans le build:"
echo "   (Recherche de 'localhost:5001' dans les fichiers JS)"
if docker-compose exec -T frontend grep -r "localhost:5001" /usr/share/nginx/html/assets/ 2>/dev/null | head -1; then
    echo "   ⚠️  ATTENTION: Des références à localhost:5001 sont encore présentes!"
    echo "   Le frontend doit être rebuilder."
else
    echo "   ✅ Aucune référence à localhost:5001 trouvée (bon signe)"
fi
echo ""

echo "   Vérification de '/api' dans le build:"
if docker-compose exec -T frontend grep -r '"/api"' /usr/share/nginx/html/assets/ 2>/dev/null | head -1; then
    echo "   ✅ Références à '/api' trouvées (correct)"
else
    echo "   ⚠️  Aucune référence à '/api' trouvée"
fi
echo ""

echo "==================================="
echo "✅ Correction terminée !"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Ouvrez http://beta-test-metro.mabstudio.fr dans votre navigateur"
echo "   2. Ouvrez la console (F12) et vérifiez:"
echo "      - Aucune erreur JavaScript"
echo "      - Les requêtes API utilisent '/api' et non 'http://localhost:5001/api'"
echo "   3. Si problème persiste, vérifiez les logs:"
echo "      docker-compose logs -f frontend backend"
echo ""

