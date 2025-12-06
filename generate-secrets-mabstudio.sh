#!/bin/bash
set -e

echo "🔐 Génération des secrets pour Metro - mabstudio.fr"
echo "=================================================="
echo ""
echo "📍 Domaine: beta-test-metro.mabstudio.fr"
echo ""

if [ -f .env.production ]; then
    echo "⚠️  Le fichier .env.production existe déjà."
    read -p "Écraser ? (oui/non): " confirm
    if [ "$confirm" != "oui" ]; then
        echo "❌ Annulé."
        exit 1
    fi
fi

echo "📝 Génération des secrets forts..."
echo ""

JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")

echo "✅ Secrets générés avec succès!"
echo ""
echo "📋 IMPORTANT: Copiez ces valeurs dans votre gestionnaire de mots de passe:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "JWT_SECRET=$JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > .env.production << EOF
# Générés automatiquement le $(date)
# Domaine: beta-test-metro.mabstudio.fr

POSTGRES_USER=metro
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=metro_db

DATABASE_URL="postgresql://metro:$POSTGRES_PASSWORD@postgres:5432/metro_db?schema=public"
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
FRONTEND_URL=https://beta-test-metro.mabstudio.fr
PORT=5000
NODE_ENV=production
UPLOAD_DIR=/app/uploads
BACKUP_DIR=/app/backups

VITE_API_URL=https://beta-test-metro.mabstudio.fr/api
LOG_LEVEL=info
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=20
EOF

chmod 600 .env.production

echo "✅ Fichier .env.production créé avec permissions 600"
echo "🌐 Domaine configuré: beta-test-metro.mabstudio.fr"
echo ""
echo "⚠️  IMPORTANT: Sauvegardez ces secrets dans un gestionnaire de mots de passe!"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Sauvegarder les secrets ci-dessus"
echo "  2. Configurer DNS: beta-test-metro.mabstudio.fr → IP de votre VPS"
echo "  3. Suivre le guide: DEPLOIEMENT_MABSTUDIO.md"
echo ""

