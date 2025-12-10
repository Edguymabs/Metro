# Correction Erreur Validation Instruments

## Problème

Erreur 400 "Erreur de validation" lors de la création d'un instrument.

## Causes Identifiées

### 1. Validation Joi trop stricte (`backend/src/middleware/validation.ts`)

- `typeId` et `siteId` marqués comme `required()` alors qu'ils devraient être optionnels
- `brand`, `model`, `internalReference` n'acceptent pas `null`

### 2. Validation basique trop stricte (`backend/src/controllers/instrumentController.ts`)

- Ligne ~124: `if (!serialNumber || !name || !typeId || !siteId)` rejette les instruments sans type/site
- `cleanOptionalFields` ne nettoie pas les UUID vides (`typeId`, `siteId`)

## Solution

J'ai créé 2 scripts de correction automatique :

### Option 1: Script Complet (Recommandé)

```bash
# Sur le VPS
cd ~/apps/Metro
bash <(curl -s https://raw.githubusercontent.com/VOTRE_USER/Metro/main/fix-validation-complete.sh)
```

**OU** si vous avez déjà le projet :

```bash
cd ~/apps/Metro
./fix-validation-complete.sh
```

Ce script :
- ✅ Diagnostique l'erreur
- ✅ Corrige `validation.ts`
- ✅ Corrige `instrumentController.ts`
- ✅ Rebuild le backend
- ✅ Redémarre les services
- ✅ Affiche les logs de vérification

### Option 2: Script Simple (Rapide)

```bash
cd ~/apps/Metro
./fix-validation-simple.sh
```

Version minimaliste sans diagnostics.

## Corrections Appliquées

### 1. `backend/src/middleware/validation.ts`

```typescript
// AVANT
typeId: Joi.string().uuid().required(),
siteId: Joi.string().uuid().required(),
brand: Joi.string().max(50).optional().allow(''),
model: Joi.string().max(50).optional().allow(''),

// APRÈS
typeId: Joi.string().uuid().optional().allow(null, ''),
siteId: Joi.string().uuid().optional().allow(null, ''),
brand: Joi.string().max(50).optional().allow('', null),
model: Joi.string().max(50).optional().allow('', null),
```

### 2. `backend/src/controllers/instrumentController.ts`

```typescript
// AVANT - Ligne ~124
if (!serialNumber || !name || !typeId || !siteId) {
  return res.status(400).json({
    message: 'Certains champs requis sont manquants'
  });
}

// APRÈS
if (!serialNumber || !name) {
  return res.status(400).json({
    message: 'Certains champs requis sont manquants'
  });
}

// AVANT - Ligne ~182
const cleanedData = cleanOptionalFields({
  ...validatedData,
  ...recurrenceData
}, {
  numberFields: ['purchasePrice']
});

// APRÈS
const cleanedData = cleanOptionalFields({
  ...validatedData,
  ...recurrenceData
}, {
  numberFields: ['purchasePrice'],
  uuidFields: ['typeId', 'siteId', 'calibrationCalendarId']
});
```

## Transfert des Scripts sur le VPS

### Méthode 1: Copier/Coller Direct

```bash
# Connectez-vous au VPS via hPanel Terminal
cd ~/apps/Metro

# Créer le script
cat > fix-validation.sh << 'EOF'
#!/bin/bash
cd ~/apps/Metro

# Corrections
docker-compose exec -T backend sed -i 's/typeId: Joi.string().uuid().required()/typeId: Joi.string().uuid().optional().allow(null, '\'''\'')/g' src/middleware/validation.ts
docker-compose exec -T backend sed -i 's/siteId: Joi.string().uuid().required()/siteId: Joi.string().uuid().optional().allow(null, '\'''\'')/g' src/middleware/validation.ts
docker-compose exec -T backend sed -i "s/brand: Joi.string().max(50).optional().allow('')/brand: Joi.string().max(50).optional().allow('', null)/g" src/middleware/validation.ts
docker-compose exec -T backend sed -i "s/model: Joi.string().max(50).optional().allow('')/model: Joi.string().max(50).optional().allow('', null)/g" src/middleware/validation.ts
docker-compose exec -T backend sed -i 's/if (!serialNumber || !name || !typeId || !siteId)/if (!serialNumber || !name)/g' src/controllers/instrumentController.ts

# Rebuild
docker-compose build --no-cache backend
docker-compose up -d backend
sleep 15
echo "✅ Fait!"
EOF

chmod +x fix-validation.sh
./fix-validation.sh
```

### Méthode 2: Via Git (depuis votre Mac)

```bash
# Sur votre Mac
cd /Users/mabs/Documents/Metro
git add fix-validation-*.sh
git commit -m "Fix: validation instruments"
git push

# Sur le VPS
cd ~/apps/Metro
git pull
chmod +x fix-validation-simple.sh
./fix-validation-simple.sh
```

## Vérification Post-Correction

```bash
# Vérifier que le backend est OK
curl http://localhost:5001/api/health

# Voir les logs en temps réel
docker-compose logs -f backend

# Tester la création d'un instrument minimal
curl -X POST http://localhost:5001/api/instruments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "serialNumber": "TEST-001",
    "name": "Instrument Test"
  }'
```

## Test Frontend

1. Ouvrez https://beta-test-metro.mabstudio.fr
2. Connectez-vous
3. Allez dans **Instruments** → **Nouveau**
4. Remplissez **uniquement** :
   - Numéro de série
   - Nom
5. Laissez Type et Site **vides**
6. Cliquez **Créer**

**Résultat attendu** : ✅ Instrument créé avec succès

## En Cas de Problème

```bash
# Voir les logs détaillés
docker-compose logs backend --tail=100

# Vérifier les changements appliqués
docker-compose exec backend grep -A 2 "typeId:" src/middleware/validation.ts
docker-compose exec backend grep "if (!serialNumber" src/controllers/instrumentController.ts

# Rebuild complet si nécessaire
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Pourquoi Cette Erreur ?

1. **Intention initiale** : Forcer les utilisateurs à choisir un type et un site
2. **Réalité UX** : Les utilisateurs doivent pouvoir créer rapidement des instruments et compléter plus tard
3. **Solution** : Type et site deviennent optionnels, validés seulement s'ils sont fournis

## Prochaines Étapes

Une fois corrigé, tester ces scénarios :

- ✅ Création instrument minimal (serialNumber + name)
- ✅ Création instrument complet (avec type + site)
- ✅ Création avec brand/model null
- ✅ Modification d'un instrument existant
- ✅ Import CSV d'instruments

---

**Dernière mise à jour** : 9 décembre 2025  
**Statut** : 🔧 Scripts prêts - Correction à appliquer sur VPS

