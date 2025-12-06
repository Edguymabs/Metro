/**
 * Service de calcul des dates d'étalonnage
 * Gère la récurrence calendaire et les tolérances
 */

export type RecurrenceType =
  | 'FIXED_INTERVAL'
  | 'CALENDAR_DAILY'
  | 'CALENDAR_WEEKLY'
  | 'CALENDAR_MONTHLY'
  | 'CALENDAR_YEARLY';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type FrequencyUnit = 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

export type ToleranceUnit = 'DAYS' | 'WEEKS' | 'MONTHS';

interface CalibrationConfig {
  recurrenceType: RecurrenceType;
  frequencyValue?: number;
  frequencyUnit?: FrequencyUnit;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  monthOfYear?: number;
  dayOfYear?: number;
  toleranceValue: number;
  toleranceUnit: ToleranceUnit;
}

/**
 * Calcule la prochaine date d'étalonnage selon la configuration
 */
export function calculateNextCalibrationDate(
  lastDate: Date,
  config: CalibrationConfig
): Date {
  const next = new Date(lastDate);

  switch (config.recurrenceType) {
    case 'FIXED_INTERVAL':
      return calculateFixedInterval(next, config.frequencyValue!, config.frequencyUnit!);

    case 'CALENDAR_DAILY':
      next.setDate(next.getDate() + 1);
      return next;

    case 'CALENDAR_WEEKLY':
      return calculateNextWeeklyDate(next, config.daysOfWeek!);

    case 'CALENDAR_MONTHLY':
      return calculateNextMonthlyDate(next, config.dayOfMonth!);

    case 'CALENDAR_YEARLY':
      return calculateNextYearlyDate(next, config.monthOfYear!, config.dayOfYear!);

    default:
      return calculateFixedInterval(next, 12, 'MONTHS');
  }
}

/**
 * Calcule la date avec intervalle fixe
 */
function calculateFixedInterval(
  date: Date,
  value: number,
  unit: FrequencyUnit
): Date {
  const result = new Date(date);

  switch (unit) {
    case 'DAYS':
      result.setDate(result.getDate() + value);
      break;
    case 'WEEKS':
      result.setDate(result.getDate() + value * 7);
      break;
    case 'MONTHS':
      result.setMonth(result.getMonth() + value);
      break;
    case 'YEARS':
      result.setFullYear(result.getFullYear() + value);
      break;
  }

  return result;
}

/**
 * Calcule la prochaine date pour récurrence hebdomadaire
 */
function calculateNextWeeklyDate(lastDate: Date, daysOfWeek: DayOfWeek[]): Date {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    // Par défaut, même jour la semaine suivante
    const result = new Date(lastDate);
    result.setDate(result.getDate() + 7);
    return result;
  }

  const dayMap: Record<DayOfWeek, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const targetDays = daysOfWeek.map((d) => dayMap[d]).sort((a, b) => a - b);
  const currentDay = lastDate.getDay();
  const result = new Date(lastDate);

  // Chercher le prochain jour dans la semaine courante
  const nextDayThisWeek = targetDays.find((d) => d > currentDay);

  if (nextDayThisWeek !== undefined) {
    // Prochain jour dans la semaine courante
    result.setDate(result.getDate() + (nextDayThisWeek - currentDay));
  } else {
    // Premier jour de la semaine suivante
    const daysUntilNextWeek = 7 - currentDay + targetDays[0];
    result.setDate(result.getDate() + daysUntilNextWeek);
  }

  return result;
}

/**
 * Calcule la prochaine date pour récurrence mensuelle
 */
function calculateNextMonthlyDate(lastDate: Date, dayOfMonth: number): Date {
  const result = new Date(lastDate);
  result.setMonth(result.getMonth() + 1);
  result.setDate(Math.min(dayOfMonth, getDaysInMonth(result)));
  return result;
}

/**
 * Calcule la prochaine date pour récurrence annuelle
 */
function calculateNextYearlyDate(
  lastDate: Date,
  monthOfYear: number,
  dayOfYear: number
): Date {
  const result = new Date(lastDate);
  result.setFullYear(result.getFullYear() + 1);
  result.setMonth(monthOfYear - 1); // Les mois sont 0-indexés
  result.setDate(Math.min(dayOfYear, getDaysInMonth(result)));
  return result;
}

/**
 * Calcule la date limite avec tolérance
 */
export function calculateToleranceExpiryDate(
  nextDate: Date,
  toleranceValue: number,
  toleranceUnit: ToleranceUnit
): Date {
  const result = new Date(nextDate);

  switch (toleranceUnit) {
    case 'DAYS':
      result.setDate(result.getDate() + toleranceValue);
      break;
    case 'WEEKS':
      result.setDate(result.getDate() + toleranceValue * 7);
      break;
    case 'MONTHS':
      result.setMonth(result.getMonth() + toleranceValue);
      break;
  }

  return result;
}

/**
 * Détermine le statut d'étalonnage
 */
export function getCalibrationStatus(
  nextDate: Date | null,
  toleranceExpiryDate: Date | null
): 'ON_TIME' | 'OVERDUE_TOLERATED' | 'OVERDUE_CRITICAL' | 'NOT_SET' {
  if (!nextDate) {
    return 'NOT_SET';
  }

  const now = new Date();

  if (now <= nextDate) {
    return 'ON_TIME';
  } else if (toleranceExpiryDate && now <= toleranceExpiryDate) {
    return 'OVERDUE_TOLERATED';
  } else {
    return 'OVERDUE_CRITICAL';
  }
}

/**
 * Retourne le nombre de jours dans un mois
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Formatte une durée en texte lisible
 */
export function formatDuration(value: number, unit: string): string {
  const unitLabels: Record<string, { singular: string; plural: string }> = {
    DAYS: { singular: 'jour', plural: 'jours' },
    WEEKS: { singular: 'semaine', plural: 'semaines' },
    MONTHS: { singular: 'mois', plural: 'mois' },
    YEARS: { singular: 'an', plural: 'ans' },
  };

  const label = unitLabels[unit];
  if (!label) return `${value} ${unit}`;

  return `${value} ${value === 1 ? label.singular : label.plural}`;
}

