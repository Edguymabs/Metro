# 🔐 Guide de Génération des Secrets - Metro

## ⚠️ CRITIQUE : À Faire AVANT Tout Déploiement

**NE JAMAIS** utiliser les secrets par défaut en production. Ils sont publics et compromettent totalement la sécurité de l'application.

---

## 1. Génération Automatique (Recommandé)

### Sur Linux/MacOS

```bash
# Aller à la racine du projet
cd /chemin/vers/Metro

# Générer tous les secrets d'un coup
cat > .env.production << 'EOF'
# Secrets générés le $(date)
POSTGRES_USER=metro
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
POSTGRES_DB=metro_db

JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

FRONTEND_URL=https://votre-domaine.com
PORT=5000
NODE_ENV=production
UPLOAD_DIR=/app/uploads
BACKUP_DIR=/app/backups

VITE_API_URL=https://votre-domaine.com/api
EOF

# Afficher le fichier généré
cat .env.production
```

### Sur Windows (PowerShell)

```powershell
# Fonction pour générer un secret fort
function New-Secret {
    $bytes = New-Object Byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

# Créer le fichier .env.production
$jwt = New-Secret
$encryption = New-Secret
$db = New-Secret

@"
POSTGRES_USER=metro
POSTGRES_PASSWORD=$db
POSTGRES_DB=metro_db

JWT_SECRET=$jwt
ENCRYPTION_KEY=$encryption

FRONTEND_URL=https://votre-domaine.com
PORT=5000
NODE_ENV=production
UPLOAD_DIR=/app/uploads
BACKUP_DIR=/app/backups

VITE_API_URL=https://votre-domaine.com/api
"@ | Out-File -FilePath .env.production -Encoding UTF8
```

---

## 2. Génération Manuelle

Si vous préférez générer manuellement :

### JWT_SECRET (32+ caractères)

```bash
openssl rand -base64 32
# Exemple de sortie: 3K9dP2mL8xR5qT7wV1zN4bJ6hF0gY9cS==
```

### ENCRYPTION_KEY (32+ caractères)

```bash
openssl rand -base64 32
# Exemple de sortie: A1sD2fG3hJ4kL5z6X7c8V9b0N1m2Q3w==
```

### POSTGRES_PASSWORD (16+ caractères)

```bash
openssl rand -base64 24
# Exemple de sortie: P9xZ2mK5rT8wN1qL4v7Y==
```

### Ou avec caractères alphanumériques uniquement

```bash
openssl rand -hex 32
# Exemple de sortie: a9f7c4e2b8d1f6a3c9e7b2d8f4a6c1e9...
```

---

## 3. Configuration du Fichier .env.production

Une fois les secrets générés, créez le fichier `.env.production` à la racine du projet :

```env
# Base de données
POSTGRES_USER=metro
POSTGRES_PASSWORD=<VOTRE_SECRET_BD>
POSTGRES_DB=metro_db

# Backend
DATABASE_URL="postgresql://metro:<VOTRE_SECRET_BD>@postgres:5432/metro_db?schema=public"
JWT_SECRET=<VOTRE_JWT_SECRET>
ENCRYPTION_KEY=<VOTRE_ENCRYPTION_KEY>
FRONTEND_URL=https://votre-domaine.com
PORT=5000
NODE_ENV=production
UPLOAD_DIR=/app/uploads
BACKUP_DIR=/app/backups

# Frontend
VITE_API_URL=https://votre-domaine.com/api
```

**⚠️ Remplacez** :
- `<VOTRE_SECRET_BD>` par le mot de passe PostgreSQL généré
- `<VOTRE_JWT_SECRET>` par le secret JWT généré
- `<VOTRE_ENCRYPTION_KEY>` par la clé de chiffrement générée
- `votre-domaine.com` par votre vrai domaine

---

## 4. Sécurisation du Fichier

### Restreindre les Permissions

```bash
# Le fichier ne doit être lisible que par le propriétaire
chmod 600 .env.production

# Vérifier les permissions
ls -la .env.production
# Devrait afficher: -rw------- (600)
```

### Ne JAMAIS Committer le Fichier

```bash
# Vérifier que .env.production est dans .gitignore
grep -E "\.env\.production" .gitignore

# Si absent, l'ajouter
echo ".env.production" >> .gitignore
```

---

## 5. Utilisation avec Docker Compose

Modifiez `docker-compose.yml` pour utiliser le fichier `.env.production` :

```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

  backend:
    env_file:
      - .env.production
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      # ... autres variables
```

**Alternative** : Charger automatiquement via Docker Compose

```bash
# Docker Compose charge automatiquement .env à la racine
# Renommer pour utilisation :
cp .env.production .env

# Puis démarrer normalement
docker-compose up -d
```

---

## 6. Vérification des Secrets

### Tester la Force des Secrets

```bash
# Un bon secret doit avoir :
# - Longueur minimale : 32 caractères
# - Haute entropie (aléatoire)

# Vérifier la longueur
echo -n "votre_secret_ici" | wc -c
# Doit afficher au moins 32
```

