# 🚀 Quick Start - Après Corrections

## ✅ Problème Résolu
L'erreur **"Données invalides"** lors de la modification d'étalonnage est maintenant corrigée !

## 📦 Démarrage

### Option 1 : Démarrage Complet (Recommandé)

```bash
# Depuis la racine du projet
cd /Users/mabs/Documents/Metro

# Démarrer tous les services
./start.sh
```

### Option 2 : Démarrage Manuel

**Terminal 1 - Base de données**
```bash
docker-compose up postgres
```

**Terminal 2 - Backend**
```bash
cd backend
npm install  # Si première fois
npm run dev
```

**Terminal 3 - Frontend**
```bash
cd frontend
npm install  # Si première fois
npm run dev
```

## 🧪 Vérification Rapide

### 1. Backend OK ?
Ouvrir http://localhost:3000/api/health
- ✅ Doit retourner `{"status": "ok"}`

### 2. Frontend OK ?
Ouvrir http://localhost:5173
- ✅ Page de login doit s'afficher

### 3. Tester l'Étalonnage
1. Se connecter
2. Menu "Instruments"
3. Cliquer sur un instrument (ex: pHmètre)
4. Cliquer "Modifier"
5. Section "Étalonnage" → Changer la méthode
6. Cliquer "Enregistrer"
7. ✅ **"Instrument modifié avec succès"** (plus d'erreur !)

## 🔍 Logs à Vérifier

Dans le terminal du **backend**, vous devriez voir :

```
🔍 Validation des données: {
  "serialNumber": "Test",
  "name": "pHmètre",
  ...
  "calibrationMethodId": "xxx",
  "calibrationFrequencyValue": 12
}
✅ Validation réussie
```

Si erreur :
```
❌ Erreurs de validation: [...]
```
→ Voir `TEST_CALIBRATION.md` pour diagnostiquer

## 📋 Checklist Post-Déploiement

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Connexion à la base de données OK
- [ ] Login fonctionne
- [ ] Création d'instrument fonctionne
- [ ] **Modification d'instrument avec étalonnage fonctionne** ✅
- [ ] Pas d'erreur "Données invalides"

## 🛠️ En Cas de Problème

### Erreur : "npm: command not found"
```bash
# Installer Node.js via Homebrew
brew install node

# Ou via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
```

### Erreur : "Port 3000 déjà utilisé"
```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)
```

### Erreur : "Base de données inaccessible"
```bash
# Vérifier que Docker tourne
docker ps

# Redémarrer PostgreSQL
docker-compose restart postgres
```

## 📚 Documentation

- **Rapport complet** : `METRO_REPORTS.md`
- **Résumé de la solution** : `SOLUTION_SUMMARY.md`
- **Guide de test** : `TEST_CALIBRATION.md`
- **Architecture** : `docs/ARCHITECTURE.md`
- **Guide utilisateur** : `docs/GUIDE_UTILISATEUR.md`

## 🎯 Prochaines Étapes

1. ✅ Tester la modification d'étalonnage (RÉSOLU)
2. Tester la création avec différentes méthodes
3. Vérifier les autres fonctionnalités (interventions, mouvements)
4. Backup de la base de données

## 💡 Conseil

Si vous rencontrez d'autres problèmes, **activez les logs détaillés** :

**Backend** (`server.ts`) :
```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend** (console navigateur) :
Ouvrir les DevTools → Network → Filtrer par "instruments"

---

*Dernière mise à jour : 23 octobre 2025*
*Problème résolu : Erreur "Données invalides" lors modification étalonnage*


