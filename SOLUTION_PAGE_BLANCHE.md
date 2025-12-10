# Solution Complète - Page Blanche

## Problème identifié

Le frontend affiche une page blanche car :
1. ❌ Les fichiers sources utilisent `(import.meta as any).env?.VITE_API_URL` au lieu de `import.meta.env.VITE_API_URL`
2. ❌ Le frontend a été buildé AVANT les corrections, donc il contient encore `http://localhost:5001/api`
3. ⚠️ Le backend est `unhealthy` (mais fonctionne quand même)
4. ⚠️ Doublon dans `nginx.conf` (ligne 27)

## Solution IMMÉDIATE sur le VPS

### Étape 1 : Diagnostic

Exécutez d'abord le script de diagnostic pour voir l'état actuel :

```bash
cd ~/apps/Metro
bash diagnostic-complet-vps.sh
```

### Étape 2 : Correction complète

Exécutez le script de correction complète :

```bash
cd ~/apps/Metro
bash fix-complet-vps.sh
```

Ce script va :
1. ✅ Corriger `api.ts` et `interventionConfigService.ts`
2. ✅ Vérifier/corriger `docker-compose.yml`
3. ✅ Vérifier/corriger `frontend/Dockerfile`
4. ✅ Vérifier/corriger `backend/Dockerfile.simple`
5. ✅ Nettoyer les anciens builds
6. ✅ Rebuild COMPLET sans cache
7. ✅ Redémarrer les services
8. ✅ Vérifier que tout fonctionne

### Étape 3 : Vérification manuelle

Si les scripts ne sont pas disponibles, exécutez ces commandes manuellement :

```bash
cd ~/apps/Metro

# 1. Corriger les fichiers sources
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/api.ts
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/interventionConfigService.ts

# 2. Vérifier que docker-compose.yml a VITE_API_URL
grep -q "VITE_API_URL=/api" docker-compose.yml || echo "⚠️ VITE_API_URL manquant dans docker-compose.yml"

# 3. Vérifier que frontend/Dockerfile a ARG VITE_API_URL
grep -q "ARG VITE_API_URL" frontend/Dockerfile || echo "⚠️ ARG VITE_API_URL manquant dans Dockerfile"

# 4. Nettoyer et rebuild
docker-compose down frontend backend
docker rmi metro-frontend metro-backend 2>/dev/null || true
docker-compose build --no-cache frontend backend
docker-compose up -d frontend backend

# 5. Attendre et vérifier
sleep 15
docker-compose ps
curl http://localhost:5001/api/health
curl -I http://localhost:3000

# 6. Vérifier que les JS n'ont plus localhost:5001
docker-compose exec frontend grep -r "localhost:5001" /usr/share/nginx/html/assets/ 2>/dev/null || echo "✅ Aucune référence à localhost:5001"
```

## Vérification dans le navigateur

1. Ouvrez http://beta-test-metro.mabstudio.fr
2. Ouvrez la console (F12 → Console)
3. Vérifiez :
   - ❌ Aucune erreur JavaScript rouge
   - ✅ Les requêtes réseau (F12 → Network) utilisent `/api/...` et non `http://localhost:5001/api/...`
   - ✅ Les requêtes API retournent `200 OK`

## Si la page est toujours blanche

### Vérification 1 : Contenu du HTML

```bash
docker-compose exec frontend cat /usr/share/nginx/html/index.html
```

Le HTML doit contenir des balises `<script>` pointant vers des fichiers JS dans `/assets/`.

### Vérification 2 : Fichiers JavaScript

```bash
docker-compose exec frontend ls -la /usr/share/nginx/html/assets/
docker-compose exec frontend find /usr/share/nginx/html/assets -name "*.js" | head -5
```

### Vérification 3 : URL API dans les JS

```bash
docker-compose exec frontend grep -r "localhost:5001" /usr/share/nginx/html/assets/ 2>/dev/null
```

Si cette commande retourne des résultats, le frontend n'a pas été correctement rebuildé.

### Vérification 4 : Logs complets

```bash
docker-compose logs frontend --tail=50
docker-compose logs backend --tail=50
```

### Vérification 5 : Console du navigateur

Ouvrez F12 → Console et cherchez :
- `Failed to load resource` → Problème de chargement de fichier
- `CORS policy` → Problème CORS
- `Cannot read property` → Erreur JavaScript
- `Network Error` → Problème de connexion API

## Correction du backend unhealthy

Le backend est `unhealthy` mais fonctionne. Pour corriger :

```bash
# Vérifier que curl est installé dans le conteneur
docker-compose exec backend which curl

# Si curl n'est pas trouvé, rebuild le backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Correction du doublon nginx.conf

Le doublon `application/xml+rss` dans `nginx.conf` ligne 27 a été corrigé localement. Pour l'appliquer sur le VPS :

```bash
cd ~/apps/Metro
sed -i 's|application/xml+rss application/json application/javascript application/xml+rss|application/json application/javascript application/xml+rss|g' frontend/nginx.conf
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## Commandes de dépannage rapide

```bash
# Voir l'état actuel
docker-compose ps
docker-compose logs frontend --tail=20
docker-compose logs backend --tail=20

# Tester l'API
curl http://localhost:5001/api/health

# Tester le frontend
curl http://localhost:3000

# Voir le contenu HTML
docker-compose exec frontend cat /usr/share/nginx/html/index.html | head -50

# Voir les fichiers JS
docker-compose exec frontend ls -la /usr/share/nginx/html/assets/

# Rechercher localhost:5001 dans les JS
docker-compose exec frontend grep -r "localhost:5001" /usr/share/nginx/html/assets/ 2>/dev/null

# Rebuild complet
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Fichiers corrigés localement

✅ `frontend/src/services/api.ts`
✅ `frontend/src/services/interventionConfigService.ts`
✅ `docker-compose.yml` (VITE_API_URL=/api)
✅ `frontend/Dockerfile` (ARG VITE_API_URL=/api)
✅ `backend/Dockerfile.simple` (curl ajouté)
✅ `frontend/nginx.conf` (doublon corrigé)

Ces fichiers doivent être synchronisés sur le VPS (via Git ou copie manuelle) puis le frontend doit être rebuildé.


