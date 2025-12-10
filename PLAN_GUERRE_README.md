# Plan de Guerre Metro - Guide d'Utilisation

## Vue d'Ensemble

Le **Plan de Guerre** est une suite de scripts automatisés pour corriger définitivement tous les problèmes du système Metro et garantir un déploiement VPS 100% fonctionnel.

## Problèmes Résolus

1. ✅ **Validation instruments** - Erreur 400 lors création sans type/site
2. ✅ **Système de sauvegarde SQL** - Backups impossibles à créer

## Scripts Disponibles

### 1. Script Maître (Recommandé)

```bash
bash plan-guerre-master.sh
```

**Utilisation** : Interactif avec confirmations entre chaque phase
**Durée** : 45 minutes
**Idéal pour** : Première exécution, déploiement important

### 2. Script Rapide

```bash
bash plan-guerre-rapide.sh
```

**Utilisation** : Non-interactif, exécution automatique
**Durée** : 10-15 minutes
**Idéal pour** : Re-déploiement rapide, CI/CD

### 3. Scripts Individuels

Exécutez une phase spécifique :

```bash
bash plan-guerre-phase1-diagnostic.sh   # Diagnostic VPS
bash plan-guerre-phase2-git-update.sh   # Mise à jour code
bash plan-guerre-phase3-rebuild.sh      # Rebuild backend
bash plan-guerre-phase4-config.sh       # Configuration
bash plan-guerre-phase5-tests.sh        # Tests fonctionnels
bash plan-guerre-phase6-logs.sh         # Vérification logs
bash plan-guerre-phase7-persistence.sh  # Test persistence
bash plan-guerre-phase8-volume.sh       # Volume Docker (opt)
bash plan-guerre-phase9-regression.sh   # Tests régression
bash plan-guerre-phase10-doc.sh         # Documentation
```

## Installation sur le VPS

### Méthode 1 : Via Git (Recommandé)

```bash
cd ~/apps/Metro
git pull origin main
chmod +x plan-guerre-*.sh
bash plan-guerre-master.sh
```

### Méthode 2 : Upload Manuel

Si Git pose problème :

1. Téléchargez tous les scripts `plan-guerre-*.sh`
2. Uploadez-les via hPanel File Manager dans `~/apps/Metro`
3. Via terminal hPanel :
   ```bash
   cd ~/apps/Metro
   chmod +x plan-guerre-*.sh
   bash plan-guerre-master.sh
   ```

## Phases du Plan

### Phase 1 : Diagnostic Complet VPS (5 min)

- Vérification version Git
- État des conteneurs Docker
- Logs backend
- Test API health
- Vérification postgresql-client
- Dossier backups

**Points de contrôle** :
- Commit Git = `63e9bd3`
- 3 conteneurs Up
- pg_dump disponible
- /app/backups existe

---

### Phase 2 : Mise à Jour Forcée Code (3 min)

- Git stash (sauvegarde modifications locales)
- Nettoyage fichiers temporaires
- Git pull
- Vérification commit

**Point de contrôle** : Commit `63e9bd3` confirmé

---

### Phase 3 : Reconstruction Propre Backend (4 min)

- Création dossier backups
- Docker-compose down
- Build --no-cache backend
- Docker-compose up -d
- Attente stabilisation (20s)

**Point de contrôle** : 3 conteneurs Up

---

### Phase 4 : Configuration Post-Démarrage (2 min)

- Création /app/backups dans conteneur
- Vérification postgresql-client
- Test connexion DB

**Points de contrôle** :
- Dossier backups accessible
- pg_dump disponible
- DB connectée

---

### Phase 5 : Tests Fonctionnels Exhaustifs (10 min)

#### Test 1 : API Health
```bash
curl http://localhost:5001/api/health
```
**Attendu** : `{"status":"OK"}`

#### Test 2 : Validation Instruments
**Frontend** : Créer instrument sans type/site
**Attendu** : Création réussie

#### Test 3 : Backup SQL
```bash
pg_dump $DATABASE_URL > /app/backups/test.sql
```
**Attendu** : Fichier .sql créé

#### Test 4 : Export Excel
**Frontend** : Paramètres → Sauvegardes → Export
**Attendu** : Fichier .xlsx téléchargé

---

### Phase 6 : Vérifications Logs & Sécurité (2 min)

- Vérification absence console.log
- Logs backup
- Erreurs TypeScript
- Erreurs critiques

**Attendu** : Aucune erreur critique

