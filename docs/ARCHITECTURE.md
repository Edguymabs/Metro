# 🏗️ Architecture Technique - Metro

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Stack Technique](#stack-technique)
3. [Architecture Système](#architecture-système)
4. [Modèle de Données](#modèle-de-données)
5. [Backend API](#backend-api)
6. [Frontend](#frontend)
7. [Sécurité](#sécurité)
8. [Déploiement](#déploiement)
9. [Performance et Optimisation](#performance-et-optimisation)
10. [Tests et Qualité](#tests-et-qualité)

---

## Vue d'Ensemble

**Metro** est une application web full-stack pour la gestion métrologique, conçue comme alternative open-source aux solutions propriétaires comme Deca.

### Objectifs du Projet

- **Gestion complète** du parc d'instruments de mesure
- **Planification intelligente** des étalonnages avec multiples modes de récurrence
- **Traçabilité** complète des mouvements et interventions
- **Interface moderne** et intuitive
- **Architecture scalable** et maintenable
- **Open-source** et extensible

### Caractéristiques Techniques

- **Architecture** : Client-Server (SPA + REST API)
- **Language** : TypeScript (100%)
- **Déploiement** : Conteneurisé avec Docker
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : JWT avec RBAC
- **API** : REST avec validation Joi

---

## Stack Technique

### Backend

| Technologie | Version | Utilisation |
|------------|---------|-------------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.18.2 | Framework web minimaliste |
| **TypeScript** | 5.3.3 | Typage statique |
| **Prisma** | 5.22.0 | ORM pour PostgreSQL |
| **PostgreSQL** | 15 | Base de données relationnelle |
| **JWT** | 9.0.2 | Authentification par tokens |
| **bcryptjs** | 2.4.3 | Hashage des mots de passe |
| **Joi** | 17.11.0 | Validation des données |
| **Multer** | 1.4.5-lts.2 | Upload de fichiers |
| **Helmet** | 7.1.0 | Sécurisation des headers HTTP |
| **express-rate-limit** | 7.1.5 | Protection contre les abus |
| **express-slow-down** | 2.0.1 | Ralentissement progressif |
| **CORS** | 2.8.5 | Gestion cross-origin |

### Frontend

| Technologie | Version | Utilisation |
|------------|---------|-------------|
| **React** | 18.2.0 | Bibliothèque UI |
| **TypeScript** | 5.3.3 | Typage statique |
| **Vite** | 5.0.11 | Build tool ultra-rapide |
| **React Router** | 6.21.1 | Routing côté client |
| **Tailwind CSS** | 3.4.1 | Framework CSS utility-first |
| **Axios** | 1.6.5 | Client HTTP |
| **Recharts** | 2.10.3 | Graphiques interactifs |
| **Lucide React** | 0.303.0 | Icônes modernes |
| **date-fns** | 3.0.6 | Manipulation de dates |

### Infrastructure

| Technologie | Version | Utilisation |
|------------|---------|-------------|
| **Docker** | Latest | Conteneurisation |
| **Docker Compose** | Latest | Orchestration |
| **Nginx** | Alpine | Serveur web (frontend) |
| **PostgreSQL** | 15 | SGBD |

---

## Architecture Système

### Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                              │
│                         (Navigateur)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │   Services   │         │
│  │              │  │              │  │              │         │
│  │ - Dashboard  │  │ - Layout     │  │ - API calls  │         │
│  │ - Instruments│  │ - Forms      │  │ - Auth       │         │
│  │ - Interventions│ │ - Modals   │  │ - Storage    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Nginx (Port 3000)                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JSON)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js/Express)                    │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   Middleware   │  │  Controllers   │  │    Services    │   │
│  │                │  │                │  │                │   │
│  │ - Auth (JWT)   │  │ - Instruments  │  │ - Calibration  │   │
│  │ - RBAC         │  │ - Interventions│  │ - Encryption   │   │
│  │ - Validation   │  │ - Suppliers    │  │ - Backup       │   │
│  │ - Rate Limit   │  │ - Sites        │  │                │   │
│  │ - Helmet       │  │ - Documents    │  │                │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
│  Express Server (Port 5001)                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                               │
│                    PostgreSQL 15                                 │
│                                                                  │
│  Tables:                                                         │
│  - users                   - calibration_methods                │
│  - instruments             - calibration_calendars              │
│  - instrument_types        - notifications                      │
│  - interventions           - corrective_actions                 │
│  - suppliers               - audit_logs                         │
│  - sites                   - ...                                │
│  - movements                                                     │
│  - documents                                                     │
│                                                                  │
│  Port 5432                                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture en Couches

#### Couche Présentation (Frontend)
- **React SPA** : Application Single Page
- **React Router** : Navigation côté client
- **Contexts** : État global (Auth, Toasts)
- **Services** : Abstraction des appels API

#### Couche API (Backend)
- **Routes** : Définition des endpoints
- **Middleware** : Authentification, validation, sécurité
- **Controllers** : Logique métier
- **Services** : Fonctions utilitaires

#### Couche Données
- **Prisma ORM** : Abstraction de la base de données
- **PostgreSQL** : Stockage persistant
- **Migrations** : Gestion des schémas

---

## Modèle de Données

### Schéma Prisma

```prisma
// Utilisateurs
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(USER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  ADMIN
  MANAGER
  USER
  READER
}

// Instruments
model Instrument {
  id                        String           @id @default(uuid())
  serialNumber              String           @unique
  internalReference         String?
  name                      String
  brand                     String?
  model                     String?
  status                    InstrumentStatus @default(CONFORME)
  
  // Fréquence d'étalonnage
  calibrationFrequencyValue Int              @default(12)
  calibrationFrequencyUnit  FrequencyUnit    @default(MONTHS)
  
  // Configuration avancée
  recurrenceType            RecurrenceType   @default(FIXED_INTERVAL)
  daysOfWeek                String[]
  dayOfMonth                Int?
  monthOfYear               Int?
  toleranceValue            Int?
  toleranceUnit             ToleranceUnit?
  
  // Dates
  purchaseDate              DateTime
  nextCalibrationDate       DateTime?
  lastCalibrationDate       DateTime?
  
  // Relations
  type                      InstrumentType   @relation(fields: [typeId], references: [id])
  typeId                    String
  site                      Site             @relation(fields: [siteId], references: [id])
  siteId                    String
  interventions             Intervention[]
  movements                 Movement[]
  documents                 Document[]
  
  createdAt                 DateTime         @default(now())
  updatedAt                 DateTime         @updatedAt
}

enum InstrumentStatus {
  CONFORME
  NON_CONFORME
  EN_MAINTENANCE
  CASSE
}

enum FrequencyUnit {
  DAYS
  WEEKS
  MONTHS
  YEARS
}

enum RecurrenceType {
  FIXED_INTERVAL
  CALENDAR_DAILY
  CALENDAR_WEEKLY
  CALENDAR_MONTHLY
  CALENDAR_YEARLY
}

enum ToleranceUnit {
  DAYS
  WEEKS
  MONTHS
}

// Interventions
model Intervention {
  id                 String             @id @default(uuid())
  type               InterventionType
  status             InterventionStatus @default(PLANNED)
  result             InterventionResult?
  scheduledDate      DateTime
  completedDate      DateTime?
  location           String?
  certificateNumber  String?
  cost               Float?
  observations       String?
  
  instrument         Instrument         @relation(fields: [instrumentId], references: [id])
  instrumentId       String
  supplier           Supplier?          @relation(fields: [supplierId], references: [id])
  supplierId         String?
  documents          Document[]
  
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

enum InterventionType {
  CALIBRATION
  VERIFICATION
  MAINTENANCE
  REPAIR
}

enum InterventionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum InterventionResult {
  CONFORM
  NON_CONFORM
}

// Méthodes d'étalonnage
model CalibrationMethod {
  id                String        @id @default(uuid())
  name              String
  description       String?
  instrumentType    InstrumentType @relation(fields: [instrumentTypeId], references: [id])
  instrumentTypeId  String
  frequencyValue    Int
  frequencyUnit     FrequencyUnit
  procedure         String?
  estimatedDuration Int?
  requiredEquipment String?
  active            Boolean       @default(true)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

// Sites
model Site {
  id              String       @id @default(uuid())
  name            String       @unique
  code            String?      @unique
  address         String?
  city            String?
  postalCode      String?
  country         String?     @default("France")
  contactName     String?
  contactEmail    String?
  contactPhone    String?
  observations    String?
  instruments     Instrument[]
  movementsFrom   Movement[]   @relation("MovementFrom")
  movementsTo     Movement[]   @relation("MovementTo")
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

// Fournisseurs
model Supplier {
  id              String         @id @default(uuid())
  name            String
  email           String?
  phone           String?
  address         String?
  city            String?
  postalCode      String?
  country         String?        @default("France")
  website         String?
  cofracNumber    String?
  iso17025        Boolean        @default(false)
  observations    String?
  interventions   Intervention[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

// Mouvements
model Movement {
  id                 String       @id @default(uuid())
  type               MovementType
  pickupDate         DateTime?
  expectedReturnDate DateTime?
  actualReturnDate   DateTime?
  externalLocation   String?
  deliveryNote       String?
  receiptNote        String?
  reason             String?
  observations       String?
  
  instrument         Instrument   @relation(fields: [instrumentId], references: [id])
  instrumentId       String
  fromSite           Site?        @relation("MovementFrom", fields: [fromSiteId], references: [id])
  fromSiteId         String?
  toSite             Site?        @relation("MovementTo", fields: [toSiteId], references: [id])
  toSiteId           String?
  
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
}

enum MovementType {
  PICKUP
  RETURN
  TRANSFER
}

// Documents
model Document {
  id              String        @id @default(uuid())
  filename        String
  originalName    String
  mimeType        String
  size            Int
  path            String
  description     String?
  
  instrument      Instrument?   @relation(fields: [instrumentId], references: [id])
  instrumentId    String?
  intervention    Intervention? @relation(fields: [interventionId], references: [id])
  interventionId  String?
  
  uploadedBy      String
  createdAt       DateTime      @default(now())
}

// Types d'instruments
model InstrumentType {
  id          String              @id @default(uuid())
  name        String              @unique
  instruments Instrument[]
  methods     CalibrationMethod[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}
```

### Relations Clés

- **Instrument ↔ Interventions** : One-to-Many (un instrument a plusieurs interventions)
- **Instrument ↔ Documents** : One-to-Many (un instrument a plusieurs documents)
- **Instrument ↔ Movements** : One-to-Many (un instrument a plusieurs mouvements)
- **Intervention ↔ Supplier** : Many-to-One (une intervention a un fournisseur)
- **Instrument ↔ Site** : Many-to-One (un instrument appartient à un site)
- **Instrument ↔ InstrumentType** : Many-to-One (un instrument a un type)

---

## Backend API

### Structure des Dossiers

```
backend/src/
├── config/
│   ├── database.ts          # Configuration Prisma
│   └── jwt.ts               # Configuration JWT
├── controllers/
│   ├── authController.ts
│   ├── instrumentController.ts
│   ├── interventionController.ts
│   ├── supplierController.ts
│   ├── siteController.ts
│   ├── movementController.ts
│   ├── documentController.ts
│   ├── userController.ts
│   ├── calibrationMethodController.ts
│   ├── calibrationCalendarController.ts
│   ├── instrumentTypeController.ts
│   └── dashboardController.ts
├── middleware/
│   ├── auth.ts              # Authentification JWT
│   ├── validation.ts        # Validation Joi
│   ├── security.ts          # Rate limiting, Helmet
│   └── monitoring.ts        # Logs, métriques
├── routes/
│   ├── authRoutes.ts
│   ├── instrumentRoutes.ts
│   ├── interventionRoutes.ts
│   ├── supplierRoutes.ts
│   ├── siteRoutes.ts
│   ├── movementRoutes.ts
│   ├── documentRoutes.ts
│   ├── userRoutes.ts
│   ├── calibrationMethodRoutes.ts
│   ├── calibrationCalendarRoutes.ts
│   ├── instrumentTypeRoutes.ts
│   ├── dashboardRoutes.ts
│   └── securityRoutes.ts
├── services/
│   └── calibrationDateService.ts
├── utils/
│   ├── encryption.ts        # AES-256-GCM
│   └── backup.ts            # Sauvegarde BDD
└── server.ts                # Point d'entrée
```

### Endpoints Principaux

#### Authentification
```
POST   /api/auth/register    # Créer un compte
POST   /api/auth/login       # Se connecter
GET    /api/auth/me          # Profil utilisateur
```

#### Instruments
```
GET    /api/instruments           # Liste avec filtres
GET    /api/instruments/:id       # Détails
POST   /api/instruments           # Créer
PUT    /api/instruments/:id       # Modifier
DELETE /api/instruments/:id       # Supprimer
GET    /api/instruments/:id/interventions  # Historique
GET    /api/instruments/:id/documents      # Documents
```

#### Interventions
```
GET    /api/interventions         # Liste avec filtres
GET    /api/interventions/:id     # Détails
POST   /api/interventions         # Créer
PUT    /api/interventions/:id     # Modifier
DELETE /api/interventions/:id     # Supprimer
GET    /api/interventions/stats   # Statistiques
```

#### Dashboard
```
GET    /api/dashboard/stats       # KPIs globaux
GET    /api/dashboard/charts      # Données graphiques
```

### Middleware

#### Authentification JWT
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};
```

#### Autorisation RBAC
```typescript
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    next();
  };
};
```

#### Validation Joi
```typescript
export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation échouée',
        errors: error.details.map(d => d.message)
      });
    }
    
    next();
  };
};
```

---

## Frontend

### Structure des Dossiers

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Breadcrumbs.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── FormField.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── forms/
│   │   └── AdvancedCalibrationScheduler.tsx
│   ├── upload/
│   │   ├── DocumentList.tsx
│   │   └── FileUpload.tsx
│   ├── Layout.tsx
│   ├── LoadingSpinner.tsx
│   ├── PrivateRoute.tsx
│   └── StatusBadge.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── InstrumentsPage.tsx
│   ├── InstrumentDetailPage.tsx
│   ├── InstrumentFormPage.tsx
│   ├── InterventionsPage.tsx
│   ├── InterventionDetailPage.tsx
│   ├── InterventionFormPage.tsx
│   ├── CalibrationPlanningPage.tsx
│   ├── CalibrationMethodsPage.tsx
│   ├── CalibrationMethodFormPage.tsx
│   ├── SuppliersPage.tsx
│   ├── SupplierDetailPage.tsx
│   ├── SupplierFormPage.tsx
│   ├── SitesPage.tsx
│   ├── SiteDetailPage.tsx
│   ├── SiteFormPage.tsx
│   ├── MovementsPage.tsx
│   ├── MovementFormPage.tsx
│   ├── ReportsPage.tsx
│   ├── UsersPage.tsx
│   ├── UserFormPage.tsx
│   ├── SettingsPage.tsx
│   └── LoginPage.tsx
├── services/
│   ├── api.ts                         # Configuration Axios
│   ├── authService.ts
│   ├── instrumentService.ts
│   ├── interventionService.ts
│   ├── supplierService.ts
│   ├── siteService.ts
│   ├── movementService.ts
│   ├── documentService.ts
│   ├── userService.ts
│   ├── calibrationMethodService.ts
│   └── dashboardService.ts
├── types/
│   └── index.ts                       # Types TypeScript
├── utils/
│   └── format.ts                      # Formatage dates, statuts
├── App.tsx                             # Routes
├── main.tsx                            # Point d'entrée
└── index.css                           # Styles globaux
```

