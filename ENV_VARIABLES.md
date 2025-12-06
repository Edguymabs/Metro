# 📋 Variables d'Environnement - Metro

Documentation complète de toutes les variables d'environnement utilisées par l'application Metro.

---

## 📝 Configuration Rapide

### Développement Local

Créer un fichier `.env` à la racine du projet :

```env
POSTGRES_USER=metro
POSTGRES_PASSWORD=metro123
POSTGRES_DB=metro_db
DATABASE_URL="postgresql://metro:metro123@localhost:5432/metro_db?schema=public"
JWT_SECRET=dev-secret-change-in-production
ENCRYPTION_KEY=dev-encryption-key-change-in-production
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
BACKUP_DIR=./backups
VITE_API_URL=http://localhost:5001/api
```

### Production (VPS)

Voir [`env.production.example`](env.production.example) et [`SECRETS_GENERATION_GUIDE.md`](SECRETS_GENERATION_GUIDE.md)

---

## 🗂️ Variables par Catégorie

### PostgreSQL (Base de Données)

| Variable | Requis | Défaut | Description |
|----------|--------|--------|-------------|
| `POSTGRES_USER` | ✅ | `metro` | Nom d'utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | ✅ | `metro123` | Mot de passe PostgreSQL (⚠️ changer en prod!) |
| `POSTGRES_DB` | ✅ | `metro_db` | Nom de la base de données |

### Backend API

| Variable | Requis | Défaut | Description |
|----------|--------|--------|-------------|
| `DATABASE_URL` | ✅ | - | URL de connexion PostgreSQL complète |
| `JWT_SECRET` | ✅ | - | Secret pour signer les tokens JWT (32+ caractères en prod) |
| `ENCRYPTION_KEY` | ✅ | - | Clé AES-256 pour chiffrer données sensibles (32+ caractères en prod) |
| `FRONTEND_URL` | ✅ | `http://localhost:3000` | URL du frontend (pour CORS) |
| `PORT` | ❌ | `5000` | Port d'écoute du serveur backend |
| `NODE_ENV` | ❌ | `development` | Environnement (`development`, `production`, `test`) |
| `UPLOAD_DIR` | ❌ | `./uploads` | Répertoire de stockage des fichiers uploadés |
| `BACKUP_DIR` | ❌ | `./backups` | Répertoire de stockage des backups |

### Frontend React

| Variable | Requis | Défaut | Description |
|----------|--------|--------|-------------|
| `VITE_API_URL` | ✅ | `http://localhost:5001/api` | URL de l'API backend |

### Logging

| Variable | Requis | Défaut | Description |
|----------|--------|--------|-------------|
| `LOG_LEVEL` | ❌ | `info` | Niveau de log (`error`, `warn`, `info`, `debug`) |

### Sécurité (Optionnelles)

| Variable | Requis | Défaut | Description |
|----------|--------|--------|-------------|
| `BACKUP_ENCRYPTION` | ❌ | `false` | Activer le chiffrement des backups |
| `BACKUP_ENCRYPTION_KEY` | ❌ | - | Clé de chiffrement des backups (si activé) |
| `RATE_LIMIT_MAX` | ❌ | `100` | Nombre max de requêtes par IP (15 min) |
| `AUTH_RATE_LIMIT_MAX` | ❌ | `20` | Nombre max de tentatives de connexion (15 min) |

---

## 🔧 Utilisation

### Docker Compose

Docker Compose charge automatiquement le fichier `.env` à la racine du projet :

```bash
# Créer .env depuis l'exemple
cp env.production.example .env

# Éditer les valeurs
nano .env

# Lancer
docker-compose up -d
```

### Mode Développement (sans Docker)

#### Backend

Créer `backend/.env` :

```env
DATABASE_URL="postgresql://metro:metro123@localhost:5432/metro_db?schema=public"
JWT_SECRET=dev-secret-change-in-production
ENCRYPTION_KEY=dev-encryption-key-change-in-production
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

#### Frontend

Créer `frontend/.env` :

```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🔐 Sécurité des Variables

### ⚠️ Ne JAMAIS Committer

Ces fichiers ne doivent **JAMAIS** être commités dans Git :

- `.env`
- `.env.production`
- `.env.local`
- `.env.development.local`
- `.env.test.local`

Vérifiez qu'ils sont dans `.gitignore` :

```bash
cat .gitignore | grep "\.env"
```

### Génération de Secrets Forts

Pour la production, utilisez le script fourni :

```bash
./generate-secrets.sh
```

Ou manuellement :

```bash
# JWT_SECRET (32+ caractères)
openssl rand -base64 32

# ENCRYPTION_KEY (32+ caractères)
openssl rand -base64 32

# POSTGRES_PASSWORD (16+ caractères)
openssl rand -base64 24
```

---

## 📱 Variables par Environnement

### Développement Local

```env
NODE_ENV=development
JWT_SECRET=dev-secret-change-in-production
ENCRYPTION_KEY=dev-encryption-key-change-in-production
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5001/api
LOG_LEVEL=debug
RATE_LIMIT_MAX=1000
```

### Production (VPS)

```env
NODE_ENV=production
JWT_SECRET=<généré-avec-openssl>
ENCRYPTION_KEY=<généré-avec-openssl>
FRONTEND_URL=https://votre-domaine.com
VITE_API_URL=https://votre-domaine.com/api
LOG_LEVEL=info
RATE_LIMIT_MAX=100
```

### Test

```env
NODE_ENV=test
DATABASE_URL="postgresql://metro:metro123@localhost:5432/metro_test_db?schema=public"
JWT_SECRET=test-secret
ENCRYPTION_KEY=test-encryption-key
```

---

## 🐛 Dépannage

### Variable Non Chargée

```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier le contenu
cat .env

# En Docker, vérifier dans le conteneur
docker exec metro-backend env | grep JWT_SECRET
```

### Erreur "DATABASE_URL is required"

```bash
# Vérifier la syntaxe
echo $DATABASE_URL

# Format correct:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### CORS Errors

Vérifier que `FRONTEND_URL` correspond à l'URL réelle du frontend :

```bash
# Backend doit autoriser l'origine du frontend
echo $FRONTEND_URL
# Doit correspondre à l'URL dans le navigateur
```

---

## 📚 Références

- [Guide de génération des secrets](SECRETS_GENERATION_GUIDE.md)
- [Configuration production](env.production.example)
- [Guide de déploiement VPS](VPS_DEPLOYMENT_GUIDE.md)
- [Guide de sécurité](SECURITY_GUIDE.md)

---

**Dernière mise à jour** : 6 décembre 2025  
**Version** : 1.0

