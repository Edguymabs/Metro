# 🚀 Metro - Guide de Démarrage Rapide Docker

## ✅ Statut : Système Opérationnel

Tous les conteneurs Docker sont démarrés et fonctionnels !

## 🌐 URLs d'Accès

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur React |
| **Backend API** | http://localhost:5001/api | API REST Node.js |
| **Base de données** | localhost:5432 | PostgreSQL (accès interne) |

## 👤 Comptes de Test

La base de données a été initialisée avec des comptes de test :

| Rôle | Email | Mot de passe | Permissions |
|------|-------|--------------|-------------|
| **Admin** | admin@metro.fr | password123 | Tous les droits |
| **Responsable Métrologie** | responsable@metro.fr | password123 | Gestion instruments, interventions |
| **Technicien** | technicien@metro.fr | password123 | Consultation et mise à jour |

## 🎯 Commandes Docker Essentielles

### Démarrer les Conteneurs
```bash
docker-compose up -d
```

### Arrêter les Conteneurs
```bash
docker-compose down
```

### Voir les Logs
```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### Redémarrer un Service
```bash
# Redémarrer le backend
docker-compose restart backend

# Redémarrer le frontend
docker-compose restart frontend
```

### Vérifier le Statut
```bash
docker-compose ps
```

### Rebuild après Modifications du Code
```bash
# Rebuild backend
docker-compose build backend

# Rebuild frontend
docker-compose build frontend

# Rebuild tout
docker-compose build
```

## 🗄️ Gestion de la Base de Données

### Accéder à Prisma Studio (Interface Graphique)
```bash
cd backend
npx prisma studio
# Ouvre sur http://localhost:5555
```

### Appliquer de Nouvelles Migrations
```bash
docker exec metro-backend npx prisma migrate deploy
```

### Réinitialiser la Base (⚠️ Perte de données)
```bash
docker exec metro-backend npx prisma migrate reset
```

### Seed (Données de Test)
```bash
docker exec metro-backend node prisma/seed.js
```

## 📊 Données Préchargées

Le système contient déjà des données de démonstration :

- **3 utilisateurs** (voir tableau ci-dessus)
- **2 sites** (Site Principal, Site Secondaire)
- **10+ types d'instruments** (Balances, pH-mètres, thermomètres, etc.)
- **5 fournisseurs** avec accréditations COFRAC
- **15 instruments** avec historique
- **Interventions** planifiées et complétées
- **Mouvements** d'instruments

## 🔍 Vérification Rapide

### Test Backend
```bash
curl http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@metro.fr","password":"password123"}'
```

Résultat attendu : `{"token": "...", "user": {...}}`

### Test Frontend
```bash
curl -I http://localhost:3000
```

Résultat attendu : `HTTP/1.1 200 OK`

### Test Database
```bash
docker exec metro-postgres psql -U metro -d metro_db -c "\dt"
```

Résultat attendu : Liste des tables

## 🛠️ Résolution de Problèmes

### Les Conteneurs ne Démarrent Pas
```bash
# Voir les logs d'erreur
docker-compose logs

# Nettoyer et redémarrer
docker-compose down -v
docker-compose up -d
```

### Le Backend ne Répond Pas
```bash
# Vérifier les logs
docker-compose logs backend

# Redémarrer
docker-compose restart backend
```

### Erreur de Migration
```bash
# Forcer la synchronisation du schéma
docker exec metro-backend npx prisma db push --skip-generate

# Marquer les migrations comme appliquées
docker exec metro-backend npx prisma migrate resolve --applied MIGRATION_NAME
```

### Réinitialisation Complète
```bash
# Arrêter et supprimer tout (y compris volumes)
docker-compose down -v

# Rebuild
docker-compose build

# Redémarrer
docker-compose up -d

# Attendre 30 secondes puis réinitialiser la base
sleep 30
docker exec metro-backend npx prisma db push --skip-generate
docker exec metro-backend node prisma/seed.js
```

## 📁 Structure des Volumes Docker

Les données persistantes sont stockées dans :

| Volume | Contenu |
|--------|---------|
| `metro_postgres_data` | Base de données PostgreSQL |
| `metro_backend_uploads` | Fichiers uploadés (documents, certificats) |

## 🔧 Configuration Production

Pour déployer en production, modifiez :

1. **`docker-compose.yml`** :
   - Variables d'environnement (JWT_SECRET, ENCRYPTION_KEY)
   - Mots de passe base de données
   - URL frontend

2. **`.env`** (créer à la racine) :
   ```env
   POSTGRES_USER=metro
   POSTGRES_PASSWORD=CHANGEZ_MOI_EN_PROD
   POSTGRES_DB=metro_db
   JWT_SECRET=CHANGEZ_CECI_AVEC_CLE_FORTE_32_CHARS
   ENCRYPTION_KEY=CHANGEZ_CECI_AVEC_CLE_FORTE_32_CHARS
   ```

3. **SSL/HTTPS** : Utiliser un reverse proxy (nginx, traefik)

## 📝 Logs et Monitoring

### Voir les Logs en Temps Réel
```bash
docker-compose logs -f --tail=100
```

### Statistiques des Conteneurs
```bash
docker stats metro-backend metro-frontend metro-postgres
```

### Espace Disque Utilisé
```bash
docker system df
```

## 🎓 Prochaines Étapes

1. **Connectez-vous** sur http://localhost:3000
2. **Utilisez** admin@metro.fr / password123
3. **Explorez** les fonctionnalités :
   - Gestion des instruments
   - Planification des étalonnages
   - Historique des interventions
   - Gestion des sites et fournisseurs

## 📚 Documentation Complète

- `QUICK_START.md` - Guide de démarrage complet
- `METRO_REPORTS.md` - Rapport détaillé des problèmes résolus
- `docs/GUIDE_UTILISATEUR.md` - Guide utilisateur
- `docs/ARCHITECTURE.md` - Architecture technique

## 🆘 Support

En cas de problème, consultez :
1. Les logs : `docker-compose logs -f`
2. Le rapport des problèmes : `METRO_REPORTS.md`
3. Le guide de démarrage : `QUICK_START.md`

---

**Version** : 1.0.0  
**Dernière mise à jour** : 18 novembre 2025  
**Statut** : ✅ Production Ready

