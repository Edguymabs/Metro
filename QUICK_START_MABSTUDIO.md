# ⚡ Démarrage Ultra-Rapide - beta-test-metro.mabstudio.fr

**Domaine** : beta-test-metro.mabstudio.fr  
**Temps total** : 2-3 heures

---

## 🎯 En 3 Étapes Simples

### 1️⃣ Générer Secrets (5 min)

**Sur votre machine locale** :

```bash
cd Metro
./generate-secrets-mabstudio.sh
```

✅ **Les secrets sont automatiquement configurés pour votre domaine**  
⚠️ **Sauvegardez les secrets affichés dans un gestionnaire de mots de passe**

---

### 2️⃣ Configurer DNS (5 min)

Chez votre registrar DNS pour **mabstudio.fr** :

**Créer un enregistrement A** :
```
Type: A
Nom: beta-test-metro
Valeur: [IP_DE_VOTRE_VPS]
TTL: 3600
```

**Vérifier** (depuis votre machine) :
```bash
dig beta-test-metro.mabstudio.fr +short
# Devrait retourner l'IP de votre VPS
```

---

### 3️⃣ Déployer sur VPS (2h)

**Suivre le guide complet** : [`DEPLOIEMENT_MABSTUDIO.md`](DEPLOIEMENT_MABSTUDIO.md)

**Ou version ultra-condensée** :

```bash
# Sur votre VPS

# 1. Installer Docker
curl -fsSL https://get.docker.com | sh
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# 2. Firewall
sudo ufw enable
sudo ufw allow 22,80,443/tcp

# 3. Cloner projet
mkdir -p ~/apps && cd ~/apps
git clone [VOTRE_REPO] Metro
cd Metro

# 4. Copier secrets (depuis votre machine locale)
# scp .env.production votre-user@VPS:~/apps/Metro/

# 5. Build et lancer
cp .env.production .env
docker-compose build
docker-compose up -d

# 6. Initialiser BD
sleep 30
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed

# 7. Configurer Nginx
sudo nano /etc/nginx/sites-available/metro
# Copier la config depuis DEPLOIEMENT_MABSTUDIO.md
sudo ln -s /etc/nginx/sites-available/metro /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 8. SSL
sudo certbot --nginx -d beta-test-metro.mabstudio.fr
```

---

## ✅ Vérifier

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

## 📚 Documentation Complète

- **Guide détaillé** : [`DEPLOIEMENT_MABSTUDIO.md`](DEPLOIEMENT_MABSTUDIO.md)
- **Guide général VPS** : [`VPS_DEPLOYMENT_GUIDE.md`](VPS_DEPLOYMENT_GUIDE.md)
- **Variables d'environnement** : [`ENV_VARIABLES.md`](ENV_VARIABLES.md)
- **Dépannage** : [`VPS_DEPLOYMENT_GUIDE.md`](VPS_DEPLOYMENT_GUIDE.md#dépannage)

---

## 🆘 Aide Rapide

**Logs** :
```bash
docker-compose logs -f backend
sudo tail -f /var/log/nginx/metro-error.log
```

**Redémarrer** :
```bash
docker-compose restart backend
sudo systemctl reload nginx
```

**Backup** :
```bash
docker-compose exec postgres pg_dump -U metro metro_db | gzip > backup.sql.gz
```

---

**Domaine** : beta-test-metro.mabstudio.fr  
**Prêt à déployer** : ✅  
**Documentation** : Complète