### Gestion d'État

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

#### ToastContext
```typescript
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}
```

### Services API

Exemple de service :
```typescript
export const instrumentService = {
  getAll: async (params?: any) => {
    const response = await api.get('/instruments', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/instruments/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/instruments', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/instruments/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/instruments/${id}`);
    return response.data;
  }
};
```

---

## Sécurité

### Authentification

**JWT (JSON Web Tokens)**
- Token signé avec secret fort
- Expiration : 7 jours
- Stockage : localStorage (frontend)
- Transmission : Header `Authorization: Bearer <token>`

### Autorisation RBAC

| Rôle | Permissions |
|------|------------|
| **ADMIN** | Accès total + gestion utilisateurs |
| **MANAGER** | CRUD complet (sauf utilisateurs) |
| **USER** | Lecture + création interventions |
| **READER** | Lecture seule |

### Protections Implémentées

✅ **Helmet** : Sécurisation des headers HTTP
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

✅ **Rate Limiting** : Protection contre les abus
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: 'Trop de requêtes depuis cette IP',
});
app.use('/api', limiter);
```

✅ **Slow Down** : Ralentissement progressif
```typescript
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500,
});
app.use('/api', speedLimiter);
```

✅ **CORS** : Restriction des origines
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

✅ **Validation** : Joi pour toutes les entrées
```typescript
const instrumentSchema = Joi.object({
  serialNumber: Joi.string().required(),
  name: Joi.string().required(),
  typeId: Joi.string().uuid().required(),
  // ...
});
```

