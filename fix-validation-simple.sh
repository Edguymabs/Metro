#!/bin/bash
cd ~/apps/Metro

echo "🔧 Correction validation instruments..."

# Fix validation.ts
docker-compose exec -T backend sed -i 's/typeId: Joi.string().uuid().required()/typeId: Joi.string().uuid().optional().allow(null, '\'''\'')/g' src/middleware/validation.ts
docker-compose exec -T backend sed -i 's/siteId: Joi.string().uuid().required()/siteId: Joi.string().uuid().optional().allow(null, '\'''\'')/g' src/middleware/validation.ts
docker-compose exec -T backend sed -i "s/brand: Joi.string().max(50).optional().allow('')/brand: Joi.string().max(50).optional().allow('', null)/g" src/middleware/validation.ts
docker-compose exec -T backend sed -i "s/model: Joi.string().max(50).optional().allow('')/model: Joi.string().max(50).optional().allow('', null)/g" src/middleware/validation.ts

# Fix instrumentController.ts - validation basique
docker-compose exec -T backend sed -i 's/if (!serialNumber || !name || !typeId || !siteId)/if (!serialNumber || !name)/g' src/controllers/instrumentController.ts

# Rebuild et redémarrer
docker-compose build --no-cache backend
docker-compose up -d backend

sleep 15
echo "✅ Fait! Testez maintenant"

