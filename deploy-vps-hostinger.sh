#!/bin/bash
set -e

echo "🚀 Déploiement Automatique Metro - VPS Hostinger"
echo "=================================================="
echo ""
echo "📍 Domaine: beta-test-metro.mabstudio.fr"
echo "📍 IP VPS: 82.112.255.148"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo ""
    echo -e "${GREEN}▶ $1${NC}"
    echo "----------------------------------------"
}

error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier qu'on est root ou sudo
if [ "$EUID" -ne 0 ]; then 
    warning "Ce script nécessite des privilèges root. Utilisation de sudo..."
    SUDO="sudo"
else
    SUDO=""
fi

# ============================================
# ÉTAPE 1: Mise à jour système
# ============================================
step "1. Mise à jour du système"
$SUDO apt update && $SUDO apt upgrade -y
success "Système mis à jour"

# ============================================
# ÉTAPE 2: Installation Docker
# ============================================
step "2. Installation Docker"
if command -v docker &> /dev/null; then
    warning "Docker est déjà installé"
    docker --version
else
    echo "Téléchargement et installation de Docker..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    $SUDO sh /tmp/get-docker.sh
    $SUDO usermod -aG docker $USER
    success "Docker installé"
    docker --version
fi

# ============================================
# ÉTAPE 3: Installation Docker Compose
# ============================================
step "3. Installation Docker Compose"
if command -v docker-compose &> /dev/null; then
    warning "Docker Compose est déjà installé"
    docker-compose --version
else
    echo "Téléchargement de Docker Compose..."
    $SUDO curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    $SUDO chmod +x /usr/local/bin/docker-compose
    success "Docker Compose installé"
    docker-compose --version
fi

# ============================================
# ÉTAPE 4: Installation Nginx et Certbot
# ============================================
step "4. Installation Nginx et Certbot"
if command -v nginx &> /dev/null; then
    warning "Nginx est déjà installé"
else
    $SUDO apt install -y nginx certbot python3-certbot-nginx ufw
    success "Nginx, Certbot et UFW installés"
fi

# ============================================
# ÉTAPE 5: Configuration Firewall
# ============================================
step "5. Configuration Firewall"
if $SUDO ufw status | grep -q "Status: active"; then
    warning "UFW est déjà actif"
else
    echo "Configuration du firewall..."
    $SUDO ufw --force enable
    $SUDO ufw allow 22/tcp
    $SUDO ufw allow 80/tcp
    $SUDO ufw allow 443/tcp
    success "Firewall configuré"
fi
$SUDO ufw status

# ============================================
# ÉTAPE 6: Préparation du projet
# ============================================
step "6. Préparation du projet Metro"
APPS_DIR="$HOME/apps"
METRO_DIR="$APPS_DIR/Metro"

if [ -d "$METRO_DIR" ]; then
    warning "Le répertoire Metro existe déjà"
    read -p "Continuer quand même ? (oui/non): " confirm
    if [ "$confirm" != "oui" ]; then
        error "Déploiement annulé"
    fi
else
    mkdir -p "$APPS_DIR"
    success "Répertoire créé: $APPS_DIR"
fi

# Vérifier si le code est déjà là
if [ ! -f "$METRO_DIR/docker-compose.yml" ]; then
    warning "Le projet Metro n'est pas encore cloné/copié"
    echo ""
    echo "Options:"
    echo "1. Cloner depuis Git (nécessite URL du repo)"
    echo "2. Transférer depuis votre machine locale"
    echo ""
    read -p "Choisir option (1 ou 2): " option
    
    if [ "$option" = "1" ]; then
        read -p "URL du repository Git: " git_url
        cd "$APPS_DIR"
        git clone "$git_url" Metro
        success "Projet cloné depuis Git"
    elif [ "$option" = "2" ]; then
        echo ""
        echo "Depuis votre machine locale, exécutez:"
        echo "  scp -r /Users/mabs/Documents/Metro root@82.112.255.148:$APPS_DIR/"
        echo ""
        read -p "Appuyez sur Entrée une fois le transfert terminé..."
    else
        error "Option invalide"
    fi
fi

cd "$METRO_DIR"
success "Répertoire projet: $METRO_DIR"