### Vérifier Que les Secrets Sont Chargés

```bash
# Dans le conteneur backend
docker exec metro-backend sh -c 'echo "JWT_SECRET length: $(echo -n $JWT_SECRET | wc -c)"'

# Devrait afficher au moins 32
```

---

## 7. Rotation des Secrets (Sécurité Avancée)

Pour une sécurité maximale, changez les secrets régulièrement :

### Rotation JWT_SECRET

1. Générer un nouveau secret
2. Mettre à jour `.env.production`
3. Redémarrer le backend
4. ⚠️ **Tous les utilisateurs seront déconnectés**

```bash
# Générer nouveau JWT_SECRET
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Mettre à jour .env.production (remplacer manuellement)
echo "Nouveau JWT_SECRET: $NEW_JWT_SECRET"

# Redémarrer
docker-compose restart backend
```

### Rotation POSTGRES_PASSWORD

⚠️ **Plus complexe** - Nécessite arrêt complet

1. Créer backup de la base
2. Arrêter les services
3. Changer le mot de passe PostgreSQL
4. Mettre à jour DATABASE_URL
5. Redémarrer

---

## 8. Backup des Secrets

### Stocker les Secrets de Manière Sécurisée

**Option 1** : Gestionnaire de mots de passe (recommandé)
- Bitwarden, 1Password, LastPass, KeePass
- Créer une entrée "Metro Production Secrets"
- Y stocker tous les secrets

**Option 2** : Fichier chiffré
```bash
# Chiffrer le fichier .env.production
gpg -c .env.production
# Crée .env.production.gpg

# Déchiffrer (si besoin)
gpg .env.production.gpg
```

**Option 3** : Vault (pour infrastructures complexes)
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault

---

## 9. Checklist Finale

Avant de déployer, vérifiez :

- [ ] Tous les secrets ont été régénérés (aucun défaut)
- [ ] JWT_SECRET fait au moins 32 caractères
- [ ] ENCRYPTION_KEY fait au moins 32 caractères
- [ ] POSTGRES_PASSWORD fait au moins 16 caractères
- [ ] FRONTEND_URL correspond au domaine réel
- [ ] VITE_API_URL correspond au domaine réel
- [ ] Fichier .env.production a les permissions 600
- [ ] .env.production est dans .gitignore
- [ ] Secrets sauvegardés dans gestionnaire de mots de passe
- [ ] Documentation des secrets accessible par l'équipe

---

## 10. En Cas de Compromission

Si vous soupçonnez qu'un secret a été compromis :

### Actions Immédiates

1. **Isoler** : Déconnecter le serveur d'Internet si possible
2. **Régénérer** : Créer de nouveaux secrets
3. **Déployer** : Mettre à jour immédiatement
4. **Notifier** : Informer les utilisateurs (si JWT compromis)
5. **Auditer** : Vérifier les logs pour activités suspectes

### Commandes Rapides

```bash
# Régénération d'urgence de tous les secrets
./generate-emergency-secrets.sh  # (À créer)

# Redéploiement immédiat
docker-compose down
docker-compose up -d --force-recreate
```

---

## 11. Script Automatisé (Bonus)

Créer `generate-secrets.sh` :

```bash
#!/bin/bash
set -e

echo "🔐 Génération des secrets pour Metro Production"
echo "================================================"
echo ""

if [ -f .env.production ]; then
    echo "⚠️  Le fichier .env.production existe déjà."
    read -p "Écraser ? (oui/non): " confirm
    if [ "$confirm" != "oui" ]; then
        echo "❌ Annulé."
        exit 1
    fi
fi

echo "📝 Génération des secrets..."

JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")

echo "✅ Secrets générés avec succès!"
echo ""
echo "📋 Copier les valeurs suivantes dans votre gestionnaire de mots de passe:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""

read -p "Entrez votre domaine (ex: metro.exemple.fr): " DOMAIN

cat > .env.production << EOF
# Générés automatiquement le $(date)
POSTGRES_USER=metro
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=metro_db

DATABASE_URL="postgresql://metro:$POSTGRES_PASSWORD@postgres:5432/metro_db?schema=public"
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
FRONTEND_URL=https://$DOMAIN
PORT=5000
NODE_ENV=production
UPLOAD_DIR=/app/uploads
BACKUP_DIR=/app/backups

VITE_API_URL=https://$DOMAIN/api
EOF

chmod 600 .env.production

echo ""
echo "✅ Fichier .env.production créé avec permissions 600"
echo "🔐 Secrets configurés pour le domaine: $DOMAIN"
echo ""
echo "⚠️  IMPORTANT: Sauvegardez ces secrets dans un gestionnaire de mots de passe!"
echo ""
```

---

**Date de création** : Décembre 2025  
**Version** : 1.0  
**Dernière mise à jour** : 6 décembre 2025

