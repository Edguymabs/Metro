#!/bin/bash
set -e

echo "🔐 Génération des secrets pour Metro Production"
echo "================================================"
echo ""

if [ -f .env.production ]; then
    echo "⚠️  Le fichier .env.production existe déjà."
    read -p "Écraser ? (oui/non): " confirm
    if [ "$confirm" != "oui" ]; then
        echo "❌ Annulé."
        exit 1
    fi
fi

echo "📝 Génération des secrets..."

JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")

echo "✅ Secrets générés avec succès!"
echo ""
echo "📋 Copier les valeurs suivantes dans votre gestionnaire de mots de passe:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""

read -p "Entrez votre domaine (ex: metro.exemple.fr): " DOMAIN

cat > .env.production << EOF
# Générés automatiquement le $(date)
POSTGRES_USER=metro
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=metro_db

DATABASE_URL="postgresql://metro:$POSTGRES_PASSWORD@postgres:5432/metro_db?schema=public"
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
FRONTEND_URL=https://$DOMAIN
PORT=5000
NODE_ENV=production
UPLOAD_DIR=/app/uploads
BACKUP_DIR=/app/backups

VITE_API_URL=https://$DOMAIN/api
LOG_LEVEL=info
EOF

chmod 600 .env.production

echo ""
echo "✅ Fichier .env.production créé avec permissions 600"
echo "🔐 Secrets configurés pour le domaine: $DOMAIN"
echo ""
echo "⚠️  IMPORTANT: Sauvegardez ces secrets dans un gestionnaire de mots de passe!"
echo ""

