# 🎯 Instructions Plan de Guerre Metro

## Vue d'ensemble

Le **Plan de Guerre** est maintenant complet et prêt à être exécuté sur votre VPS pour résoudre définitivement les problèmes de validation et de backup SQL.

## ✅ Ce qui a été fait

### 1. Scripts Automatisés Créés (13 fichiers)

✅ **Scripts d'exécution** :
- `plan-guerre-master.sh` - Script principal interactif (45 min)
- `plan-guerre-rapide.sh` - Version automatique rapide (15 min)
- 10 scripts de phase individuels (phase1 à phase10)

✅ **Documentation** :
- `PLAN_GUERRE_README.md` - Guide complet d'utilisation
- `METRO_REPORTS.md` - Mis à jour avec Problème 7

### 2. Corrections Code Appliquées

✅ **backend/src/utils/backup.ts** :
- Nettoyage DATABASE_URL (suppression `?schema=public` pour pg_dump)
- Remplacement de tous les `console.log` par `logger`
- Création automatique du dossier backups

✅ **backend/src/middleware/validation.ts** (déjà corrigé) :
- `typeId` et `siteId` maintenant optionnels

✅ **backend/src/controllers/instrumentController.ts** (déjà corrigé) :
- Validation assouplie (seulement serialNumber et name requis)

### 3. Commit & Push

✅ Commit `21f2583` poussé sur GitHub
✅ 14 fichiers créés/modifiés
✅ 1869 lignes ajoutées

---

## 🚀 Ce que VOUS devez faire maintenant

### Option 1 : Exécution Rapide (RECOMMANDÉ)

**Durée** : 10-15 minutes  
**Idéal pour** : Déploiement rapide sans interaction

```bash
# 1. Connexion VPS (terminal hPanel ou SSH)
ssh root@beta-test-metro.mabstudio.fr

# 2. Aller dans le dossier Metro
cd ~/apps/Metro

# 3. Pull le dernier code avec les scripts
git pull origin main

# 4. Rendre les scripts exécutables
chmod +x plan-guerre-*.sh

# 5. Exécuter le plan rapide
bash plan-guerre-rapide.sh
```

**Ce que fait le script rapide** :
1. ✅ Diagnostic VPS
2. ✅ Mise à jour code (git pull)
3. ✅ Rebuild backend complet
4. ✅ Configuration post-démarrage
5. ✅ Tests API health
6. ✅ Test backup SQL manuel
7. ✅ Vérification logs
8. ✅ Test persistence

**Résultat attendu** :
```
✅ PLAN DE GUERRE RAPIDE TERMINÉ

État final:
NAME            IMAGE           STATUS
metro-backend   ...             Up (healthy)
metro-frontend  ...             Up
metro-postgres  ...             Up (healthy)

🧪 TESTS MANUELS REQUIS:
  1. https://beta-test-metro.mabstudio.fr
  2. Créer instrument sans type/site
  3. Créer backup depuis le frontend
```

---

### Option 2 : Exécution Complète Interactive (DÉTAILLÉE)

**Durée** : 40-60 minutes  
**Idéal pour** : Premier déploiement, validation complète

```bash
# 1-4. Même chose que Option 1
cd ~/apps/Metro && git pull origin main && chmod +x plan-guerre-*.sh

# 5. Exécuter le plan maître
bash plan-guerre-master.sh
```

**Avantage** :
- Pause entre chaque phase avec confirmation
- Tests manuels guidés (validation instruments, exports, etc.)
- Tests de régression complets (login, CRUD, dashboard)
- Génération automatique d'un rapport final `RAPPORT_TESTS_YYYYMMDD.md`

---

### Option 3 : Exécution Phase par Phase (DÉBOGAGE)

Si vous voulez exécuter seulement certaines phases :

```bash
# Diagnostic seulement
bash plan-guerre-phase1-diagnostic.sh

# Tests seulement
bash plan-guerre-phase5-tests.sh

# Génération rapport seulement
bash plan-guerre-phase10-doc.sh
```

---

## 🧪 Tests Manuels Requis

Après l'exécution du script, testez ces fonctionnalités critiques :

### Test 1 : Validation Instruments ⭐ CRITIQUE

1. Allez sur https://beta-test-metro.mabstudio.fr
2. Connectez-vous (admin@metro.fr / password123)
3. **Instruments** → **Nouveau**
4. Remplir SEULEMENT :
   - Numéro de série : `TEST-GUERRE-001`
   - Nom : `Test Plan de Guerre`
5. **Laisser Type et Site VIDES**
6. Cliquer **Créer**

**✅ Attendu** : Instrument créé sans erreur 400

---

### Test 2 : Backup SQL ⭐ CRITIQUE

1. **Mon compte** → **Sauvegardes** (onglet visible seulement pour admin)
2. Cliquer **Créer backup**
3. Attendre 2-5 secondes
4. Vérifier apparition dans la liste

