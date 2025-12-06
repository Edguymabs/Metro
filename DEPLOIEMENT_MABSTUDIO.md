# 🚀 Guide de Déploiement - beta-test-metro.mabstudio.fr

**Domaine** : beta-test-metro.mabstudio.fr  
**Type** : Beta Test  
**Durée estimée** : 2-3 heures

---

## 📋 Prérequis

- ✅ Serveur VPS (Ubuntu 22.04 ou Debian 11+)
- ✅ Domaine mabstudio.fr avec accès aux DNS
- ✅ Accès SSH au VPS
- ✅ RAM : 2 GB minimum (4 GB recommandé)

---

## 🎯 Vue d'Ensemble

Vous allez déployer Metro sur : `https://beta-test-metro.mabstudio.fr`

**Architecture** :
```
Internet
    ↓
[Nginx Reverse Proxy + SSL]
    ↓
beta-test-metro.mabstudio.fr
    ↓
[Docker Network]
    ├─ Frontend (React + Nginx) :3000
    ├─ Backend (Express API) :5001
    └─ PostgreSQL :5432
```

---

## 📍 Étape 1 : Configuration DNS (5 min)

### 1.1 Accéder à votre Registrar DNS

Connectez-vous à l'interface de gestion DNS de mabstudio.fr (OVH, Gandi, Cloudflare, etc.)

### 1.2 Créer l'Enregistrement DNS

Créez un enregistrement **A** :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | beta-test-metro | `IP_DE_VOTRE_VPS` | 3600 |

**Exemple** :
```
Type: A
Nom: beta-test-metro
Cible: 123.45.67.89  (remplacer par l'IP de votre VPS)
TTL: 3600
```

### 1.3 Vérifier la Propagation DNS

Depuis votre machine locale :

```bash
# Vérifier que le domaine pointe vers votre VPS
dig beta-test-metro.mabstudio.fr +short

# Devrait retourner l'IP de votre VPS
# Attendre 5-10 minutes si pas encore propagé
```

---

## 🖥️ Étape 2 : Préparer le Serveur VPS (30 min)

### 2.1 Se Connecter au VPS

```bash
ssh root@IP_DE_VOTRE_VPS
# ou
ssh votre-utilisateur@IP_DE_VOTRE_VPS
```

### 2.2 Mettre à Jour le Système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Installer Docker

```bash
# Installer Docker (script officiel)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker (si non-root)
sudo usermod -aG docker $USER

# Se déconnecter et reconnecter pour appliquer
exit
# Reconnectez-vous
ssh votre-utilisateur@IP_DE_VOTRE_VPS
```

### 2.4 Installer Docker Compose

```bash
# Télécharger Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier
docker --version
docker-compose --version
```

### 2.5 Installer Nginx et Certbot

```bash
# Installer Nginx et Certbot pour SSL
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 🔒 Étape 3 : Configurer le Firewall (5 min)

```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH (IMPORTANT: avant d'activer UFW)
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier les règles
sudo ufw status

# Devrait afficher:
# 22/tcp    ALLOW
# 80/tcp    ALLOW
# 443/tcp   ALLOW
```

---

## 📦 Étape 4 : Déployer l'Application (45 min)

### 4.1 Cloner le Projet

```bash
# Créer répertoire
mkdir -p ~/apps
cd ~/apps

# Cloner le projet (remplacer par votre URL Git)
git clone https://github.com/votre-compte/Metro.git
cd Metro
```

### 4.2 Générer les Secrets

**Option A : Script Automatique (Recommandé)**

```bash
# Utiliser le script pré-configuré pour mabstudio.fr
./generate-secrets-mabstudio.sh

# Copier les secrets affichés dans un gestionnaire de mots de passe
```

**Option B : Manuel**

```bash
# Copier le template
cp .env.production.mabstudio .env.production

# Générer secrets
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24)

# Éditer le fichier
nano .env.production

