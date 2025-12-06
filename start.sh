#!/bin/bash

# Script de démarrage rapide pour Metro
# Ce script vérifie les prérequis et lance l'application

set -e

echo "🚀 Metro - Démarrage de l'application"
echo "======================================"
echo ""

# Vérifier si Docker est installé
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker détecté"
    echo ""
    
    # Vérifier si un rebuild est nécessaire
    if [ "$1" = "--rebuild" ] || [ ! "$(docker images -q metro-backend 2> /dev/null)" ]; then
        echo "🔨 Reconstruction des images Docker..."
        docker-compose down
        docker-compose build --no-cache backend
        echo "✅ Images reconstruites"
        echo ""
    fi
    
    echo "🚀 Démarrage avec Docker Compose..."
    echo ""
    
    # Démarrer les services
    docker-compose up -d
    
    echo ""
    echo "⏳ Attente du démarrage de PostgreSQL (10 secondes)..."
    sleep 10
    
    # Générer Prisma dans le conteneur backend au démarrage
    echo "🔧 Génération du client Prisma..."
    docker-compose exec -T backend sh -c "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate || echo 'Prisma déjà généré'" || true
    
    # Redémarrer le backend après génération de Prisma
    echo "🔄 Redémarrage du backend..."
    docker-compose restart backend
    
    echo "⏳ Attente du démarrage du backend (5 secondes)..."
    sleep 5
    
    # Vérifier si c'est le premier démarrage
    if ! docker-compose exec -T backend npx prisma migrate status &> /dev/null; then
        echo ""
        echo "📦 Première installation détectée"
        echo "Initialisation de la base de données..."
        docker-compose exec -T backend npx prisma migrate deploy
        docker-compose exec -T backend npm run seed
        echo "✅ Base de données initialisée avec des données de démonstration"
    fi
    
    echo ""
    echo "✅ Application démarrée avec succès!"
    echo ""
    echo "🌐 Accès à l'application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5001/api"
    echo ""
    echo "👤 Comptes de test:"
    echo "   Admin:       admin@metro.fr / password123"
    echo "   Responsable: responsable@metro.fr / password123"
    echo "   Technicien:  technicien@metro.fr / password123"
    echo ""
    echo "📋 Commandes utiles:"
    echo "   Voir les logs:    docker-compose logs -f"
    echo "   Arrêter:          docker-compose down"
    echo "   Redémarrer:       docker-compose restart"
    echo "   Rebuild complet:  ./start.sh --rebuild"
    echo ""
    echo "💡 Utilisez './start.sh --rebuild' après avoir modifié:"
    echo "   - Les dépendances (package.json)"
    echo "   - Le Dockerfile"
    echo "   - Le code backend"
    echo ""
    
elif command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "✅ Node.js détecté (Docker non disponible)"
    echo ""
    echo "⚠️  Installation locale requise"
    echo ""
    echo "Veuillez suivre les étapes dans INSTALLATION_RAPIDE.md"
    echo ""
    echo "Résumé:"
    echo "1. Installer PostgreSQL"
    echo "2. Créer la base de données 'metro_db'"
    echo "3. Exécuter: npm run install-all"
    echo "4. Configurer backend/.env"
    echo "5. Exécuter: cd backend && npm run prisma:migrate && npm run seed"
    echo "6. Exécuter: npm run dev"
    echo ""
    
else
    echo "❌ Erreur: Node.js et Docker ne sont pas installés"
    echo ""
    echo "Veuillez installer l'un des deux:"
    echo "  - Docker: https://www.docker.com/get-started"
    echo "  - Node.js: https://nodejs.org/"
    echo ""
    exit 1
fi