✅ **Encryption** : AES-256-GCM pour données sensibles
```typescript
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  // ...
};
```

### Recommandations Production

⚠️ **Avant déploiement** :
1. Changer `JWT_SECRET` dans `docker-compose.yml`
2. Changer `ENCRYPTION_KEY`
3. Configurer `FRONTEND_URL` correctement
4. Activer HTTPS (certificat SSL/TLS)
5. Configurer un reverse proxy (Nginx, Traefik)
6. Activer les sauvegardes automatiques
7. Configurer monitoring (logs, métriques)

---

## Déploiement

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: metro
      POSTGRES_PASSWORD: metro123
      POSTGRES_DB: metro_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U metro"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://metro:metro123@postgres:5432/metro_db
      JWT_SECRET: CHANGEZ_CECI_EN_PRODUCTION
      PORT: 5000
      NODE_ENV: production
    ports:
      - "5001:5000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/backups:/app/backups

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Dockerfile Backend

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
RUN mkdir -p /app/uploads
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Dockerfile Frontend

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Commandes de Déploiement

```bash
# Build et démarrage
docker-compose up -d --build

# Migrations
docker-compose exec backend npx prisma migrate deploy

# Seed (données initiales)
docker-compose exec backend npm run seed

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrage
docker-compose restart backend
docker-compose restart frontend

# Arrêt
docker-compose down

# Suppression complète (⚠️ données perdues)
docker-compose down -v
```

