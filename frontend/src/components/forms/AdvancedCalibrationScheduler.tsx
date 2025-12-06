import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, Info, Repeat } from 'lucide-react';

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

export type ToleranceUnit = 'DAYS' | 'WEEKS' | 'MONTHS';

export interface CalibrationSchedule {
  recurrenceType: RecurrenceType;
  frequencyValue?: number;
  frequencyUnit?: string;
  daysOfWeek: DayOfWeek[];
  dayOfMonth?: number;
  monthOfYear?: number;
  dayOfYear?: number;
  toleranceValue: number;
  toleranceUnit: ToleranceUnit;
}

interface AdvancedCalibrationSchedulerProps {
  schedule: CalibrationSchedule;
  onChange: (schedule: CalibrationSchedule) => void;
  label?: string;
}

const AdvancedCalibrationScheduler: React.FC<AdvancedCalibrationSchedulerProps> = ({
  schedule,
  onChange,
  label = "Planification d'étalonnage avancée",
}) => {
  const [showAdvanced, setShowAdvanced] = useState(schedule.recurrenceType !== 'FIXED_INTERVAL');

  const daysOfWeekOptions: { value: DayOfWeek; label: string }[] = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SATURDAY', label: 'Samedi' },
    { value: 'SUNDAY', label: 'Dimanche' },
  ];

  const monthOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  const handleRecurrenceTypeChange = (type: RecurrenceType) => {
    onChange({
      ...schedule,
      recurrenceType: type,
      frequencyValue: type === 'FIXED_INTERVAL' ? (schedule.frequencyValue || 6) : undefined,
      frequencyUnit: type === 'FIXED_INTERVAL' ? (schedule.frequencyUnit || 'MONTHS') : undefined,
      daysOfWeek: type === 'CALENDAR_WEEKLY' ? ['MONDAY'] : [],
      dayOfMonth: type === 'CALENDAR_MONTHLY' ? 1 : undefined,
      monthOfYear: type === 'CALENDAR_YEARLY' ? 1 : undefined,
      dayOfYear: type === 'CALENDAR_YEARLY' ? 1 : undefined,
    });
  };

  const handleDayOfWeekToggle = (day: DayOfWeek) => {
    const newDays = schedule.daysOfWeek.includes(day)
      ? schedule.daysOfWeek.filter((d) => d !== day)
      : [...schedule.daysOfWeek, day];
    
    onChange({ ...schedule, daysOfWeek: newDays });
  };

  const getScheduleDescription = (): string => {
    switch (schedule.recurrenceType) {
      case 'FIXED_INTERVAL':
        const value = schedule.frequencyValue || 1;
        const unit = schedule.frequencyUnit || 'MONTHS';
        const unitLabels = {
          DAYS: value === 1 ? 'jour' : 'jours',
          WEEKS: value === 1 ? 'semaine' : 'semaines',
          MONTHS: value === 1 ? 'mois' : 'mois',
          YEARS: value === 1 ? 'année' : 'années',
        };
        return `Tous les ${value} ${unitLabels[unit as keyof typeof unitLabels] || unit.toLowerCase()}`;
      
      case 'CALENDAR_DAILY':
        return 'Tous les jours';
      
      case 'CALENDAR_WEEKLY':
        if (schedule.daysOfWeek.length === 0) return 'Aucun jour sélectionné';
        const dayLabels = schedule.daysOfWeek.map(
          (d) => daysOfWeekOptions.find((opt) => opt.value === d)?.label
        );
        return `Tous les ${dayLabels.join(', ')}`;
      
      case 'CALENDAR_MONTHLY':
        return `Le ${schedule.dayOfMonth || 1} de chaque mois`;
      
      case 'CALENDAR_YEARLY':
        const month = monthOptions.find((m) => m.value === schedule.monthOfYear)?.label;
        return `Le ${schedule.dayOfYear || 1} ${month || 'janvier'} chaque année`;
      
      default:
        return 'Non configuré';
    }
  };

  const getToleranceDescription = (): string => {
    if (schedule.toleranceValue === 0) return 'Aucune tolérance';
    
    const unitLabels = {
      DAYS: schedule.toleranceValue === 1 ? 'jour' : 'jours',
      WEEKS: schedule.toleranceValue === 1 ? 'semaine' : 'semaines',
      MONTHS: 'mois',
    };
    
    return `+${schedule.toleranceValue} ${unitLabels[schedule.toleranceUnit]}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Repeat className="w-4 h-4 inline mr-2" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {showAdvanced ? 'Mode simple' : 'Mode avancé'}
        </button>
      </div>

      {/* Type de récurrence */}
      <div>
        <label className="block text-xs text-gray-600 mb-2">Type de planification</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleRecurrenceTypeChange('FIXED_INTERVAL')}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              schedule.recurrenceType === 'FIXED_INTERVAL'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Clock className="w-5 h-5 mb-1" />
            <div className="text-sm font-medium">Intervalle fixe</div>
            <div className="text-xs text-gray-500">Ex: tous les 6 mois</div>
          </button>

          <button
            type="button"
            onClick={() => handleRecurrenceTypeChange('CALENDAR_WEEKLY')}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              schedule.recurrenceType === 'CALENDAR_WEEKLY'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <div className="text-sm font-medium">Jour(s) de la semaine</div>
            <div className="text-xs text-gray-500">Ex: tous les lundis</div>
          </button>

          {showAdvanced && (
            <>
              <button
                type="button"
                onClick={() => handleRecurrenceTypeChange('CALENDAR_DAILY')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  schedule.recurrenceType === 'CALENDAR_DAILY'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5 mb-1" />
                <div className="text-sm font-medium">Quotidien</div>
                <div className="text-xs text-gray-500">Tous les jours</div>
              </button>

              <button
                type="button"
                onClick={() => handleRecurrenceTypeChange('CALENDAR_MONTHLY')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  schedule.recurrenceType === 'CALENDAR_MONTHLY'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5 mb-1" />
                <div className="text-sm font-medium">Jour du mois</div>
                <div className="text-xs text-gray-500">Ex: le 1er de chaque mois</div>
              </button>

              <button
                type="button"
                onClick={() => handleRecurrenceTypeChange('CALENDAR_YEARLY')}
                className={`p-3 rounded-lg border-2 text-left transition-colors col-span-2 ${
                  schedule.recurrenceType === 'CALENDAR_YEARLY'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5 mb-1" />
                <div className="text-sm font-medium">Date annuelle</div>
                <div className="text-xs text-gray-500">Ex: 15 janvier chaque année</div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Configuration spécifique selon le type */}
      {schedule.recurrenceType === 'FIXED_INTERVAL' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="frequencyValue" className="block text-xs text-gray-600 mb-1">
              Valeur
            </label>
            <input
              id="frequencyValue"
              type="number"
              min="1"
              max="999"
              value={schedule.frequencyValue || 1}
              onChange={(e) =>
                onChange({ ...schedule, frequencyValue: parseInt(e.target.value) || 1 })
              }
              className="input-field"
              placeholder="Ex: 6"
            />
          </div>
          <div>
            <label htmlFor="frequencyUnit" className="block text-xs text-gray-600 mb-1">
              Unité
            </label>
            <select
              id="frequencyUnit"
              value={schedule.frequencyUnit || 'MONTHS'}
              onChange={(e) =>
                onChange({ ...schedule, frequencyUnit: e.target.value })
              }
              className="input-field"
            >
              <option value="DAYS">Jour(s)</option>
              <option value="WEEKS">Semaine(s)</option>
              <option value="MONTHS">Mois</option>
              <option value="YEARS">Année(s)</option>
            </select>
          </div>
        </div>
      )}

      {schedule.recurrenceType === 'CALENDAR_WEEKLY' && (
        <div>
          <label className="block text-xs text-gray-600 mb-2">Jour(s) de la semaine</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeekOptions.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayOfWeekToggle(day.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  schedule.daysOfWeek.includes(day.value)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {schedule.recurrenceType === 'CALENDAR_MONTHLY' && (
        <div>
          <label htmlFor="dayOfMonth" className="block text-xs text-gray-600 mb-1">
            Jour du mois
          </label>
          <select
            id="dayOfMonth"
            value={schedule.dayOfMonth || 1}
            onChange={(e) =>
              onChange({ ...schedule, dayOfMonth: parseInt(e.target.value) })
            }
            className="input-field"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      )}

      {schedule.recurrenceType === 'CALENDAR_YEARLY' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dayOfYear" className="block text-xs text-gray-600 mb-1">
              Jour
            </label>
            <select
              id="dayOfYear"
              value={schedule.dayOfYear || 1}
              onChange={(e) =>
                onChange({ ...schedule, dayOfYear: parseInt(e.target.value) })
              }
              className="input-field"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="monthOfYear" className="block text-xs text-gray-600 mb-1">
              Mois
            </label>
            <select
              id="monthOfYear"
              value={schedule.monthOfYear || 1}
              onChange={(e) =>
                onChange({ ...schedule, monthOfYear: parseInt(e.target.value) })
              }
              className="input-field"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tolérance de retard */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Tolérance de retard</h4>
            <p className="text-xs text-yellow-700 mt-1">
              Délai supplémentaire acceptable après la date d'étalonnage prévue
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="toleranceValue" className="block text-xs text-gray-700 mb-1">
              Valeur
            </label>
            <input
              id="toleranceValue"
              type="number"
              min="0"
              max="365"
              value={schedule.toleranceValue}
              onChange={(e) =>
                onChange({ ...schedule, toleranceValue: parseInt(e.target.value) || 0 })
              }
              className="input-field bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="toleranceUnit" className="block text-xs text-gray-700 mb-1">
              Unité
            </label>
            <select
              id="toleranceUnit"
              value={schedule.toleranceUnit}
              onChange={(e) =>
                onChange({ ...schedule, toleranceUnit: e.target.value as ToleranceUnit })
              }
              className="input-field bg-gray-50"
            >
              <option value="DAYS">Jour(s)</option>
              <option value="WEEKS">Semaine(s)</option>
              <option value="MONTHS">Mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Résumé de la planification</p>
            <p className="mt-1">
              <strong>Fréquence :</strong> {getScheduleDescription()}
            </p>
            <p className="mt-1">
              <strong>Tolérance :</strong> {getToleranceDescription()}
            </p>
            {schedule.toleranceValue > 0 && (
              <p className="mt-2 text-xs">
                ⚠️ L'instrument sera considéré en retard seulement après la période de tolérance
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCalibrationScheduler;

