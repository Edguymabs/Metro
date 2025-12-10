#!/bin/bash
set -e

echo "🔍 Diagnostic et correction erreur validation instruments..."
cd ~/apps/Metro

# 1. Capturer les logs backend avec l'erreur
echo "📋 Vérification des logs backend..."
docker-compose logs backend --tail=100 > /tmp/backend-logs.txt 2>&1 || true

# 2. Vérifier le contenu actuel de validation.ts
echo "📋 État actuel de la validation..."
docker-compose exec -T backend cat src/middleware/validation.ts | grep -A 10 "instrument:" | head -15

# 3. Correction du fichier validation.ts
echo "🔧 Correction validation.ts..."
docker-compose exec -T backend sh -c 'cat > /tmp/fix-validation.js << '\''ENDJS'\''
const fs = require("fs");
const file = "src/middleware/validation.ts";
let content = fs.readFileSync(file, "utf8");

// S'\''assurer que typeId et siteId sont optionnels
content = content.replace(
  /typeId:\s*Joi\.string\(\)\.uuid\(\)\.required\(\)/g,
  "typeId: Joi.string().uuid().optional().allow(null, '\'''\'')"
);
content = content.replace(
  /siteId:\s*Joi\.string\(\)\.uuid\(\)\.required\(\)/g,
  "siteId: Joi.string().uuid().optional().allow(null, '\'''\'')"
);

// S'\''assurer que brand, model, internalReference acceptent null
content = content.replace(
  /brand:\s*Joi\.string\(\)\.max\(50\)\.optional\(\)\.allow\('\'\''\)/g,
  "brand: Joi.string().max(50).optional().allow('\''\'', null)"
);
content = content.replace(
  /model:\s*Joi\.string\(\)\.max\(50\)\.optional\(\)\.allow\('\'\''\)/g,
  "model: Joi.string().max(50).optional().allow('\''\'', null)"
);
content = content.replace(
  /internalReference:\s*Joi\.string\(\)\.max\(50\)\.optional\(\)\.allow\('\'\''\)/g,
  "internalReference: Joi.string().max(50).optional().allow('\''\'', null)"
);

fs.writeFileSync(file, content);
console.log("✅ validation.ts corrigé");
ENDJS
node /tmp/fix-validation.js'

# 4. Correction du controller instrumentController.ts
echo "🔧 Correction instrumentController.ts..."
docker-compose exec -T backend sh -c 'cat > /tmp/fix-controller.js << '\''ENDJS'\''
const fs = require("fs");
const file = "src/controllers/instrumentController.ts";
let content = fs.readFileSync(file, "utf8");

// Fix 1: Validation basique - seulement serialNumber et name requis
const basicValidationRegex = /if\s*\(\s*!serialNumber\s*\|\|\s*!name\s*\|\|\s*!typeId\s*\|\|\s*!siteId\s*\)/g;
if (basicValidationRegex.test(content)) {
  content = content.replace(
    basicValidationRegex,
    "if (!serialNumber || !name)"
  );
  console.log("✅ Validation basique corrigée");
}

// Fix 2: Ajouter uuidFields dans cleanOptionalFields
const cleanFieldsRegex = /cleanOptionalFields\(\s*{[\s\S]*?numberFields:\s*\['purchasePrice'\]\s*}\)/;
if (cleanFieldsRegex.test(content) && !content.includes("uuidFields")) {
  content = content.replace(
    /numberFields:\s*\['purchasePrice'\]\s*}\)/g,
    "numberFields: ['\'purchasePrice\'],\n      uuidFields: ['\'typeId\', '\'siteId\', '\'calibrationCalendarId\']\n    })"
  );
  console.log("✅ uuidFields ajouté");
}

fs.writeFileSync(file, content);
console.log("✅ instrumentController.ts corrigé");
ENDJS
node /tmp/fix-controller.js'

# 5. Vérification des changements
echo ""
echo "📋 Vérification typeId/siteId dans validation.ts:"
docker-compose exec -T backend cat src/middleware/validation.ts | grep -E "typeId:|siteId:" | head -2

echo ""
echo "📋 Vérification uuidFields dans instrumentController.ts:"
docker-compose exec -T backend cat src/controllers/instrumentController.ts | grep -A 2 "numberFields:"

# 6. Rebuild backend
echo ""
echo "🔨 Rebuild du backend..."
docker-compose build --no-cache backend

# 7. Redémarrage
echo "🔄 Redémarrage du backend..."
docker-compose up -d backend

# 8. Attendre que le backend soit prêt
echo "⏳ Attente du démarrage (15s)..."
sleep 15

# 9. Test de santé
echo "🏥 Test de santé du backend..."
curl -s http://localhost:5001/api/health | jq . || curl -s http://localhost:5001/api/health

echo ""
echo "✅ Corrections appliquées!"
echo ""
echo "🧪 Testez maintenant la création d'instrument depuis le frontend"
echo ""
echo "📋 Pour voir les logs en temps réel:"
echo "   docker-compose logs -f backend"