---

### Phase 7 : Persistence & Robustesse (3 min)

- Liste backups avant restart
- Restart backend
- Vérification backups après restart

**Attendu** : Backups persistés

**Si échec** : Passer à Phase 8 (Volume Docker)

---

### Phase 8 : Amélioration Volume Docker (5 min, Optionnel)

- Modification docker-compose.yml
- Ajout volume backend_backups
- Rebuild et redémarrage

**Attendu** : Volume persistent après restart

---

### Phase 9 : Tests de Régression (5 min)

Tests manuels :
1. Login/Logout
2. Liste instruments
3. Modification instrument
4. Suppression instrument
5. Création intervention
6. Création site
7. Dashboard

**Attendu** : Toutes fonctionnalités OK

---

### Phase 10 : Documentation Finale (2 min)

- Génération rapport tests
- État système
- Logs importants
- Recommandations

**Livrable** : `RAPPORT_TESTS_YYYYMMDD.md`

---

## Checklist Finale

Avant de considérer le plan réussi :

- [ ] Git commit = `63e9bd3`
- [ ] 3 conteneurs Up
- [ ] API health retourne OK
- [ ] Création instrument sans type/site ✅
- [ ] Création backup SQL ✅
- [ ] Liste backups affiche fichiers
- [ ] Téléchargement backup fonctionne
- [ ] Logs backend propres
- [ ] Tests régression passés

## Rollback en Cas d'Échec

Si tout échoue :

```bash
cd ~/apps/Metro

# Identifier commit qui marchait
git log --oneline -20

# Revenir en arrière
git reset --hard COMMIT_QUI_MARCHAIT

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Temps Estimés

| Phase | Durée | Type |
|-------|-------|------|
| 1-4 | 15 min | Automatique |
| 5 | 10 min | Semi-automatique |
| 6-7 | 5 min | Automatique |
| 8 | 5 min | Optionnel |
| 9 | 5 min | Manuel |
| 10 | 2 min | Automatique |
| **Total** | **45 min** | **Script maître** |
| **Rapide** | **10-15 min** | **Script rapide** |

## Support

### Logs Complets

```bash
docker-compose logs > logs_$(date +%Y%m%d-%H%M%S).txt
```

### État Base de Données

```bash
docker-compose exec postgres psql -U metro_user -d metro_db -c "\dt"
```

### Espace Disque

```bash
df -h
docker system df
```

## Diagramme de Flux

```
Début
  ↓
Phase 1: Diagnostic
  ↓
Code à jour? → Non → Phase 2: Git Pull
  ↓ Oui               ↓
Phase 3: Rebuild Backend
  ↓
Phase 4: Configuration
  ↓
Phase 5: Tests Fonctionnels
  ↓
Tous tests OK? → Non → Debug & Fix → Phase 5
  ↓ Oui
Phase 6: Logs
  ↓
Phase 7: Persistence
  ↓
Phase 8: Volume (opt)
  ↓
Phase 9: Régression
  ↓
Tout OK? → Non → Debug
  ↓ Oui
Phase 10: Documentation
  ↓
✅ Système Opérationnel
```

## Fichiers Générés

Après exécution du plan :

- `RAPPORT_TESTS_YYYYMMDD.md` - Rapport complet des tests
- `docker-compose.yml.backup-*` - Backup docker-compose (si Phase 8)
- Fichiers `.sql` dans `/app/backups` - Backups test

## FAQ

### Q: Le script plante à la Phase 3 (rebuild)

**R**: Erreur de build TypeScript probable.
```bash
docker-compose logs backend
# Corriger les erreurs TS, puis relancer
bash plan-guerre-phase3-rebuild.sh
```

### Q: pg_dump non trouvé

**R**: Installer postgresql-client :
```bash
docker-compose exec backend apk add --no-cache postgresql-client
bash plan-guerre-phase4-config.sh
```

### Q: Backups perdus après restart (Phase 7)

**R**: Normal sans volume Docker. Exécutez Phase 8 :
```bash
bash plan-guerre-phase8-volume.sh
```

### Q: Tests frontend échouent

**R**: Vérifier :
1. Frontend accessible : `https://beta-test-metro.mabstudio.fr`
2. Login fonctionne
3. Console browser (F12) pour erreurs
4. Logs backend : `docker-compose logs backend --tail=100`

---

**Dernière mise à jour** : 10 décembre 2025  
**Version** : 1.0  
**Statut** : Production Ready

