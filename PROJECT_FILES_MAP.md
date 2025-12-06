# Carte des Interactions - Projet Metro

## 📊 Vue d'ensemble

**Dernière mise à jour** : 18 novembre 2025  
**Fichiers actifs** : Backend (52), Frontend (67), Total actif : 119  
**Fichiers obsolètes identifiés** : 2

---

## 🔵 BACKEND - Architecture des Interactions

### Point d'entrée principal
```
server.ts (Point d'entrée)
    ├─> middleware/security.ts (helmetConfig, generalLimiter, authLimiter, speedLimiter, securityHeaders, attackDetection)
    ├─> middleware/monitoring.ts (requestMonitoring, authFailureMonitoring, bruteForceMonitoring, getSecurityStats)
    └─> Routes (16 modules)
```

### Routes et leurs dépendances

#### 1. **authRoutes.ts**
```
authRoutes.ts
    ├─> controllers/authController.ts (register, login, getMe)
    ├─> middleware/auth.ts (authenticateToken)
    └─> middleware/validation.ts (validate, schemas)
        └─> authController.ts
            ├─> config/database.ts (prisma)
            ├─> config/jwt.ts (generateToken, verifyToken)
            └─> bcrypt (hashing)
```

#### 2. **instrumentRoutes.ts**
```
instrumentRoutes.ts
    ├─> controllers/instrumentController.ts
    ├─> middleware/auth.ts (authenticateToken, authorize)
    └─> middleware/validation.ts
        └─> instrumentController.ts
            ├─> config/database.ts (prisma)
            ├─> services/calibrationDateService.ts
            └─> controllers/documentController.ts
```

#### 3. **interventionRoutes.ts**
```
interventionRoutes.ts
    ├─> controllers/interventionController.ts
    ├─> middleware/auth.ts
    └─> middleware/validation.ts
        └─> interventionController.ts
            └─> config/database.ts (prisma)
```

#### 4. **supplierRoutes.ts**
```
supplierRoutes.ts
    ├─> controllers/supplierController.ts
    ├─> middleware/auth.ts
    └─> middleware/validation.ts
        └─> supplierController.ts
            └─> config/database.ts (prisma)
```

#### 5. **documentRoutes.ts**
```
documentRoutes.ts
    ├─> controllers/documentController.ts
    ├─> middleware/auth.ts
    └─> multer (upload de fichiers)
        └─> documentController.ts
            ├─> config/database.ts (prisma)
            └─> fs, path (gestion fichiers)
```

#### 6. **siteRoutes.ts**
```
siteRoutes.ts
    ├─> controllers/siteController.ts
    ├─> middleware/auth.ts
    └─> middleware/validation.ts
        └─> siteController.ts
            └─> config/database.ts (prisma)
```

#### 7. **instrumentTypeRoutes.ts**
```
instrumentTypeRoutes.ts
    ├─> controllers/instrumentTypeController.ts
    ├─> middleware/auth.ts
    └─> middleware/validation.ts
        └─> instrumentTypeController.ts
            └─> config/database.ts (prisma)
```

#### 8. **movementRoutes.ts**
```
movementRoutes.ts
    ├─> controllers/movementController.ts
    ├─> middleware/auth.ts
    └─> middleware/validation.ts
        └─> movementController.ts
            └─> config/database.ts (prisma)
```

#### 9. **userRoutes.ts**
```
userRoutes.ts
    ├─> controllers/userController.ts
    ├─> middleware/auth.ts (authenticateToken, authorize ADMIN)
    └─> middleware/validation.ts
        └─> userController.ts
            ├─> config/database.ts (prisma)
            └─> bcrypt
```

#### 10. **calibrationMethodRoutes.ts**
```
calibrationMethodRoutes.ts
    ├─> controllers/calibrationMethodController.ts
    ├─> middleware/auth.ts
    └─> middleware/validation.ts
        └─> calibrationMethodController.ts
            └─> config/database.ts (prisma)
```

#### 11. **calibrationCalendarRoutes.ts**
```
calibrationCalendarRoutes.ts
    ├─> controllers/calibrationCalendarController.ts
    ├─> middleware/auth.ts
    └─> middleware/validation.ts
        └─> calibrationCalendarController.ts
            └─> config/database.ts (prisma)
```

#### 12. **dashboardRoutes.ts**
```
dashboardRoutes.ts
    ├─> controllers/dashboardController.ts
    └─> middleware/auth.ts
        └─> dashboardController.ts
            └─> config/database.ts (prisma)
```

#### 13. **securityRoutes.ts**
```
securityRoutes.ts
    ├─> middleware/monitoring.ts (getSecurityStats)
    └─> middleware/auth.ts (requireAdmin)
```

