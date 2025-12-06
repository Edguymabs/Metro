import api from './api';

export interface CalibrationMethod {
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
  procedure?: string;
  requiredEquipment?: string;
  estimatedDuration?: number;
  instrumentTypeId?: string;
  instrumentType?: {
    id: string;
    name: string;
  };
  _count?: {
    calendars: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InstrumentWithCalendar {
  id: string;
  name: string;
  serialNumber: string;
  type?: {
    id: string;
    name: string;
  };
  site?: {
    id: string;
    name: string;
  };
  calendarName: string;
  calendarId: string;
}

export interface ApplyMethodRequest {
  methodId: string;
  instrumentIds: string[];
  calendarName?: string;
}

export interface RemoveMethodRequest {
  methodId: string;
  instrumentIds: string[];
}

export const calibrationMethodService = {
  async getAll(instrumentTypeId?: string): Promise<CalibrationMethod[]> {
    const params = instrumentTypeId ? { instrumentTypeId } : {};
    const response = await api.get('/calibration-methods', { params });
    return response.data;
  },

  async getById(id: string): Promise<CalibrationMethod> {
    const response = await api.get(`/calibration-methods/${id}`);
    return response.data;
  },

  async create(data: Partial<CalibrationMethod>): Promise<CalibrationMethod> {
    const response = await api.post('/calibration-methods', data);
    return response.data;
  },

  async update(id: string, data: Partial<CalibrationMethod>): Promise<CalibrationMethod> {
    const response = await api.patch(`/calibration-methods/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/calibration-methods/${id}`);
  },

  // Nouvelles fonctions pour la gestion en masse
  async getInstrumentsUsingMethod(methodId: string): Promise<{
    method: CalibrationMethod;
    instruments: InstrumentWithCalendar[];
    totalCount: number;
  }> {
    const response = await api.get(`/calibration-methods/${methodId}/instruments`);
    return response.data;
  },

  async applyMethodToInstruments(request: ApplyMethodRequest): Promise<{
    message: string;
    calendar: any;
    instruments: any[];
  }> {
    const response = await api.post('/calibration-methods/apply', request);
    return response.data;
  },

  async removeMethodFromInstruments(request: RemoveMethodRequest): Promise<{
    message: string;
    affectedCount: number;
  }> {
    const response = await api.post('/calibration-methods/remove', request);
    return response.data;
  },
};

