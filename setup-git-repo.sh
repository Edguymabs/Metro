#!/bin/bash
# Script pour préparer le projet pour Git

echo "🔧 Préparation du projet Metro pour Git"
echo "========================================"
echo ""

cd /Users/mabs/Documents/Metro

# Vérifier si Git est déjà initialisé
if [ -d ".git" ]; then
    echo "✅ Git est déjà initialisé"
    git status
else
    echo "📦 Initialisation de Git..."
    git init
    echo "✅ Git initialisé"
fi

# Vérifier .gitignore
if [ ! -f ".gitignore" ]; then
    echo "📝 Création de .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.production
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Prisma
# backend/prisma/migrations/ - Conserver les migrations

# Uploads
backend/uploads/
uploads/

# Docker
*.env.docker

# Expo (not used)
.expo/
app.json
EOF
    echo "✅ .gitignore créé"
fi

# Ajouter tous les fichiers
echo "📦 Ajout des fichiers..."
git add .

# Créer commit initial
if ! git log -1 &> /dev/null; then
    echo "💾 Création du commit initial..."
    git commit -m "Initial commit - Metro Beta Test"
    echo "✅ Commit créé"
else
    echo "✅ Des commits existent déjà"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Projet prêt pour Git !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Créer un repository sur GitHub/GitLab:"
echo "   - Allez sur https://github.com/new"
echo "   - Nom: Metro (ou autre)"
echo "   - Créez le repo (sans README)"
echo ""
echo "2. Connecter votre repo local:"
echo "   git remote add origin https://github.com/[VOTRE_USER]/[VOTRE_REPO].git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Sur le VPS (terminal hPanel):"
echo "   mkdir -p ~/apps && cd ~/apps"
echo "   git clone https://github.com/[VOTRE_USER]/[VOTRE_REPO].git Metro"
echo "   cd Metro"
echo "   chmod +x deploy-vps-hostinger.sh"
echo "   ./deploy-vps-hostinger.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

