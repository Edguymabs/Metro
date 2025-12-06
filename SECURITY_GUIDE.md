# 🔐 Guide de Sécurité - Metro

## ⚠️ IMPORTANT : Configuration de Production

Avant de déployer l'application en production, **vous DEVEZ** changer les valeurs suivantes dans `docker-compose.yml` :

### 1. JWT_SECRET
```yaml
JWT_SECRET: "VOTRE_CLE_SECRETE_JWT_UNIQUE_ET_FORTE"
```
- **Longueur minimale** : 32 caractères
- **Contenu** : Caractères aléatoires (lettres, chiffres, symboles)
- **Exemple de génération** :
  ```bash
  openssl rand -base64 32
  ```

### 2. ENCRYPTION_KEY
```yaml
ENCRYPTION_KEY: "VOTRE_CLE_DE_CHIFFREMENT_UNIQUE_ET_FORTE"
```
- **Longueur minimale** : 32 caractères
- **Contenu** : Caractères aléatoires (lettres, chiffres, symboles)
- **Exemple de génération** :
  ```bash
  openssl rand -base64 32
  ```

### 3. Mot de passe PostgreSQL
```yaml
POSTGRES_PASSWORD: "VOTRE_MOT_DE_PASSE_SECURISE"
```
- **Longueur minimale** : 16 caractères
- **Contenu** : Caractères aléatoires (lettres, chiffres, symboles)

### 4. URL du Frontend
```yaml
FRONTEND_URL: "https://votre-domaine.com"
```
- Remplacez par l'URL réelle de votre frontend en production

---

## 🛡️ Mesures de Sécurité Implémentées

### Authentification et Autorisation
- ✅ **JWT** : Tokens avec expiration
- ✅ **Bcrypt** : Hashage des mots de passe avec salt
- ✅ **RBAC** : Contrôle d'accès basé sur les rôles
- ✅ **Validation Joi** : Validation stricte de toutes les entrées

### Protection des API
- ✅ **Rate Limiting** : Protection contre les abus
  - 100 requêtes/15 min en production
  - 20 tentatives de connexion/15 min
- ✅ **Slow Down** : Ralentissement progressif après 50 requêtes
- ✅ **Brute Force Protection** : 10 tentatives de connexion max
- ✅ **Attack Detection** : Détection des outils d'attaque et injections SQL

### Headers de Sécurité
- ✅ **Helmet** : Headers HTTP sécurisés
- ✅ **CORS** : Configuration restrictive
- ✅ **CSP** : Content Security Policy
- ✅ **HSTS** : HTTP Strict Transport Security
- ✅ **X-Frame-Options** : Protection contre clickjacking

### Gestion des Fichiers
- ✅ **Validation stricte** : Types MIME et extensions
- ✅ **Taille limitée** : 10 MB maximum
- ✅ **Path Traversal Protection** : Vérification des chemins
- ✅ **Nom de fichier sanitisé** : Caractères autorisés uniquement

### Logging et Monitoring
- ✅ **Logger sécurisé** : Logs structurés sans données sensibles
- ✅ **Logs de sécurité** : Événements de sécurité tracés
- ✅ **Monitoring** : Suivi des requêtes et erreurs

---

## 📋 Checklist de Déploiement Sécurisé

Avant de déployer en production, vérifiez :

### Configuration
- [ ] JWT_SECRET changé
- [ ] ENCRYPTION_KEY changé
- [ ] POSTGRES_PASSWORD changé
- [ ] FRONTEND_URL configuré
- [ ] NODE_ENV='production'

### Infrastructure
- [ ] HTTPS activé (certificat SSL/TLS valide)
- [ ] Reverse proxy configuré (Nginx, Traefik, etc.)
- [ ] Firewall configuré
- [ ] Sauvegarde automatique activée
- [ ] Logs centralisés

### Sécurité
- [ ] Mise à jour des dépendances
- [ ] Scan de vulnérabilités effectué
- [ ] Certificats SSL valides
- [ ] Rate limiting activé
- [ ] Monitoring actif

### Base de Données
- [ ] Mot de passe PostgreSQL fort
- [ ] Accès restreint (pas d'accès public)
- [ ] Sauvegardes régulières configurées
- [ ] Chiffrement at-rest activé (si possible)

---

## 🔒 Bonnes Pratiques

### Mots de Passe
- **Minimum 12 caractères** pour les utilisateurs
- **Minimum 16 caractères** pour les secrets système
- Contenir : majuscules, minuscules, chiffres, symboles
- Ne jamais réutiliser les mots de passe
- Utiliser un gestionnaire de mots de passe

### Accès
- Principe du moindre privilège
- Rotation régulière des secrets
- Audit régulier des accès
- Désactivation des comptes inactifs

### Monitoring
- Surveiller les logs de sécurité
- Alertes sur les tentatives d'attaque
- Audit régulier des permissions
- Revue des logs d'accès

### Mises à Jour
- Mettre à jour les dépendances régulièrement
- Scanner les vulnérabilités (npm audit)
- Appliquer les patches de sécurité rapidement
- Tester les mises à jour en staging

---

## 🚨 En Cas d'Incident de Sécurité

### Actions Immédiates
1. **Isoler** : Déconnecter le système compromis
2. **Analyser** : Identifier l'étendue de la compromission
3. **Contenir** : Empêcher la propagation
4. **Documenter** : Garder une trace de toutes les actions

### Actions Post-Incident
1. **Restaurer** : À partir d'une sauvegarde saine
2. **Changer** : Tous les secrets et mots de passe
3. **Auditer** : Vérifier tous les accès et logs
4. **Améliorer** : Corriger les vulnérabilités identifiées

---

## 📞 Support et Reporting

Si vous découvrez une vulnérabilité de sécurité :
1. **NE PAS** publier publiquement
2. Contacter immédiatement l'administrateur système
3. Fournir un maximum de détails
4. Attendre la correction avant de divulguer

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Prisma Security](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

---

**Date de dernière mise à jour** : 2025-10-20
**Version** : 1.0

