import { api } from '@/lib/api';

export interface CreateRestaurantWithSubscriptionInput {
  // Restaurant details
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  
  // Subscription details
  plan_id: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  grace_period_days?: number;
  
  // Restaurant admin details
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Subscription details
  plan_id?: number;
  start_date?: string;
  end_date?: string;
  grace_period_days?: number;
  subscription_status?: string;
  plan_name?: string;
  plan_price?: number;
  
  // Admin details
  admin_name?: string;
  admin_email?: string;
  
  // Settings details
  max_outlets?: number;
  settings_active?: boolean;
  module_permissions?: Array<{
    module_id: number;
    module_name: string;
    display_name: string;
    category: string;
    is_enabled: boolean;
  }>;
}

export class RestaurantService {
  static async createRestaurantWithSubscription(data: CreateRestaurantWithSubscriptionInput) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.post('/restaurants/with-subscription', data, token);
    return response.data;
  }

  static async getRestaurants(page: number = 1, limit: number = 10) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/restaurants?page=${page}&limit=${limit}`, token);
    return response.data;
  }

  static async getRestaurant(id: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/restaurants/${id}`, token);
    return response.data;
  }

  static async updateRestaurant(id: number, data: Partial<Restaurant>) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.put(`/restaurants/${id}`, data, token);
    return response.data;
  }

  static async deleteRestaurant(id: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.delete(`/restaurants/${id}`, token);
    return response.data;
  }

  static async resetRestaurantAdminPassword(restaurantId: number, newPassword: string) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.post(`/restaurants/${restaurantId}/reset-admin-password`, {
      new_password: newPassword
    }, token);
    return response.data;
  }

  static async updateRestaurantAdmin(restaurantId: number, data: {
    admin_name: string;
    admin_email: string;
    admin_password?: string;
  }) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.put(`/restaurants/${restaurantId}/admin`, data, token);
    return response.data;
  }

  static async updateRestaurantSubscription(restaurantId: number, data: {
    plan_id: string;
    start_date: string;
    end_date: string;
    grace_period_days: number;
  }) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.put(`/restaurants/${restaurantId}/subscription`, data, token);
    return response.data;
  }

  static async getRestaurantSettings(restaurantId: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/restaurants/${restaurantId}/settings`, token);
    return response.data;
  }

  static async updateRestaurantSettings(restaurantId: number, data: {
    max_outlets: number;
    module_permissions: Array<{
      module_id: number;
      is_enabled: boolean;
    }>;
  }) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.put(`/restaurants/${restaurantId}/settings`, data, token);
    return response.data;
  }

  static async getModules() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get('/modules', token);
    return response.data;
  }

  static async getOutlets(restaurantId: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get(`/restaurants/${restaurantId}/outlets`, token);
    return response.data;
  }

  static async createOutlet(restaurantId: number, data: any) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.post(`/restaurants/${restaurantId}/outlets`, data, token);
    return response.data;
  }

  static async deleteOutlet(restaurantId: number, outletId: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.delete(`/restaurants/${restaurantId}/outlets/${outletId}`, token);
    return response.data;
  }

  static async getSubscriptionPlans() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    
    const response = await api.get('/subscription-plans', token);
    return response.data;
  }
} 