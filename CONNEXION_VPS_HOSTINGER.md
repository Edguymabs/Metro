# 🔐 Connexion au VPS Hostinger - Déploiement Metro

**VPS** : srv1175369.hstgr.cloud  
**IP** : 82.112.255.148  
**Domaine** : beta-test-metro.mabstudio.fr ✅ DNS configuré

---

## 🔑 Connexion SSH

### Option 1 : Via Hostinger hPanel

1. Connectez-vous à https://hpanel.hostinger.com
2. Allez dans **VPS** → **Votre VPS**
3. Cliquez sur **"SSH Access"** ou **"Terminal"**
4. Vous serez connecté directement dans le navigateur

### Option 2 : Via SSH depuis votre machine

```bash
# Connexion SSH
ssh root@82.112.255.148
# ou
ssh root@srv1175369.hstgr.cloud
```

**Si vous n'avez pas encore configuré de clé SSH**, vous devrez utiliser le mot de passe root fourni par Hostinger dans l'email de création du VPS.

---

## 📋 Informations VPS

- **Hostname** : srv1175369.hstgr.cloud
- **IP** : 82.112.255.148
- **IPv6** : 2a02:4780:28:e88::1
- **OS** : Ubuntu 24.04 LTS
- **RAM** : 4 GB
- **Disque** : 50 GB
- **État** : ✅ Running

---

## 🚀 Déploiement Rapide

Une fois connecté au VPS, exécutez ces commandes :

### 1. Mise à Jour Système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installation Docker

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Vérifier
docker --version
```

### 3. Installation Docker Compose

```bash
# Télécharger Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier
docker-compose --version
```

### 4. Installation Nginx et Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx ufw
```

### 5. Configuration Firewall

```bash
# Activer UFW
sudo ufw enable

# Autoriser les ports nécessaires
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier
sudo ufw status
```

### 6. Cloner le Projet

```bash
# Créer répertoire
mkdir -p ~/apps
cd ~/apps

# Cloner votre projet (remplacer par votre URL Git)
git clone [VOTRE_REPO_GIT] Metro
cd Metro
```

**Si vous n'avez pas encore poussé le code sur Git**, vous pouvez :

**Option A** : Créer un repo Git et pousser le code
```bash
# Sur votre machine locale
cd /Users/mabs/Documents/Metro
git init
git add .
git commit -m "Initial commit"
# Créer un repo sur GitHub/GitLab et pousser
```

**Option B** : Transférer les fichiers via SCP
```bash
# Depuis votre machine locale
cd /Users/mabs/Documents/Metro
scp -r . root@82.112.255.148:~/apps/Metro
```

### 7. Générer les Secrets

**Sur votre machine locale** (si pas déjà fait) :

```bash
cd /Users/mabs/Documents/Metro
./generate-secrets-mabstudio.sh
```

**Puis transférer le fichier .env.production au VPS** :

```bash
# Depuis votre machine locale
scp .env.production root@82.112.255.148:~/apps/Metro/.env.production
```

**OU créer directement sur le VPS** :

```bash
# Sur le VPS
cd ~/apps/Metro
nano .env.production
# Copier le contenu depuis env.mabstudio.example et générer les secrets
```

### 8. Build et Lancer

```bash
# Sur le VPS
cd ~/apps/Metro

# Renommer .env.production en .env
cp .env.production .env

# Build
docker-compose build --no-cache

# Lancer
docker-compose up -d

# Vérifier
docker-compose ps
```

### 9. Initialiser la Base de Données

```bash
# Attendre que PostgreSQL soit prêt
sleep 30

# Migrations
docker-compose exec backend npx prisma migrate deploy

# Seed données
docker-compose exec backend npm run seed

# Vérifier logs
docker-compose logs backend | tail -20
```

### 10. Configurer Nginx

```bash
# Créer configuration
sudo nano /etc/nginx/sites-available/metro
```

**Coller cette configuration** :

```nginx
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
```

```bash
# Activer
sudo ln -s /etc/nginx/sites-available/metro /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 11. Obtenir Certificat SSL

```bash
sudo certbot --nginx -d beta-test-metro.mabstudio.fr
```

Suivre les instructions :
- Email : votre email
- Accepter termes : Y
- Redirect HTTP→HTTPS : Choisir **2**

---

## ✅ Vérification

```bash
# Test 1: HTTPS
curl -I https://beta-test-metro.mabstudio.fr

# Test 2: API
curl https://beta-test-metro.mabstudio.fr/api/health

# Test 3: Conteneurs
docker-compose ps
```

**Navigateur** : https://beta-test-metro.mabstudio.fr  
**Login** : admin@metro.fr / password123

---

## 🆘 Dépannage

### Problème de Connexion SSH

Si vous ne pouvez pas vous connecter :

1. **Via hPanel Hostinger** :
   - Allez dans VPS → Terminal
   - Connexion directe dans le navigateur

2. **Vérifier le mot de passe root** :
   - Email de création VPS Hostinger
   - Ou réinitialiser depuis hPanel

### Problème Build Docker

```bash
# Vérifier logs
docker-compose logs backend

# Rebuild complet
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Problème DNS

Le DNS est déjà configuré, mais si besoin de vérifier :

```bash
# Depuis votre machine locale
dig beta-test-metro.mabstudio.fr +short
# Devrait retourner: 82.112.255.148
```

---

## 📞 Support

- **Guide complet** : [`DEPLOIEMENT_MABSTUDIO.md`](DEPLOIEMENT_MABSTUDIO.md)
- **Checklist** : [`CHECKLIST_MABSTUDIO.md`](CHECKLIST_MABSTUDIO.md)
- **Logs** : `docker-compose logs -f`

---

**VPS** : 82.112.255.148  
**Domaine** : beta-test-metro.mabstudio.fr  
**Prêt** : ✅ DNS configuré, VPS accessible

