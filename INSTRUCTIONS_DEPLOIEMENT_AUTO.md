# 🚀 Instructions Déploiement Automatique - VPS Hostinger

## ✅ Ce qui est déjà fait

- ✅ **DNS configuré** : beta-test-metro.mabstudio.fr → 82.112.255.148
- ✅ **VPS accessible** : Ping OK, serveur actif
- ✅ **Script de déploiement** : `deploy-vps-hostinger.sh` créé

---

## 🎯 Déploiement en 2 Étapes

### Étape 1 : Transférer le projet au VPS

**Depuis votre machine locale** :

```bash
cd /Users/mabs/Documents/Metro

# Transférer tout le projet au VPS
scp -r . root@82.112.255.148:~/apps/Metro
```

**OU via hPanel Hostinger** :
1. Allez sur https://hpanel.hostinger.com
2. VPS → File Manager
3. Créer dossier `apps/Metro`
4. Uploader les fichiers (ou utiliser Git si vous avez un repo)

---

### Étape 2 : Exécuter le script de déploiement

**Option A : Via Terminal hPanel (Recommandé)**

1. Connectez-vous à https://hpanel.hostinger.com
2. Allez dans **VPS** → **Votre VPS** → **Terminal**
3. Exécutez :

```bash
cd ~/apps/Metro
chmod +x deploy-vps-hostinger.sh
./deploy-vps-hostinger.sh
```

**Option B : Via SSH**

```bash
# Se connecter au VPS
ssh root@82.112.255.148

# Aller dans le projet
cd ~/apps/Metro

# Rendre le script exécutable
chmod +x deploy-vps-hostinger.sh

# Lancer le déploiement
./deploy-vps-hostinger.sh
```

---

## 📋 Ce que fait le script automatiquement

Le script `deploy-vps-hostinger.sh` fait **TOUT** automatiquement :

1. ✅ Mise à jour du système
2. ✅ Installation Docker
3. ✅ Installation Docker Compose
4. ✅ Installation Nginx + Certbot
5. ✅ Configuration Firewall (ports 22, 80, 443)
6. ✅ Génération des secrets (JWT, ENCRYPTION, POSTGRES)
7. ✅ Build des images Docker
8. ✅ Lancement des conteneurs
9. ✅ Initialisation base de données (migrations + seed)
10. ✅ Configuration Nginx
11. ✅ Obtention certificat SSL (Let's Encrypt)
12. ✅ Vérifications finales

**Temps estimé** : 15-20 minutes (selon la vitesse du VPS)

---

## ⚠️ Interactions Requises

Le script vous demandera :

1. **Si le projet existe déjà** : Confirmer pour continuer
2. **Cloner Git ou transférer** : Choisir votre méthode
3. **Régénérer secrets** : Si .env.production existe déjà
4. **Sauvegarder secrets** : ⚠️ IMPORTANT - Copier les secrets affichés
5. **Certbot SSL** : 
   - Email : votre email
   - Accepter termes : Y
   - Redirect HTTP→HTTPS : Choisir **2**

---

## 🎉 Après le Déploiement

Une fois le script terminé :

1. **Vérifier l'application** :
   - Ouvrir : https://beta-test-metro.mabstudio.fr
   - Login : admin@metro.fr / password123

2. **Changer le mot de passe admin** :
   - Se connecter
   - Mon compte → Paramètres
   - Changer le mot de passe

3. **Vérifier les logs** :
   ```bash
   docker-compose logs -f
   ```

---

## 🆘 En Cas de Problème

### Le script s'arrête avec une erreur

```bash
# Voir les logs du script
# Le script affiche les erreurs en rouge

# Vérifier les conteneurs
docker-compose ps

# Voir les logs Docker
docker-compose logs backend
docker-compose logs frontend
```

### Erreur "Permission denied"

```bash
# Vérifier les permissions
chmod +x deploy-vps-hostinger.sh

# Ou exécuter avec sudo
sudo ./deploy-vps-hostinger.sh
```

### Erreur "Cannot connect to Docker daemon"

```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Se déconnecter et reconnecter
exit
# Reconnectez-vous
```

### Certbot échoue

```bash
# Vérifier que le DNS est propagé
dig beta-test-metro.mabstudio.fr +short

# Réessayer manuellement
sudo certbot --nginx -d beta-test-metro.mabstudio.fr
```

---

## 📞 Support

- **Guide complet** : [`DEPLOIEMENT_MABSTUDIO.md`](DEPLOIEMENT_MABSTUDIO.md)
- **Checklist** : [`CHECKLIST_MABSTUDIO.md`](CHECKLIST_MABSTUDIO.md)
- **Connexion VPS** : [`CONNEXION_VPS_HOSTINGER.md`](CONNEXION_VPS_HOSTINGER.md)

---

## 🎯 Résumé Ultra-Rapide

```bash
# 1. Transférer le projet (depuis votre machine locale)
scp -r /Users/mabs/Documents/Metro root@82.112.255.148:~/apps/Metro

# 2. Se connecter au VPS (via hPanel Terminal ou SSH)
ssh root@82.112.255.148

# 3. Lancer le script
cd ~/apps/Metro
chmod +x deploy-vps-hostinger.sh
./deploy-vps-hostinger.sh

# 4. Suivre les instructions interactives
# 5. Attendre 15-20 minutes
# 6. Accéder à https://beta-test-metro.mabstudio.fr
```

**C'est tout ! Le script fait le reste automatiquement.** 🚀

