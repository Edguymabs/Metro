# 🚀 Guide Complet de Déploiement VPS - Metro

Guide détaillé pour déployer l'application Metro sur un serveur VPS en production.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Serveur](#configuration-serveur)
3. [Installation Docker](#installation-docker)
4. [Configuration Domaine & DNS](#configuration-domaine--dns)
5. [Installation SSL/HTTPS](#installation-sslhttps)
6. [Déploiement Application](#déploiement-application)
7. [Configuration Firewall](#configuration-firewall)
8. [Monitoring & Logs](#monitoring--logs)
9. [Backups Automatiques](#backups-automatiques)
10. [Mises à Jour](#mises-à-jour)
11. [Dépannage](#dépannage)

---

## 📌 Prérequis

### Serveur VPS

- **OS**: Ubuntu 22.04 LTS ou Debian 11+ (recommandé)
- **RAM**: Minimum 2 GB (4 GB recommandé)
- **CPU**: Minimum 2 cœurs
- **Stockage**: Minimum 20 GB SSD
- **Bande passante**: Illimitée ou >1 TB/mois

### Domaine

- Un nom de domaine acheté (ex: `metro.votreentreprise.fr`)
- Accès aux DNS du domaine

### Accès SSH

- Clé SSH configurée
- Accès root ou sudo

---

## 1. Configuration Serveur

### 1.1 Connexion Initiale

```bash
# Se connecter au VPS (remplacer par votre IP)
ssh root@votre-ip-vps

# Ou si utilisateur non-root
ssh utilisateur@votre-ip-vps
```

### 1.2 Mise à Jour du Système

```bash
# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl wget git vim ufw fail2ban
```

### 1.3 Créer Utilisateur Dédié (si root)

```bash
# Créer utilisateur metro
sudo adduser metro

# Ajouter aux sudoers
sudo usermod -aG sudo metro

# Se connecter avec le nouvel utilisateur
su - metro
```

### 1.4 Configurer SSH (Sécurité)

```bash
# Éditer la config SSH
sudo vim /etc/ssh/sshd_config
```

Modifier les paramètres suivants :

```conf
# Désactiver connexion root
PermitRootLogin no

# Activer uniquement clés SSH
PasswordAuthentication no
PubkeyAuthentication yes

# Port SSH (optionnel - changer le port par défaut)
# Port 2222
```

Redémarrer SSH :

```bash
sudo systemctl restart sshd
```

---

## 2. Installation Docker

### 2.1 Installer Docker

```bash
# Installer Docker (script officiel)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Déconnexion/reconnexion pour appliquer les changements
exit
# Se reconnecter
ssh metro@votre-ip-vps
```

### 2.2 Installer Docker Compose

```bash
# Télécharger Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

### 2.3 Configurer Docker

```bash
# Démarrage automatique au boot
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 3. Configuration Domaine & DNS

### 3.1 Configuration DNS

Chez votre registrar de domaine (OVH, Gandi, Cloudflare, etc.), créer les enregistrements DNS :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | `votre-ip-vps` | 3600 |
| A | www | `votre-ip-vps` | 3600 |
| AAAA | @ | `votre-ipv6-vps` | 3600 (si IPv6) |

### 3.2 Vérifier la Propagation DNS

```bash
# Vérifier que le domaine pointe vers votre VPS
dig votre-domaine.com +short

# Doit retourner l'IP de votre VPS
# Attendre jusqu'à 24h pour propagation complète (généralement 1-2h)
```

---

## 4. Installation SSL/HTTPS

### 4.1 Installer Nginx (Reverse Proxy)

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4.2 Configurer Nginx pour Metro

```bash
# Créer configuration Metro
sudo vim /etc/nginx/sites-available/metro
```

Contenu initial (HTTP seulement, avant SSL) :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Logs
    access_log /var/log/nginx/metro-access.log;
    error_log /var/log/nginx/metro-error.log;

    # Limite taille upload (pour backups)
    client_max_body_size 100M;

    # Frontend (React)
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

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts (ajuster selon besoins)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Activer la configuration :

```bash
# Créer lien symbolique
sudo ln -s /etc/nginx/sites-available/metro /etc/nginx/sites-enabled/

# Supprimer config par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 4.3 Installer Certbot (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Suivre les instructions interactives
# Email: votre-email@exemple.com
# Accepter les termes
# Choisir: 2 (Redirect HTTP -> HTTPS)
```

Certbot modifie automatiquement la config Nginx pour ajouter HTTPS.

### 4.4 Vérifier Renouvellement Auto SSL

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Le renouvellement automatique est déjà configuré via cron/systemd
```

---

## 5. Déploiement Application

### 5.1 Cloner le Projet

```bash
# Créer répertoire pour l'application
mkdir -p ~/apps
cd ~/apps

# Cloner depuis Git (remplacer par votre URL)
git clone https://github.com/votre-compte/Metro.git
cd Metro
```

### 5.2 Générer Secrets Production

```bash
# Utiliser le script fourni
./generate-secrets.sh

# Ou créer manuellement .env.production
cp env.production.example .env.production

# Éditer avec vos secrets
nano .env.production
```

**Secrets à configurer** :

```env
# Générer avec: openssl rand -base64 32
POSTGRES_PASSWORD=<généré>
JWT_SECRET=<généré>
ENCRYPTION_KEY=<généré>

# Votre domaine
FRONTEND_URL=https://votre-domaine.com
VITE_API_URL=https://votre-domaine.com/api
```

### 5.3 Modifier docker-compose.yml

```bash
# Éditer docker-compose pour production
nano docker-compose.yml
```

**Modifications importantes** :

```yaml
services:
  backend:
    # Supprimer la ligne platform (ARM64 compatible)
    # platform: linux/amd64  # <-- SUPPRIMER
    
    env_file:
      - .env.production  # Charger depuis .env.production
    
    # Ajouter volume pour backups
    volumes:
      - backend_uploads:/app/uploads
      - backend_backups:/app/backups  # NOUVEAU
      - backend_logs:/app/logs        # NOUVEAU
  
  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=https://votre-domaine.com/api  # IMPORTANT

volumes:
  backend_backups:
    driver: local
  backend_logs:
    driver: local
```

### 5.4 Lancer l'Application

```bash
# Renommer .env.production en .env (Docker Compose le charge auto)
cp .env.production .env

# Build et lancer
docker-compose build --no-cache
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### 5.5 Initialiser la Base de Données

```bash
# Attendre que PostgreSQL soit prêt (30 sec)
sleep 30

# Vérifier l'état des migrations
docker-compose exec backend npx prisma migrate status

# Si besoin, déployer migrations
docker-compose exec backend npx prisma migrate deploy

# Seed données initiales
docker-compose exec backend npm run seed

# Vérifier que tout fonctionne
curl http://localhost:3000
curl http://localhost:5001/api/health
```

---

## 6. Configuration Firewall

### 6.1 Configurer UFW (Ubuntu)

```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH (port 22 ou custom)
sudo ufw allow 22/tcp
# Si port SSH modifié: sudo ufw allow 2222/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier les règles
sudo ufw status numbered

# Règles attendues:
# [1] 22/tcp         ALLOW IN    Anywhere
# [2] 80/tcp         ALLOW IN    Anywhere
# [3] 443/tcp        ALLOW IN    Anywhere
```

### 6.2 Bloquer Accès Direct aux Ports Docker

Vérifier que les ports 3000, 5001, 5432 ne sont **PAS** exposés publiquement :

```bash
# Test depuis l'extérieur (depuis votre PC local)
nc -zv votre-ip-vps 5432  # Ne doit PAS réussir
nc -zv votre-ip-vps 5001  # Ne doit PAS réussir
nc -zv votre-ip-vps 3000  # Ne doit PAS réussir
```

Si exposés, modifier `docker-compose.yml` pour binder sur localhost uniquement :

```yaml
services:
  backend:
    ports:
      - "127.0.0.1:5001:5000"  # Uniquement localhost
  
  frontend:
    ports:
      - "127.0.0.1:3000:80"    # Uniquement localhost
  
  postgres:
    ports:
      - "127.0.0.1:5432:5432"  # Uniquement localhost
```

---

## 7. Monitoring & Logs

### 7.1 Logs Docker Compose

```bash
# Tous les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Dernières 100 lignes
docker-compose logs --tail=100
```

### 7.2 Logs Nginx

```bash
# Logs accès
sudo tail -f /var/log/nginx/metro-access.log

# Logs erreurs
sudo tail -f /var/log/nginx/metro-error.log
```

### 7.3 Logs Application (Backend)

```bash
# Logs du logger custom
docker-compose exec backend ls -lh /app/logs/

# Voir logs du jour
docker-compose exec backend tail -f /app/logs/$(date +%Y-%m-%d).log
```

### 7.4 Monitoring Système

```bash
# Utilisation ressources
docker stats

# Espace disque
df -h

# Statut services
docker-compose ps
sudo systemctl status nginx docker
```

---

## 8. Backups Automatiques

### 8.1 Script de Backup

Créer `/home/metro/scripts/backup-metro.sh` :

```bash
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/home/metro/backups"
CONTAINER_NAME="metro-backend"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer répertoire
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
echo "📦 Création backup PostgreSQL..."
docker-compose -f /home/metro/apps/Metro/docker-compose.yml \
  exec -T postgres \
  pg_dump -U metro metro_db | gzip > "$BACKUP_DIR/metro_db_$DATE.sql.gz"

# Backup fichiers uploadés
echo "📦 Backup fichiers uploads..."
docker cp $CONTAINER_NAME:/app/uploads "$BACKUP_DIR/uploads_$DATE"
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$BACKUP_DIR" "uploads_$DATE"
rm -rf "$BACKUP_DIR/uploads_$DATE"

# Nettoyer vieux backups
echo "🧹 Nettoyage backups > $RETENTION_DAYS jours..."
find $BACKUP_DIR -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup terminé: $BACKUP_DIR"
ls -lh $BACKUP_DIR | tail -5
```

Rendre exécutable :

```bash
chmod +x /home/metro/scripts/backup-metro.sh
```

### 8.2 Automatiser avec Cron

```bash
# Éditer crontab
crontab -e
```

Ajouter :

```cron
# Backup quotidien à 2h du matin
0 2 * * * /home/metro/scripts/backup-metro.sh >> /home/metro/logs/backup.log 2>&1

# Backup hebdomadaire complet (dimanche 3h)
0 3 * * 0 /home/metro/scripts/backup-metro.sh >> /home/metro/logs/backup-weekly.log 2>&1
```

### 8.3 Test du Backup

```bash
# Exécuter manuellement
/home/metro/scripts/backup-metro.sh

# Vérifier
ls -lh /home/metro/backups/
```

---

## 9. Mises à Jour

### 9.1 Mise à Jour de l'Application

```bash
cd ~/apps/Metro

# 1. Créer backup avant mise à jour
/home/metro/scripts/backup-metro.sh

# 2. Pull dernières modifications
git pull origin main

# 3. Rebuild si nécessaire
docker-compose build --no-cache

# 4. Redémarrer
docker-compose up -d

# 5. Appliquer migrations BD si nécessaire
docker-compose exec backend npx prisma migrate deploy

# 6. Vérifier
docker-compose ps
curl https://votre-domaine.com/api/health
```

### 9.2 Mise à Jour Docker

```bash
# Mettre à jour Docker
sudo apt update
sudo apt upgrade docker-ce docker-ce-cli containerd.io

# Redémarrer Docker
sudo systemctl restart docker
```

### 9.3 Rollback en Cas de Problème

```bash
# Arrêter les conteneurs
docker-compose down

# Revenir à la version précédente
git log --oneline  # Trouver le commit
git checkout <commit-hash>

# Restaurer backup BD si nécessaire
gunzip < /home/metro/backups/metro_db_YYYYMMDD.sql.gz | \
  docker-compose exec -T postgres psql -U metro -d metro_db

# Redémarrer
docker-compose up -d
```

---

## 10. Dépannage

### 10.1 Application Inaccessible

```bash
# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t

# Vérifier containers
docker-compose ps

# Vérifier logs
docker-compose logs backend | tail -50
sudo tail -50 /var/log/nginx/metro-error.log
```

### 10.2 Erreur 502 Bad Gateway

```bash
# Backend probablement down
docker-compose ps backend

# Redémarrer backend
docker-compose restart backend

# Vérifier logs
docker-compose logs -f backend
```

### 10.3 Base de Données Inaccessible

```bash
# Vérifier PostgreSQL
docker-compose ps postgres
docker-compose logs postgres

# Test connexion
docker-compose exec postgres psql -U metro -d metro_db -c "SELECT 1;"
```

### 10.4 Certificat SSL Expiré

```bash
# Renouveler manuellement
sudo certbot renew --force-renewal

# Redémarrer Nginx
sudo systemctl reload nginx
```

### 10.5 Espace Disque Plein

```bash
# Vérifier utilisation
df -h

# Nettoyer Docker
docker system prune -a --volumes

# Nettoyer vieux logs
sudo journalctl --vacuum-time=7d

# Nettoyer vieux backups
find /home/metro/backups -type f -mtime +30 -delete
```

---

## 11. Checklist Post-Déploiement

Une fois déployé, vérifier :

### Sécurité

- [ ] Secrets forts générés (JWT_SECRET, ENCRYPTION_KEY, POSTGRES_PASSWORD)
- [ ] Firewall configuré (UFW activé, ports 80/443/22 seulement)
- [ ] SSH sécurisé (clés SSH, PasswordAuthentication no)
- [ ] Certificat SSL actif (https:// fonctionne)
- [ ] Ports Docker non exposés publiquement (5432, 5001, 3000)

### Application

- [ ] Frontend accessible (https://votre-domaine.com)
- [ ] Backend répond (https://votre-domaine.com/api/health)
- [ ] Login fonctionne (admin@metro.fr / password123)
- [ ] Uploads fonctionnent
- [ ] Backups testés

### Monitoring

- [ ] Logs accessibles
- [ ] Backup automatique configuré (cron)
- [ ] Monitoring système en place
- [ ] Alertes configurées (optionnel)

### Documentation

- [ ] Secrets sauvegardés dans gestionnaire de mots de passe
- [ ] Procédure rollback documentée
- [ ] Contacts d'urgence notés

---

## 12. Ressources Additionnelles

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [UFW Tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu)

---

## 13. Support & Aide

En cas de problème, consulter :

1. Les logs : `docker-compose logs -f`
2. Le guide de dépannage ci-dessus
3. [`METRO_REPORTS.md`](METRO_REPORTS.md) - Problèmes déjà résolus
4. [`SECURITY_GUIDE.md`](SECURITY_GUIDE.md) - Guide de sécurité

---

**Date de création** : 6 décembre 2025  
**Version** : 1.0  
**Auteur** : Équipe Metro  
**Testé sur** : Ubuntu 22.04 LTS, Debian 11