# ============================================
# ÉTAPE 7: Génération des secrets
# ============================================
step "7. Configuration des secrets"
if [ -f ".env.production" ]; then
    warning "Le fichier .env.production existe déjà"
    read -p "Régénérer les secrets ? (oui/non): " regenerate
    if [ "$regenerate" = "oui" ]; then
        rm .env.production
    else
        success "Utilisation des secrets existants"
        skip_secrets=true
    fi
fi

if [ "$skip_secrets" != "true" ]; then
    echo "Génération des secrets..."
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")
    
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
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  IMPORTANT: Sauvegardez ces secrets dans un gestionnaire de mots de passe:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "JWT_SECRET=$JWT_SECRET"
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
    echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Appuyez sur Entrée après avoir sauvegardé les secrets..."
    
    success "Secrets générés et sauvegardés"
fi

# ============================================
# ÉTAPE 8: Build et lancement Docker
# ============================================
step "8. Build et lancement des conteneurs"
cp .env.production .env

echo "Build des images Docker (cela peut prendre 5-10 minutes)..."
docker-compose build --no-cache

success "Build terminé"

echo "Démarrage des conteneurs..."
docker-compose up -d

echo "Attente du démarrage (30 secondes)..."
sleep 30

success "Conteneurs démarrés"
docker-compose ps

# ============================================
# ÉTAPE 9: Initialisation Base de Données
# ============================================
step "9. Initialisation de la base de données"
echo "Déploiement des migrations..."
docker-compose exec -T backend npx prisma migrate deploy

echo "Seed des données de test..."
docker-compose exec -T backend npm run seed

success "Base de données initialisée"

# ============================================
# ÉTAPE 10: Configuration Nginx
# ============================================
step "10. Configuration Nginx"
NGINX_CONFIG="/etc/nginx/sites-available/metro"

if [ -f "$NGINX_CONFIG" ]; then
    warning "Configuration Nginx existe déjà"
    read -p "Remplacer ? (oui/non): " replace
    if [ "$replace" != "oui" ]; then
        skip_nginx=true
    fi
fi

if [ "$skip_nginx" != "true" ]; then
    $SUDO tee "$NGINX_CONFIG" > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name beta-test-metro.mabstudio.fr;

    access_log /var/log/nginx/metro-access.log;
    error_log /var/log/nginx/metro-error.log;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

    # Activer la configuration
    $SUDO ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/metro
    $SUDO rm -f /etc/nginx/sites-enabled/default
    
    # Tester et recharger
    if $SUDO nginx -t; then
        $SUDO systemctl reload nginx
        success "Nginx configuré"
    else
        error "Erreur dans la configuration Nginx"
    fi
fi

# ============================================
# ÉTAPE 11: Certificat SSL
# ============================================
step "11. Obtention du certificat SSL"
echo "Lancement de Certbot..."
echo ""
echo "⚠️  Vous devrez répondre aux questions interactives:"
echo "   - Email: votre email"
echo "   - Accepter termes: Y"
echo "   - Redirect HTTP→HTTPS: Choisir 2"
echo ""

$SUDO certbot --nginx -d beta-test-metro.mabstudio.fr

success "Certificat SSL obtenu"

# ============================================
# ÉTAPE 12: Vérifications finales
# ============================================
step "12. Vérifications finales"

echo "Vérification des conteneurs..."
if docker-compose ps | grep -q "Up"; then
    success "Conteneurs actifs"
    docker-compose ps
else
    warning "Certains conteneurs ne sont pas actifs"
    docker-compose ps
fi

echo ""
echo "Test de l'API..."
if curl -f -s https://beta-test-metro.mabstudio.fr/api/health > /dev/null; then
    success "API accessible"
else
    warning "API non accessible (peut prendre quelques minutes)"
fi

# ============================================
# RÉSUMÉ FINAL
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Application: https://beta-test-metro.mabstudio.fr"
echo "📍 API Health:  https://beta-test-metro.mabstudio.fr/api/health"
echo ""
echo "👤 Login par défaut:"
echo "   Email:    admin@metro.fr"
echo "   Password: password123"
echo ""
echo "⚠️  IMPORTANT: Changez le mot de passe admin immédiatement !"
echo ""
echo "📋 Commandes utiles:"
echo "   Logs:           docker-compose logs -f"
echo "   Redémarrer:     docker-compose restart"
echo "   Status:         docker-compose ps"
echo "   Backup:         docker-compose exec postgres pg_dump -U metro metro_db | gzip > backup.sql.gz"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

