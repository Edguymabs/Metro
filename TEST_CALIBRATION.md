# Test de la Fonctionnalité d'Étalonnage

## Problème Résolu
L'erreur "Données invalides" lors de la modification d'un instrument avec configuration d'étalonnage.

## Correctifs Appliqués

### 1. Backend - Validation (`validation.ts`)
- ✅ Ajout de `allowUnknown: true` dans les options Joi
- ✅ Utilisation de `Joi.alternatives()` pour champs flexibles
- ✅ Ajout de logs de débogage

### 2. Backend - Contrôleur (`instrumentController.ts`)
- ✅ Gestion de tous les champs d'étalonnage
- ✅ Conversion correcte des types

### 3. Frontend - Types (`types/index.ts`)
- ✅ Ajout des types `RecurrenceType`, `ToleranceUnit`, `DayOfWeek`
- ✅ Enrichissement de l'interface `Instrument`

### 4. Frontend - Formulaire (`InstrumentFormPage.tsx`)
- ✅ Chargement de la configuration d'étalonnage lors de l'édition
- ✅ Détection automatique du mode (méthode vs avancé)

## Tests à Effectuer

### Test 1 : Création d'un Instrument avec Méthode Prédéfinie
1. Aller sur "Instruments" → "Nouvel instrument"
2. Remplir les champs obligatoires
3. Section "Étalonnage" → Sélectionner "Méthode prédéfinie"
4. Choisir "Étalonnage pHmètre Acide"
5. Cliquer "Créer l'instrument"
6. **Résultat attendu** : Instrument créé avec succès

### Test 2 : Création avec Configuration Avancée
1. Aller sur "Instruments" → "Nouvel instrument"
2. Remplir les champs obligatoires
3. Section "Étalonnage" → Sélectionner "Étalonnage personnalisé"
4. Configurer :
   - Type : Intervalle fixe
   - Fréquence : 6 mois
   - Tolérance : 2 jours
5. Cliquer "Créer l'instrument"
6. **Résultat attendu** : Instrument créé avec succès

### Test 3 : Modification avec Méthode Prédéfinie (CAS INITIAL)
1. Aller sur la liste des instruments
2. Cliquer sur "pHmètre" (Test / ph 046)
3. Cliquer "Modifier"
4. Section "Étalonnage" → Vérifier que "Méthode prédéfinie" est sélectionné
5. Vérifier que "Étalonnage pHmètre Acide" est sélectionné
6. Changer pour une autre méthode si besoin
7. Cliquer "Enregistrer"
8. **Résultat attendu** : ✅ Modification réussie (plus d'erreur "Données invalides")

### Test 4 : Modification de la Configuration
1. Modifier un instrument existant
2. Changer le mode d'étalonnage de "Méthode prédéfinie" vers "Personnalisé"
3. Configurer :
   - Type : Jour(s) de la semaine
   - Sélectionner : Lundi, Mercredi, Vendredi
   - Tolérance : 1 semaine
4. Cliquer "Enregistrer"
5. **Résultat attendu** : Modification réussie

### Test 5 : Édition Sans Modification
1. Modifier un instrument existant
2. Ne rien changer
3. Cliquer "Enregistrer"
4. **Résultat attendu** : Enregistrement réussi sans erreur

## Vérifications dans les Logs du Serveur

Quand vous testez, vous verrez maintenant dans les logs du backend :

```
🔍 Validation des données: {
  "serialNumber": "Test",
  "internalReference": "ph 046",
  "name": "pHmètre",
  ...
  "calibrationMethodId": "xxx-xxx-xxx",
  "calibrationFrequencyValue": 12,
  "calibrationFrequencyUnit": "MONTHS"
}
✅ Validation réussie
```

Si erreur :
```
❌ Erreurs de validation: [
  { field: "xxx", message: "..." }
]
```

## Commandes pour Tester

### Démarrer le Backend
```bash
cd /Users/mabs/Documents/Metro/backend
npm run dev
```

### Démarrer le Frontend
```bash
cd /Users/mabs/Documents/Metro/frontend
npm run dev
```

## Points de Vigilance

1. **Valeurs vides vs null** : Le frontend peut envoyer `""` ou `null` - les deux sont acceptés
2. **TypeId et SiteId** : Toujours requis, doivent être des UUIDs valides
3. **Mode d'étalonnage** : Soit `calibrationMethodId` (méthode), soit `advancedConfig` (personnalisé)

## En Cas de Problème

Si l'erreur persiste :
1. Vérifier les logs du backend (console)
2. Vérifier la console du navigateur (Network tab)
3. Vérifier que les deux serveurs sont démarrés
4. Vérifier les fichiers modifiés :
   - `backend/src/middleware/validation.ts`
   - `backend/src/controllers/instrumentController.ts`
   - `frontend/src/types/index.ts`
   - `frontend/src/pages/InstrumentFormPage.tsx`


