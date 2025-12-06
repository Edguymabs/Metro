# ✅ Checklist Déploiement - beta-test-metro.mabstudio.fr

## 📋 Avant de Commencer

- [ ] J'ai accès à un VPS (IP : ________________)
- [ ] J'ai accès aux DNS de mabstudio.fr
- [ ] J'ai accès SSH au VPS
- [ ] J'ai lu [`QUICK_START_MABSTUDIO.md`](QUICK_START_MABSTUDIO.md)

---

## 🔐 Étape 1 : Secrets (5 min)

- [ ] Exécuté `./generate-secrets-mabstudio.sh`
- [ ] Secrets copiés dans gestionnaire de mots de passe :
  - [ ] JWT_SECRET
  - [ ] ENCRYPTION_KEY
  - [ ] POSTGRES_PASSWORD
- [ ] Fichier `.env.production` créé

---

## 🌐 Étape 2 : DNS (5 min)

- [ ] Enregistrement A créé :
  ```
  beta-test-metro.mabstudio.fr → [IP_VPS]
  ```
- [ ] DNS propagé (vérifié avec `dig`)
- [ ] Ping fonctionne : `ping beta-test-metro.mabstudio.fr`

---

## 🖥️ Étape 3 : Serveur VPS (30 min)

### Installation de Base
- [ ] Connexion SSH réussie
- [ ] Système mis à jour : `sudo apt update && sudo apt upgrade -y`
- [ ] Docker installé : `docker --version`
- [ ] Docker Compose installé : `docker-compose --version`
- [ ] Nginx installé : `nginx -v`
- [ ] Certbot installé : `certbot --version`

### Firewall
- [ ] UFW activé : `sudo ufw enable`
- [ ] Port SSH autorisé : `sudo ufw allow 22/tcp`
- [ ] Port HTTP autorisé : `sudo ufw allow 80/tcp`
- [ ] Port HTTPS autorisé : `sudo ufw allow 443/tcp`
- [ ] Status vérifié : `sudo ufw status`

---

## 📦 Étape 4 : Déploiement Application (45 min)

### Code
- [ ] Répertoire créé : `~/apps`
- [ ] Projet cloné dans `~/apps/Metro`
- [ ] Fichier `.env.production` copié sur le VPS
- [ ] Fichier renommé en `.env`

### Docker
- [ ] Build réussi : `docker-compose build`
- [ ] Conteneurs lancés : `docker-compose up -d`
- [ ] 3 conteneurs "Up" : `docker-compose ps`
  - [ ] metro-backend
  - [ ] metro-frontend
  - [ ] metro-postgres

### Base de Données
- [ ] Migrations déployées : `docker-compose exec backend npx prisma migrate deploy`
- [ ] Seed effectué : `docker-compose exec backend npm run seed`
- [ ] Backend démarre : `docker-compose logs backend | tail -20`

---

## 🔒 Étape 5 : Nginx & SSL (15 min)

### Configuration Nginx
- [ ] Fichier créé : `/etc/nginx/sites-available/metro`
- [ ] Configuration copiée depuis le guide
- [ ] Lien symbolique créé : `/etc/nginx/sites-enabled/metro`
- [ ] Config par défaut supprimée : `/etc/nginx/sites-enabled/default`
- [ ] Test Nginx OK : `sudo nginx -t`
- [ ] Nginx rechargé : `sudo systemctl reload nginx`

### Certificat SSL
- [ ] Certbot exécuté : `sudo certbot --nginx -d beta-test-metro.mabstudio.fr`
- [ ] Email fourni
- [ ] Termes acceptés
- [ ] Redirect HTTP→HTTPS choisi (option 2)
- [ ] Certificat obtenu avec succès

---

## ✅ Étape 6 : Vérifications (10 min)

### Tests CLI
- [ ] HTTPS répond : `curl -I https://beta-test-metro.mabstudio.fr`
- [ ] API répond : `curl https://beta-test-metro.mabstudio.fr/api/health`
- [ ] Conteneurs actifs : `docker-compose ps`

### Tests Navigateur
- [ ] URL accessible : https://beta-test-metro.mabstudio.fr
- [ ] Certificat SSL valide (cadenas vert)
- [ ] Login fonctionne (admin@metro.fr / password123)
- [ ] Dashboard s'affiche
- [ ] Menu fonctionne
- [ ] Fonctionnalités testées :
  - [ ] Créer un instrument
  - [ ] Modifier un instrument
  - [ ] Uploader un document
  - [ ] Créer une intervention
  - [ ] Voir le calendrier

---

## 🔧 Étape 7 : Post-Déploiement (15 min)

### Backups
- [ ] Répertoire créé : `~/backups`
- [ ] Script créé : `~/scripts/backup-metro.sh`
- [ ] Script testé manuellement
- [ ] Cron configuré (backups quotidiens 3h)
- [ ] Au moins 1 backup créé et vérifié

### Sécurité
- [ ] Mots de passe par défaut changés :
  - [ ] admin@metro.fr
  - [ ] responsable@metro.fr
  - [ ] technicien@metro.fr
- [ ] Secrets sauvegardés dans gestionnaire de mots de passe
- [ ] Firewall vérifié : `sudo ufw status`

### Monitoring
- [ ] Logs accessibles : `docker-compose logs -f`
- [ ] Logs Nginx OK : `sudo tail /var/log/nginx/metro-access.log`
- [ ] Espace disque vérifié : `df -h`

---

## 🎉 Prêt pour Beta Test

- [ ] **Tous les items ci-dessus cochés**
- [ ] Application accessible publiquement
- [ ] SSL actif et valide
- [ ] Backups configurés
- [ ] Mots de passe changés
- [ ] Documentation lue

### Prochaines Étapes

- [ ] Créer comptes pour beta-testeurs
- [ ] Inviter 5-10 utilisateurs
- [ ] Établir processus de feedback
- [ ] Planifier réunions de suivi

---

## 📞 Support

Si un item ne peut pas être coché :

1. **Consulter** : [`DEPLOIEMENT_MABSTUDIO.md`](DEPLOIEMENT_MABSTUDIO.md) - Section correspondante
2. **Logs** : `docker-compose logs -f` ou `/var/log/nginx/metro-error.log`
3. **Dépannage** : [`VPS_DEPLOYMENT_GUIDE.md`](VPS_DEPLOYMENT_GUIDE.md) - Section Dépannage

---

**Domaine** : beta-test-metro.mabstudio.fr  
**Date** : _______________  
**Par** : _______________  
**Statut** : ⬜ En cours / ✅ Complété

