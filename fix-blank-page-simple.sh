#!/bin/bash
# Script simple de correction pour la page blanche
# À exécuter sur le VPS dans ~/apps/Metro

cd ~/apps/Metro

echo "🔧 Correction de la page blanche..."

# 1. Corriger api.ts
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/api.ts

# 2. Corriger interventionConfigService.ts  
sed -i "s|(import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api'|import.meta.env.VITE_API_URL || '/api'|g" frontend/src/services/interventionConfigService.ts

# 3. Rebuild frontend
echo "Reconstruction du frontend..."
docker-compose build --no-cache frontend

# 4. Redémarrer
echo "Redémarrage..."
docker-compose up -d --force-recreate frontend

echo "✅ Terminé ! Vérifiez http://beta-test-metro.mabstudio.fr"