#### 14. **maintenanceRoutes.ts**
```
maintenanceRoutes.ts
    ├─> controllers/maintenanceController.ts
    ├─> middleware/auth.ts (authenticateToken, requireAdmin)
    └─> middleware/validation.ts
        └─> maintenanceController.ts
            └─> config/database.ts (prisma)
```

#### 15. **accountRoutes.ts**
```
accountRoutes.ts
    ├─> controllers/accountController.ts
    ├─> middleware/auth.ts (authenticateToken)
    └─> middleware/validation.ts
        └─> accountController.ts
            ├─> config/database.ts (prisma)
            └─> bcrypt
```

#### 16. **backupRoutes.ts** ⭐ NOUVEAU
```
backupRoutes.ts
    ├─> controllers/backupController.ts
    └─> middleware/auth.ts (authenticateToken, requireAdmin)
        └─> backupController.ts
            ├─> utils/backup.ts (backupManager)
            ├─> utils/dataImporter.ts (importFromCSV, importFromJSON, importFromExcel)
            └─> config/database.ts (prisma)
                ├─> backup.ts
                │   ├─> fs, path, child_process
                │   ├─> utils/encryption.ts (encrypt, decrypt)
                │   ├─> exceljs (exports Excel)
                │   └─> csv-writer (exports CSV)
                └─> dataImporter.ts
                    ├─> csv-parser (parsing CSV)
                    ├─> exceljs (lecture Excel)
                    └─> config/database.ts (prisma)
```

### Services & Utils

```
services/
    └─> calibrationDateService.ts
        └─> Utilisé par instrumentController.ts

utils/
    ├─> backup.ts (backupManager)
    │   ├─> Utilisé par backupController.ts
    │   └─> Dépend de encryption.ts
    ├─> dataImporter.ts
    │   └─> Utilisé par backupController.ts
    ├─> encryption.ts
    │   └─> Utilisé par backup.ts
    └─> logger.ts
        └─> NON UTILISÉ (mais peut être utile pour le futur)
```

### Configuration

```
config/
    ├─> database.ts (prisma client)
    │   └─> Utilisé par TOUS les controllers
    └─> jwt.ts (generateToken, verifyToken)
        └─> Utilisé par authController.ts et auth.ts
```

---

## 🟢 FRONTEND - Architecture des Interactions

### Point d'entrée principal

```
main.tsx
    └─> App.tsx
        ├─> contexts/AuthContext.tsx
        ├─> contexts/ToastContext.tsx
        ├─> components/Toast.tsx
        ├─> components/Layout.tsx
        ├─> components/PrivateRoute.tsx
        └─> Routes (37 pages)
```

### Contextes

```
contexts/
    ├─> AuthContext.tsx
    │   ├─> services/authService.ts
    │   └─> Utilisé par: Layout, PrivateRoute, toutes les pages
    └─> ToastContext.tsx
        └─> Utilisé par: App, toutes les pages
```

### Composants communs

```
components/
    ├─> Layout.tsx
    │   ├─> contexts/AuthContext.tsx
    │   └─> Utilisé par: toutes les routes dans App.tsx
    ├─> PrivateRoute.tsx
    │   ├─> contexts/AuthContext.tsx
    │   └─> Utilisé par: toutes les routes protégées dans App.tsx
    ├─> LoadingSpinner.tsx
    │   └─> Utilisé par: plusieurs pages
    ├─> StatusBadge.tsx
    │   └─> Utilisé par: pages de listing
    ├─> MaintenanceNotification.tsx
    │   ├─> services/maintenanceService.ts
    │   └─> Utilisé par: Layout.tsx
    ├─> Calendar.tsx
    │   └─> Utilisé par: CalibrationPlanningPage
    ├─> common/
    │   ├─> Breadcrumbs.tsx
    │   ├─> ConfirmDialog.tsx
    │   ├─> FormField.tsx
    │   ├─> Modal.tsx
    │   └─> Toast.tsx
    ├─> forms/
    │   └─> AdvancedCalibrationScheduler.tsx
    │       └─> Utilisé par: InstrumentFormPage
    └─> upload/
        ├─> DocumentList.tsx
        └─> FileUpload.tsx
            └─> Utilisés par: InstrumentDetailPage, InterventionDetailPage
```

### Pages (37 au total)

