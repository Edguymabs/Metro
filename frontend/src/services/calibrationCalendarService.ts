import api from './api';

export interface CalibrationCalendar {
  id: string;
  name: string;
  description?: string;
  recurrenceType: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  daysOfWeek: string[];
  dayOfMonth?: number;
  monthOfYear?: number;
  dayOfYear?: number;
  toleranceValue: number;
  toleranceUnit: string;
  active: boolean;
  calibrationMethodId?: string;
  calibrationMethod?: {
    id: string;
    name: string;
    instrumentType?: {
      id: string;
      name: string;
    };
  };
  _count?: {
    instruments: number;
  };
  instruments?: Array<{
    id: string;
    serialNumber: string;
    name: string;
    type?: { name: string };
  }>;
  createdAt: string;
  updatedAt: string;
}

export const calibrationCalendarService = {
  async getAll(params?: { calibrationMethodId?: string; active?: boolean }): Promise<CalibrationCalendar[]> {
    const response = await api.get('/calibration-calendars', { params });
    return response.data;
  },

  async getById(id: string): Promise<CalibrationCalendar> {
    const response = await api.get(`/calibration-calendars/${id}`);
    return response.data;
  },

  async create(data: Partial<CalibrationCalendar> & { instrumentIds?: string[] }): Promise<CalibrationCalendar> {
    const response = await api.post('/calibration-calendars', data);
    return response.data;
  },

  async update(id: string, data: Partial<CalibrationCalendar> & { instrumentIds?: string[] }): Promise<CalibrationCalendar> {
    const response = await api.patch(`/calibration-calendars/${id}`, data);
    return response.data;
  },

  async toggleActive(id: string, active: boolean): Promise<CalibrationCalendar> {
    const response = await api.patch(`/calibration-calendars/${id}/toggle`, { active });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/calibration-calendars/${id}`);
  },
};

