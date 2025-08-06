export interface Outlet {
  id: number;
  restaurant_id: number;
  name: string;
  alias?: string;
  email?: string;
  landmark?: string;
  zip_code: string;
  fax?: string;
  tin_no?: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  address: string;
  area?: string;
  latitude: number;
  longitude: number;
  additional_info?: string;
  cuisines?: string;
  seating_capacity: string;
  logo_url?: string;
  images?: string[];
  restaurant_type: string;
  online_order_channels?: string[];
  code?: string;
  fssai_lic_no?: string;
  tax_authority_name: string;
  outlet_serving_type: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOutletInput {
  restaurant_id: number;
  name: string;
  alias?: string;
  email?: string;
  landmark?: string;
  zip_code: string;
  fax?: string;
  tin_no?: string;
  country: string;
  state: string;
  city: string;
  timezone?: string;
  address: string;
  area?: string;
  latitude: number;
  longitude: number;
  additional_info?: string;
  cuisines?: string;
  seating_capacity?: string;
  logo_url?: string;
  images?: string[];
  restaurant_type?: string;
  online_order_channels?: string[];
  code?: string;
  fssai_lic_no?: string;
  tax_authority_name: string;
  outlet_serving_type?: string;
}

export interface UpdateOutletInput extends Partial<CreateOutletInput> {
  is_active?: boolean;
} 