# 🚀 Démarrage Rapide - Fonctionnalités du Compte

## ⚡ Une Seule Action Requise

Pour activer les nouvelles fonctionnalités du menu "Paramètres du compte" :

```bash
cd /Users/mabs/Documents/Metro/backend
npx prisma migrate deploy
npx prisma generate
```

**Durée** : 10 secondes

## ✅ Vérification Rapide

### 1. Démarrer l'Application

```bash
# Si pas encore fait, installer les dépendances
./install-dependencies.sh

# Démarrer
./start.sh
```

### 2. Tester les Fonctionnalités

1. **Se connecter** à http://localhost:5173
2. **Cliquer** sur votre nom (coin supérieur droit) → "Mon compte"
3. **Aller** sur l'onglet "Paramètres"

#### Test Changement de Mot de Passe ✅
- Cliquer sur "Changer le mot de passe"
- Remplir le formulaire
- Cliquer "Modifier le mot de passe"
- **Résultat** : Message de succès

#### Test Préférences ✅
- Cocher/décocher "Notifications par email"
- **Résultat** : Message "Préférence mise à jour"
- Recharger la page
- **Résultat** : État conservé

## 📋 Fonctionnalités Disponibles

### ✅ Opérationnelles Maintenant

| Fonctionnalité | Description |
|----------------|-------------|
| **Changer le mot de passe** | Modal avec validation complète |
| **Notifications email** | Activer/désactiver |
| **Notifications push** | Activer/désactiver |
| **Mode sombre** | Activer/désactiver |

### 🔜 Prochainement

| Fonctionnalité | Statut |
|----------------|--------|
| Authentification 2FA | Badge "Bientôt" affiché |
| Sessions actives | Badge "Bientôt" affiché |

## 🔧 En Cas de Problème

### Erreur : "Cannot find module accountController"

**Solution** :
```bash
cd backend
npm run build
# OU simplement redémarrer
npm run dev
```

### Erreur : "Column 'emailNotifications' does not exist"

**Solution** : Migration pas appliquée
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Mot de Passe Refusé

**Vérifier** :
- ✅ Minimum 8 caractères
- ✅ Au moins une majuscule
- ✅ Au moins une minuscule
- ✅ Au moins un chiffre

**Exemples valides** :
- `Password123`
- `Metro2024!`
- `Test1234`

### Préférences Ne Se Sauvegardent Pas

**Vérifier** :
1. Backend démarré : http://localhost:5000/api/health
2. Token valide (se reconnecter si besoin)
3. Migration appliquée (voir ci-dessus)

## 📊 Endpoints API Créés

```
GET    /api/account/profile          - Profil utilisateur
PATCH  /api/account/profile          - Modifier profil
POST   /api/account/change-password  - Changer mot de passe
GET    /api/account/preferences      - Lire préférences
PATCH  /api/account/preferences      - Modifier préférences
```

## 🎯 Utilisation Typique

### Scénario 1 : Premier Changement de Mot de Passe

```
1. Login avec mot de passe initial
2. Mon compte → Paramètres
3. Changer le mot de passe
4. Déconnexion
5. Reconnexion avec nouveau mot de passe
```

### Scénario 2 : Désactiver les Notifications

```
1. Mon compte → Paramètres
2. Décocher "Notifications par email"
3. Décocher "Notifications push"
4. Pas de bouton "Sauvegarder" : automatique !
```

### Scénario 3 : Activer le Mode Sombre

```
1. Mon compte → Paramètres
2. Cocher "Mode sombre"
3. (Fonctionnalité prête, thème à implémenter)
```

## 💡 Conseils

### Sécurité
- ✅ Changez régulièrement votre mot de passe
- ✅ Utilisez un mot de passe fort (12+ caractères recommandé)
- ✅ N'utilisez pas le même mot de passe ailleurs

### Performance
- ⚡ Les préférences sont mises à jour instantanément (optimistic updates)
- ⚡ Pas besoin de bouton "Sauvegarder"
- ⚡ Feedback immédiat avec toast notifications

### UX
- 🎨 Icons pour chaque fonctionnalité
- 🎨 Hover effects sur les boutons
- 🎨 Badges "Bientôt" pour transparence
- 🎨 Modal centrée et responsive

## 📚 Documentation Complète

Pour plus de détails, voir :
- **`ACCOUNT_FEATURES_IMPLEMENTATION.md`** - Documentation technique complète
- **`METRO_REPORTS.md`** - Rapport global des corrections

## ✅ Checklist de Démarrage

- [ ] Migration appliquée (`npx prisma migrate deploy`)
- [ ] Types Prisma générés (`npx prisma generate`)
- [ ] Backend démarré (port 5000)
- [ ] Frontend démarré (port 5173)
- [ ] Se connecter à l'application
- [ ] Tester changement de mot de passe
- [ ] Tester préférences notifications
- [ ] Confirmer que tout fonctionne

---

**Temps requis** : 2 minutes  
**Difficulté** : ⭐ Facile  
**Statut** : ✅ Prêt à l'emploi


