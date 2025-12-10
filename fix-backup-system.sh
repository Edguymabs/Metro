#!/bin/bash
set -e

echo "🔧 CORRECTION SYSTÈME DE SAUVEGARDE SQL"
echo "════════════════════════════════════════"

cd ~/apps/Metro

echo ""
echo "1️⃣ Création du dossier backups..."
docker-compose exec -T backend mkdir -p /app/backups
docker-compose exec -T backend chmod 755 /app/backups
echo "✅ Dossier backups créé"

echo ""
echo "2️⃣ Vérification de postgresql-client..."
docker-compose exec -T backend sh -c "apk info | grep postgresql-client" || {
  echo "⚠️  Installation de postgresql-client..."
  docker-compose exec -T backend apk add --no-cache postgresql-client
}
echo "✅ postgresql-client installé"

echo ""
echo "3️⃣ Test de connexion base de données..."
docker-compose exec -T backend sh -c "
  psql \$DATABASE_URL -c 'SELECT 1 as test;' 2>&1
" && echo "✅ Connexion OK" || echo "❌ Erreur de connexion"

echo ""
echo "4️⃣ Test de création backup simple..."
docker-compose exec -T backend sh -c "
  cd /app
  DATABASE_URL=\$DATABASE_URL node -e \"
    const { backupManager } = require('./dist/utils/backup');
    (async () => {
      const result = await backupManager.createFullBackup();
      if (result.success) {
        console.log('✅ Backup créé:', result.filename);
      } else {
        console.error('❌ Erreur:', result.error);
      }
    })();
  \"
"

echo ""
echo "5️⃣ Liste des backups créés..."
docker-compose exec -T backend sh -c "ls -lh /app/backups/"

echo ""
echo "════════════════════════════════════════"
echo "✅ Correction terminée"
echo ""
echo "🧪 TESTER MAINTENANT:"
echo "   1. Allez sur https://beta-test-metro.mabstudio.fr"
echo "   2. Paramètres → Sauvegardes"
echo "   3. Créer une sauvegarde"

