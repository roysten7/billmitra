-- Create outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),
  email VARCHAR(255),
  landmark VARCHAR(255),
  zip_code VARCHAR(20) NOT NULL,
  fax VARCHAR(50),
  tin_no VARCHAR(50),
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  address TEXT NOT NULL,
  area VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  additional_info TEXT,
  cuisines TEXT,
  seating_capacity VARCHAR(20) DEFAULT '1-10',
  logo_url VARCHAR(500),
  images JSONB,
  restaurant_type VARCHAR(50) DEFAULT 'Fine Dine',
  online_order_channels JSONB,
  code VARCHAR(100),
  fssai_lic_no VARCHAR(100),
  tax_authority_name VARCHAR(255) NOT NULL,
  outlet_serving_type VARCHAR(20) DEFAULT 'Service',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outlets_restaurant_id ON outlets(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_outlets_city ON outlets(city);
CREATE INDEX IF NOT EXISTS idx_outlets_state ON outlets(state);
CREATE INDEX IF NOT EXISTS idx_outlets_restaurant_type ON outlets(restaurant_type);
CREATE INDEX IF NOT EXISTS idx_outlets_is_active ON outlets(is_active);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_outlets_timestamp ON outlets;
CREATE TRIGGER update_outlets_timestamp
  BEFORE UPDATE ON outlets
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Add some sample data for testing
INSERT INTO outlets (
  restaurant_id, name, alias, email, landmark, zip_code, country, state, city, 
  address, latitude, longitude, seating_capacity, restaurant_type, 
  tax_authority_name, outlet_serving_type
) VALUES 
(1, 'Main Branch', 'MB', 'main@restaurant.com', 'Near Central Park', '400001', 'India', 'Maharashtra', 'Mumbai', 
 '123 Main Street, Mumbai, Maharashtra', 19.0760, 72.8777, '25-50', 'Fine Dine', 
 'Mumbai Tax Authority', 'Service'),
(1, 'Downtown Branch', 'DB', 'downtown@restaurant.com', 'Opposite Mall', '400002', 'India', 'Maharashtra', 'Mumbai', 
 '456 Downtown Avenue, Mumbai, Maharashtra', 19.0760, 72.8777, '10-25', 'QSR', 
 'Mumbai Tax Authority', 'Both'); 