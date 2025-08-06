-- Add grace_period field to restaurant_subscriptions table
ALTER TABLE restaurant_subscriptions 
ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 7;

-- Add comment for clarity
COMMENT ON COLUMN restaurant_subscriptions.grace_period_days IS 'Number of days after end_date before subscription is considered expired';

-- Update the existing trigger to include the new column
-- (The existing trigger will automatically handle the new column) 