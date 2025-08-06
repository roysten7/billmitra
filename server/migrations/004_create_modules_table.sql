-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'management', 'operations', 'reports', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurant_settings table
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  max_outlets INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id)
);

-- Create restaurant_module_permissions table
CREATE TABLE IF NOT EXISTS restaurant_module_permissions (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, module_id)
);

-- Insert default modules
INSERT INTO modules (name, display_name, description, category) VALUES
('order_management', 'Order Management', 'Manage orders, KOT generation, and order tracking', 'operations'),
('table_management', 'Table Management', 'Manage restaurant tables and seating arrangements', 'operations'),
('menu_management', 'Menu Management', 'Create and manage menu items, categories, and pricing', 'management'),
('inventory_management', 'Inventory Management', 'Track stock levels, low stock alerts, and inventory reports', 'management'),
('staff_management', 'Staff Management', 'Manage staff accounts, roles, and permissions', 'management'),
('customer_management', 'Customer Management', 'Manage customer database and loyalty programs', 'management'),
('payment_processing', 'Payment Processing', 'Process payments, split bills, and payment reports', 'operations'),
('reports_analytics', 'Reports & Analytics', 'Sales reports, analytics, and business insights', 'reports'),
('billing_management', 'Billing Management', 'Generate bills, manage invoices, and billing history', 'operations'),
('kitchen_display', 'Kitchen Display', 'Kitchen order display and preparation tracking', 'operations'),
('reservation_system', 'Reservation System', 'Table reservations and booking management', 'operations'),
('loyalty_program', 'Loyalty Program', 'Customer loyalty points and rewards system', 'management');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant_id ON restaurant_settings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_module_permissions_restaurant_id ON restaurant_module_permissions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_module_permissions_module_id ON restaurant_module_permissions(module_id);

-- Add triggers for updated_at
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['modules', 'restaurant_settings', 'restaurant_module_permissions'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_timestamp ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_timestamp
                       BEFORE UPDATE ON %I
                       FOR EACH ROW EXECUTE FUNCTION update_timestamp()', t, t);
    END LOOP;
END;
$$; 