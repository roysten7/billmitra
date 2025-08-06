import { UserRole } from './user';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  monthly_price: number;
  yearly_price: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  logo_url?: string;
  timezone: string;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface RestaurantSubscription {
  id: number;
  restaurant_id: number;
  plan_id: string;
  start_date: Date;
  end_date: Date;
  grace_period_days: number;
  status: 'active' | 'expired' | 'canceled' | 'pending';
  payment_status: 'paid' | 'unpaid' | 'refunded' | 'failed' | 'pending';
  payment_reference?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRestaurantInput {
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
}

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
  start_date: Date;
  end_date: Date;
  grace_period_days?: number;
  
  // Restaurant admin details
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> {
  is_active?: boolean;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  description?: string;
  monthly_price: number;
  yearly_price: number;
  is_active?: boolean;
}

export interface CreateRestaurantSubscriptionInput {
  restaurant_id: number;
  plan_id: string;
  start_date: Date;
  end_date: Date;
  grace_period_days?: number;
  status?: 'active' | 'expired' | 'canceled' | 'pending';
  payment_status?: 'paid' | 'unpaid' | 'refunded' | 'failed' | 'pending';
  payment_reference?: string;
}

export interface CreateRestaurantAdminInput {
  name: string;
  email: string;
  password: string;
  restaurant_id: number;
}

export interface Module {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RestaurantSettings {
  id: number;
  restaurant_id: number;
  max_outlets: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RestaurantModulePermission {
  id: number;
  restaurant_id: number;
  module_id: number;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
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
