#!/bin/bash
# Script de correction des erreurs React et validation
# À exécuter sur le VPS

cd ~/apps/Metro

echo "🔧 Correction des erreurs React et validation..."
echo ""

# 1. Corriger errorHandler.ts pour gérer les objets {field, message}
echo "1. Correction de errorHandler.ts..."
if [ -f "frontend/src/utils/errorHandler.ts" ]; then
    # Remplacer la ligne qui assigne directement data.errors
    sed -i 's|details = data.errors;|details = data.errors.map((err: any) => {\
      if (typeof err === '\''string'\'') {\
        return err;\
      } else if (err && typeof err === '\''object'\'' && err.field && err.message) {\
        return `${err.field}: ${err.message}`;\
      } else if (err && typeof err === '\''object'\'' && err.message) {\
        return err.message;\
      } else {\
        return JSON.stringify(err);\
      }\
    });|g' frontend/src/utils/errorHandler.ts
    echo "   ✅ errorHandler.ts corrigé"
else
    echo "   ⚠️  frontend/src/utils/errorHandler.ts introuvable"
fi

# 2. Corriger validation.ts pour rendre typeId et siteId optionnels
echo "2. Correction de validation.ts..."
if [ -f "backend/src/middleware/validation.ts" ]; then
    sed -i "s|typeId: Joi.string().uuid().required(),|typeId: Joi.string().uuid().optional().allow(null, ''),|g" backend/src/middleware/validation.ts
    sed -i "s|siteId: Joi.string().uuid().required(),|siteId: Joi.string().uuid().optional().allow(null, ''),|g" backend/src/middleware/validation.ts
    echo "   ✅ validation.ts corrigé"
else
    echo "   ⚠️  backend/src/middleware/validation.ts introuvable"
fi

# 3. Rebuild
echo ""
echo "3. Reconstruction..."
docker-compose down frontend backend
docker-compose build --no-cache frontend backend
docker-compose up -d frontend backend

echo ""
echo "✅ Terminé !"
echo "Attendez 15 secondes puis testez la création d'instrument"


