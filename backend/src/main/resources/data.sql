-- Seed data for Smart Bus Pass PostgreSQL database
-- Run this after the tables are created by Hibernate

INSERT INTO depots (id, name) VALUES
('d1', 'Saluru'),
('d2', 'Srikakulam'),
('d3', 'Vizianagaram')
ON CONFLICT (id) DO NOTHING;

INSERT INTO routes (id, name, depot_id, coordinates) VALUES
('r1', 'Saluru → Rajam', 'd1', '[[18.52, 83.21], [18.45, 83.63]]'),
('r2', 'Saluru → Bobbili → Rajam', 'd1', '[[18.52, 83.21], [18.57, 83.36], [18.45, 83.63]]'),
('r3', 'Saluru → Srikakulam', 'd1', '[[18.52, 83.21], [18.30, 83.90]]'),
('r4', 'Srikakulam → Rajam', 'd2', '[[18.30, 83.90], [18.45, 83.63]]'),
('r5', 'Srikakulam → Bobbili', 'd2', '[[18.30, 83.90], [18.57, 83.36]]'),
('r6', 'Srikakulam → Saluru', 'd2', '[[18.30, 83.90], [18.52, 83.21]]'),
('r7', 'Srikakulam → Balijipeta', 'd2', '[[18.30, 83.90], [18.35, 83.75]]'),
('r8', 'Srikakulam → Vizianagaram', 'd2', '[[18.30, 83.90], [18.11, 83.39]]'),
('r9', 'Vizianagaram → Cheepurupalli → Rajam', 'd3', '[[18.11, 83.39], [18.31, 83.57], [18.45, 83.63]]'),
('r10', 'Vizianagaram → Bobbili', 'd3', '[[18.11, 83.39], [18.57, 83.36]]'),
('r11', 'Vizianagaram → Srikakulam', 'd3', '[[18.11, 83.39], [18.30, 83.90]]')
ON CONFLICT (id) DO NOTHING;

-- Passwords: Plain text for development
-- Users: password123, Admin: admin123

INSERT INTO parents (id, father_name, email, password) VALUES
('p1', 'Ramesh Kumar', 'ramesh@example.com', 'password123'),
('p2', 'Suresh Reddy', 'suresh@example.com', 'password123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, name, phone, email, parent_id, route_id, password) VALUES
('s1', 'Anil Kumar', '9876543210', 'anil@example.com', 'p1', 'r1', 'password123'),
('s2', 'Priya Kumar', '9876543211', 'priya@example.com', 'p1', 'r4', 'password123'),
('s3', 'Vikram Reddy', '9876543212', 'vikram@example.com', 'p2', 'r9', 'password123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO admins (id, name, depot_id, route_id, password) VALUES
('a1', 'Conductor Raju', 'd1', 'r1', 'admin123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bus_passes (id, student_id, route_id, start_date, expiry_date, months, status) VALUES
('bp1', 's1', 'r1', '2026-01-01', '2026-04-01', 3, 'ACTIVE'),
('bp2', 's2', 'r4', '2025-10-01', '2026-01-01', 3, 'EXPIRED'),
('bp3', 's3', 'r9', '2026-02-01', '2026-05-01', 3, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, bus_pass_id, status, date, amount) VALUES
('pay1', 'bp1', 'SUCCESS', '2026-01-01', 1500.00),
('pay2', 'bp2', 'SUCCESS', '2025-10-01', 1500.00),
('pay3', 'bp3', 'SUCCESS', '2026-02-01', 1500.00)
ON CONFLICT (id) DO NOTHING;
