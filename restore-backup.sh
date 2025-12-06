#!/bin/bash

# Script de restauration de backup pour Metro
# Ce script permet de restaurer une sauvegarde de la base de données

set -e

echo "🔄 Metro - Restauration de Backup"
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
    exit 1
fi

# Vérifier si le conteneur backend est en cours d'exécution
if ! docker-compose ps backend | grep -q "Up"; then
    echo -e "${RED}❌ Erreur: Le conteneur backend n'est pas démarré${NC}"
    echo "Démarrez d'abord les services avec: docker-compose up -d"
    exit 1
fi

# Lister les backups disponibles
echo -e "${YELLOW}📋 Liste des backups disponibles:${NC}"
BACKUPS=$(docker-compose exec -T backend ls -1 /app/backups/metro_backup_*.sql 2>/dev/null | xargs -n1 basename 2>/dev/null || echo "")

if [ -z "$BACKUPS" ]; then
    echo -e "${RED}❌ Aucun backup trouvé dans /app/backups/${NC}"
    echo ""
    echo "Pour créer un backup:"
    echo "  1. Via l'API: POST http://localhost:5001/api/security/backup"
    echo "  2. Via le script: ./create-backup.sh"
    echo ""
    exit 1
fi

echo "$BACKUPS" | nl -w2 -s'. '
echo ""

# Demander le backup à restaurer
if [ -z "$1" ]; then
    read -p "Entrez le numéro du backup à restaurer: " BACKUP_NUM
    BACKUP_FILE=$(echo "$BACKUPS" | sed -n "${BACKUP_NUM}p")
else
    BACKUP_FILE="$1"
fi

if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup invalide${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  ATTENTION: Cette opération va remplacer toutes les données actuelles!${NC}"
read -p "Êtes-vous sûr de vouloir continuer? (tapez 'OUI' pour confirmer): " CONFIRM

if [ "$CONFIRM" != "OUI" ]; then
    echo "Annulé."
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Restauration du backup: $BACKUP_FILE${NC}"

# Vérifier l'intégrité du backup
echo -e "${YELLOW}🔍 Vérification de l'intégrité du backup...${NC}"
VERIFY_RESULT=$(docker-compose exec -T backend node -e "
const backupManager = require('./dist/utils/backup').backupManager;
backupManager.verifyBackup('$BACKUP_FILE').then(result => {
  console.log(JSON.stringify(result));
}).catch(err => {
  console.log(JSON.stringify({valid: false, error: err.message}));
});
" 2>/dev/null || echo '{"valid":false,"error":"Erreur de vérification"}')

if echo "$VERIFY_RESULT" | grep -q '"valid":false'; then
    echo -e "${RED}❌ Le backup semble invalide${NC}"
    echo "$VERIFY_RESULT"
    read -p "Voulez-vous quand même continuer? (o/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        exit 0
    fi
fi

# Créer un backup de sécurité avant restauration
echo -e "${YELLOW}💾 Création d'un backup de sécurité avant restauration...${NC}"
SAFETY_BACKUP=$(docker-compose exec -T backend node -e "
const backupManager = require('./dist/utils/backup').backupManager;
backupManager.createFullBackup().then(result => {
  console.log(result.filename || '');
}).catch(err => {
  console.log('');
});
" 2>/dev/null || echo "")

if [ ! -z "$SAFETY_BACKUP" ]; then
    echo -e "${GREEN}✅ Backup de sécurité créé: $SAFETY_BACKUP${NC}"
else
    echo -e "${YELLOW}⚠️  Impossible de créer un backup de sécurité${NC}"
fi

# Restaurer le backup
echo ""
echo -e "${YELLOW}🔄 Restauration en cours...${NC}"
RESTORE_RESULT=$(docker-compose exec -T backend node -e "
const backupManager = require('./dist/utils/backup').backupManager;
backupManager.restoreBackup('$BACKUP_FILE').then(result => {
  console.log(JSON.stringify(result));
}).catch(err => {
  console.log(JSON.stringify({success: false, error: err.message}));
});
" 2>/dev/null || echo '{"success":false,"error":"Erreur de restauration"}')

if echo "$RESTORE_RESULT" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Backup restauré avec succès!${NC}"
    echo ""
    echo "Vérification des données restaurées..."
    docker-compose exec -T postgres psql -U metro -d metro_db -c "SELECT COUNT(*) as instruments FROM instruments; SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as sites FROM sites;" | cat
else
    echo -e "${RED}❌ Erreur lors de la restauration${NC}"
    echo "$RESTORE_RESULT"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Restauration terminée!${NC}"
echo ""
echo "🌐 Vérifiez l'application sur: http://localhost:3000"

