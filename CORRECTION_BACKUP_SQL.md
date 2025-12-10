# Correction Système de Sauvegarde SQL

## 🔍 Problème Identifié

Le système de sauvegarde SQL peut ne pas fonctionner pour plusieurs raisons :

### Causes Possibles

1. **Dossier `backups` inexistant** dans le conteneur backend
2. **postgresql-client non disponible** (théoriquement installé mais à vérifier)
3. **Variables d'environnement mal configurées**
4. **Format DATABASE_URL incorrect** avec `?schema=public`
5. **Permissions insuffisantes** sur le dossier backups

## ✅ Solution Complète

### Étape 1: Diagnostic

Sur le VPS, exécutez :

```bash
cd ~/apps/Metro

# Vérifier si pg_dump est disponible
docker-compose exec backend which pg_dump

# Vérifier le dossier backups
docker-compose exec backend ls -la /app/backups

# Voir les logs d'erreur
docker-compose logs backend --tail=50 | grep -i backup
```

### Étape 2: Correction Rapide (One-Liner)

```bash
cd ~/apps/Metro && docker-compose exec -T backend sh -c "mkdir -p /app/backups && chmod 755 /app/backups && apk info | grep postgresql-client || apk add --no-cache postgresql-client" && echo "✅ Corrections appliquées"
```

### Étape 3: Test du Système

```bash
# Test manuel de backup
docker-compose exec backend sh -c "
  cd /app
  node -e \"
    const { backupManager } = require('./dist/utils/backup');
    (async () => {
      const result = await backupManager.createFullBackup();
      console.log(result);
    })();
  \"
"
```

## 🔧 Corrections du Code

### 1. Améliorer la gestion d'erreur dans `backup.ts`

Le code actuel utilise `console.log/error`. Remplacer par le logger:

```typescript
// AVANT
console.log('🔄 Création du backup...');
console.error('❌ Erreur lors de la création du backup:', error);

// APRÈS
import { logger } from './logger';
logger.info('Création du backup...');
logger.error('Erreur lors de la création du backup', { error });
```

### 2. Vérifier les Prérequis au Démarrage

Ajouter une fonction de vérification dans le constructor:

```typescript
constructor() {
  this.config = { /* ... */ };
  
  // Créer le dossier de backup s'il n'existe pas
  if (!fs.existsSync(this.config.backupDir)) {
    fs.mkdirSync(this.config.backupDir, { recursive: true });
  }
  
  // AJOUTER: Vérifier que pg_dump existe
  this.verifyPostgreSQLTools();
}

private async verifyPostgreSQLTools(): Promise<void> {
  try {
    await execAsync('which pg_dump');
    await execAsync('which psql');
  } catch (error) {
    console.error('⚠️  ATTENTION: pg_dump/psql non disponibles. Backups SQL désactivés.');
  }
}
```

### 3. Gestion du `?schema=public` dans DATABASE_URL

Le code actuel extrait mal l'URL si elle contient `?schema=public`. Correction:

```typescript
// AMÉLIORATION - Ligne 46
const urlMatch = this.config.databaseUrl
  .split('?')[0]  // ← AJOUTER: Retirer les query params
  .match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
```

## 📦 Script Automatique de Correction

J'ai créé 2 scripts:

1. **`diagnostic-backup-vps.sh`** - Diagnostic complet (7 tests)
2. **`fix-backup-system.sh`** - Correction automatique

### Utilisation

```bash
# Sur le VPS
cd ~/apps/Metro

# Option 1: Diagnostic seul
bash diagnostic-backup-vps.sh

# Option 2: Correction directe
bash fix-backup-system.sh
```

## 🐛 Erreurs Courantes et Solutions

### Erreur 1: `pg_dump: command not found`

**Cause**: postgresql-client non installé ou mal configuré

**Solution**:
```bash
docker-compose exec backend apk add --no-cache postgresql-client
docker-compose restart backend
```

### Erreur 2: `ENOENT: no such file or directory, open '/app/backups/...'`

**Cause**: Dossier backups manquant

**Solution**:
```bash
docker-compose exec backend mkdir -p /app/backups
docker-compose exec backend chmod 755 /app/backups
```

### Erreur 3: `PGPASSWORD: psql: error: invalid URI query parameter: "schema"`

**Cause**: DATABASE_URL contient `?schema=public` qui n'est pas supporté par psql