```
pages/
    ├─> LoginPage.tsx
    │   └─> services/authService.ts
    ├─> DashboardPage.tsx
    │   ├─> services/instrumentService.ts
    │   ├─> services/interventionService.ts
    │   └─> services/movementService.ts
    ├─> InstrumentsPage.tsx
    ├─> InstrumentDetailPage.tsx
    ├─> InstrumentFormPage.tsx
    │   ├─> services/instrumentService.ts
    │   ├─> services/siteService.ts
    │   ├─> services/instrumentTypeService.ts
    │   ├─> services/calibrationMethodService.ts
    │   └─> components/forms/AdvancedCalibrationScheduler.tsx
    ├─> InterventionsPage.tsx
    ├─> InterventionDetailPage.tsx
    ├─> InterventionFormPage.tsx
    │   ├─> services/interventionService.ts
    │   ├─> services/instrumentService.ts
    │   └─> services/supplierService.ts
    ├─> SuppliersPage.tsx
    ├─> SupplierDetailPage.tsx
    ├─> SupplierFormPage.tsx
    │   └─> services/supplierService.ts
    ├─> SitesPage.tsx
    ├─> SiteDetailPage.tsx
    ├─> SiteFormPage.tsx
    │   └─> services/siteService.ts
    ├─> MovementsPage.tsx
    ├─> MovementFormPage.tsx
    │   ├─> services/movementService.ts
    │   └─> services/instrumentService.ts
    ├─> UsersPage.tsx
    ├─> UserFormPage.tsx
    │   └─> services/authService.ts (pour createUser)
    ├─> SettingsPage.tsx
    │   ├─> services/instrumentTypeService.ts
    │   └─> services/interventionConfigService.ts
    ├─> ReportsPage.tsx
    │   ├─> services/instrumentService.ts
    │   └─> services/interventionService.ts
    ├─> InterventionConfigPage.tsx
    ├─> InterventionConfigFormPage.tsx
    │   └─> services/interventionConfigService.ts
    ├─> AccountPage.tsx ⭐ ÉTENDU
    │   ├─> services/accountService.ts
    │   ├─> services/backupService.ts (NOUVEAU)
    │   ├─> components/common/Modal.tsx
    │   └─> components/common/ConfirmDialog.tsx
    ├─> MaintenanceMessagesPage.tsx
    ├─> MaintenanceMessageFormPage.tsx
    │   └─> services/maintenanceService.ts
    ├─> CalibrationMethodsPage.tsx
    ├─> CalibrationMethodFormPage.tsx
    ├─> CalibrationMethodDetailPage.tsx
    ├─> CalibrationMethodBulkPage.tsx
    │   └─> services/calibrationMethodService.ts
    ├─> CalibrationCalendarsPage.tsx
    ├─> CalibrationCalendarFormPage.tsx
    │   └─> services/calibrationCalendarService.ts
    └─> CalibrationPlanningPage.tsx
        ├─> services/calibrationCalendarService.ts
        └─> components/Calendar.tsx
```

### Services (14 au total)

```
services/
    ├─> api.ts (axios configuré)
    │   └─> Utilisé par TOUS les autres services
    ├─> authService.ts
    │   └─> Utilisé par: AuthContext, LoginPage, UserFormPage
    ├─> accountService.ts
    │   └─> Utilisé par: AccountPage
    ├─> backupService.ts ⭐ NOUVEAU
    │   └─> Utilisé par: AccountPage (onglet Sauvegardes)
    ├─> instrumentService.ts
    │   └─> Utilisé par: InstrumentsPage, InstrumentDetailPage, InstrumentFormPage, DashboardPage, InterventionFormPage, MovementFormPage, ReportsPage
    ├─> interventionService.ts
    │   └─> Utilisé par: InterventionsPage, InterventionDetailPage, InterventionFormPage, DashboardPage, ReportsPage
    ├─> supplierService.ts
    │   └─> Utilisé par: SuppliersPage, SupplierDetailPage, SupplierFormPage, InterventionFormPage
    ├─> siteService.ts
    │   └─> Utilisé par: SitesPage, SiteDetailPage, SiteFormPage, InstrumentFormPage
    ├─> movementService.ts
    │   └─> Utilisé par: MovementsPage, MovementFormPage, DashboardPage
    ├─> instrumentTypeService.ts
    │   └─> Utilisé par: SettingsPage, InstrumentFormPage
    ├─> calibrationMethodService.ts
    │   └─> Utilisé par: CalibrationMethodsPage, CalibrationMethodFormPage, CalibrationMethodDetailPage, CalibrationMethodBulkPage, InstrumentFormPage
    ├─> calibrationCalendarService.ts
    │   └─> Utilisé par: CalibrationCalendarsPage, CalibrationCalendarFormPage, CalibrationPlanningPage
    ├─> interventionConfigService.ts
    │   └─> Utilisé par: InterventionConfigPage, InterventionConfigFormPage, SettingsPage
    ├─> maintenanceService.ts
    │   └─> Utilisé par: MaintenanceMessagesPage, MaintenanceMessageFormPage, MaintenanceNotification
    └─> documentService.ts
        └─> Utilisé par: FileUpload, DocumentList
```