**✅ Attendu** : Backup SQL créé avec nom `metro_backup_YYYY-MM-DD...`

---

### Test 3 : Export Excel (bonus)

1. Sauvegardes → **Export Sélectif**
2. Entité : **Instruments**
3. Format : **Excel**
4. Cliquer **Exporter**

**✅ Attendu** : Fichier `.xlsx` téléchargé

---

### Test 4 : Téléchargement Backup (bonus)

1. Dans la liste des backups, cliquer icône **Download** (flèche bas)
2. Vérifier téléchargement automatique

**✅ Attendu** : Fichier `.sql` ou `.sql.gz` téléchargé

---

## 📊 Rapport de Résultats

Après les tests, remplissez cette checklist :

```
# CHECKLIST VALIDATION PLAN DE GUERRE

## Infrastructure
- [ ] Git pull réussi (commit 21f2583)
- [ ] 3 conteneurs Up (docker-compose ps)
- [ ] API health OK (curl localhost:5001/api/health)
- [ ] Logs backend sans erreurs critiques
- [ ] Logs backend sans console.log

## Tests Critiques
- [ ] ✅ Test 1 : Création instrument sans type/site
- [ ] ✅ Test 2 : Création backup SQL
- [ ] Test 3 : Export Excel (optionnel)
- [ ] Test 4 : Téléchargement backup (optionnel)

## Validation Frontend
- [ ] Site accessible : https://beta-test-metro.mabstudio.fr
- [ ] Login fonctionne
- [ ] Dashboard s'affiche
- [ ] Liste instruments fonctionne

## État Final
- Système opérationnel : OUI / NON
- Problèmes restants : (noter ici)
```

---

## ❌ En Cas de Problème

### Problème : git pull échoue avec conflits

**Solution** :
```bash
cd ~/apps/Metro
git stash
git pull origin main
```

---

### Problème : Conteneurs ne démarrent pas

**Solution** :
```bash
cd ~/apps/Metro

# Rebuild complet
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d

# Attendre 20s et vérifier
sleep 20
docker-compose ps
```

---

### Problème : Test validation échoue encore

**Solution** :
```bash
# Vérifier logs backend
docker-compose logs backend --tail=50

# Vérifier que le code est à jour
cd ~/apps/Metro
git log -1 --oneline
# Devrait afficher: 21f2583 Feat: Plan de Guerre...
```

---

### Problème : Backup SQL échoue

**Solution** :
```bash
# Tester manuellement pg_dump
docker-compose exec backend sh -c '
  DBURL_CLEAN=$(echo $DATABASE_URL | cut -d"?" -f1)
  pg_dump $DBURL_CLEAN > /app/backups/test_manual.sql
  ls -lh /app/backups/test_manual.sql
'
```

Si ça échoue, vérifier que postgresql-client est installé :
```bash
docker-compose exec backend which pg_dump
# Doit retourner: /usr/bin/pg_dump
```

---

### Rollback Total

Si tout échoue et vous voulez revenir en arrière :

```bash
cd ~/apps/Metro

# Revenir au commit précédent (avant plan de guerre)
git log --oneline -10
git reset --hard 63e9bd3  # Commit précédent stable

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Récupérez les logs complets** :
   ```bash
   cd ~/apps/Metro
   docker-compose logs > logs_complets_$(date +%Y%m%d-%H%M%S).txt
   ```

2. **Vérifiez l'état des conteneurs** :
   ```bash
   docker-compose ps
   docker-compose logs backend --tail=100
   ```

3. **Partagez** :
   - Le message d'erreur exact
   - Les logs complets
   - La sortie de `git log -1 --oneline`
   - La sortie de `docker-compose ps`

---

## 🎉 Résumé

### Ce qui a été implémenté

✅ **13 scripts shell** pour automatisation complète  
✅ **Documentation** de 510 lignes (PLAN_GUERRE_README.md)  
✅ **Corrections code** pour validation et backup SQL  
✅ **Commit 21f2583** poussé sur GitHub  
✅ **Plan rollback** en cas d'échec  
✅ **20+ tests** automatisés et manuels  

### Ce que vous devez faire

1. ✅ `cd ~/apps/Metro && git pull origin main`
2. ✅ `chmod +x plan-guerre-*.sh`
3. ✅ `bash plan-guerre-rapide.sh` (ou `plan-guerre-master.sh`)
4. ✅ Tester validation instruments (sans type/site)
5. ✅ Tester création backup SQL
6. ✅ Me confirmer que tout fonctionne

### Durée totale

- **Pull + chmod + script rapide** : 10-15 minutes
- **Tests manuels** : 5 minutes
- **Total** : ~20 minutes

---

**Bonne chance ! Le système devrait être 100% fonctionnel après exécution. 🚀**

**Dernière mise à jour** : 10 décembre 2025  
**Commit** : 21f2583

