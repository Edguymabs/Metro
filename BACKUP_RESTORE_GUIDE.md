# Guide de Sauvegarde et Restauration - Metro

## Vue d'ensemble

Metro dispose d'un système complet de sauvegarde et restauration des données accessible uniquement aux administrateurs. Ce système permet de :

- Créer des backups SQL complets de la base de données PostgreSQL
- Exporter des données spécifiques au format Excel, CSV ou JSON
- Importer des données depuis des fichiers
- Restaurer des backups complets
- Gérer le cycle de vie des backups

## Accès

**Restriction** : Seuls les utilisateurs avec le rôle `ADMIN` peuvent accéder aux fonctionnalités de sauvegarde.

**Accès** : Mon compte → Onglet "Sauvegardes"

## Types de Sauvegarde

### 1. Backup SQL Complet

**Description** : Dump PostgreSQL complet de toute la base de données.

**Format** : `.sql` (ou `.sql.gz` si compression activée, `.sql.enc` si chiffrement activé)

**Usage** :
- Sauvegarde complète pour restauration en cas de perte de données
- Backup avant mise à jour majeure
- Archivage long terme

**Comment créer** :
1. Cliquer sur "Créer backup" dans la section "Backup SQL Complet"
2. Attendre la confirmation
3. Le fichier apparaît dans la liste des backups

**Contenu** : Toutes les tables, données, schémas, enums, relations

### 2. Export Sélectif

**Description** : Export d'une seule entité (table) au format souhaité.

**Formats disponibles** :
- Excel (.xlsx) - Formaté avec en-têtes stylisés
- CSV (.csv) - Format standard avec séparateurs
- JSON (.json) - Format structuré

**Entités exportables** :
- Instruments
- Interventions
- Sites
- Fournisseurs
- Utilisateurs (sans mots de passe)
- Mouvements
- Types d'instruments
- Méthodes d'étalonnage
- Calendriers d'étalonnage

**Comment exporter** :
1. Sélectionner l'entité dans le menu déroulant
2. Choisir le format (Excel, CSV, JSON)
3. Cliquer sur "Exporter"
4. Le fichier est créé et téléchargeable depuis la liste

### 3. Export Complet Multi-formats

**Description** : Export de toutes les entités en un seul fichier/archive.

**Formats** :
- **Excel** : Un fichier .xlsx avec une feuille par entité
- **CSV** : Archive .zip contenant un fichier .csv par entité
- **JSON** : Archive .zip contenant un fichier .json par entité

**Comment exporter** :
1. Choisir le format souhaité (Excel, CSV, JSON)
2. Cliquer sur le bouton correspondant
3. Le traitement peut prendre quelques secondes pour les grandes bases

## Import de Données

### Formats acceptés

- CSV (.csv)
- JSON (.json)
- Excel (.xlsx, .xls)

### Limite de taille

**Maximum** : 50 MB par fichier

### Procédure d'import

1. **Préparer le fichier** :
   - Vérifier que les colonnes correspondent aux champs de la base
   - S'assurer que les données sont valides
   - Inclure les champs requis (voir section Validation)

2. **Importer** :
   - Sélectionner l'entité cible
   - Choisir le fichier
   - Cliquer sur "Importer"
   - Attendre le résultat

3. **Vérifier** :
   - Le système affiche le nombre d'entrées importées
   - Les erreurs éventuelles sont loggées dans la console

### Validation des données

#### Champs requis par entité :

**Instruments** :
- serialNumber (unique)
- name
- typeId (doit exister)
- siteId (doit exister)

**Sites** :
- name

**Fournisseurs** :
- name

**Utilisateurs** :
- email (unique)
- password (sera hashé)
- firstName
- lastName
- role (ADMIN, RESPONSABLE_METROLOGIE, TECHNICIEN, LECTURE_SEULE)

**Types d'instruments** :
- name (unique)

### Gestion des erreurs d'import

- Les entrées valides sont importées
- Les entrées invalides sont ignorées avec log d'erreur
- Pas de rollback : les entrées valides restent importées même si certaines échouent

## Restauration de Backup SQL

### ⚠️ ATTENTION : Opération Destructive

**La restauration d'un backup SQL remplace TOUTES les données actuelles.**

Cette opération est **IRRÉVERSIBLE**.

### Avant de restaurer

1. ✅ **Créer un backup de l'état actuel**
2. ✅ **Vérifier que le backup à restaurer est le bon**
3. ✅ **Informer les utilisateurs** (maintenance)
4. ✅ **Avoir un plan de rollback**

### Procédure de restauration

1. Cliquer sur "Restaurer un backup" (bouton rouge)
2. **Lire l'avertissement** attentivement
3. Sélectionner le fichier de backup dans la liste
4. Cliquer sur "Confirmer la restauration"
5. Attendre la fin de l'opération (peut prendre plusieurs minutes)

### Après restauration

- Redémarrer les services si nécessaire
- Vérifier l'intégrité des données
- Tester les fonctionnalités principales
- Informer les utilisateurs de la remise en service

## Gestion des Backups

### Liste des backups

