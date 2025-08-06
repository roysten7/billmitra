-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  billing_cycle VARCHAR(20) NOT NULL, -- monthly, quarterly, annually
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurant_subscriptions table
CREATE TABLE IF NOT EXISTS restaurant_subscriptions (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, expired, canceled, pending
  payment_status VARCHAR(20) NOT NULL, -- paid, unpaid, refunded, etc.
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, plan_id, status)
);

-- Add restaurant_id to users table for restaurant admins
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_restaurant_id ON restaurant_subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_plan_id ON restaurant_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_status ON restaurant_subscriptions(status);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['subscription_plans', 'restaurants', 'restaurant_subscriptions'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_timestamp ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_timestamp
                       BEFORE UPDATE ON %I
                       FOR EACH ROW EXECUTE FUNCTION update_timestamp()', t, t);
    END LOOP;
END;
$$;
