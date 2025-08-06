-- Drop subscription_plans table and update foreign key references

-- First, drop the foreign key constraint from restaurant_subscriptions
ALTER TABLE restaurant_subscriptions 
DROP CONSTRAINT IF EXISTS restaurant_subscriptions_plan_id_fkey;

-- Change the plan_id column type from integer to UUID to match plans.id
ALTER TABLE restaurant_subscriptions 
ALTER COLUMN plan_id TYPE UUID USING plan_id::text::UUID;

-- Update the plan_id column to reference the plans table instead
ALTER TABLE restaurant_subscriptions 
ADD CONSTRAINT restaurant_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;

-- Drop the subscription_plans table
DROP TABLE IF EXISTS subscription_plans;

-- Update the trigger creation to remove subscription_plans from the array
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['restaurants', 'restaurant_subscriptions'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_timestamp ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_timestamp
                       BEFORE UPDATE ON %I
                       FOR EACH ROW EXECUTE FUNCTION update_timestamp()', t, t);
    END LOOP;
END;
$$; 