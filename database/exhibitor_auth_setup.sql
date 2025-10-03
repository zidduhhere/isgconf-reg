-- Exhibitor Authentication Setup for Supabase
-- This script sets up the Supabase Auth users for exhibitor companies

-- First, ensure the exhibitor_companies table exists
CREATE TABLE IF NOT EXISTS exhibitor_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    plan VARCHAR(20) CHECK (plan IN ('Diamond', 'Platinum', 'Gold', 'Silver')) NOT NULL,
    lunch_allocation INTEGER NOT NULL,
    dinner_allocation INTEGER NOT NULL,
    lunch_used INTEGER DEFAULT 0,
    dinner_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample exhibitor companies with proper allocations
INSERT INTO exhibitor_companies (company_id, company_name, phone_number, plan, lunch_allocation, dinner_allocation) VALUES
('EXH001', 'Diamond Exhibitor Corp', '+1234567890', 'Diamond', 5, 4),
('EXH002', 'Platinum Solutions Ltd', '+1234567891', 'Platinum', 3, 2),
('EXH003', 'Gold Industries Inc', '+1234567892', 'Gold', 2, 0),
('EXH004', 'Silver Enterprises Co', '+1234567893', 'Silver', 1, 0)
ON CONFLICT (company_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    phone_number = EXCLUDED.phone_number,
    plan = EXCLUDED.plan,
    lunch_allocation = EXCLUDED.lunch_allocation,
    dinner_allocation = EXCLUDED.dinner_allocation;

-- Create the exhibitor employees table
CREATE TABLE IF NOT EXISTS exhibitor_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES exhibitor_companies(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    employee_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create the exhibitor meal claims table
CREATE TABLE IF NOT EXISTS exhibitor_meal_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES exhibitor_companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES exhibitor_employees(id) ON DELETE CASCADE,
    meal_slot_id VARCHAR(50) NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('lunch', 'dinner')) NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    claimed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, employee_id, meal_slot_id)
);

-- Insert sample employees for each company
INSERT INTO exhibitor_employees (company_id, employee_name, employee_phone, is_active) VALUES
-- Diamond Exhibitor Corp employees (5 for lunch, 4 for dinner)
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH001'), 'John Smith', '+1234567801', TRUE),
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH001'), 'Jane Doe', '+1234567802', TRUE),
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH001'), 'Mike Johnson', '+1234567803', TRUE),
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH001'), 'Sarah Wilson', '+1234567804', TRUE),
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH001'), 'David Brown', '+1234567805', TRUE),

-- Platinum Solutions Ltd employees (3 for lunch, 2 for dinner)
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH002'), 'Alice Cooper', '+1234567811', TRUE),
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH002'), 'Bob Williams', '+1234567812', TRUE),
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH002'), 'Carol Davis', '+1234567813', TRUE),

-- Gold Industries Inc employees (2 for lunch, 0 for dinner)
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH003'), 'Emma Thompson', '+1234567821', TRUE),
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH003'), 'Frank Miller', '+1234567822', TRUE),

-- Silver Enterprises Co employees (1 for lunch, 0 for dinner)
((SELECT id FROM exhibitor_companies WHERE company_id = 'EXH004'), 'Grace Lee', '+1234567831', TRUE)
ON CONFLICT DO NOTHING;

-- Note: The following users need to be created in Supabase Auth manually or via API:
-- Email: exh001@isgcon, Password: participanthere (for EXH001 - Diamond)
-- Email: exh002@isgcon, Password: participanthere (for EXH002 - Platinum)
-- Email: exh003@isgcon, Password: participanthere (for EXH003 - Gold)
-- Email: exh004@isgcon, Password: participanthere (for EXH004 - Silver)

-- Row Level Security (RLS) policies for exhibitor tables
ALTER TABLE exhibitor_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_meal_claims ENABLE ROW LEVEL SECURITY;

-- Policy for exhibitor_companies: Users can only access their own company data
CREATE POLICY "Exhibitors can view own company" ON exhibitor_companies
FOR ALL USING (
    company_id = UPPER(SPLIT_PART(auth.jwt()->>'email', '@', 1))
);

-- Policy for exhibitor_employees: Users can only access employees of their company
CREATE POLICY "Exhibitors can manage own employees" ON exhibitor_employees
FOR ALL USING (
    company_id IN (
        SELECT id FROM exhibitor_companies 
        WHERE company_id = UPPER(SPLIT_PART(auth.jwt()->>'email', '@', 1))
    )
);

-- Policy for exhibitor_meal_claims: Users can only access claims of their company
CREATE POLICY "Exhibitors can manage own meal claims" ON exhibitor_meal_claims
FOR ALL USING (
    company_id IN (
        SELECT id FROM exhibitor_companies 
        WHERE company_id = UPPER(SPLIT_PART(auth.jwt()->>'email', '@', 1))
    )
);

-- Grant necessary permissions
GRANT ALL ON exhibitor_companies TO authenticated;
GRANT ALL ON exhibitor_employees TO authenticated;
GRANT ALL ON exhibitor_meal_claims TO authenticated;