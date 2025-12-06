# 📖 Guide Utilisateur - Metro

## Table des Matières

1. [Introduction](#introduction)
2. [Premiers Pas](#premiers-pas)
3. [Tableau de Bord](#tableau-de-bord)
4. [Gestion des Instruments](#gestion-des-instruments)
5. [Planification des Étalonnages](#planification-des-étalonnages)
6. [Gestion des Interventions](#gestion-des-interventions)
7. [Traçabilité des Mouvements](#traçabilité-des-mouvements)
8. [Gestion des Fournisseurs](#gestion-des-fournisseurs)
9. [Gestion des Sites](#gestion-des-sites)
10. [Documents et Certificats](#documents-et-certificats)
11. [Rapports et Analyses](#rapports-et-analyses)
12. [Administration](#administration)
13. [Bonnes Pratiques](#bonnes-pratiques)

---

## Introduction

**Metro** est un système complet de gestion métrologique qui vous permet de :
- Gérer votre parc d'instruments de mesure
- Planifier et suivre les étalonnages
- Tracer les mouvements d'instruments
- Gérer les fournisseurs et prestataires
- Générer des rapports et analyses

Ce guide vous accompagnera dans l'utilisation de toutes les fonctionnalités de l'application.

---

## Premiers Pas

### Connexion

1. Ouvrez votre navigateur à l'adresse : **http://localhost:3000**
2. Saisissez vos identifiants :
   - **Email** : admin@metro.fr
   - **Mot de passe** : password123
3. Cliquez sur **"Se connecter"**

### Interface Principale

L'interface est composée de :
- **Barre de navigation** (gauche) : Accès rapide aux différents modules
- **Zone de contenu** (centre) : Affichage des données et formulaires
- **Fil d'Ariane** (haut) : Navigation contextuelle
- **Profil utilisateur** (haut droite) : Informations et déconnexion

---

## Tableau de Bord

Le tableau de bord vous donne une vue d'ensemble de votre activité métrologique.

### Indicateurs Clés (KPI)

**Instruments**
- Total d'instruments dans le parc
- Répartition par statut (Conforme, Non conforme, En maintenance, Cassé)

**Étalonnages**
- Nombre d'étalonnages en retard
- Étalonnages à venir dans les 30 jours
- Nombre de non-conformités

**Mouvements**
- Instruments actuellement sortis
- Retours en retard

### Graphiques

**Évolution des Étalonnages**
- Nombre d'interventions par mois
- Permet d'anticiper la charge de travail

**Répartition par Statut**
- Vue visuelle de l'état du parc
- Identification rapide des problèmes

### Actions Rapides

Les cartes cliquables permettent un accès direct :
- **En retard** → Liste des instruments en retard d'étalonnage
- **À venir (30j)** → Étalonnages planifiés dans le mois
- **Non-conformités** → Liste des interventions avec résultats non conformes

---

## Gestion des Instruments

### Liste des Instruments

**Navigation** : Tableau de bord → Instruments

#### Fonctionnalités
- **Recherche** : Par numéro de série, nom, référence interne
- **Filtres** :
  - Par type (Balance, pH-mètre, Four, etc.)
  - Par site (Laboratoire A, Production, etc.)
  - Par statut (Conforme, Non conforme, etc.)
- **Tri** : Cliquer sur les en-têtes de colonnes
- **Actions rapides** : Voir détails, Modifier, Supprimer

### Créer un Instrument

1. Cliquez sur **"+ Nouvel Instrument"**
2. Remplissez les informations obligatoires :

**Informations de Base**
- **Numéro de série** : Identifiant unique du fabricant
- **Référence interne** : Votre code interne (optionnel)
- **Nom** : Désignation de l'instrument
- **Marque** : Fabricant
- **Modèle** : Référence du modèle
- **Statut** : État actuel (Conforme par défaut)

**Localisation**
- **Site** : Lieu où se trouve l'instrument
- **Emplacement** : Zone précise (ex: "Salle 101, Paillasse 3")

**Informations d'Achat**
- **Date d'achat** : Date de mise en service
- **Prix d'achat** : Coût initial (optionnel)

**Type d'Instrument**
- Sélectionnez le type dans la liste déroulante
- Si le type n'existe pas, créez-le dans **Paramètres** d'abord

3. Configurez l'étalonnage (2 options)

#### Option 1 : Méthode Prédéfinie

Utilisez une méthode d'étalonnage existante :
- Sélectionnez une méthode dans la liste
- La fréquence et les paramètres sont définis automatiquement
- Idéal pour les instruments standards

#### Option 2 : Étalonnage Personnalisé (Avancé)

Configurez manuellement :

**Récurrence - Intervalle Fixe**
- Fréquence : Valeur + Unité (ex: 12 Mois)
- La prochaine date est calculée automatiquement

**Récurrence - Calendaire**
- **Quotidien** : Tous les jours
- **Hebdomadaire** : Jours spécifiques (ex: Tous les lundis)
- **Mensuel** : Jour du mois (ex: Le 1er de chaque mois)
- **Annuel** : Date anniversaire (ex: 15 mars de chaque année)

**Tolérance de Retard**
- Période de grâce après la date d'étalonnage
- Ex: Tolérance de 1 mois sur un étalonnage annuel

4. Ajoutez des observations (optionnel)
5. Cliquez sur **"Créer l'instrument"**

### Détails d'un Instrument

Cliquez sur un instrument pour voir :

**Onglet Informations**
- Toutes les caractéristiques
- Historique des modifications
- Documents associés

**Onglet Étalonnages**
- Liste chronologique des interventions
- Statut de conformité
- Prochaine échéance

**Onglet Mouvements**
- Historique des déplacements
- Mouvements en cours

**Actions Disponibles**
- **Modifier** : Mettre à jour les informations
- **Créer une intervention** : Planifier un étalonnage
- **Créer un mouvement** : Sortir l'instrument
- **Supprimer** : Retirer du parc (avec confirmation)

### Modifier un Instrument

1. Depuis les détails, cliquez sur **"Modifier"**
2. Modifiez les champs nécessaires
3. Cliquez sur **"Enregistrer"**

> ⚠️ La modification de la fréquence d'étalonnage recalcule automatiquement la prochaine date.

---

## Planification des Étalonnages

### Vue Planification

**Navigation** : Étalonnages (menu)

#### Vue par Cartes (par Type)

Affiche des cartes regroupées par type d'instrument :
- **Total** : Nombre d'instruments de ce type
- **À jour** : Conformes et dans les délais
- **Retard toléré** : Échéance dépassée mais dans la tolérance
- **Retard critique** : Au-delà de la tolérance
- **Cette semaine** : Étalonnages prévus dans les 7 jours
- **Barre de progression** : Visualisation rapide du taux de conformité

Cliquez sur une carte pour voir la liste filtrée.

#### Vue Liste

Affiche tous les instruments avec :
- Prochaine date d'étalonnage
- Statut (À jour, À venir, En retard)
- Dernière intervention
- Actions rapides

#### Filtres

- **Tous** : Tous les instruments
- **En retard** : Échéance dépassée
- **À venir (30j)** : Étalonnages dans le mois
- **À jour** : Conformes

### Méthodes d'Étalonnage

**Navigation** : Étalonnages → Méthodes

Les méthodes sont des templates réutilisables pour des instruments similaires.

#### Créer une Méthode

1. Cliquez sur **"+ Nouvelle Méthode"**
2. Remplissez :
   - **Nom** : Ex: "Méthode pH-mètre acide"
   - **Description** : Objectif et contexte
   - **Type d'instrument** : À quel type s'applique
   - **Fréquence** : Périodicité standard
   - **Procédure** : Étapes détaillées
   - **Durée estimée** : Temps nécessaire
   - **Équipement requis** : Matériel nécessaire
3. Cliquez sur **"Créer"**

#### Utiliser une Méthode

Lors de la création d'un instrument :
1. Sélectionnez **"Méthode prédéfinie"**
2. Choisissez la méthode
3. Les paramètres d'étalonnage sont appliqués automatiquement

---

## Gestion des Interventions

### Créer une Intervention

1. **Navigation** : Interventions → + Nouvelle Intervention
2. Remplissez le formulaire :

**Instrument**
- Sélectionnez dans la liste déroulante
- Les informations contextuelles s'affichent

**Type d'Intervention**
- **Étalonnage** : Vérification avec ajustement si nécessaire
- **Vérification** : Contrôle sans ajustement
- **Maintenance** : Entretien préventif
- **Réparation** : Correction de défaut

**Date et Lieu**
- **Date prévue** : Date de planification
- **Date réalisée** : À renseigner après l'intervention
- **Lieu** : Sur site ou chez le prestataire

**Prestataire**
- Sélectionnez le fournisseur
- Ou indiquez si réalisé en interne

**Statut**
- **Planifiée** : Intervention programmée
- **En cours** : Intervention en cours
- **Terminée** : Intervention achevée
- **Annulée** : Intervention annulée

**Résultats** (après réalisation)
- **Résultat** : Conforme / Non conforme
- **Numéro de certificat** : Référence du document
- **Observations** : Remarques, mesures, écarts

**Coût**
- Montant de la prestation (optionnel)

3. Cliquez sur **"Créer l'intervention"**

### Compléter une Intervention

1. Accédez aux détails de l'intervention
2. Cliquez sur **"Modifier"**
3. Mettez à jour :
   - Date réalisée
   - Statut → Terminée
   - Résultat (Conforme/Non conforme)
   - Numéro de certificat
4. Uploadez le certificat d'étalonnage
5. Cliquez sur **"Enregistrer"**

> ✅ La prochaine date d'étalonnage de l'instrument est automatiquement mise à jour !

### Gérer les Non-Conformités

Pour une intervention non conforme :
1. Indiquez **"Non conforme"** dans le résultat
2. Détaillez les écarts dans les observations
3. Créez une action corrective si nécessaire
4. Planifiez une nouvelle intervention de suivi

---

## Traçabilité des Mouvements

### Vue des Mouvements

**Navigation** : Mouvements

#### Filtres
- **Tous** : Tous les mouvements
- **En cours** : Instruments sortis non retournés
- **En retard** : Retours dépassant la date prévue

### Créer un Mouvement

1. Cliquez sur **"+ Nouveau Mouvement"**
2. Sélectionnez le **type** :

#### Enlèvement (Sortie)
- **Instrument** : Sélectionnez l'instrument
- **Du site** : Site de départ
- **Localisation externe** : Chez le prestataire, laboratoire externe, etc.
- **Date d'enlèvement** : Date de sortie
- **Date de retour prévue** : Échéance de retour
- **Bon de livraison** : Référence du bon
- **Motif** : Étalonnage, réparation, prêt, etc.

#### Retour
- **Instrument** : Sélectionnez l'instrument en mouvement
- **Vers le site** : Site de destination
- **Date de retour** : Date effective
- **Bon de réception** : Référence du bon
- **Observations** : État de retour, remarques

#### Transfert
- **Du site** : Site de départ
- **Vers le site** : Site d'arrivée
- **Date** : Date du transfert
- **Motif** : Réorganisation, prêt, etc.

3. Cliquez sur **"Créer le mouvement"**

### Alertes de Retard

Les mouvements dont la date de retour prévue est dépassée s'affichent en rouge dans la liste.

**Action** :
1. Contactez le prestataire
2. Mettez à jour la date prévue si nécessaire
3. Créez le mouvement de retour dès réception

---

## Gestion des Fournisseurs

### Liste des Fournisseurs

**Navigation** : Fournisseurs

Affiche tous les prestataires métrologiques.

### Créer un Fournisseur

1. Cliquez sur **"+ Nouveau Fournisseur"**
2. Remplissez :

**Informations Principales**
- **Nom** : Raison sociale
- **Email** : Contact principal
- **Téléphone** : Numéro direct
- **Site web** : URL (optionnel)

**Adresse**
- Adresse complète
- Code postal, Ville
- Pays

**Accréditations**
- **COFRAC** : N° d'accréditation si applicable
- **ISO 17025** : Certification
- **Autres** : Normes et certifications

**Informations Complémentaires**
- **Domaines de compétence** : Types d'instruments
- **Observations** : Notes, conditions commerciales, etc.

3. Cliquez sur **"Créer le fournisseur"**

### Détails d'un Fournisseur

Affiche :
- Informations de contact
- Accréditations
- **Liste des interventions réalisées** : Historique complet
- Statistiques (nombre d'interventions, coût total)

---

## Gestion des Sites

### Liste des Sites

**Navigation** : Sites

Affiche tous les sites/localisations.

### Créer un Site

1. Cliquez sur **"+ Nouveau Site"**
2. Remplissez :
   - **Nom** : Ex: "Laboratoire A", "Usine Nord"
   - **Code** : Identifiant court (ex: "LAB-A")
   - **Adresse complète**
   - **Responsable** : Nom du contact
   - **Email et Téléphone** : Coordonnées du responsable
   - **Observations** : Horaires, accès, etc.
3. Cliquez sur **"Créer le site"**

### Détails d'un Site

Affiche :
- Informations du site
- **Liste des instruments** affectés au site
- **Statistiques** :
  - Total d'instruments
  - Répartition par statut
  - Instruments en retard d'étalonnage

---

## Documents et Certificats

### Upload de Documents

Les documents peuvent être uploadés depuis :
- Page de détail d'un instrument
- Page de détail d'une intervention
- Formulaire d'intervention

#### Processus d'Upload

1. Cliquez sur **"Ajouter un document"** ou glissez-déposez
2. Sélectionnez le fichier (PDF, JPG, PNG, max 10 MB)
3. Ajoutez une description (optionnel)
4. Cliquez sur **"Upload"**

> ✅ Le document est automatiquement associé à l'instrument ou l'intervention

### Gestion des Documents

**Actions disponibles** :
- **Télécharger** : Récupérer le fichier
- **Supprimer** : Retirer le document (avec confirmation)

**Bonnes pratiques** :
- Nommez les fichiers de manière explicite
- Uploadez les certificats d'étalonnage systématiquement
- Ajoutez une description pour faciliter la recherche

---

## Rapports et Analyses

### Page Rapports

**Navigation** : Rapports

#### Analyses Disponibles

**Coûts des Étalonnages**
- Évolution mensuelle des coûts
- Répartition par type d'instrument
- Coût moyen par intervention
- Budget annuel

**Taux de Conformité**
- Pourcentage de conformité global
- Évolution dans le temps
- Par type d'instrument
- Par fournisseur

**Suivi des Non-Conformités**
- Liste des instruments non conformes
- Causes identifiées
- Actions correctives
- Taux de récurrence

**Prévisions**
- Étalonnages prévus sur 12 mois
- Charge de travail mensuelle
- Budget prévisionnel

#### Exports

**Formats disponibles** :
- **PDF** : Pour archivage ou impression
- **Excel** : Pour traitement dans un tableur

**Procédure** :
1. Sélectionnez le rapport
2. Choisissez la période
3. Cliquez sur **"Exporter PDF"** ou **"Exporter Excel"**

---

## Administration

### Gestion des Utilisateurs

**Navigation** : Utilisateurs (⚠️ Réservé aux ADMINISTRATEURS)

#### Rôles et Permissions

**ADMIN (Administrateur)**
- Accès total à l'application
- Gestion des utilisateurs
- Modification des paramètres
- Suppression de données

**MANAGER (Responsable Métrologie)**
- Gestion complète du parc d'instruments
- Création/modification d'instruments
- Gestion des interventions
- Gestion des fournisseurs et sites
- Consultation des rapports

**USER (Technicien)**
- Consultation du parc
- Création d'interventions
- Upload de documents
- Pas de suppression

**READER (Lecture seule)**
- Consultation uniquement
- Aucune modification

#### Créer un Utilisateur

1. Cliquez sur **"+ Nouvel Utilisateur"**
2. Remplissez :
   - **Nom complet**
   - **Email** : Servira d'identifiant
   - **Rôle** : Sélectionnez le niveau d'accès
   - **Mot de passe** : Au moins 6 caractères
3. Cliquez sur **"Créer l'utilisateur"**

> 📧 L'utilisateur reçoit un email avec ses identifiants (si email configuré)

#### Désactiver un Utilisateur

Pour empêcher l'accès sans supprimer le compte :
1. Accédez au détail de l'utilisateur
2. Cliquez sur **"Modifier"**
3. Décochez **"Actif"**
4. Enregistrez

### Paramètres

**Navigation** : Paramètres

#### Types d'Instruments

Gérez la liste des types d'instruments :

**Créer un Type**
1. Cliquez sur **"+ Nouveau Type"**
2. Entrez le nom (ex: "Balance de précision")
3. Cliquez sur **"Créer"**

**Modifier un Type**
1. Cliquez sur l'icône crayon
2. Modifiez le nom
3. Enregistrez

**Supprimer un Type**
- ⚠️ Impossible si des instruments utilisent ce type
- Réaffectez d'abord les instruments à un autre type

---

## Bonnes Pratiques

### Organisation du Parc

1. **Créez tous les sites** avant les instruments
2. **Définissez les types d'instruments** dès le début
3. **Enregistrez les fournisseurs** avec leurs accréditations
4. **Utilisez des références internes** cohérentes

### Planification des Étalonnages

1. **Définissez des méthodes** pour les instruments récurrents
2. **Utilisez les tolérances de retard** pour plus de flexibilité
3. **Planifiez en avance** : Consultez la vue "À venir (30j)" régulièrement
4. **Groupez les interventions** par fournisseur pour optimiser les coûts

### Traçabilité

1. **Complétez systématiquement les interventions** après réalisation
2. **Uploadez tous les certificats d'étalonnage**
3. **Créez des mouvements** pour chaque sortie d'instrument
4. **Documentez les non-conformités** avec actions correctives

### Sécurité

1. **Changez les mots de passe par défaut** immédiatement
2. **Attribuez le bon rôle** à chaque utilisateur
3. **Désactivez les comptes** non utilisés
4. **Sauvegardez régulièrement** la base de données

### Performance

1. **Utilisez les filtres** pour limiter l'affichage
2. **Archivez les instruments** retirés du parc (statut "Cassé")
3. **Nettoyez les documents obsolètes** régulièrement

---

## Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + S` | Enregistrer un formulaire |
| `Échap` | Fermer un dialogue/modal |
| `Ctrl + K` | Recherche rapide |
| `Alt + N` | Nouvel élément (contexte) |

---

## Support et Assistance

### Problèmes Techniques

Consultez d'abord :
1. Ce guide utilisateur
2. Le fichier `README.md` à la racine
3. Le guide de dépannage

### Demandes de Fonctionnalités

Ouvrez une issue sur le dépôt GitHub avec :
- Description détaillée
- Cas d'usage
- Bénéfice attendu

### Bugs et Erreurs

Signalez avec :
- Description du problème
- Étapes pour reproduire
- Captures d'écran si possible
- Message d'erreur exact

---

## Glossaire

**Étalonnage** : Opération de vérification et d'ajustement d'un instrument par rapport à une référence

**Vérification** : Contrôle de conformité sans ajustement

**Conformité** : État d'un instrument dont les caractéristiques sont dans les tolérances

**Non-conformité** : Écart par rapport aux spécifications

**Traçabilité** : Capacité à retrouver l'historique complet d'un instrument

**Accréditation** : Reconnaissance officielle de la compétence d'un laboratoire (ex: COFRAC)

**Périodicité** : Fréquence des étalonnages

**Tolérance** : Écart admissible

---

**Version du guide** : 1.0.0  
**Dernière mise à jour** : Octobre 2025

Pour toute question, contactez l'administrateur système ou consultez la documentation technique dans `/docs/ARCHITECTURE.md`.