**Solution**: Modifier le code pour strip les query params (voir correction #3)

### Erreur 4: `permission denied: /app/backups`

**Cause**: Permissions insuffisantes

**Solution**:
```bash
docker-compose exec backend chmod 755 /app/backups
docker-compose exec backend chown -R node:node /app/backups
```

### Erreur 5: `Connection refused to postgres:5432`

**Cause**: DATABASE_URL pointe vers `localhost` au lieu de `postgres` (nom du service Docker)

**Solution**: Vérifier `.env`:
```bash
# CORRECT
DATABASE_URL="postgresql://metro_user:metro_password@postgres:5432/metro_db?schema=public"

# INCORRECT
DATABASE_URL="postgresql://metro_user:metro_password@localhost:5432/metro_db?schema=public"
```

## 🔄 Persister les Backups (Volume Docker)

Actuellement, les backups sont perdus si le conteneur est supprimé. **Solution recommandée**:

### Ajouter dans `docker-compose.yml`

```yaml
services:
  backend:
    volumes:
      - backend_uploads:/app/uploads
      - backend_backups:/app/backups  # ← AJOUTER
      - backend_logs:/app/logs

volumes:
  postgres_data:
  backend_uploads:
  backend_backups:  # ← AJOUTER
  backend_logs:
```

### Appliquer le changement

```bash
cd ~/apps/Metro
docker-compose down
docker-compose up -d
```

## 🧪 Tests à Effectuer

### Test 1: Création Backup API

```bash
# Obtenir un token admin (depuis le frontend ou générer manuellement)
TOKEN="votre_token_jwt"

# Créer un backup
curl -X POST http://localhost:5001/api/backup/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Résultat attendu**:
```json
{
  "message": "Backup créé avec succès",
  "filename": "metro_backup_2025-12-10T12-30-00-000Z.sql"
}
```

### Test 2: Lister les Backups

```bash
curl http://localhost:5001/api/backup/list \
  -H "Authorization: Bearer $TOKEN"
```

**Résultat attendu**:
```json
{
  "backups": [
    {
      "filename": "metro_backup_2025-12-10T12-30-00-000Z.sql",
      "size": 245632,
      "created": "2025-12-10T12:30:00.000Z",
      "type": "plain"
    }
  ],
  "count": 1
}
```

### Test 3: Télécharger un Backup

```bash
curl -O http://localhost:5001/api/backup/download/metro_backup_2025-12-10T12-30-00-000Z.sql \
  -H "Authorization: Bearer $TOKEN"
```

### Test 4: Export Excel

```bash
curl -X POST http://localhost:5001/api/backup/export/instruments/excel \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Monitoring des Backups

### Vérifier les Backups Régulièrement

```bash
# Taille totale des backups
docker-compose exec backend du -sh /app/backups

# Liste détaillée
docker-compose exec backend ls -lh /app/backups

# Nombre de backups
docker-compose exec backend sh -c "ls /app/backups | wc -l"
```

### Logs de Backup

```bash
# Voir les logs de création
docker-compose logs backend | grep "Backup créé"

# Voir les erreurs
docker-compose logs backend | grep -i "erreur.*backup"
```

## 🎯 Checklist de Vérification

### Après Correction

- [ ] `docker-compose exec backend which pg_dump` → retourne un chemin
- [ ] `docker-compose exec backend which psql` → retourne un chemin
- [ ] `docker-compose exec backend ls /app/backups` → dossier existe
- [ ] Créer backup depuis frontend → ✅ Succès
- [ ] Lister backups → Au moins 1 backup visible
- [ ] Télécharger backup → Fichier .sql valide
- [ ] Restaurer backup → ✅ Base restaurée

### Volume Persistant

- [ ] `backend_backups` présent dans `docker-compose.yml`
- [ ] `docker-compose down && docker-compose up -d` → Backups conservés
- [ ] Supprimer conteneur → Backups toujours présents après recréation

## 📝 Variables d'Environnement Requises

Dans `.env` ou `docker-compose.yml`:

```bash
# Base de données (REQUIS)
DATABASE_URL=postgresql://metro_user:metro_password@postgres:5432/metro_db?schema=public

# Backup (OPTIONNEL - valeurs par défaut)
BACKUP_DIR=/app/backups
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION=false
BACKUP_COMPRESSION=false
```

## 🚀 Déploiement de la Correction

### Option A: Scripts Automatiques

```bash
cd ~/apps/Metro
bash fix-backup-system.sh
```

### Option B: Manuel

```bash
cd ~/apps/Metro

# 1. Créer dossier backups
docker-compose exec backend mkdir -p /app/backups
docker-compose exec backend chmod 755 /app/backups

# 2. Vérifier postgresql-client
docker-compose exec backend apk add --no-cache postgresql-client

# 3. Tester
docker-compose exec backend pg_dump --version

# 4. Restart (optionnel)
docker-compose restart backend
```

### Option C: Rebuild Complet

Si rien ne fonctionne:

```bash
cd ~/apps/Metro
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

## 🔐 Sécurité des Backups

### Recommandations

1. **Chiffrer les backups sensibles**:
   ```bash
   # Dans .env
   BACKUP_ENCRYPTION=true
   ```

2. **Limiter l'accès API** (déjà fait - ADMIN seulement)

3. **Sauvegarder hors VPS** (cron quotidien):
   ```bash
   # Sur votre machine locale
   0 3 * * * scp root@82.112.255.148:~/apps/Metro/backend/backups/*.sql ~/backups/metro/
   ```

4. **Rotation automatique** (déjà implémentée - 30 jours par défaut)

## 📞 Support

### Si le Problème Persiste

```bash
# Logs complets
docker-compose logs backend > backend-full.log

# Envoyer à support avec:
# - backend-full.log
# - Sortie de diagnostic-backup-vps.sh
# - Message d'erreur exact du frontend
```

---

**Dernière mise à jour**: 10 décembre 2025  
**Statut**: 🔧 Scripts de correction prêts