La liste affiche pour chaque backup :
- **Nom du fichier** : contient la date/heure de création
- **Taille** : en B, KB, MB ou GB
- **Date de création** : formatée en français
- **Type** : plain, compressed, encrypted

### Actions disponibles

- **Télécharger** (icône ⬇️) : Télécharge le fichier localement
- **Supprimer** (icône 🗑️) : Supprime définitivement le backup (confirmation requise)

### Actualiser la liste

Cliquer sur "Actualiser" pour recharger la liste après une opération.

### Rétention automatique

Les backups sont automatiquement supprimés après **30 jours** (configurable via `BACKUP_RETENTION_DAYS`).

## Configuration Avancée

### Variables d'environnement (Backend)

```env
# Dossier de stockage des backups
BACKUP_DIR=./backups

# Nombre de jours de rétention
BACKUP_RETENTION_DAYS=30

# Activer la compression (gzip)
BACKUP_COMPRESSION=true

# Activer le chiffrement
BACKUP_ENCRYPTION=false

# Clé de chiffrement (si BACKUP_ENCRYPTION=true)
ENCRYPTION_KEY=votre_cle_secrete_32_caracteres
```

### Emplacement des fichiers

**Développement** : `backend/backups/`

**Production (Docker)** : `/app/backups` (monté via volume)

### Backups automatiques

Les backups peuvent être programmés automatiquement (non implémenté dans l'UI mais disponible en code) :

```javascript
backupManager.scheduleBackups(24); // Toutes les 24h
```

## Bonnes Pratiques

### Fréquence de sauvegarde

| Type de données | Fréquence recommandée |
|-----------------|----------------------|
| Backup SQL complet | Quotidien (automatique) |
| Export entités critiques | Avant modifications importantes |
| Export complet | Hebdomadaire ou mensuel |

### Stockage des backups

1. **Ne pas stocker uniquement sur le serveur**
   - Télécharger les backups régulièrement
   - Stocker sur un système externe (NAS, Cloud, disque externe)

2. **Vérifier l'intégrité**
   - Tester les restaurations périodiquement
   - Vérifier que les fichiers ne sont pas corrompus

3. **Sécurité**
   - Activer le chiffrement en production
   - Protéger l'accès au dossier de backups
   - Ne pas partager les backups contenant des données sensibles

### Avant une mise à jour

1. Créer un backup SQL complet
2. Télécharger le backup
3. Vérifier sa taille (doit être cohérente)
4. Effectuer la mise à jour
5. Tester l'application
6. Conserver le backup pendant 7 jours minimum

### En cas de problème

1. **Données perdues** :
   - Restaurer le dernier backup SQL complet
   - Importer les exports récents si nécessaire

2. **Backup corrompu** :
   - Essayer avec un backup plus ancien
   - Utiliser les exports partiels pour reconstituer

3. **Restauration échouée** :
   - Vérifier les logs backend
   - Vérifier l'espace disque disponible
   - Contacter le support technique

## Résolution de Problèmes

### Erreur "Fichier trop volumineux"

**Solution** : Augmenter la limite dans le backend (actuellement 50MB)

### Erreur lors de l'import

**Causes possibles** :
- Format de fichier incorrect
- Données invalides
- Références manquantes (ex: typeId inexistant)

**Solution** : Vérifier les logs d'erreur, corriger le fichier, réessayer

### Backup SQL ne se crée pas

**Vérifier** :
- PostgreSQL est accessible
- pg_dump est installé
- Permissions du dossier backups
- Espace disque disponible

### Restauration bloquée

**Si la restauration ne démarre pas** :
- Vérifier que le fichier existe
- Vérifier les permissions
- Vérifier la connexion à la base de données

**Si la restauration plante** :
- Consulter les logs : `docker-compose logs backend`
- Vérifier l'intégrité du fichier SQL
- Essayer avec un autre backup

## Support

Pour toute question ou problème :

1. Consulter les logs : `docker-compose logs backend`
2. Vérifier le fichier `METRO_REPORTS.md`
3. Consulter la documentation technique : `docs/ARCHITECTURE.md`

## Sécurité

### Accès restreint

- Seuls les ADMIN peuvent accéder aux sauvegardes
- Toutes les opérations sont loggées avec l'email de l'utilisateur
- Les exports d'utilisateurs excluent automatiquement les mots de passe

### Audit

Tous les événements suivants sont loggés :
- Création de backup
- Export de données
- Import de données
- Restauration
- Suppression de backup

Format des logs :
```
🔐 Admin user@example.com crée un backup SQL complet
📊 Admin user@example.com exporte instruments en excel
⚠️  Admin user@example.com restaure le backup metro_backup_2025-11-18.sql
```

### Recommandations de sécurité

1. Limiter le nombre d'administrateurs
2. Utiliser des mots de passe forts
3. Activer le chiffrement des backups
4. Stocker les backups dans un lieu sécurisé
5. Auditer régulièrement les logs d'accès
6. Tester les restaurations dans un environnement séparé

---

**Version** : 1.0.0  
**Dernière mise à jour** : 18 novembre 2025  
**Système** : Metro - Gestion Métrologique
