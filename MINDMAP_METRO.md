# Metro - Carte Mentale Complète

## 🎯 PROJET METRO

### 📦 Architecture Globale
#### Stack Technique
- **Backend**: Node.js 20 + TypeScript
  - Framework: Express.js
  - ORM: Prisma 5.0.0
  - Base de données: PostgreSQL 15
  - Validation: Joi
  - Auth: JWT + bcrypt
  - Sécurité: Helmet, Rate limiting, CORS
- **Frontend**: React 18 + TypeScript
  - Build: Vite
  - Routing: React Router v6
  - Styling: Tailwind CSS
  - HTTP: Axios
  - Icons: Lucide React
- **Infrastructure**
  - Conteneurisation: Docker + Docker Compose
  - Proxy: Nginx (frontend)
  - Volumes: PostgreSQL data, Backend uploads

#### Environnements
- **Développement**: Ports 3000 (frontend), 5000 (backend), 5432 (DB)
- **Production Docker**: Ports 3000 (frontend), 5001 (backend), 5432 (DB)
- **Scripts**: start.sh avec auto-rebuild

---

## 🔵 BACKEND

### Point d'Entrée
#### server.ts
- **Port**: 5000 (production: 5001)
- **Configuration**
  - CORS configuré pour frontend
  - Body parsing JSON (10MB max)
  - Rate limiting global
  - Monitoring des requêtes
  - Logs de sécurité
- **Middleware globaux**
  - Helmet (sécurité headers)
  - CORS (origin + credentials)
  - Rate limiting (général + auth)
  - Request monitoring
  - Attack detection
  - Security headers custom
- **Routes montées**: 16 endpoints API

---

### 🔐 Sécurité & Monitoring

#### middleware/security.ts
- **helmetConfig**
  - CSP (Content Security Policy)
  - HSTS activé
  - noSniff, frameGuard
  - xssFilter
- **generalLimiter**
  - 1000 req / 15min par IP
  - Message: "Trop de requêtes"
- **authLimiter**
  - 10 tentatives / 15min par IP
  - Protection brute force
- **speedLimiter**
  - Ralentissement progressif
  - +500ms par requête excessive
- **securityHeaders**
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
- **attackDetection**
  - Détection patterns SQL injection
  - Détection XSS
  - Détection Path traversal
  - Logging automatique

#### middleware/monitoring.ts
- **requestMonitoring**
  - Log chaque requête (méthode, URL, IP, user)
  - Durée d'exécution
  - Status code
- **authFailureMonitoring**
  - Compteur échecs par IP
  - Alert après 5 échecs
  - Tracking tentatives
- **bruteForceMonitoring**
  - Détection patterns suspects
  - Blocage temporaire
  - Logs sécurité
- **getSecurityStats**
  - Statistiques temps réel
  - Endpoints les plus utilisés
  - IPs suspectes
  - Tentatives échouées

#### middleware/auth.ts
- **authenticateToken**
  - Vérifie JWT dans Authorization header
  - Decode et valide le token
  - Ajoute user à req.user
- **authorize(...roles)**
  - Vérifie le rôle utilisateur
  - Permet multi-rôles
  - Retourne 403 si refusé
- **requireAdmin**
  - Vérifie rôle ADMIN uniquement
  - Utilisé pour: backups, users, security
  - Logs toutes les actions admin

#### middleware/validation.ts
- **validate(schema)**
  - Validation Joi sur req.body
  - abortEarly: false (toutes les erreurs)
  - allowUnknown: true (flexibilité)
  - Messages d'erreur détaillés
- **schemas**
  - register: email, password, firstName, lastName, role
  - login: email, password
  - instrument: nom, type, site, config étalonnage
  - intervention: dates, fournisseur, résultat
  - site: nom, adresse
  - supplier: nom, contact, accréditations
  - user: email, password, role
  - maintenance: titre, message, type, dates

---

### 🗄️ Configuration

#### config/database.ts
- **PrismaClient**
  - Instance unique (singleton)
  - Connection pooling automatique
  - Logs des requêtes (dev)
  - Gestion des erreurs
  - Auto-reconnexion
- **Export**: prisma (utilisé par tous les controllers)

#### config/jwt.ts
- **generateToken(payload)**
  - Secret: process.env.JWT_SECRET
  - Expiration: 7 jours
  - Payload: userId, email, role
- **verifyToken(token)**
  - Vérifie signature
  - Vérifie expiration
  - Retourne payload décodé
- **Utilisé par**: authController, auth middleware

---

### 🎛️ Routes (16 endpoints API)