# Remplacer:
# - CHANGEZ_MOI_AVEC_SECRET_FORT_32_CHARS par les valeurs générées
```

### 4.3 Préparer Docker Compose

Le fichier `docker-compose.yml` est déjà optimisé. Vérifiez qu'il contient :

```bash
# Vérifier la configuration
cat docker-compose.yml | grep -A 5 "backend:"
```

### 4.4 Build et Lancer l'Application

```bash
# Renommer .env.production en .env (Docker Compose le charge auto)
cp .env.production .env

# Build des images
docker-compose build --no-cache

# Lancer les conteneurs
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps

# Devrait afficher 3 conteneurs "Up":
# - metro-backend
# - metro-frontend
# - metro-postgres
```

### 4.5 Initialiser la Base de Données

```bash
# Attendre 30 secondes que PostgreSQL soit prêt
sleep 30

# Déployer les migrations
docker-compose exec backend npx prisma migrate deploy

# Seed les données de test
docker-compose exec backend npm run seed

# Vérifier le backend
docker-compose logs backend | tail -20
```

---

## 🔐 Étape 5 : Configurer SSL (Let's Encrypt) (15 min)

### 5.1 Configurer Nginx pour Metro

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/metro
```

**Coller cette configuration** :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name beta-test-metro.mabstudio.fr;

    # Logs
    access_log /var/log/nginx/metro-access.log;
    error_log /var/log/nginx/metro-error.log;

    # Limite taille upload
    client_max_body_size 50M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 5.2 Activer la Configuration

```bash
# Créer lien symbolique
sudo ln -s /etc/nginx/sites-available/metro /etc/nginx/sites-enabled/

# Supprimer config par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 5.3 Obtenir le Certificat SSL

```bash
# Obtenir certificat Let's Encrypt
sudo certbot --nginx -d beta-test-metro.mabstudio.fr

# Suivre les instructions:
# 1. Entrer votre email: votre-email@mabstudio.fr
# 2. Accepter les termes: Y
# 3. Newsletter (optionnel): Y ou N
# 4. Redirect HTTP -> HTTPS: Choisir 2 (Redirect)
```

Le certificat sera automatiquement renouvelé tous les 90 jours.

---

## ✅ Étape 6 : Vérifier le Déploiement (10 min)

### 6.1 Tests de Base

```bash
# Test 1: Vérifier que Nginx répond
curl -I https://beta-test-metro.mabstudio.fr
# Devrait retourner: HTTP/2 200

# Test 2: Vérifier l'API backend
curl https://beta-test-metro.mabstudio.fr/api/health
# Devrait retourner: {"status":"OK",...}

# Test 3: Vérifier les conteneurs
docker-compose ps
# Les 3 conteneurs doivent être "Up"

# Test 4: Vérifier les logs
docker-compose logs backend | tail -20
docker-compose logs frontend | tail -20
```

### 6.2 Test depuis un Navigateur

1. Ouvrir : `https://beta-test-metro.mabstudio.fr`
2. Vérifier que le certificat SSL est valide (cadenas vert)
3. Se connecter avec :
   - **Email** : admin@metro.fr
   - **Mot de passe** : password123

4. Tester :
   - ✅ Créer un instrument
   - ✅ Modifier un instrument
   - ✅ Uploader un document
   - ✅ Créer une intervention

---

## 🔧 Étape 7 : Configuration Post-Déploiement (15 min)

### 7.1 Configurer Backups Automatiques

```bash
# Créer répertoire de backup
mkdir -p ~/backups

# Créer script de backup
nano ~/scripts/backup-metro.sh
```

**Coller ce script** :

```bash
#!/bin/bash
set -e

BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose -f ~/apps/Metro/docker-compose.yml exec -T postgres \
  pg_dump -U metro metro_db | gzip > "$BACKUP_DIR/metro_db_$DATE.sql.gz"

# Nettoyer backups > 30 jours
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ Backup créé: $BACKUP_DIR/metro_db_$DATE.sql.gz"
```

