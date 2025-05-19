-- Migration for Developer Portal integration
-- Creates tables for managing developer applications, API keys, subscriptions, and usage metrics

-- API applications table
CREATE TABLE IF NOT EXISTS dev_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT dev_applications_name_unique UNIQUE (user_id, name)
);

-- API keys table
CREATE TABLE IF NOT EXISTS dev_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES dev_applications(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL, -- Hashed API key for security
  key_prefix TEXT NOT NULL, -- First 8 chars of key for display
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT dev_api_keys_name_unique UNIQUE (application_id, name)
);

-- API subscription plans
CREATE TABLE IF NOT EXISTS dev_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  features JSONB NOT NULL DEFAULT '{}'::JSONB,
  rate_limit INTEGER NOT NULL DEFAULT 60, -- Requests per minute
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application subscriptions
CREATE TABLE IF NOT EXISTS dev_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES dev_applications(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES dev_subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT dev_subscriptions_app_unique UNIQUE (application_id)
);

-- API usage metrics
CREATE TABLE IF NOT EXISTS dev_api_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES dev_applications(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES dev_api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL, -- in milliseconds
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- API documentation table for endpoints
CREATE TABLE IF NOT EXISTS dev_api_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  request_schema JSONB,
  response_schema JSONB,
  example_request JSONB,
  example_response JSONB,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT dev_api_docs_endpoint_unique UNIQUE (endpoint, method, version)
);

