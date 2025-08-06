import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/subscription`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('=== REQUEST INTERCEPTOR DEBUG ===');
    console.log('Token found:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization ? 'Yes' : 'No');
    } else {
      console.log('No token found, skipping Authorization header');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanModule {
  id: string;
  plan_id: string;
  module_name: string;
  is_enabled: boolean;
}

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface CreatePlanInput {
  name: string;
  monthly_price: number;
  yearly_price: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
  id: string;
}

export interface UpdatePlanModulesInput {
  plan_id: string;
  modules: Array<{
    name: string;
    is_enabled: boolean;
  }>;
}

export interface CreateSubscriptionInput {
  restaurant_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
}

export interface UpdateSubscriptionInput {
  id: string;
  plan_id?: string;
  end_date?: string;
  is_active?: boolean;
}

export const subscriptionService = {
  // Plan Management
  async getPlans(activeOnly: boolean = true): Promise<Plan[]> {
    console.log('=== GET PLANS DEBUG ===');
    console.log('Fetching plans with activeOnly:', activeOnly);
    const response = await api.get<Plan[]>('/plans', {
      params: { activeOnly }
    });
    console.log('Plans response:', response.data);
    return response.data;
  },

  async getPlanById(id: string): Promise<Plan> {
    const response = await api.get<Plan>(`/plans/${id}`);
    return response.data;
  },

  async createPlan(data: CreatePlanInput): Promise<Plan> {
    console.log('=== SUBSCRIPTION SERVICE DEBUG ===');
    console.log('Creating plan with data:', data);
    console.log('API base URL:', api.defaults.baseURL);
    console.log('Request headers:', api.defaults.headers);
    
    const response = await api.post<Plan>('/plans', data);
    console.log('Response received:', response.data);
    return response.data;
  },

  async updatePlan(data: UpdatePlanInput): Promise<Plan> {
    const { id, ...updateData } = data;
    const response = await api.put<Plan>(`/plans/${id}`, updateData);
    return response.data;
  },

  async deletePlan(id: string): Promise<void> {
    await api.delete(`/plans/${id}`);
  },

  // Plan Modules
  async getPlanModules(planId: string): Promise<PlanModule[]> {
    const response = await api.get<PlanModule[]>(`/plans/${planId}/modules`);
    return response.data;
  },

  async updatePlanModules(planId: string, modules: Array<{ name: string; is_enabled: boolean }>): Promise<PlanModule[]> {
    const response = await api.put<PlanModule[]>(`/plans/${planId}/modules`, { modules });
    return response.data;
  },

  // Subscription Management
  async getRestaurantSubscription(restaurantId: string): Promise<Subscription | null> {
    try {
      const response = await api.get<Subscription>(`/restaurants/${restaurantId}/subscription`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createSubscription(data: CreateSubscriptionInput): Promise<Subscription> {
    const response = await api.post<Subscription>('/subscriptions', data);
    return response.data;
  },

  async updateSubscription(data: UpdateSubscriptionInput): Promise<Subscription> {
    const { id, ...updateData } = data;
    const response = await api.put<Subscription>(`/subscriptions/${id}`, updateData);
    return response.data;
  },

  async cancelSubscription(id: string): Promise<Subscription> {
    const response = await api.post<Subscription>(`/subscriptions/${id}/cancel`);
    return response.data;
  },

  // Utility Methods
  async getRestaurantModules(restaurantId: string): Promise<string[]> {
    const response = await api.get<{ modules: string[] }>(`/restaurants/${restaurantId}/modules`);
    return response.data.modules;
  },

  async checkModuleAccess(restaurantId: string, moduleName: string): Promise<boolean> {
    try {
      const response = await api.get<{ hasAccess: boolean }>(
        `/restaurants/${restaurantId}/modules/${moduleName}/check-access`
      );
      return response.data.hasAccess;
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  },

  async getAvailableModules(): Promise<string[]> {
    const response = await api.get<{ modules: string[] }>('/modules');
    return response.data.modules;
  },

  // Format price for display
  formatPrice(price: number, period: 'monthly' | 'yearly' = 'monthly'): string {
    const amount = period === 'monthly' ? price : price / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Calculate savings for yearly billing
  calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
    if (!monthlyPrice || !yearlyPrice) return 0;
    const monthlyTotal = monthlyPrice * 12;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  },
};