```bash
# Rendre exécutable
chmod +x ~/scripts/backup-metro.sh

# Tester
~/scripts/backup-metro.sh
```

### 7.2 Automatiser avec Cron

```bash
# Éditer crontab
crontab -e

# Ajouter cette ligne (backup quotidien à 3h du matin)
0 3 * * * ~/scripts/backup-metro.sh >> ~/logs/backup.log 2>&1
```

### 7.3 Changer les Mots de Passe par Défaut

**IMPORTANT** : Changez immédiatement les mots de passe des comptes test :

1. Se connecter sur `https://beta-test-metro.mabstudio.fr`
2. Pour chaque compte (admin, responsable, technicien) :
   - Se connecter
   - Aller dans "Mon compte" → "Paramètres"
   - Changer le mot de passe
   - Se déconnecter

---

## 📊 Monitoring et Logs

### Voir les Logs en Temps Réel

```bash
# Tous les logs
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# Logs Nginx
sudo tail -f /var/log/nginx/metro-access.log
sudo tail -f /var/log/nginx/metro-error.log
```

### Vérifier l'État des Services

```bash
# Docker
docker-compose ps

# Nginx
sudo systemctl status nginx

# Firewall
sudo ufw status

# Espace disque
df -h
```

---

## 🔄 Mise à Jour de l'Application

```bash
cd ~/apps/Metro

# 1. Créer backup
~/scripts/backup-metro.sh

# 2. Pull dernières modifications
git pull origin main

# 3. Rebuild si nécessaire
docker-compose build

# 4. Redémarrer
docker-compose up -d

# 5. Migrations BD si nécessaire
docker-compose exec backend npx prisma migrate deploy
```

---

## 🆘 Dépannage

### Application Inaccessible

```bash
# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t

# Vérifier Docker
docker-compose ps
docker-compose logs backend | tail -50
```

### Erreur 502 Bad Gateway

```bash
# Backend probablement down
docker-compose restart backend
docker-compose logs -f backend
```

### Certificat SSL Expiré

```bash
# Renouveler
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## 📋 Checklist Finale

### Sécurité
- [ ] Secrets forts générés et sauvegardés
- [ ] Certificat SSL actif (https://)
- [ ] Firewall configuré (ports 80, 443, 22)
- [ ] Mots de passe par défaut changés

### Application
- [ ] Frontend accessible : https://beta-test-metro.mabstudio.fr
- [ ] Backend répond : https://beta-test-metro.mabstudio.fr/api/health
- [ ] Login fonctionne
- [ ] Uploads fonctionnent
- [ ] Toutes les fonctionnalités testées

### Backups
- [ ] Script de backup créé et testé
- [ ] Cron configuré (backups quotidiens)
- [ ] Au moins 1 backup manuel effectué

### Monitoring
- [ ] Logs accessibles
- [ ] Conteneurs en état "Up"
- [ ] Nginx actif

---

## 🎉 Beta Test

Une fois tout vérifié :

1. **Créer comptes supplémentaires** pour vos testeurs
2. **Inviter 5-10 utilisateurs** de l'entreprise
3. **Collecter feedback** pendant 2-4 semaines
4. **Corriger bugs** identifiés
5. **Préparer production** complète

---

## 📞 Support

En cas de problème :

1. Consulter les logs : `docker-compose logs -f`
2. Vérifier le guide général : [`VPS_DEPLOYMENT_GUIDE.md`](VPS_DEPLOYMENT_GUIDE.md)
3. Consulter les problèmes connus : [`METRO_REPORTS.md`](METRO_REPORTS.md)

---

## 🔗 Liens Utiles

- **Application** : https://beta-test-metro.mabstudio.fr
- **API Health** : https://beta-test-metro.mabstudio.fr/api/health
- **Let's Encrypt** : https://letsencrypt.org/docs/

---

**Domaine** : beta-test-metro.mabstudio.fr  
**Date de création** : 6 décembre 2025  
**Version** : 1.0  
**Statut** : ✅ Guide Personnalisé

