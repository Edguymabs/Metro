#!/bin/bash
echo "🔍 DIAGNOSTIC SYSTÈME DE SAUVEGARDE SQL"
echo "════════════════════════════════════════"

cd ~/apps/Metro

echo ""
echo "1️⃣ Vérification des outils PostgreSQL dans le conteneur..."
docker-compose exec -T backend sh -c "which pg_dump"
docker-compose exec -T backend sh -c "which psql"
docker-compose exec -T backend sh -c "pg_dump --version"

echo ""
echo "2️⃣ Vérification du dossier backups..."
docker-compose exec -T backend sh -c "ls -la /app/backups 2>/dev/null || echo 'Dossier backups manquant'"
docker-compose exec -T backend sh -c "mkdir -p /app/backups && echo '✅ Dossier créé'"

echo ""
echo "3️⃣ Vérification des variables d'environnement..."
docker-compose exec -T backend sh -c "echo DATABASE_URL: \$DATABASE_URL"
docker-compose exec -T backend sh -c "echo BACKUP_DIR: \$BACKUP_DIR"

echo ""
echo "4️⃣ Test de connexion PostgreSQL..."
docker-compose exec -T backend sh -c "psql \$DATABASE_URL -c 'SELECT version();' 2>&1 | head -5"

echo ""
echo "5️⃣ Test de création backup (pg_dump)..."
docker-compose exec -T backend sh -c "pg_dump --help | head -5"

echo ""
echo "6️⃣ Vérification des logs backend récents..."
docker-compose logs backend --tail=20 | grep -i "backup\|error" || echo "Aucun log backup trouvé"

echo ""
echo "7️⃣ Test API backup (appel direct)..."
TOKEN=$(docker-compose exec -T backend sh -c "node -e \"const jwt = require('jsonwebtoken'); console.log(jwt.sign({userId: '1', email: 'admin@test.com', role: 'ADMIN'}, process.env.JWT_SECRET || 'test-secret', {expiresIn: '1h'}))\"")
echo "Token généré: ${TOKEN:0:20}..."

curl -s -X POST http://localhost:5001/api/backup/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq . || echo "Erreur API"

echo ""
echo "════════════════════════════════════════"
echo "✅ Diagnostic terminé"

