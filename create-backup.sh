#!/bin/bash

# Script de création de backup pour Metro
# Ce script crée une sauvegarde complète de la base de données

set -e

echo "💾 Metro - Création de Backup"
echo "=============================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Erreur: Docker n'est pas installé${NC}"
    exit 1
fi

# Vérifier si le conteneur backend est en cours d'exécution
if ! docker-compose ps backend | grep -q "Up"; then
    echo -e "${RED}❌ Erreur: Le conteneur backend n'est pas démarré${NC}"
    echo "Démarrez d'abord les services avec: docker-compose up -d"
    exit 1
fi

echo -e "${YELLOW}🔄 Création du backup...${NC}"

# Créer le dossier de backup s'il n'existe pas
docker-compose exec -T backend mkdir -p /app/backups 2>/dev/null || true

# Créer le backup directement depuis le conteneur PostgreSQL
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")
FILENAME="metro_backup_${TIMESTAMP}.sql"

# Utiliser pg_dump depuis le conteneur PostgreSQL et rediriger vers le backend
docker-compose exec -T postgres pg_dump -U metro -d metro_db > /tmp/${FILENAME} 2>&1

# Copier le backup dans le conteneur backend
if [ -f /tmp/${FILENAME} ] && [ -s /tmp/${FILENAME} ]; then
    docker cp /tmp/${FILENAME} metro-backend:/app/backups/${FILENAME} 2>/dev/null
    rm /tmp/${FILENAME}
    BACKUP_RESULT='{"success":true,"filename":"'${FILENAME}'"}'
else
    BACKUP_RESULT='{"success":false,"error":"Erreur lors de la création du backup"}'
fi

if echo "$BACKUP_RESULT" | grep -q '"success":true'; then
    FILENAME=$(echo "$BACKUP_RESULT" | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Backup créé avec succès!${NC}"
    echo ""
    echo "📁 Fichier: $FILENAME"
    echo "📍 Emplacement: /app/backups/$FILENAME (dans le conteneur)"
    echo ""
    echo "Pour restaurer ce backup:"
    echo "  ./restore-backup.sh $FILENAME"
else
    echo -e "${RED}❌ Erreur lors de la création du backup${NC}"
    echo "$BACKUP_RESULT"
    exit 1
fi

# Lister tous les backups
echo -e "${YELLOW}📋 Liste des backups disponibles:${NC}"
docker-compose exec -T backend ls -lh /app/backups/metro_backup_*.sql 2>/dev/null | awk '{print $9, "(" $5 ")"}' | xargs -n1 basename 2>/dev/null || echo "Aucun backup trouvé"

