#!/bin/bash

# Script d'installation des dépendances pour Metro
# Résout toutes les erreurs de linter liées aux modules manquants

set -e

echo "🚀 Installation des dépendances pour Metro"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier que Node.js est installé
print_step "Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé !"
    echo ""
    echo "Installation avec Homebrew :"
    echo "  brew install node"
    echo ""
    echo "Ou avec nvm (recommandé) :"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  nvm install --lts"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
print_step "Node.js $NODE_VERSION détecté"
print_step "npm $NPM_VERSION détecté"
echo ""

# Installation Backend
print_step "Installation des dépendances du backend..."
cd backend

if [ -d "node_modules" ]; then
    print_warning "node_modules existe déjà, nettoyage..."
    rm -rf node_modules
fi

npm install
print_step "✅ Backend : Dépendances installées"
echo ""

# Génération des types Prisma
print_step "Génération des types Prisma..."
npx prisma generate
print_step "✅ Types Prisma générés"
echo ""

# Installation Frontend
print_step "Installation des dépendances du frontend..."
cd ../frontend

if [ -d "node_modules" ]; then
    print_warning "node_modules existe déjà, nettoyage..."
    rm -rf node_modules
fi

npm install
print_step "✅ Frontend : Dépendances installées"
echo ""

# Retour à la racine
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Installation terminée avec succès !${NC}"
echo "=========================================="
echo ""
echo "Prochaines étapes :"
echo "  1. Démarrer PostgreSQL : docker-compose up -d postgres"
echo "  2. Appliquer les migrations : cd backend && npx prisma migrate dev"
echo "  3. Démarrer le backend : cd backend && npm run dev"
echo "  4. Démarrer le frontend : cd frontend && npm run dev"
echo ""
echo "Ou utiliser le script de démarrage : ./start.sh"
echo ""


