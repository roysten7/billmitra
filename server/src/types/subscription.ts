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
  created_at: string;
  updated_at: string;
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
  modules: {
    name: string;
    is_enabled: boolean;
  }[];
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

export const AVAILABLE_MODULES = [
  'billing',
  'whatsapp_share',
  'inventory',
  'template_config',
  'kot_printing',
  'menu_management',
  'table_management',
  'reports',
  'customer_management',
  'multi_outlet',
  'online_ordering',
  'loyalty_program',
  'staff_management',
  'analytics_dashboard',
] as const;

export type ModuleName = typeof AVAILABLE_MODULES[number];
