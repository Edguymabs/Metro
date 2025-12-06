import api from './api';

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const accountService = {
  // Changer le mot de passe
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/account/change-password', data);
    return response.data;
  },

  // Récupérer les préférences
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<UserPreferences>('/account/preferences');
    return response.data;
  },

  // Mettre à jour les préférences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.patch<UserPreferences>('/account/preferences', preferences);
    return response.data;
  },

  // Récupérer le profil
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/account/profile');
    return response.data;
  },

  // Mettre à jour le profil
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/account/profile', data);
    return response.data;
  },
};