#### 1. routes/authRoutes.ts
- **POST /api/auth/register**
  - Validation: schemas.register
  - Controller: authController.register
  - Public (pas d'auth)
- **POST /api/auth/login**
  - Validation: schemas.login
  - Controller: authController.login
  - Retourne JWT token
  - Public (pas d'auth)
- **GET /api/auth/me**
  - Middleware: authenticateToken
  - Controller: authController.getMe
  - Retourne user actuel

#### 2. routes/instrumentRoutes.ts
- **GET /api/instruments**
  - Auth requise
  - Liste avec filtres et pagination
  - Controller: getAllInstruments
- **GET /api/instruments/:id**
  - Auth requise
  - Détails complets + relations
  - Controller: getInstrumentById
- **POST /api/instruments**
  - Auth requise + validation
  - Création avec config étalonnage
  - Controller: createInstrument
- **PUT /api/instruments/:id**
  - Auth requise + validation
  - Mise à jour complète
  - Controller: updateInstrument
- **DELETE /api/instruments/:id**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Soft delete possible
  - Controller: deleteInstrument

#### 3. routes/interventionRoutes.ts
- **GET /api/interventions**
  - Auth requise
  - Filtres: date, instrument, fournisseur, status
  - Controller: getAllInterventions
- **GET /api/interventions/:id**
  - Auth requise
  - Détails + documents attachés
  - Controller: getInterventionById
- **POST /api/interventions**
  - Auth requise + validation
  - Création avec upload documents
  - Controller: createIntervention
- **PUT /api/interventions/:id**
  - Auth requise + validation
  - Mise à jour status et résultats
  - Controller: updateIntervention
- **DELETE /api/interventions/:id**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Controller: deleteIntervention

#### 4. routes/supplierRoutes.ts
- **GET /api/suppliers**
  - Auth requise
  - Liste avec accréditations
  - Controller: getAllSuppliers
- **GET /api/suppliers/:id**
  - Auth requise
  - Détails + historique interventions
  - Controller: getSupplierById
- **POST /api/suppliers**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Validation complète
  - Controller: createSupplier
- **PUT /api/suppliers/:id**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Mise à jour infos et accréditations
  - Controller: updateSupplier
- **DELETE /api/suppliers/:id**
  - Auth requise, role ADMIN
  - Controller: deleteSupplier

#### 5. routes/documentRoutes.ts
- **GET /api/documents**
  - Auth requise
  - Liste par instrument ou intervention
  - Controller: getAllDocuments
- **GET /api/documents/:id**
  - Auth requise
  - Téléchargement fichier
  - Controller: getDocumentById
- **POST /api/documents**
  - Auth requise
  - Upload avec Multer
  - Types: PDF, images, Excel
  - Max: 10MB par fichier
  - Controller: uploadDocument
- **DELETE /api/documents/:id**
  - Auth requise
  - Suppression fichier + DB
  - Controller: deleteDocument

#### 6. routes/siteRoutes.ts
- **GET /api/sites**
  - Auth requise
  - Liste tous les sites
  - Controller: getAllSites
- **GET /api/sites/:id**
  - Auth requise
  - Détails + instruments du site
  - Controller: getSiteById
- **POST /api/sites**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Validation adresse
  - Controller: createSite
- **PUT /api/sites/:id**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Controller: updateSite
- **DELETE /api/sites/:id**
  - Auth requise, role ADMIN
  - Vérifie pas d'instruments liés
  - Controller: deleteSite

#### 7. routes/instrumentTypeRoutes.ts
- **GET /api/instrument-types**
  - Auth requise
  - Liste types avec métadonnées
  - Controller: getAllInstrumentTypes
- **GET /api/instrument-types/:id**
  - Auth requise
  - Détails type
  - Controller: getInstrumentTypeById
- **POST /api/instrument-types**
  - Auth requise, role ADMIN
  - Création nouveau type
  - Controller: createInstrumentType
- **PUT /api/instrument-types/:id**
  - Auth requise, role ADMIN
  - Controller: updateInstrumentType
- **DELETE /api/instrument-types/:id**
  - Auth requise, role ADMIN
  - Controller: deleteInstrumentType

#### 8. routes/movementRoutes.ts
- **GET /api/movements**
  - Auth requise
  - Filtres: date, instrument, site
  - Controller: getAllMovements
- **GET /api/movements/:id**
  - Auth requise
  - Détails mouvement
  - Controller: getMovementById
- **POST /api/movements**
  - Auth requise
  - Enregistre mouvement instrument
  - Types: entrée, sortie, transfert
  - Controller: createMovement
- **DELETE /api/movements/:id**
  - Auth requise, role ADMIN
  - Controller: deleteMovement

#### 9. routes/userRoutes.ts
- **GET /api/users**
  - Auth requise, role ADMIN
  - Liste utilisateurs
  - Controller: getAllUsers
- **GET /api/users/:id**
  - Auth requise, role ADMIN
  - Détails utilisateur
  - Controller: getUserById
- **POST /api/users**
  - Auth requise, role ADMIN
  - Création compte
  - Hash password automatique
  - Controller: createUser
- **PUT /api/users/:id**
  - Auth requise, role ADMIN
  - Mise à jour infos
  - Controller: updateUser
- **DELETE /api/users/:id**
  - Auth requise, role ADMIN
  - Désactivation compte
  - Controller: deleteUser

#### 10. routes/calibrationMethodRoutes.ts
- **GET /api/calibration-methods**
  - Auth requise
  - Liste méthodes prédéfinies
  - Controller: getAllCalibrationMethods
- **GET /api/calibration-methods/:id**
  - Auth requise
  - Détails méthode avec template
  - Controller: getCalibrationMethodById
- **POST /api/calibration-methods**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Création méthode personnalisée
  - Controller: createCalibrationMethod
- **PUT /api/calibration-methods/:id**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Controller: updateCalibrationMethod
- **DELETE /api/calibration-methods/:id**
  - Auth requise, role ADMIN
  - Controller: deleteCalibrationMethod

#### 11. routes/calibrationCalendarRoutes.ts
- **GET /api/calibration-calendars**
  - Auth requise
  - Planning avec filtres dates
  - Controller: getAllCalibrationCalendars
- **GET /api/calibration-calendars/:id**
  - Auth requise
  - Détails événement calendrier
  - Controller: getCalibrationCalendarById
- **POST /api/calibration-calendars**
  - Auth requise
  - Création événement planning
  - Controller: createCalibrationCalendar
- **PUT /api/calibration-calendars/:id**
  - Auth requise
  - Mise à jour dates/status
  - Controller: updateCalibrationCalendar
- **DELETE /api/calibration-calendars/:id**
  - Auth requise, role ADMIN ou RESPONSABLE
  - Controller: deleteCalibrationCalendar

#### 12. routes/dashboardRoutes.ts
- **GET /api/dashboard/stats**
  - Auth requise
  - Statistiques globales
  - Controller: getDashboardStats
  - Retourne:
    - Nombre d'instruments
    - Interventions en cours
    - Alertes étalonnage
    - Mouvements récents

#### 13. routes/securityRoutes.ts
- **GET /api/security/stats**
  - Auth requise, role ADMIN
  - Statistiques sécurité
  - Controller: getSecurityStats (from monitoring)
  - Retourne:
    - Requêtes totales
    - Tentatives échouées
    - IPs suspectes
    - Attaques détectées

#### 14. routes/maintenanceRoutes.ts
- **GET /api/maintenance/messages**
  - Auth requise
  - Liste messages actifs
  - Controller: getAllMaintenanceMessages
- **GET /api/maintenance/messages/:id**
  - Auth requise
  - Détails message
  - Controller: getMaintenanceMessageById
- **POST /api/maintenance/messages**
  - Auth requise, role ADMIN
  - Création message maintenance
  - Controller: createMaintenanceMessage
- **PUT /api/maintenance/messages/:id**
  - Auth requise, role ADMIN
  - Controller: updateMaintenanceMessage
- **DELETE /api/maintenance/messages/:id**
  - Auth requise, role ADMIN
  - Controller: deleteMaintenanceMessage

#### 15. routes/accountRoutes.ts
- **GET /api/account/profile**
  - Auth requise
  - Profil utilisateur connecté
  - Controller: getMyProfile
- **PATCH /api/account/profile**
  - Auth requise
  - Mise à jour nom, prénom
  - Controller: updateMyProfile
- **POST /api/account/change-password**
  - Auth requise
  - Validation password strength
  - Vérifie password actuel
  - Controller: changePassword
- **GET /api/account/preferences**
  - Auth requise
  - Préférences utilisateur
  - Controller: getPreferences
- **PATCH /api/account/preferences**
  - Auth requise
  - Mise à jour préférences
  - Controller: updatePreferences

#### 16. routes/backupRoutes.ts ⭐ NOUVEAU
- **POST /api/backup/create**
  - Auth requise, role ADMIN
  - Backup SQL complet (pg_dump)
  - Controller: createBackup
- **POST /api/backup/export/:entity/:format**
  - Auth requise, role ADMIN
  - Export sélectif (Excel, CSV, JSON)
  - Entités: instruments, interventions, sites, suppliers, users, movements
  - Controller: exportEntity
- **POST /api/backup/export-all/:format**
  - Auth requise, role ADMIN
  - Export toutes entités
  - Formats: excel (multi-feuilles), csv (zip), json (zip)
  - Controller: exportAll
- **GET /api/backup/list**
  - Auth requise, role ADMIN
  - Liste backups avec métadonnées
  - Controller: listBackups
- **POST /api/backup/restore**
  - Auth requise, role ADMIN
  - Restauration backup SQL
  - ATTENTION: opération destructive
  - Controller: restoreBackup
- **POST /api/backup/import/:entity**
  - Auth requise, role ADMIN
  - Import CSV/JSON/Excel
  - Validation automatique
  - Controller: importData
- **GET /api/backup/download/:filename**
  - Auth requise, role ADMIN
  - Téléchargement fichier backup
  - Controller: downloadBackup
- **DELETE /api/backup/:filename**
  - Auth requise, role ADMIN
  - Suppression backup
  - Controller: deleteBackup

---

### 🎮 Controllers (16 au total)

#### controllers/authController.ts
- **register()**
  - Hash password (bcrypt, 10 rounds)
  - Crée user dans DB
  - Génère JWT token
  - Retourne user + token
- **login()**
  - Vérifie email existe
  - Compare password (bcrypt)
  - Génère JWT token
  - Log tentative (succès/échec)
- **getMe()**
  - Récupère user depuis req.user.userId
  - Retourne infos complètes
  - Exclut password

#### controllers/instrumentController.ts
- **getAllInstruments()**
  - Filtres: site, type, status, search
  - Pagination: page, limit
  - Tri: nom, date, numéro série
  - Include: site, type, interventions
- **getInstrumentById()**
  - Include: site, type, interventions, movements, documents
  - Calcul prochaine échéance étalonnage
- **createInstrument()**
  - Validation données
  - Création avec config étalonnage
  - Gestion méthode prédéfinie ou avancée
  - Calcul dates automatique via calibrationDateService
- **updateInstrument()**
  - Mise à jour données
  - Recalcul dates étalonnage si modifié
  - Historique modifications
- **deleteInstrument()**
  - Soft delete ou hard delete
  - Vérifie interventions en cours

#### controllers/interventionController.ts
- **getAllInterventions()**
  - Filtres: dates, instrument, fournisseur, status
  - Include: instrument, supplier, user
  - Tri par date
- **getInterventionById()**
  - Include: instrument, supplier, user, documents
  - Historique complet
- **createIntervention()**
  - Validation dates
  - Upload documents automatique
  - Notification si hors tolérance
  - Mise à jour status instrument
- **updateIntervention()**
  - Mise à jour résultats
  - Changement status
  - Ajout documents
- **deleteIntervention()**
  - Suppression avec documents
  - Rollback status instrument

#### controllers/supplierController.ts
- **getAllSuppliers()**
  - Filtres: accrédité, actif
  - Include: accréditations
- **getSupplierById()**
  - Include: accréditations, interventions
  - Statistiques performance
- **createSupplier()**
  - Création avec accréditations
  - Validation contact
- **updateSupplier()**
  - Mise à jour infos
  - Gestion accréditations
- **deleteSupplier()**
  - Vérifie pas d'interventions actives

#### controllers/documentController.ts
- **getAllDocuments()**
  - Filtres: instrument, intervention, type
- **getDocumentById()**
  - Stream fichier
  - Headers download
- **uploadDocument()**
  - Upload via Multer
  - Validation type MIME
  - Stockage /uploads
  - Enregistrement DB
- **deleteDocument()**
  - Suppression fichier système
  - Suppression DB

#### controllers/siteController.ts
- **getAllSites()**
  - Liste avec count instruments
- **getSiteById()**
  - Include: instruments actifs
  - Statistiques site
- **createSite()**
  - Validation adresse
  - Géocodage optionnel
- **updateSite()**
  - Mise à jour infos
- **deleteSite()**
  - Vérifie instruments liés

#### controllers/instrumentTypeController.ts
- **getAllInstrumentTypes()**
  - Liste avec count instruments
- **getInstrumentTypeById()**
  - Include: instruments de ce type
- **createInstrumentType()**
  - Création type personnalisé
- **updateInstrumentType()**
  - Mise à jour métadonnées
- **deleteInstrumentType()**
  - Vérifie instruments liés

#### controllers/movementController.ts
- **getAllMovements()**
  - Filtres: dates, instrument, site
  - Include: instrument, user
- **getMovementById()**
  - Détails complets
- **createMovement()**
  - Types: IN, OUT, TRANSFER
  - Mise à jour localisation instrument
  - Log automatique
- **deleteMovement()**
  - Rollback localisation

#### controllers/userController.ts
- **getAllUsers()**
  - Filtres: role, active
  - Exclut passwords
- **getUserById()**
  - Include: créations, modifications
- **createUser()**
  - Hash password
  - Validation email unique
  - Rôle par défaut: LECTURE_SEULE
- **updateUser()**
  - Mise à jour infos
  - Changement rôle (ADMIN only)
- **deleteUser()**
  - Désactivation (soft delete)

#### controllers/calibrationMethodController.ts
- **getAllCalibrationMethods()**
  - Méthodes prédéfinies + custom
- **getCalibrationMethodById()**
  - Template complet
- **createCalibrationMethod()**
  - Méthode personnalisée
  - Définition récurrence
- **updateCalibrationMethod()**
  - Mise à jour template
- **deleteCalibrationMethod()**
  - Suppression si pas utilisée

#### controllers/calibrationCalendarController.ts
- **getAllCalibrationCalendars()**
  - Planning filtré par dates
  - Vue mensuelle/hebdomadaire
- **getCalibrationCalendarById()**
  - Détails événement
- **createCalibrationCalendar()**
  - Création événement
  - Génération depuis instrument
- **updateCalibrationCalendar()**
  - Reprogrammation
  - Changement status
- **deleteCalibrationCalendar()**
  - Annulation événement

#### controllers/dashboardController.ts
- **getDashboardStats()**
  - Count instruments par status
  - Interventions en cours
  - Alertes étalonnage (< 30 jours)
  - Mouvements 7 derniers jours
  - Graphiques et tendances

#### controllers/maintenanceController.ts
- **getAllMaintenanceMessages()**
  - Messages actifs par date
  - Filtres: type, priorité
- **getMaintenanceMessageById()**
  - Détails message
- **createMaintenanceMessage()**
  - Types: INFO, WARNING, MAINTENANCE
  - Dates début/fin
  - Affichage conditionnel
- **updateMaintenanceMessage()**
  - Mise à jour contenu
- **deleteMaintenanceMessage()**
  - Suppression message

#### controllers/accountController.ts
- **getMyProfile()**
  - Profil user connecté
- **updateMyProfile()**
  - firstName, lastName
- **changePassword()**
  - Vérifie password actuel
  - Validation nouveau (8+ chars, complexity)
  - Hash et update
  - Log changement
- **getPreferences()**
  - emailNotifications
  - pushNotifications
  - darkMode
- **updatePreferences()**
  - Mise à jour préférences
  - Sauvegarde DB

#### controllers/backupController.ts ⭐ NOUVEAU
- **createBackup()**
  - Utilise utils/backup.ts
  - pg_dump PostgreSQL
  - Compression optionnelle
  - Chiffrement optionnel
  - Stockage /app/backups
- **exportEntity(entity, format)**
  - Récupère données via Prisma
  - Formats: Excel (exceljs), CSV (csv-writer), JSON
  - Styling Excel (headers colorés)
  - Retourne filename
- **exportAll(format)**
  - Export 9 entités
  - Excel: multi-feuilles
  - CSV/JSON: archive ZIP
  - Utilise utils/backup.ts
- **listBackups()**
  - Liste fichiers /app/backups
  - Métadonnées: taille, date, type
  - Tri par date desc
- **restoreBackup(filename)**
  - Utilise utils/backup.ts
  - pg_restore
  - Décompression auto
  - Déchiffrement auto
  - ATTENTION: écrase DB
- **importData(entity, file)**
  - Utilise utils/dataImporter.ts
  - Parse CSV/JSON/Excel
  - Validation données
  - Import par batch
  - Gestion erreurs par ligne
- **downloadBackup(filename)**
  - Stream fichier
  - Headers download
  - Content-Type: octet-stream
- **deleteBackup(filename)**
  - Suppression fichier
  - Vérification existence

---

### 🛠️ Services & Utils

#### services/calibrationDateService.ts
- **calculateNextCalibrationDate()**
  - Input: instrument config
  - Types récurrence: FIXED_INTERVAL, CALENDAR_DAILY, CALENDAR_WEEKLY, etc.
  - Calcul date avec tolérance
  - Retourne: nextDate, dueDate, toleranceDate
- **isCalibrationDue()**
  - Vérifie si étalonnage nécessaire
  - Compare avec date actuelle
- **getCalibrationStatus()**
  - Statuts: À JOUR, PROCHE, EN RETARD
  - Codes couleur

#### utils/backup.ts ⭐ ÉTENDU
- **SecureBackupManager class**
  - **config**: databaseUrl, backupDir, retentionDays, encryption, compression
  - **createFullBackup()**
    - pg_dump avec PGPASSWORD
    - Compression gzip si activé
    - Chiffrement si activé
    - Cleanup anciens backups
    - Retourne filename
  - **restoreBackup(filename)**
    - Détection format (.sql, .gz, .enc)
    - Décompression si nécessaire
    - Déchiffrement si nécessaire
    - psql restore
    - Cleanup fichiers temp
  - **exportToExcel(entityName, data)**
    - Création workbook exceljs
    - Headers stylisés (gris foncé, blanc, gras)
    - Colonnes auto-width
    - Sauvegarde fichier
  - **exportToCSV(entityName, data)**
    - csv-writer avec headers
    - Encodage UTF-8
    - Sauvegarde fichier
  - **exportToJSON(entityName, data)**
    - JSON.stringify avec indent 2
    - Format lisible
  - **exportAllEntities(format, entitiesData)**
    - Excel: une feuille par entité
    - CSV/JSON: zip multiple fichiers
    - Retourne filename
  - **listBackups()**
    - Scan backupDir
    - Métadonnées (size, date, type)
    - Tri date desc
  - **deleteBackup(filename)**
    - fs.unlinkSync
  - **cleanupOldBackups()**
    - Supprime > retentionDays
    - Automatique après chaque backup

#### utils/dataImporter.ts ⭐ NOUVEAU
- **importFromCSV(entity, filePath)**
  - csv-parser stream
  - Parse automatique
  - Conversion types
  - Import via Prisma
  - Retourne: success, imported, errors[]
- **importFromJSON(entity, filePath)**
  - fs.readFileSync + JSON.parse
  - Validation array
  - Import via Prisma
  - Gestion erreurs
- **importFromExcel(entity, filePath)**
  - exceljs.Workbook.xlsx.readFile
  - Lecture première feuille ou feuille nommée
  - Extraction headers + data
  - Import via Prisma
- **cleanRowData(row)**
  - Conversion booléens ("true" → true)
  - Conversion dates (string → Date)
  - Conversion nombres (string → number)
  - Parsing tableaux JSON
  - Nettoyage valeurs vides
- **validateImportData(entity, data)**
  - Vérifie champs requis par entité
  - Retourne: valid, errors[]
- **entityModels mapping**
  - instruments → prisma.instrument
  - interventions → prisma.intervention
  - sites → prisma.site
  - suppliers → prisma.supplier
  - users → prisma.user
  - movements → prisma.movement
  - instrumentTypes → prisma.instrumentType
  - calibrationMethods → prisma.calibrationMethod
  - calibrationCalendars → prisma.calibrationCalendar

#### utils/encryption.ts
- **encrypt(text)**
  - Algorithm: aes-256-cbc
  - Key: ENCRYPTION_KEY env
  - IV aléatoire
  - Retourne: { iv, encryptedData }
- **decrypt({ iv, encryptedData })**
  - Déchiffrement avec key
  - Retourne texte original

#### utils/logger.ts
- **NON UTILISÉ ACTUELLEMENT**
- Prêt pour logging avancé
- Winston ou similaire

---

## 🟢 FRONTEND

### Point d'Entrée

#### main.tsx
- **React.StrictMode**
- Mount <App /> sur #root
- Import global CSS

#### App.tsx
- **Providers**
  - AuthProvider (context auth)
  - ToastProvider (notifications)
- **Router**
  - BrowserRouter
  - 37 routes définies
  - PrivateRoute wrapper
  - Layout commun
- **Routes publiques**
  - /login → LoginPage
- **Routes privées**
  - / → DashboardPage
  - /instruments/* → 4 routes
  - /interventions/* → 4 routes
  - /fournisseurs/* → 4 routes
  - /sites/* → 4 routes
  - /mouvements/* → 2 routes
  - /utilisateurs/* → 2 routes (ADMIN)
  - /methodes-etalonnage/* → 4 routes
  - /calendriers-etalonnage/* → 2 routes
  - /planning-etalonnage → 1 route
  - /configuration-interventions/* → 2 routes
  - /messages-maintenance/* → 2 routes (ADMIN)
  - /parametres → 1 route
  - /rapports → 1 route
  - /mon-compte → 1 route

---

### 🎨 Contextes

#### contexts/AuthContext.tsx
- **State**
  - user: User | null
  - token: string | null
  - isAuthenticated: boolean
  - loading: boolean
- **Functions**
  - login(email, password)
  - register(userData)
  - logout()
  - updateUser(userData)
- **Storage**
  - localStorage: token, user
  - Auto-load au mount
  - Auto-clear au logout
- **Utilisé par**: Toutes les pages + Layout + PrivateRoute

#### contexts/ToastContext.tsx
- **State**
  - toasts: Toast[]
- **Functions**
  - showToast(message, type, details?)
  - hideToast(id)
- **Types**
  - success, error, warning, info
- **Auto-hide**: 5 secondes
- **Utilisé par**: Toutes les pages

---

### 🧩 Composants Réutilisables

#### components/Layout.tsx
- **Structure**
  - Sidebar (navigation)
  - Header (user, logout, notifications)
  - Main content area
  - Mobile menu
- **Navigation**
  - Tableau de bord
  - Instruments
  - Étalonnages
  - Interventions
  - Mouvements
  - Fournisseurs
  - Sites
  - Rapports
  - Utilisateurs (ADMIN only)
  - Mon compte
  - Paramètres
- **Features**
  - Active link highlight
  - User profile dropdown
  - Responsive sidebar
  - Breadcrumbs integration

#### components/PrivateRoute.tsx
- **Props**
  - children: ReactNode
  - requiredRole?: string
- **Logic**
  - Vérifie isAuthenticated
  - Redirect /login si non auth
  - Vérifie role si requis
  - Affiche 403 si role insuffisant

#### components/LoadingSpinner.tsx
- **Props**
  - size?: 'sm' | 'md' | 'lg'
  - fullScreen?: boolean
- **Design**
  - Animation rotate
  - Tailwind CSS

#### components/StatusBadge.tsx
- **Props**
  - status: string
  - type?: 'instrument' | 'intervention' | 'movement'
- **Colors**
  - À JOUR → green
  - PROCHE → yellow
  - EN RETARD → red
  - EN COURS → blue

#### components/MaintenanceNotification.tsx
- **Features**
  - Fetch messages actifs
  - Affichage banner top
  - Dismiss option
  - Types: INFO, WARNING, MAINTENANCE
  - Icons + colors

#### components/Calendar.tsx
- **Props**
  - events: CalibrationEvent[]
  - onDateClick?: (date) => void
  - onEventClick?: (event) => void
- **Features**
  - Vue mensuelle
  - Événements colorés
  - Navigation mois
  - Highlight aujourd'hui

#### components/common/Breadcrumbs.tsx
- **Props**
  - items: Array<{ label, href? }>
- **Design**
  - Chemin de navigation
  - Liens cliquables
  - Dernier item non cliquable

#### components/common/ConfirmDialog.tsx
- **Props**
  - isOpen: boolean
  - title: string
  - message: string
  - confirmLabel?: string
  - cancelLabel?: string
  - onConfirm: () => void
  - onCancel: () => void
  - variant?: 'danger' | 'warning' | 'info'
- **Design**
  - Modal overlay
  - Boutons colorés
  - Icons

#### components/common/FormField.tsx
- **Props**
  - label: string
  - name: string
  - type?: string
  - value: any
  - onChange: (e) => void
  - error?: string
  - required?: boolean
  - options?: Array (pour select)
- **Features**
  - Label avec asterisk si required
  - Error message styling
  - Support input, textarea, select

#### components/common/Modal.tsx
- **Props**
  - isOpen: boolean
  - onClose: () => void
  - title: string
  - children: ReactNode
  - size?: 'sm' | 'md' | 'lg' | 'xl'
- **Features**
  - Overlay cliquable
  - ESC pour fermer
  - Scroll interne
  - Responsive

#### components/common/Toast.tsx
- **Props**
  - message: string
  - type: 'success' | 'error' | 'warning' | 'info'
  - details?: string
  - onClose: () => void
- **Design**
  - Position: top-right
  - Auto-dismiss: 5s
  - Icons colorés
  - Animation slide-in

#### components/forms/AdvancedCalibrationScheduler.tsx
- **Props**
  - value: CalibrationConfig
  - onChange: (config) => void
- **Features**
  - Type récurrence: Fixed, Calendar
  - Fréquence + unité
  - Jours semaine (weekly)
  - Jour mois (monthly)
  - Tolérance
  - Preview prochaines dates

#### components/upload/FileUpload.tsx
- **Props**
  - onUpload: (file) => void
  - accept?: string
  - maxSize?: number
  - multiple?: boolean
- **Features**
  - Drag & drop
  - Click to browse
  - Validation taille
  - Validation type
  - Preview images

#### components/upload/DocumentList.tsx
- **Props**
  - documents: Document[]
  - onDelete?: (id) => void
  - onDownload?: (id) => void
- **Features**
  - Liste avec icons
  - Download button
  - Delete button (si permission)
  - Taille fichier formatée
  - Date upload

---

### 📄 Pages (37 au total)

#### pages/LoginPage.tsx
- **State**: email, password, loading, error
- **Submit**: authService.login()
- **Success**: store token + redirect dashboard
- **Design**: Centered card, logo, form

#### pages/DashboardPage.tsx
- **Fetch**
  - Stats globales (instruments, interventions)
  - Alertes étalonnage
  - Mouvements récents
- **Widgets**
  - Count cards (avec icons)
  - Graphiques (instruments par status)
  - Liste alertes (liens vers instruments)
  - Liste mouvements récents

#### pages/InstrumentsPage.tsx
- **Fetch**: instrumentService.getAll()
- **Filters**
  - Search (nom, numéro série)
  - Site
  - Type
  - Status étalonnage
- **Table**
  - Columns: Nom, Numéro série, Type, Site, Status, Actions
  - Actions: Voir, Modifier, Supprimer
- **Pagination**: page, limit
- **Button**: + Nouvel instrument

#### pages/InstrumentDetailPage.tsx
- **Fetch**: instrumentService.getById(id)
- **Include**: site, type, interventions, movements, documents
- **Sections**
  - Infos générales
  - Configuration étalonnage
  - Prochaine échéance
  - Historique interventions
  - Mouvements
  - Documents attachés
- **Actions**: Modifier, Supprimer

#### pages/InstrumentFormPage.tsx
- **Mode**: Create ou Edit (selon URL)
- **Form**
  - Informations générales
    - Nom, numéro série, description
    - Site, Type
    - Date d'achat, garantie
  - Configuration étalonnage
    - Méthode prédéfinie OU
    - Configuration avancée
      - AdvancedCalibrationScheduler component
      - Tolérance, fréquence
  - Documents
    - FileUpload component
- **Submit**: create ou update
- **Validation**: champs requis, format

#### pages/InterventionsPage.tsx
- **Fetch**: interventionService.getAll()
- **Filters**
  - Dates (range)
  - Instrument
  - Fournisseur
  - Status
- **Table**
  - Columns: Date, Instrument, Fournisseur, Type, Status, Actions
  - Actions: Voir, Modifier, Supprimer
- **Button**: + Nouvelle intervention

#### pages/InterventionDetailPage.tsx
- **Fetch**: interventionService.getById(id)
- **Include**: instrument, supplier, user, documents
- **Sections**
  - Informations générales
  - Dates planifiées vs réelles
  - Résultats étalonnage
  - Certificat
  - Documents
  - Commentaires
- **Actions**: Modifier, Supprimer, Télécharger certificat

#### pages/InterventionFormPage.tsx
- **Mode**: Create ou Edit
- **Form**
  - Instrument (select)
  - Fournisseur (select)
  - Dates: planifiée, réalisée
  - Type intervention
  - Résultats
  - Certificat (upload)
  - Documents (upload)
  - Commentaires
- **Submit**: create ou update

#### pages/SuppliersPage.tsx
- **Fetch**: supplierService.getAll()
- **Filters**
  - Search
  - Accrédité (oui/non)
  - Actif
- **Table**
  - Columns: Nom, Contact, Accréditations, Actif, Actions
  - Actions: Voir, Modifier, Supprimer
- **Button**: + Nouveau fournisseur

#### pages/SupplierDetailPage.tsx
- **Fetch**: supplierService.getById(id)
- **Sections**
  - Informations contact
  - Accréditations
  - Historique interventions
  - Statistiques performance
- **Actions**: Modifier, Supprimer

#### pages/SupplierFormPage.tsx
- **Form**
  - Nom, description
  - Contact (nom, email, téléphone)
  - Adresse
  - Accréditations (liste)
  - Actif (checkbox)
- **Submit**: create ou update

#### pages/SitesPage.tsx
- **Fetch**: siteService.getAll()
- **Table**
  - Columns: Nom, Adresse, Instruments, Actions
  - Count instruments par site
- **Button**: + Nouveau site

#### pages/SiteDetailPage.tsx
- **Fetch**: siteService.getById(id)
- **Sections**
  - Informations
  - Adresse
  - Liste instruments du site
- **Actions**: Modifier, Supprimer

#### pages/SiteFormPage.tsx
- **Form**
  - Nom
  - Adresse complète
  - Coordonnées GPS (optionnel)
- **Submit**: create ou update

#### pages/MovementsPage.tsx
- **Fetch**: movementService.getAll()
- **Filters**
  - Dates
  - Instrument
  - Type mouvement
  - Site origine/destination
- **Table**
  - Columns: Date, Instrument, Type, De → Vers, User, Actions
  - Actions: Voir, Supprimer
- **Button**: + Nouveau mouvement

#### pages/MovementFormPage.tsx
- **Form**
  - Instrument (select)
  - Type: IN, OUT, TRANSFER
  - Site origine
  - Site destination (si TRANSFER)
  - Date
  - Commentaire
- **Submit**: create

#### pages/UsersPage.tsx
- **Fetch**: authService.getAllUsers()
- **Filters**
  - Role
  - Actif
- **Table**
  - Columns: Nom, Email, Role, Actif, Actions
  - Actions: Modifier, Supprimer
- **Button**: + Nouvel utilisateur
- **Access**: ADMIN only

#### pages/UserFormPage.tsx
- **Mode**: Create ou Edit
- **Form**
  - Email
  - Password (si create)
  - Prénom, Nom
  - Role (select)
  - Actif (checkbox)
- **Submit**: create ou update
- **Access**: ADMIN only

#### pages/SettingsPage.tsx
- **Sections**
  - Types d'instruments
    - Liste avec count
    - Add, Edit, Delete
  - Configuration interventions
    - Templates types interventions
  - Paramètres système
    - Fréquences par défaut
    - Tolérances
- **Access**: ADMIN ou RESPONSABLE

#### pages/ReportsPage.tsx
- **Reports**
  - Instruments par site
  - Instruments par type
  - Interventions par période
  - Interventions par fournisseur
  - Alertes étalonnage
  - Mouvements par période
- **Filters**: dates, sites, types
- **Export**: PDF, Excel

#### pages/InterventionConfigPage.tsx
- **Fetch**: interventionConfigService.getAll()
- **List**: Templates types interventions
- **Button**: + Nouvelle configuration

#### pages/InterventionConfigFormPage.tsx
- **Form**
  - Nom template
  - Type intervention
  - Champs requis
  - Valeurs par défaut
- **Submit**: create ou update

#### pages/AccountPage.tsx ⭐ ÉTENDU
- **Tabs**
  - **Profil**
    - Infos user
    - Role, permissions
  - **Messages de maintenance**
    - Lien vers gestion (si ADMIN)
  - **Paramètres**
    - Sécurité
      - Changer mot de passe (modal)
      - 2FA (à venir)
      - Sessions actives (à venir)
    - Préférences
      - Notifications email (toggle)
      - Notifications push (toggle)
      - Mode sombre (toggle)
  - **Sauvegardes** ⭐ NOUVEAU (ADMIN only)
    - **Zone Exports** (fond bleu)
      - Backup SQL Complet
        - Bouton "Créer backup"
      - Export Sélectif
        - Select entité
        - Select format (Excel/CSV/JSON)
        - Bouton "Exporter"
      - Export Complet
        - Boutons: Excel, CSV (zip), JSON (zip)
    - **Zone Import/Restauration** (fond jaune warning)
      - Importer des données
        - Select entité
        - File input (CSV/JSON/Excel)
        - Bouton "Importer"
      - Restaurer Backup SQL
        - Badge "Attention"
        - Warning destructif
        - Bouton "Restaurer un backup"
    - **Zone Gestion** (liste backups)
      - Table: Nom, Taille, Date, Type
      - Actions: Télécharger, Supprimer
      - Bouton "Actualiser"
- **Modals**
  - Changement password
  - Restauration backup (avec warning)

#### pages/MaintenanceMessagesPage.tsx
- **Fetch**: maintenanceService.getAll()
- **Filters**
  - Type (INFO, WARNING, MAINTENANCE)
  - Actif
- **Table**
  - Columns: Titre, Type, Dates, Actif, Actions
- **Button**: + Nouveau message
- **Access**: ADMIN only

#### pages/MaintenanceMessageFormPage.tsx
- **Form**
  - Titre
  - Message (textarea)
  - Type (select)
  - Dates début/fin
  - Actif (checkbox)
- **Submit**: create ou update
- **Access**: ADMIN only

#### pages/CalibrationMethodsPage.tsx
- **Fetch**: calibrationMethodService.getAll()
- **List**: Méthodes prédéfinies + custom
- **Actions**: Voir, Modifier, Supprimer, Dupliquer
- **Button**: + Nouvelle méthode

#### pages/CalibrationMethodFormPage.tsx
- **Form**
  - Nom méthode
  - Description
  - Configuration récurrence
    - Type, fréquence, tolérance
  - Template (optionnel)
- **Submit**: create ou update

#### pages/CalibrationMethodDetailPage.tsx
- **Fetch**: calibrationMethodService.getById(id)
- **Sections**
  - Détails méthode
  - Configuration
  - Instruments utilisant cette méthode
- **Actions**: Modifier, Supprimer, Dupliquer

#### pages/CalibrationMethodBulkPage.tsx
- **Features**
  - Sélection multiple instruments
  - Application méthode en masse
  - Preview changements
  - Confirmation
- **Submit**: bulk update

#### pages/CalibrationCalendarsPage.tsx
- **Fetch**: calibrationCalendarService.getAll()
- **Filters**: dates
- **Table**
  - Columns: Date, Instrument, Type, Status
- **Button**: + Nouvel événement

#### pages/CalibrationCalendarFormPage.tsx
- **Form**
  - Instrument
  - Date planifiée
  - Type
  - Commentaire
- **Submit**: create ou update

#### pages/CalibrationPlanningPage.tsx
- **Fetch**: calibrationCalendarService.getAll()
- **View**: Calendar component
- **Features**
  - Vue mensuelle
  - Événements étalonnage
  - Click → détails
  - Drag & drop (à venir)
  - Filtres: site, type

---

### 🔌 Services Frontend (14 au total)

#### services/api.ts
- **axios instance**
  - baseURL: /api (proxy Vite)
  - timeout: 30000
  - headers: Content-Type application/json
- **Interceptors**
  - Request: ajout token Authorization
  - Response: extraction data
  - Error: formatage erreurs, logout si 401

#### services/authService.ts
- **login(email, password)**
  - POST /api/auth/login
  - Retourne: user, token
- **register(userData)**
  - POST /api/auth/register
  - Retourne: user, token
- **getMe()**
  - GET /api/auth/me
  - Retourne: user actuel
- **getAllUsers()** (ADMIN)
  - GET /api/users
  - Retourne: users[]

#### services/accountService.ts
- **getProfile()**
  - GET /api/account/profile
- **updateProfile(data)**
  - PATCH /api/account/profile
- **changePassword(currentPassword, newPassword)**
  - POST /api/account/change-password
- **getPreferences()**
  - GET /api/account/preferences
- **updatePreferences(prefs)**
  - PATCH /api/account/preferences

#### services/backupService.ts ⭐ NOUVEAU
- **createBackup()**
  - POST /api/backup/create
  - Retourne: filename
- **exportEntity(entity, format)**
  - POST /api/backup/export/:entity/:format
  - Retourne: filename, count
- **exportAll(format)**
  - POST /api/backup/export-all/:format
  - Retourne: filename
- **listBackups()**
  - GET /api/backup/list
  - Retourne: backups[] (filename, size, created, type)
- **restoreBackup(filename)**
  - POST /api/backup/restore
  - Body: { filename }
- **importData(entity, file)**
  - POST /api/backup/import/:entity
  - FormData avec file
  - Retourne: imported, errors[]
- **downloadBackup(filename)**
  - GET /api/backup/download/:filename
  - Déclenche téléchargement navigateur
- **deleteBackup(filename)**
  - DELETE /api/backup/:filename
- **formatFileSize(bytes)**
  - Utilitaire: B, KB, MB, GB
- **formatDate(date)**
  - Utilitaire: format français

#### services/instrumentService.ts
- **getAll(filters, pagination)**
  - GET /api/instruments
  - Params: search, site, type, status, page, limit
- **getById(id)**
  - GET /api/instruments/:id
- **create(data)**
  - POST /api/instruments
- **update(id, data)**
  - PUT /api/instruments/:id
- **delete(id)**
  - DELETE /api/instruments/:id

#### services/interventionService.ts
- **getAll(filters)**
  - GET /api/interventions
- **getById(id)**
  - GET /api/interventions/:id
- **create(data)**
  - POST /api/interventions
- **update(id, data)**
  - PUT /api/interventions/:id
- **delete(id)**
  - DELETE /api/interventions/:id

#### services/supplierService.ts
- **getAll()**
  - GET /api/suppliers
- **getById(id)**
  - GET /api/suppliers/:id
- **create(data)**
  - POST /api/suppliers
- **update(id, data)**
  - PUT /api/suppliers/:id
- **delete(id)**
  - DELETE /api/suppliers/:id

#### services/siteService.ts
- **getAll()**
  - GET /api/sites
- **getById(id)**
  - GET /api/sites/:id
- **create(data)**
  - POST /api/sites
- **update(id, data)**
  - PUT /api/sites/:id
- **delete(id)**
  - DELETE /api/sites/:id

#### services/movementService.ts
- **getAll(filters)**
  - GET /api/movements
- **getById(id)**
  - GET /api/movements/:id
- **create(data)**
  - POST /api/movements
- **delete(id)**
  - DELETE /api/movements/:id

#### services/instrumentTypeService.ts
- **getAll()**
  - GET /api/instrument-types
- **getById(id)**
  - GET /api/instrument-types/:id
- **create(data)**
  - POST /api/instrument-types
- **update(id, data)**
  - PUT /api/instrument-types/:id
- **delete(id)**
  - DELETE /api/instrument-types/:id

#### services/calibrationMethodService.ts
- **getAll()**
  - GET /api/calibration-methods
- **getById(id)**
  - GET /api/calibration-methods/:id
- **create(data)**
  - POST /api/calibration-methods
- **update(id, data)**
  - PUT /api/calibration-methods/:id
- **delete(id)**
  - DELETE /api/calibration-methods/:id

#### services/calibrationCalendarService.ts
- **getAll(filters)**
  - GET /api/calibration-calendars
- **getById(id)**
  - GET /api/calibration-calendars/:id
- **create(data)**
  - POST /api/calibration-calendars
- **update(id, data)**
  - PUT /api/calibration-calendars/:id
- **delete(id)**
  - DELETE /api/calibration-calendars/:id

#### services/interventionConfigService.ts
- **getAll()**
  - GET /api/intervention-configs (à implémenter)
- **create(data)**
  - POST /api/intervention-configs
- **update(id, data)**
  - PUT /api/intervention-configs/:id

#### services/maintenanceService.ts
- **getAll()**
  - GET /api/maintenance/messages
- **getById(id)**
  - GET /api/maintenance/messages/:id
- **create(data)**
  - POST /api/maintenance/messages
- **update(id, data)**
  - PUT /api/maintenance/messages/:id
- **delete(id)**
  - DELETE /api/maintenance/messages/:id

#### services/documentService.ts
- **getAll(filters)**
  - GET /api/documents
- **getById(id)**
  - GET /api/documents/:id
- **upload(file, metadata)**
  - POST /api/documents
  - FormData
- **delete(id)**
  - DELETE /api/documents/:id

---

### 📐 Types & Utils

#### types/index.ts
- **User**: id, email, firstName, lastName, role, active
- **Instrument**: id, serialNumber, name, type, site, config étalonnage
- **Intervention**: id, dates, instrument, supplier, résultats
- **Site**: id, name, adresse
- **Supplier**: id, name, contact, accréditations
- **Movement**: id, type, instrument, sites, date
- **CalibrationMethod**: id, name, config
- **CalibrationCalendar**: id, date, instrument, status
- **Document**: id, filename, type, path
- **Role**: ADMIN, RESPONSABLE_METROLOGIE, TECHNICIEN, LECTURE_SEULE
- **RecurrenceType**: FIXED_INTERVAL, CALENDAR_DAILY, etc.

#### types/interventionConfig.ts
- **InterventionConfig**: templates types interventions

#### types/maintenance.ts
- **MaintenanceMessage**: titre, message, type, dates, actif

#### utils/errorHandler.ts
- **extractErrorDetails(error)**
  - Parse axios errors
  - Retourne: { message, details }
  - Gère: network errors, 401, 403, 404, 500

#### utils/format.ts
- **formatDate(date, format?)**
  - Format français par défaut
  - Intl.DateTimeFormat
- **formatNumber(number, decimals?)**
  - Séparateurs milliers
- **formatCurrency(amount)**
  - Format euros

---

## 🐳 INFRASTRUCTURE

### Docker

#### docker-compose.yml
- **services**
  - **postgres**
    - Image: postgres:15-alpine
    - Port: 5432
    - Volume: postgres_data
    - Healthcheck: pg_isready
    - Env: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
  - **backend**
    - Build: ./backend (Dockerfile.simple)
    - Platform: linux/amd64
    - Port: 5001:5000
    - Depends: postgres (healthy)
    - Volume: backend_uploads
    - Env: DATABASE_URL, JWT_SECRET, FRONTEND_URL, etc.
  - **frontend**
    - Build: ./frontend (Dockerfile)
    - Port: 3000:80
    - Depends: backend
    - Nginx serving static files

#### backend/Dockerfile.simple
- **Base**: node:20-alpine
- **Étapes**
  - Install: openssl, postgresql-client, ca-certificates
  - Copy: package.json, tsconfig.json
  - npm install (toutes dépendances)
  - Copy: code source
  - Prisma generate (avec PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING)
  - npm run build (TypeScript → JavaScript)
  - mkdir uploads
- **CMD**: Prisma generate + npm start

#### frontend/Dockerfile
- **Builder stage**
  - Base: node:20-alpine
  - npm install
  - npm run build (Vite → dist/)
- **Production stage**
  - Base: nginx:alpine
  - Copy: dist/ → /usr/share/nginx/html
  - Copy: nginx.conf
  - Expose: 80

### Scripts

#### start.sh
- **Détection Docker**
- **Option --rebuild**
  - docker-compose down
  - docker-compose build --no-cache backend
- **Démarrage**
  - docker-compose up -d
  - Wait PostgreSQL (10s)
  - Prisma generate dans container
  - Restart backend
  - Wait backend (5s)
- **Initialisation DB**
  - Vérifie migrations
  - prisma migrate deploy si nécessaire
  - npm run seed
- **Affichage**
  - URLs (frontend, backend, DB)
  - Comptes test
  - Commandes utiles

---

## 📚 DOCUMENTATION

### Guides
- **README.md**: Vue d'ensemble, features, installation
- **QUICK_START.md**: Démarrage rapide
- **DOCKER_QUICK_START.md**: Guide Docker spécifique
- **BACKUP_RESTORE_GUIDE.md**: Guide système sauvegarde/restauration
- **SECURITY_GUIDE.md**: Bonnes pratiques sécurité
- **PRISMA_BINARIES_ISSUE.md**: Workaround problème Prisma binaries

### Rapports
- **METRO_REPORTS.md**: Historique 6 problèmes résolus
- **AUDIT_SECURITE_RAPPORT.md**: Audit sécurité complet
- **PROJECT_FILES_MAP.md**: Carte interactions (ce fichier)
- **MINDMAP_METRO.md**: Carte mentale détaillée (ce fichier)

### Technique
- **ACCOUNT_FEATURES_IMPLEMENTATION.md**: Implémentation features compte
- **BULK_CALIBRATION_REDESIGN.md**: Redesign calibration en masse
- **INDEX_DOCUMENTATION.md**: Index documentation
- **LINTER_RESOLUTION.md**: Résolution erreurs linter
- **TEST_CALIBRATION.md**: Tests étalonnage

---

## 📊 STATISTIQUES

### Backend
- **Contrôleurs**: 16
- **Routes**: 16
- **Middleware**: 4
- **Services**: 1
- **Utils**: 4
- **Config**: 2
- **Total lignes**: ~15,000

### Frontend
- **Pages**: 37
- **Composants**: 13
- **Services**: 14
- **Contextes**: 2
- **Utils/Types**: 5
- **Total lignes**: ~18,000

### Total Projet
- **Fichiers sources**: 114
- **Lignes de code**: ~33,000
- **Dépendances backend**: 331 packages
- **Dépendances frontend**: ~180 packages

---

## 🔗 FLUX DE DONNÉES PRINCIPAUX

### 1. Authentification
```
User Login Form
  → authService.login()
  → POST /api/auth/login
  → authController.login()
  → Prisma: find user
  → bcrypt: compare password
  → jwt: generate token
  → Response: { user, token }
  → AuthContext: store token + user
  → Redirect to Dashboard
```

### 2. Création Instrument
```
InstrumentFormPage
  → Fill form (nom, type, site, config étalonnage)
  → instrumentService.create()
  → POST /api/instruments
  → validate(schemas.instrument)
  → instrumentController.createInstrument()
  → calibrationDateService.calculateNextDate()
  → Prisma: instrument.create()
  → Response: instrument
  → Redirect to instruments list
  → Toast: success
```

### 3. Backup SQL Complet
```
AccountPage (onglet Sauvegardes, ADMIN)
  → Click "Créer backup"
  → backupService.createBackup()
  → POST /api/backup/create
  → requireAdmin middleware
  → backupController.createBackup()
  → backupManager.createFullBackup()
  → pg_dump PostgreSQL
  → Compression (gzip)
  → Stockage /app/backups
  → Response: { filename }
  → Refresh backups list
  → Toast: success
```

### 4. Export Excel Instruments
```
AccountPage (onglet Sauvegardes)
  → Select: entité=instruments, format=excel
  → Click "Exporter"
  → backupService.exportEntity('instruments', 'excel')
  → POST /api/backup/export/instruments/excel
  → requireAdmin middleware
  → backupController.exportEntity()
  → Prisma: instrument.findMany()
  → backupManager.exportToExcel()
  → exceljs: create workbook + styling
  → Sauvegarde fichier
  → Response: { filename, count }
  → Refresh backups list
  → Toast: success
```

### 5. Import CSV Sites
```
AccountPage (onglet Sauvegardes)
  → Select: entité=sites
  → Upload: fichier.csv
  → Click "Importer"
  → backupService.importData('sites', file)
  → POST /api/backup/import/sites (FormData)
  → requireAdmin middleware
  → backupController.importData()
  → dataImporter.importFromCSV()
  → csv-parser: parse file
  → cleanRowData: convert types
  → Prisma: site.create() for each row
  → Response: { imported: 10, errors: [] }
  → Toast: success with count
```

### 6. Restauration Backup
```
AccountPage (onglet Sauvegardes)
  → Click "Restaurer un backup"
  → Modal: warning destructif
  → Select backup file
  → Click "Confirmer"
  → backupService.restoreBackup(filename)
  → POST /api/backup/restore
  → requireAdmin middleware
  → backupController.restoreBackup()
  → backupManager.restoreBackup()
  → Décompression si .gz
  → Déchiffrement si .enc
  → pg_restore
  → ATTENTION: écrase toute la DB
  → Response: { success }
  → Toast: success
  → Recommendation: restart services
```

### 7. Calcul Date Étalonnage
```
InstrumentFormPage
  → Configure récurrence (FIXED_INTERVAL, 12 mois, 30 jours tolérance)
  → Submit form
  → instrumentController.createInstrument()
  → calibrationDateService.calculateNextCalibrationDate({
      recurrenceType: 'FIXED_INTERVAL',
      frequencyValue: 12,
      frequencyUnit: 'MONTHS',
      toleranceValue: 30,
      toleranceUnit: 'DAYS',
      lastCalibrationDate: today
    })
  → Calcul:
      - nextDate = today + 12 months
      - dueDate = nextDate
      - toleranceDate = nextDate + 30 days
  → Prisma: save instrument avec dates
  → Response: instrument avec prochaine échéance
```

### 8. Dashboard Stats
```
DashboardPage mount
  → dashboardService.getStats() (custom function)
  → Multiple parallel calls:
      - instrumentService.getAll()
      - interventionService.getAll()
      - movementService.getAll()
  → OR single endpoint:
      - GET /api/dashboard/stats
      - dashboardController.getDashboardStats()
      - Prisma: multiple queries
        * instrument.count({ where: { status: 'ACTIF' } })
        * intervention.count({ where: { status: 'EN_COURS' } })
        * instrument.findMany({ where: { nextCalibrationDate: < 30 days } })
        * movement.findMany({ where: { date: > -7 days } })
  → Aggregate results
  → Response: { instrumentsCount, interventionsCount, alerts: [], movements: [] }
  → Render widgets with data
```

---

## 🎯 POINTS D'ATTENTION

### Sécurité
- ✅ JWT avec expiration 7 jours
- ✅ Rate limiting (auth: 10/15min, global: 1000/15min)
- ✅ Helmet + CSP
- ✅ CORS strict
- ✅ Validation Joi toutes routes
- ✅ Bcrypt passwords (10 rounds)
- ✅ Middleware requireAdmin pour backups
- ✅ Logging toutes actions sensibles
- ✅ Attack detection (SQL injection, XSS, Path traversal)

### Performance
- ✅ Prisma connection pooling
- ✅ Pagination sur listes
- ✅ Indexes DB (à vérifier sur schema)
- ⚠️ Optimisation queries N+1 (use include judicieusement)
- ⚠️ Cache Redis (à implémenter pour stats dashboard)

### Backup/Restore
- ✅ Backups SQL natifs (pg_dump)
- ✅ Exports multi-formats (Excel, CSV, JSON)
- ✅ Imports avec validation
- ✅ Rétention automatique (30 jours)
- ✅ Compression optionnelle
- ✅ Chiffrement optionnel
- ⚠️ Backups automatiques planifiés (à implémenter via cron)
- ⚠️ Stockage externe backups (S3, NAS) recommandé

### Monitoring
- ✅ Request monitoring (tous endpoints)
- ✅ Auth failure monitoring
- ✅ Brute force detection
- ✅ Security stats endpoint
- ⚠️ APM (Application Performance Monitoring) à ajouter
- ⚠️ Alerting automatique (email/SMS) à implémenter

### Testing
- ⚠️ Tests unitaires backend (à implémenter)
- ⚠️ Tests intégration API (à implémenter)
- ⚠️ Tests E2E frontend (Cypress/Playwright)
- ⚠️ Tests charge/performance (k6, Artillery)

---

## 🚀 ÉVOLUTIONS FUTURES

### Court terme
- [ ] Tests automatisés (unit + E2E)
- [ ] Backups automatiques planifiés
- [ ] Authentification 2FA
- [ ] Sessions actives management
- [ ] Stockage backups externe (S3)

### Moyen terme
- [ ] API REST → GraphQL (optionnel)
- [ ] WebSockets pour notifications temps réel
- [ ] Système de rapports avancés (PDF dynamiques)
- [ ] Module d'analyse et BI
- [ ] Application mobile (React Native)

### Long terme
- [ ] Multi-tenancy (plusieurs organisations)
- [ ] Marketplace templates étalonnage
- [ ] Intelligence artificielle (prédictions échéances)
- [ ] Intégrations externes (ERP, LIMS)
- [ ] Version cloud SaaS

---

**Fin de la carte mentale complète**

Version: 2.0  
Dernière mise à jour: 18 novembre 2025  
Projet: Metro - Système de Gestion Métrologique

