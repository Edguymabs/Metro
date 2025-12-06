#!/bin/bash

# Script de validation Metro
# Vérifie que tous les fichiers nécessaires sont présents et que le projet est prêt

echo "🔍 Validation du projet Metro..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Fonction de vérification
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 - MANQUANT"
        ((errors++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ - MANQUANT"
        ((errors++))
    fi
}

# Vérification des fichiers racine
echo "📁 Fichiers racine:"
check_file "docker-compose.yml"
check_file "package.json"
check_file "README.md"
check_file "METRO_REPORTS.md"
check_file "IMPLEMENTATION_COMPLETE.md"
echo ""

# Vérification Backend
echo "🔧 Backend:"
check_dir "backend/src"
check_dir "backend/src/controllers"
check_dir "backend/src/routes"
check_dir "backend/src/middleware"
check_dir "backend/prisma"
check_file "backend/package.json"
check_file "backend/Dockerfile"
check_file "backend/tsconfig.json"
check_file "backend/prisma/schema.prisma"
check_file "backend/prisma/seed.js"

# Contrôleurs
check_file "backend/src/controllers/authController.ts"
check_file "backend/src/controllers/instrumentController.ts"
check_file "backend/src/controllers/interventionController.ts"
check_file "backend/src/controllers/supplierController.ts"
check_file "backend/src/controllers/siteController.ts"
check_file "backend/src/controllers/documentController.ts"
check_file "backend/src/controllers/movementController.ts"
check_file "backend/src/controllers/instrumentTypeController.ts"
check_file "backend/src/controllers/userController.ts"

# Routes
check_file "backend/src/routes/authRoutes.ts"
check_file "backend/src/routes/instrumentRoutes.ts"
check_file "backend/src/routes/interventionRoutes.ts"
check_file "backend/src/routes/supplierRoutes.ts"
check_file "backend/src/routes/siteRoutes.ts"
check_file "backend/src/routes/documentRoutes.ts"
check_file "backend/src/routes/movementRoutes.ts"
check_file "backend/src/routes/instrumentTypeRoutes.ts"
check_file "backend/src/routes/userRoutes.ts"

check_file "backend/src/server.ts"
check_file "backend/src/middleware/auth.ts"
echo ""

# Vérification Frontend
echo "🎨 Frontend:"
check_dir "frontend/src"
check_dir "frontend/src/components"
check_dir "frontend/src/pages"
check_dir "frontend/src/services"
check_dir "frontend/src/contexts"
check_file "frontend/package.json"
check_file "frontend/Dockerfile"
check_file "frontend/tsconfig.json"
check_file "frontend/nginx.conf"

# Composants
check_file "frontend/src/components/Layout.tsx"
check_file "frontend/src/components/PrivateRoute.tsx"
check_file "frontend/src/components/LoadingSpinner.tsx"
check_file "frontend/src/components/StatusBadge.tsx"

# Composants communs
check_file "frontend/src/components/common/Modal.tsx"
check_file "frontend/src/components/common/Toast.tsx"
check_file "frontend/src/components/common/ConfirmDialog.tsx"
check_file "frontend/src/components/common/FormField.tsx"
check_file "frontend/src/components/common/Breadcrumbs.tsx"

# Composants upload
check_file "frontend/src/components/upload/FileUpload.tsx"
check_file "frontend/src/components/upload/DocumentList.tsx"

# Pages
check_file "frontend/src/pages/LoginPage.tsx"
check_file "frontend/src/pages/DashboardPage.tsx"
check_file "frontend/src/pages/InstrumentsPage.tsx"
check_file "frontend/src/pages/InstrumentDetailPage.tsx"
check_file "frontend/src/pages/InstrumentFormPage.tsx"
check_file "frontend/src/pages/InterventionsPage.tsx"
check_file "frontend/src/pages/InterventionDetailPage.tsx"
check_file "frontend/src/pages/InterventionFormPage.tsx"
check_file "frontend/src/pages/SuppliersPage.tsx"
check_file "frontend/src/pages/SupplierDetailPage.tsx"
check_file "frontend/src/pages/SupplierFormPage.tsx"
check_file "frontend/src/pages/SitesPage.tsx"
check_file "frontend/src/pages/SiteDetailPage.tsx"
check_file "frontend/src/pages/SiteFormPage.tsx"
check_file "frontend/src/pages/MovementsPage.tsx"
check_file "frontend/src/pages/MovementFormPage.tsx"
check_file "frontend/src/pages/UsersPage.tsx"
check_file "frontend/src/pages/UserFormPage.tsx"
check_file "frontend/src/pages/SettingsPage.tsx"
check_file "frontend/src/pages/ReportsPage.tsx"

# Contexts
check_file "frontend/src/contexts/AuthContext.tsx"
check_file "frontend/src/contexts/ToastContext.tsx"

# Services
check_file "frontend/src/services/api.ts"
check_file "frontend/src/services/authService.ts"
check_file "frontend/src/services/instrumentService.ts"
check_file "frontend/src/services/interventionService.ts"
check_file "frontend/src/services/supplierService.ts"
check_file "frontend/src/services/siteService.ts"
check_file "frontend/src/services/documentService.ts"
check_file "frontend/src/services/movementService.ts"
check_file "frontend/src/services/instrumentTypeService.ts"

check_file "frontend/src/App.tsx"
check_file "frontend/src/main.tsx"
check_file "frontend/src/index.css"
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ Validation réussie !${NC}"
    echo "Le projet Metro est complet et prêt à être déployé."
else
    echo -e "${RED}❌ Validation échouée !${NC}"
    echo "$errors erreur(s) détectée(s)"
fi

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $warnings avertissement(s)${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier Docker
echo "🐳 Vérification Docker:"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker installé"
    docker --version
else
    echo -e "${RED}✗${NC} Docker non installé"
    ((errors++))
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose installé"
    docker-compose --version
else
    echo -e "${RED}✗${NC} Docker Compose non installé"
    ((errors++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $errors -eq 0 ]; then
    echo "🚀 Pour démarrer l'application:"
    echo "   ./start.sh"
    echo ""
    echo "📖 Pour plus d'informations:"
    echo "   cat README.md"
    echo "   cat IMPLEMENTATION_COMPLETE.md"
    exit 0
else
    exit 1
fi