---

## Performance et Optimisation

### Backend

✅ **Indexation des requêtes fréquentes**
```prisma
@@index([serialNumber])
@@index([status])
@@index([nextCalibrationDate])
```

✅ **Pagination**
```typescript
const instruments = await prisma.instrument.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

✅ **Mise en cache** (à implémenter)
- Redis pour sessions
- Cache des statistiques dashboard

### Frontend

✅ **Code splitting** avec React.lazy
```typescript
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
```

✅ **Optimisation des re-renders**
- React.memo pour composants purs
- useCallback pour fonctions
- useMemo pour calculs coûteux

✅ **Build optimisé avec Vite**
- Tree shaking automatique
- Minification
- Compression gzip

---

## Tests et Qualité

### Tests (à implémenter)

**Backend**
- Tests unitaires : Jest
- Tests d'intégration : Supertest
- Coverage : >80%

**Frontend**
- Tests unitaires : Vitest
- Tests composants : React Testing Library
- Tests E2E : Playwright

### Qualité du Code

✅ **TypeScript strict**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

✅ **ESLint** : Linting du code
✅ **Prettier** : Formatage automatique

---

## Monitoring et Logs

### Logs

Les logs sont structurés et incluent :
- Timestamp
- Niveau (info, warn, error)
- Message
- Contexte (user, action)

### Métriques à Surveiller

- Temps de réponse API
- Taux d'erreur
- Utilisation CPU/RAM
- Espace disque
- Connexions PostgreSQL

### Alertes Recommandées

- Étalonnages en retard > 10
- Erreurs 500 > 5/min
- Utilisation disque > 80%
- Base de données inaccessible

---

## Évolutions Futures

### Roadmap

**Court terme (v1.1)**
- Exports PDF/Excel des rapports
- Emails automatiques pour alertes
- Dark mode
- Multi-langue (EN, ES)

**Moyen terme (v1.5)**
- Module OPPERET (optimisation périodicités)
- Calcul d'incertitudes (GUM)
- API publique REST documentée
- Webhooks pour intégrations

**Long terme (v2.0)**
- Application mobile (React Native)
- Mode multi-tenant (SaaS)
- IA pour prédiction de pannes
- Blockchain pour traçabilité

---

**Version** : 1.0.0  
**Dernière mise à jour** : Octobre 2025  
**Auteurs** : Moi

Pour toute question technique, consultez le `README.md` ou le `GUIDE_UTILISATEUR.md`.

