#!/bin/bash

# Script de reconstruction Docker pour Metro
# Ce script reconstruit les images Docker et redémarre les services

set -e

echo "🔨 Metro - Reconstruction Docker"
echo "=================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Erreur: Docker n'est pas installé${NC}"
    echo ""
    echo "Veuillez installer Docker: https://www.docker.com/get-started"
    exit 1
fi

echo -e "${GREEN}✅ Docker détecté${NC}"
echo ""

# Vérifier si l'option --yes est passée
SKIP_CONFIRM=false
NO_CACHE=false
if [[ "$1" == "--yes" ]] || [[ "$1" == "-y" ]]; then
    SKIP_CONFIRM=true
fi
if [[ "$1" == "--no-cache" ]] || [[ "$2" == "--no-cache" ]]; then
    NO_CACHE=true
fi

# Demander confirmation sauf si --yes est passé
if [ "$SKIP_CONFIRM" = false ]; then
    read -p "Voulez-vous reconstruire les images Docker? (o/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo "Annulé."
        exit 0
    fi
fi

echo ""
echo -e "${YELLOW}💾 Création d'un backup de sécurité avant reconstruction...${NC}"
# Créer un backup avant de tout reconstruire
BACKUP_RESULT=$(docker-compose exec -T backend node -e "
const backupManager = require('./dist/utils/backup').backupManager;
backupManager.createFullBackup().then(result => {
  console.log(JSON.stringify(result));
}).catch(err => {
  console.log(JSON.stringify({success: false, error: err.message}));
});
" 2>/dev/null || echo '{"success":false}')

if echo "$BACKUP_RESULT" | grep -q '"success":true'; then
    BACKUP_FILE=$(echo "$BACKUP_RESULT" | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Backup créé: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  Impossible de créer un backup automatique${NC}"
    echo "   Vous pouvez créer un backup manuellement avec: ./create-backup.sh"
    read -p "   Continuer quand même? (o/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo "Annulé."
        exit 0
    fi
fi

echo ""
echo -e "${YELLOW}⏹️  Arrêt des conteneurs...${NC}"
docker-compose down

echo ""
if [ "$NO_CACHE" = true ]; then
    echo -e "${YELLOW}🗑️  Reconstruction sans cache...${NC}"
    docker-compose build --no-cache
else
    echo -e "${YELLOW}🔨 Reconstruction des images...${NC}"
    docker-compose build
fi

echo ""
echo -e "${YELLOW}🚀 Démarrage des services...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Attente du démarrage de PostgreSQL (15 secondes)...${NC}"
sleep 15

# Vérifier l'état des services
echo ""
echo -e "${YELLOW}🔍 Vérification de l'état des services...${NC}"
docker-compose ps

echo ""
echo -e "${YELLOW}📦 Vérification des migrations de base de données...${NC}"
if docker-compose exec -T backend npx prisma migrate status &> /dev/null; then
    echo -e "${GREEN}✅ Migrations à jour${NC}"
else
    echo -e "${YELLOW}⚠️  Application des migrations...${NC}"
    docker-compose exec -T backend npx prisma migrate deploy || true
fi

echo ""
echo -e "${GREEN}✅ Reconstruction terminée avec succès!${NC}"
echo ""
echo "🌐 Accès à l'application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001/api"
echo ""
echo "📋 Commandes utiles:"
echo "   Voir les logs:    docker-compose logs -f"
echo "   Logs frontend:    docker-compose logs -f frontend"
echo "   Logs backend:     docker-compose logs -f backend"
echo "   Arrêter:          docker-compose down"
echo "   Redémarrer:       docker-compose restart"
echo ""