### Utils & Types

```
utils/
    ├─> errorHandler.ts
    │   └─> Utilisé par: tous les services et pages avec try/catch
    └─> format.ts
        └─> Utilisé par: plusieurs pages pour formater dates, nombres

types/
    ├─> index.ts (types principaux)
    │   └─> Utilisé par: toutes les pages et services
    ├─> interventionConfig.ts
    │   └─> Utilisé par: InterventionConfigPage, InterventionConfigFormPage
    └─> maintenance.ts
        └─> Utilisé par: MaintenanceMessagesPage, MaintenanceMessageFormPage
```

---

## ❌ FICHIERS OBSOLÈTES IDENTIFIÉS

### Backend (1 fichier)

| Fichier | Raison | Action |
|---------|--------|--------|
| `backend/Dockerfile` | docker-compose.yml utilise `Dockerfile.simple` | ✅ À SUPPRIMER |

### Frontend (0 fichiers)

Tous les fichiers sont utilisés.

### Documentation (0 fichiers obsolètes confirmés)

Tous les fichiers de documentation sont récents et pertinents :
- BACKUP_RESTORE_GUIDE.md (créé aujourd'hui)
- METRO_REPORTS.md (mis à jour aujourd'hui)
- PRISMA_BINARIES_ISSUE.md (créé aujourd'hui)
- Autres sont utiles pour référence

### Autres (1 fichier)

| Fichier | Raison | Action |
|---------|--------|--------|
| `backend/node_modules/console-control-strings/README.md~` | Fichier temporaire dans node_modules | ⚠️ Sera nettoyé par npm |

---

## ✅ FICHIERS ACTIFS ET À JOUR

### Backend - Résumé

**Contrôleurs** : 16 (tous actifs)
**Routes** : 16 (tous actifs)
**Middleware** : 4 (tous actifs)
**Services** : 1 (actif)
**Utils** : 4 (3 actifs + 1 optionnel)
**Config** : 2 (tous actifs)

**Total Backend** : 43 fichiers actifs + Prisma

### Frontend - Résumé

**Pages** : 37 (toutes actives)
**Composants** : 13 (tous actifs)
**Services** : 14 (tous actifs)
**Contextes** : 2 (tous actifs)
**Utils/Types** : 5 (tous actifs)

**Total Frontend** : 71 fichiers actifs

---

## 🔗 Graphe de Dépendances Critiques

```
Niveau 1 (Infrastructure)
    ├─> config/database.ts (prisma)
    ├─> config/jwt.ts
    └─> services/api.ts (axios)

Niveau 2 (Middleware & Utils)
    ├─> middleware/auth.ts
    ├─> middleware/validation.ts
    ├─> middleware/security.ts
    ├─> middleware/monitoring.ts
    ├─> utils/backup.ts
    ├─> utils/dataImporter.ts
    ├─> utils/encryption.ts
    └─> utils/errorHandler.ts

Niveau 3 (Contrôleurs & Services)
    ├─> Tous les contrôleurs (16)
    └─> Tous les services frontend (14)

Niveau 4 (Routes & Pages)
    ├─> Toutes les routes (16)
    └─> Toutes les pages (37)

Niveau 5 (Point d'entrée)
    ├─> server.ts (backend)
    └─> main.tsx → App.tsx (frontend)
```

---

## 📈 Statistiques

| Catégorie | Actifs | Obsolètes | Total |
|-----------|--------|-----------|-------|
| Backend Controllers | 16 | 0 | 16 |
| Backend Routes | 16 | 0 | 16 |
| Backend Middleware | 4 | 0 | 4 |
| Backend Utils | 4 | 0 | 4 |
| Backend Config | 2 | 0 | 2 |
| Backend Dockerfiles | 1 | **1** | 2 |
| Frontend Pages | 37 | 0 | 37 |
| Frontend Components | 13 | 0 | 13 |
| Frontend Services | 14 | 0 | 14 |
| Frontend Contextes | 2 | 0 | 2 |
| Frontend Utils/Types | 5 | 0 | 5 |
| **TOTAL** | **114** | **1** | **115** |

---

## 🎯 Conclusion

Le projet Metro est **très bien structuré** avec :
- ✅ Aucun fichier source obsolète
- ✅ Tous les fichiers sont interconnectés et utilisés
- ✅ Architecture claire et modulaire
- ⚠️ **1 seul fichier obsolète** : `backend/Dockerfile`

**Recommandation** : Supprimer uniquement `backend/Dockerfile`.

