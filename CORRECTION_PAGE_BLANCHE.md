# Correction Page Blanche - Metro VPS

## Problème identifié

Le frontend affiche une page blanche car :
1. ❌ `api.ts` utilise `(import.meta as any).env?.VITE_API_URL` au lieu de `import.meta.env.VITE_API_URL`
2. ❌ `interventionConfigService.ts` a le même problème
3. ❌ Vite ne peut pas remplacer les variables d'environnement avec cette syntaxe incorrecte

## Corrections appliquées localement

✅ **frontend/src/services/api.ts** : Corrigé pour utiliser `import.meta.env.VITE_API_URL || '/api'`
✅ **frontend/src/services/interventionConfigService.ts** : Corrigé pour utiliser `import.meta.env.VITE_API_URL || '/api'`
✅ **docker-compose.yml** : `VITE_API_URL=/api` configuré dans les build args
✅ **frontend/Dockerfile** : `ARG VITE_API_URL=/api` configuré
✅ **backend/Dockerfile.simple** : `curl` ajouté pour le healthcheck

## Déploiement sur le VPS

### Option 1 : Via Git (Recommandé)

```bash
# Sur votre machine locale
cd /Users/mabs/Documents/Metro
git add frontend/src/services/api.ts frontend/src/services/interventionConfigService.ts docker-compose.yml frontend/Dockerfile backend/Dockerfile.simple
git commit -m "Fix: Correction page blanche - VITE_API_URL"
git push

# Sur le VPS
cd ~/apps/Metro
git pull
docker-compose build --no-cache frontend backend
docker-compose up -d --force-recreate frontend backend
```

### Option 2 : Script automatique

Copiez le script `fix-blank-page-vps.sh` sur le VPS et exécutez-le :

```bash
# Sur votre machine locale
scp fix-blank-page-vps.sh root@82.112.255.148:~/apps/Metro/

# Sur le VPS
cd ~/apps/Metro
chmod +x fix-blank-page-vps.sh
./fix-blank-page-vps.sh
```

### Option 3 : Corrections manuelles

Sur le VPS, exécutez ces commandes :

```bash
cd ~/apps/Metro

# 1. Corriger api.ts
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/api.ts

# 2. Corriger interventionConfigService.ts
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/interventionConfigService.ts

# 3. Rebuild frontend
docker-compose build --no-cache frontend

# 4. Redémarrer
docker-compose up -d --force-recreate frontend

# 5. Vérifier
docker-compose ps
docker-compose logs frontend --tail=20
curl http://localhost:3000
```

## Vérification

Après le déploiement, vérifiez :

1. **Conteneurs actifs** :
   ```bash
   docker-compose ps
   ```
   Tous les conteneurs doivent être `Up` et `healthy`

2. **Backend API** :
   ```bash
   curl http://localhost:5001/api/health
   ```
   Doit retourner `{"status":"OK",...}`

3. **Frontend** :
   ```bash
   curl -I http://localhost:3000
   ```
   Doit retourner `200 OK`

4. **Dans le navigateur** :
   - Ouvrez http://beta-test-metro.mabstudio.fr
   - Ouvrez la console (F12)
   - Vérifiez qu'il n'y a pas d'erreurs JavaScript
   - Vérifiez que les requêtes API utilisent `/api` et non `http://localhost:5001/api`

## Dépannage

Si la page est toujours blanche :

1. **Vérifier les logs** :
   ```bash
   docker-compose logs frontend --tail=50
   docker-compose logs backend --tail=50
   ```

2. **Vérifier la console du navigateur** (F12) :
   - Erreurs JavaScript ?
   - Requêtes API qui échouent ?
   - Erreurs CORS ?

3. **Vérifier le build** :
   ```bash
   docker-compose exec frontend cat /usr/share/nginx/html/index.html | head -20
   ```

4. **Vérifier les variables d'environnement** :
   ```bash
   docker-compose exec frontend env | grep VITE
   ```

5. **Rebuild complet** :
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Notes techniques

- Vite remplace `import.meta.env.VITE_API_URL` au moment du build
- La syntaxe `(import.meta as any).env?.VITE_API_URL` empêche Vite de faire le remplacement
- En production, l'URL `/api` est correcte car Nginx proxy vers `metro-backend:5000`
- Le healthcheck backend utilise `curl` qui doit être installé dans l'image Docker


