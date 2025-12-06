export type UserRole = 'ADMIN' | 'RESPONSABLE_METROLOGIE' | 'TECHNICIEN' | 'LECTURE_SEULE';

export type InstrumentStatus = 'CONFORME' | 'NON_CONFORME' | 'EN_MAINTENANCE' | 'CASSE';

export type InterventionType = 'ETALONNAGE' | 'VERIFICATION' | 'MAINTENANCE' | 'REPARATION';

export type InterventionStatus = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export type ConformityResult = 'CONFORME' | 'NON_CONFORME' | 'AVEC_RESERVES';

export type MovementType = 'ENLEVEMENT' | 'RETOUR' | 'TRANSFERT';

export type FrequencyUnit = 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

export type RecurrenceType = 'FIXED_INTERVAL' | 'CALENDAR_DAILY' | 'CALENDAR_WEEKLY' | 'CALENDAR_MONTHLY' | 'CALENDAR_YEARLY';

export type ToleranceUnit = 'DAYS' | 'WEEKS' | 'MONTHS';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface CalibrationFrequency {
  value: number;
  unit: FrequencyUnit;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Site {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  instruments?: Instrument[];
}

export interface InstrumentType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    instruments: number;
  };
}

export interface Instrument {
  id: string;
  serialNumber: string;
  internalReference?: string;
  name: string;
  brand?: string;
  model?: string;
  status: InstrumentStatus;
  calibrationPeriod: number; // DEPRECATED: gardé pour compatibilité
  calibrationFrequencyValue: number;
  calibrationFrequencyUnit: FrequencyUnit;
  nextCalibrationDate?: string;
  toleranceExpiryDate?: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  observations?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Configuration de récurrence
  recurrenceType?: RecurrenceType;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  monthOfYear?: number;
  dayOfYear?: number;
  // Tolérance
  toleranceValue?: number;
  toleranceUnit?: ToleranceUnit;
  // Méthode d'étalonnage
  calibrationMethodId?: string;
  // Relations
  type?: InstrumentType;
  site?: Site;
  interventions?: Intervention[];
  documents?: Document[];
  movements?: Movement[];
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  accreditations: string[];
  accreditationDoc?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  interventions?: Intervention[];
}

export interface Intervention {
  id: string;
  type: InterventionType;
  status: InterventionStatus;
  scheduledDate: string;
  completedDate?: string;
  conformityResult?: ConformityResult;
  cost?: number;
  observations?: string;
  certificateNumber?: string;
  nextCalibrationDate?: string;
  createdAt: string;
  updatedAt: string;
  instrument?: Instrument;
  supplier?: Supplier;
  createdBy?: User;
  documents?: Document[];
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  description?: string;
  uploadedAt: string;
  instrumentId?: string;
  interventionId?: string;
}

export interface Movement {
  id: string;
  type: MovementType;
  departureDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  deliveryNote?: string;
  receptionNote?: string;
  reason?: string;
  externalLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  instrument?: Instrument;
  fromSite?: Site;
  toSite?: Site;
  createdBy?: User;
}

export interface DashboardStats {
  totalInstruments: number;
  instrumentsByStatus: { status: InstrumentStatus; _count: number }[];
  overdueCalibrations: number;
  upcomingCalibrations: number;
}

export interface InterventionStats {
  totalInterventions: number;
  interventionsByStatus: { status: InterventionStatus; _count: number }[];
  interventionsByType: { type: InterventionType; _count: number }[];
  nonConformities: number;
  totalCost: number;
  overdueInterventions: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

