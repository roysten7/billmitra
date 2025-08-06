-- Migration: Create subscription management tables
-- Created: 2025-08-02

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_plan_name UNIQUE (name)
);

-- Plan modules (features) table
CREATE TABLE IF NOT EXISTS plan_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan
        FOREIGN KEY(plan_id) 
        REFERENCES plans(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_plan_module UNIQUE (plan_id, module_name)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan
        FOREIGN KEY(plan_id)
        REFERENCES plans(id)
        ON DELETE RESTRICT,
    CONSTRAINT unique_restaurant_subscription UNIQUE (restaurant_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_plan_modules_plan_id ON plan_modules(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id ON subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at column
DROP TRIGGER IF EXISTS update_plans_modtime ON plans;
CREATE TRIGGER update_plans_modtime
BEFORE UPDATE ON plans
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_plan_modules_modtime ON plan_modules;
CREATE TRIGGER update_plan_modules_modtime
BEFORE UPDATE ON plan_modules
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_subscriptions_modtime ON subscriptions;
CREATE TRIGGER update_subscriptions_modtime
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Insert default modules that can be enabled/disabled for plans
INSERT INTO plans (id, name, monthly_price, yearly_price, description, is_active)
VALUES 
    (uuid_generate_v4(), 'Free', 0, 0, 'Basic plan with essential features', true),
    (uuid_generate_v4(), 'Starter', 999, 9999, 'For small restaurants', true),
    (uuid_generate_v4(), 'Professional', 2499, 24999, 'For growing restaurants', true),
    (uuid_generate_v4(), 'Enterprise', 4999, 49999, 'For large restaurant chains', true)
ON CONFLICT (name) DO NOTHING;
