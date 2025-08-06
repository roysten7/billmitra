import { api } from '@/lib/api';

export interface Module {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantSettings {
  id: number;
  restaurant_id: number;
  max_outlets: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantModulePermission {
  id: number;
  restaurant_id: number;
  module_id: number;
  module_name: string;
  display_name: string;
  description?: string;
  category: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModuleInput {
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_active?: boolean;
}

export interface UpdateRestaurantSettingsInput {
  max_outlets?: number;
  is_active?: boolean;
}

export interface UpdateRestaurantModulePermissionsInput {
  module_permissions: Array<{
    module_id: number;
    is_enabled: boolean;
  }>;
}

export class ModuleService {
  // Module Management
  static async createModule(data: CreateModuleInput) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.post('/modules', data, token);
    return response.data;
  }

  static async getModules(activeOnly: boolean = true) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/modules?active=${activeOnly}`, token);
    return response.data;
  }

  static async getModule(id: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/modules/${id}`, token);
    return response.data;
  }

  static async updateModule(id: number, data: Partial<CreateModuleInput>) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.put(`/modules/${id}`, data, token);
    return response.data;
  }

  static async deleteModule(id: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.delete(`/modules/${id}`, token);
    return response.data;
  }

  // Restaurant Settings
  static async getRestaurantSettings(restaurantId: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/restaurants/${restaurantId}/settings`, token);
    return response.data;
  }

  static async updateRestaurantSettings(restaurantId: number, data: UpdateRestaurantSettingsInput) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.put(`/restaurants/${restaurantId}/settings`, data, token);
    return response.data;
  }

  // Restaurant Module Permissions
  static async getRestaurantModulePermissions(restaurantId: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/restaurants/${restaurantId}/module-permissions`, token);
    return response.data;
  }

  static async updateRestaurantModulePermissions(restaurantId: number, data: UpdateRestaurantModulePermissionsInput) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.put(`/restaurants/${restaurantId}/module-permissions`, data, token);
    return response.data;
  }

  // Combined restaurant details
  static async getRestaurantWithDetails(restaurantId: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/restaurants/${restaurantId}/details`, token);
    return response.data;
  }
} 