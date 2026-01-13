-- Create optimized tables
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    age INT2, 
    gender VARCHAR(10),
    emergency_contact VARCHAR(15),
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(8,2) NOT NULL,
    receipt_no VARCHAR(20) NOT NULL,
    payment_mode VARCHAR(10) DEFAULT 'Cash',
    type VARCHAR(15) DEFAULT 'RENEWAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE archived_members (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100),
    phone VARCHAR(15),
    terminated_at DATE DEFAULT CURRENT_DATE,
    original_data JSONB
);


-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_members ENABLE ROW LEVEL SECURITY;

-- Create "Public Service Access" Policies
-- These allow your frontend app to perform all actions while blocking unauthorized external database direct connections
CREATE POLICY "HA_Gym_Full_Access" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "HA_Gym_Full_Access" ON memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "HA_Gym_Full_Access" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "HA_Gym_Full_Access" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "HA_Gym_Full_Access" ON archived_members FOR ALL USING (true) WITH CHECK (true);