-- Function to hash API keys
CREATE OR REPLACE FUNCTION hash_api_key() RETURNS TRIGGER AS $$
BEGIN
  NEW.key_hash := crypt(NEW.key_hash, gen_salt('bf'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to hash API keys before insert
CREATE TRIGGER hash_api_key_trigger
BEFORE INSERT ON dev_api_keys
FOR EACH ROW
EXECUTE FUNCTION hash_api_key();

-- Add indexes for performance
CREATE INDEX idx_dev_applications_user_id ON dev_applications(user_id);
CREATE INDEX idx_dev_api_keys_app_id ON dev_api_keys(application_id);
CREATE INDEX idx_dev_api_keys_revoked ON dev_api_keys(revoked);
CREATE INDEX idx_dev_subscriptions_app_id ON dev_subscriptions(application_id);
CREATE INDEX idx_dev_subscriptions_status ON dev_subscriptions(status);
CREATE INDEX idx_dev_api_metrics_app_id ON dev_api_metrics(application_id);
CREATE INDEX idx_dev_api_metrics_timestamp ON dev_api_metrics(timestamp);
CREATE INDEX idx_dev_api_metrics_endpoint ON dev_api_metrics(endpoint);

-- Add comments
COMMENT ON TABLE dev_applications IS 'Developer applications registered to use the API';
COMMENT ON TABLE dev_api_keys IS 'API keys for developer applications';
COMMENT ON TABLE dev_subscription_plans IS 'Subscription plans for API access';
COMMENT ON TABLE dev_subscriptions IS 'Active subscriptions for developer applications';
COMMENT ON TABLE dev_api_metrics IS 'Usage metrics for API calls';
COMMENT ON TABLE dev_api_docs IS 'Documentation for API endpoints';

-- Row Level Security
ALTER TABLE dev_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_api_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for developer applications
CREATE POLICY "Users can view their own applications" 
  ON dev_applications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own applications" 
  ON dev_applications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications" 
  ON dev_applications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Policies for API keys
CREATE POLICY "Users can view API keys for their applications" 
  ON dev_api_keys 
  FOR SELECT 
  USING (
    application_id IN (
      SELECT id FROM dev_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create API keys for their applications" 
  ON dev_api_keys 
  FOR INSERT 
  WITH CHECK (
    application_id IN (
      SELECT id FROM dev_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update API keys for their applications" 
  ON dev_api_keys 
  FOR UPDATE 
  USING (
    application_id IN (
      SELECT id FROM dev_applications WHERE user_id = auth.uid()
    )
  );

-- Policies for subscriptions
CREATE POLICY "Users can view subscriptions for their applications" 
  ON dev_subscriptions 
  FOR SELECT 
  USING (
    application_id IN (
      SELECT id FROM dev_applications WHERE user_id = auth.uid()
    )
  );

-- Policies for API metrics
CREATE POLICY "Users can view metrics for their applications" 
  ON dev_api_metrics 
  FOR SELECT 
  USING (
    application_id IN (
      SELECT id FROM dev_applications WHERE user_id = auth.uid()
    )
  );

-- Admin policies (requires is_admin check)
CREATE POLICY "Admins can view all applications" 
  ON dev_applications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

CREATE POLICY "Admins can manage all API keys" 
  ON dev_api_keys 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

CREATE POLICY "Admins can manage all subscriptions" 
  ON dev_subscriptions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

CREATE POLICY "Admins can view all metrics" 
  ON dev_api_metrics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

-- Insert initial subscription plans
INSERT INTO dev_subscription_plans (name, description, price, billing_cycle, features, rate_limit)
VALUES 
  ('Free', 'Basic API access with limited rate', 0.00, 'monthly', '{"endpoints": ["events", "categories"], "support": "community"}', 60),
  ('Developer', 'Standard API access for developers', 29.99, 'monthly', '{"endpoints": ["events", "categories", "tickets", "orders"], "support": "email"}', 300),
  ('Business', 'Enhanced API access for businesses', 99.99, 'monthly', '{"endpoints": ["events", "categories", "tickets", "orders", "users"], "support": "priority"}', 1000),
  ('Enterprise', 'Full API access with dedicated support', 299.99, 'monthly', '{"endpoints": ["all"], "support": "dedicated", "custom_domain": true}', 5000);

-- Function to get developer application details
CREATE OR REPLACE FUNCTION get_developer_application(p_app_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  api_key_count INTEGER,
  subscription_plan TEXT,
  subscription_status TEXT,
  rate_limit INTEGER,
  owner_email TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.description,
    a.status,
    a.created_at,
    a.updated_at,
    COUNT(k.id)::INTEGER AS api_key_count,
    p.name AS subscription_plan,
    s.status AS subscription_status,
    p.rate_limit,
    u.email AS owner_email
  FROM 
    dev_applications a
    LEFT JOIN dev_api_keys k ON a.id = k.application_id
    LEFT JOIN dev_subscriptions s ON a.id = s.application_id
    LEFT JOIN dev_subscription_plans p ON s.plan_id = p.id
    LEFT JOIN auth.users u ON a.user_id = u.id
  WHERE 
    a.id = p_app_id
  GROUP BY
    a.id, a.name, a.description, a.status, a.created_at, a.updated_at,
    p.name, s.status, p.rate_limit, u.email;
END;
$$;

-- Function to generate a secure API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  bytes BYTEA;
  key TEXT;
BEGIN
  bytes := gen_random_bytes(32);
  key := encode(bytes, 'base64');
  key := replace(key, '/', '_');
  key := replace(key, '+', '-');
  key := replace(key, '=', '');
  RETURN key;
END;
$$;

-- Function to create a new API key
CREATE OR REPLACE FUNCTION create_api_key(
  p_application_id UUID,
  p_name TEXT,
  p_permissions JSONB,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  key TEXT,
  key_prefix TEXT,
  name TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_key TEXT;
  v_key_prefix TEXT;
  v_id UUID;
BEGIN
  -- Generate a secure API key
  v_key := generate_api_key();
  v_key_prefix := substring(v_key from 1 for 8);
  
  -- Insert the new API key
  INSERT INTO dev_api_keys (
    application_id,
    key_hash,
    key_prefix,
    name,
    permissions,
    expires_at
  ) VALUES (
    p_application_id,
    v_key, -- Will be hashed by trigger
    v_key_prefix,
    p_name,
    p_permissions,
    p_expires_at
  ) RETURNING id INTO v_id;
  
  -- Return the newly created key (this is the only time the full key is available)
  RETURN QUERY
  SELECT 
    v_id,
    v_key,
    v_key_prefix,
    p_name;
END;
$$;
