-- Minimal schema and seed for Real Estate assessment
-- Tables: projects, properties, lands, contacts

DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS lands;
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	image_urls JSONB DEFAULT '[]'::jsonb,
	price_range TEXT,
	location_city TEXT,
	location_neighborhood TEXT,
	details TEXT,
	sq_ft_or_area INT,
	search_vector tsvector
);

CREATE TABLE properties (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	image_urls JSONB DEFAULT '[]'::jsonb,
	price NUMERIC(14,2),
	price_range TEXT,
	location_city TEXT,
	location_neighborhood TEXT,
	details TEXT,
	sq_ft_or_area INT,
	project_id INT REFERENCES projects(id)
	,search_vector tsvector
);

CREATE TABLE lands (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	image_urls JSONB DEFAULT '[]'::jsonb,
	price NUMERIC(14,2),
	price_range TEXT,
	location_city TEXT,
	location_neighborhood TEXT,
	details TEXT,
	sq_ft_or_area INT,
	images JSONB DEFAULT '[]'::jsonb,
	search_vector tsvector
);

CREATE TABLE contacts (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	message TEXT NOT NULL,
	property_id INT REFERENCES properties(id),
	created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
-- B-tree indexes for common filters and sorting
CREATE INDEX IF NOT EXISTS idx_properties_location_city ON properties(location_city);
CREATE INDEX IF NOT EXISTS idx_properties_location_neighborhood ON properties(location_neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_sqft ON properties(sq_ft_or_area);

CREATE INDEX IF NOT EXISTS idx_projects_location_city ON projects(location_city);
CREATE INDEX IF NOT EXISTS idx_projects_location_neighborhood ON projects(location_neighborhood);
CREATE INDEX IF NOT EXISTS idx_projects_sqft ON projects(sq_ft_or_area);

CREATE INDEX IF NOT EXISTS idx_lands_location_city ON lands(location_city);
CREATE INDEX IF NOT EXISTS idx_lands_location_neighborhood ON lands(location_neighborhood);
CREATE INDEX IF NOT EXISTS idx_lands_price ON lands(price);
CREATE INDEX IF NOT EXISTS idx_lands_sqft ON lands(sq_ft_or_area);

-- Full-text search indexes (GIN) on name + details to support keyword search
-- Maintain a tsvector column for efficient full-text search
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
	NEW.search_vector := to_tsvector('english', coalesce(NEW.name, '') || ' ' || coalesce(NEW.details, ''));
	RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Populate search_vector for existing rows
UPDATE projects SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(details, ''));
UPDATE properties SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(details, ''));
UPDATE lands SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(details, ''));

-- Triggers to keep search_vector up-to-date (drop if exist, then create)
DROP TRIGGER IF EXISTS trg_projects_search_vector ON projects;
CREATE TRIGGER trg_projects_search_vector BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS trg_properties_search_vector ON properties;
CREATE TRIGGER trg_properties_search_vector BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS trg_lands_search_vector ON lands;
CREATE TRIGGER trg_lands_search_vector BEFORE INSERT OR UPDATE ON lands
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- GIN indexes on the persisted search_vector column
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_lands_search ON lands USING GIN (search_vector);

-- Seed data
INSERT INTO projects (name, image_urls, price_range, location_city, location_neighborhood, details, sq_ft_or_area) VALUES
('Sunset Villas', '[]', '$150k - $400k', 'Seaside', 'Coastline', 'A beachfront development with modern villas.', NULL),
('Green Acres', '[]', '$80k - $250k', 'Hillside', 'Green Estates', 'Family-oriented community near parks.', NULL);

INSERT INTO properties (name, image_urls, price, price_range, location_city, location_neighborhood, details, sq_ft_or_area, project_id) VALUES
('Cozy 2BR Apartment', '["/sample data/images/properties/property1.jpg"]', 85000.00, NULL, 'Seaside', 'Coastline', 'Bright apartment near the sea', 75, 1),
('Family House', '["/sample data/images/properties/property2.jpg"]', 185000.00, NULL, 'Hillside', 'Green Estates', 'Spacious house with garden', 220, 2);

INSERT INTO lands (name, image_urls, price, price_range, location_city, location_neighborhood, details, sq_ft_or_area, images) VALUES
('Plot A', '[]', 40000.00, NULL, 'Outskirts', 'Main Road', 'Build-ready plot near main road', 500, '[]'),
('Plot B', '[]', 55000.00, NULL, 'Hillside', 'Quiet Neighborhood', 'Quiet neighborhood plot', 650, '[]');

INSERT INTO contacts (name, email, message, property_id) VALUES
('Alice', 'alice@example.com', 'I am interested in Cozy 2BR Apartment', 1),
('Bob', 'bob@example.com', 'Please send more details about Family House', 2);

-- End of script

-- Users table for authentication
DROP TABLE IF EXISTS users;
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	name TEXT,
	role TEXT DEFAULT 'user', -- e.g., user, admin, agent
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMPTZ DEFAULT now(),
	last_login TIMESTAMPTZ
);

-- Agent contacts / request logs (to record incoming agent or webhook requests)
DROP TABLE IF EXISTS agent_contacts;
CREATE TABLE agent_contacts (
	id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id),
	name TEXT,
	email TEXT,
	message TEXT,
	property_id INT REFERENCES properties(id),
	request_path TEXT,
	request_body JSONB,
	response_status INT,
	user_agent TEXT,
	ip_address TEXT,
	metadata JSONB DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for auth and logging
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_agent_contacts_user ON agent_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_contacts_property ON agent_contacts(property_id);

-- Example seed user (password_hash should be replaced with a real bcrypt hash in production)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@example.com', '$2b$10$exampleReplaceWithRealHash', 'Admin', 'admin');

-- Bulk-generated sample data (1000 rows total)
-- Projects: 250, Properties: 600, Lands: 150
-- Uses generate_series + random() to create varied realistic sample rows

-- Projects (250)
INSERT INTO projects (name, image_urls, price_range, location_city, location_neighborhood, details, sq_ft_or_area)
SELECT
	concat('Project ', s.id, ' - ', (array['Apex','Vista','Haven','Gardens','Residences','Terraces'])[(floor(random()*6)+1)::int]) as name,
	jsonb_build_array((array['/sample data/images/projects/project1.jpg','/sample data/images/projects/project2.jpg'])[(floor(random()*2)+1)::int]) as image_urls,
	(array['$50k - $150k','$75k - $250k','$120k - $400k','$200k - $600k','$300k - $900k'])[(floor(random()*5)+1)::int] as price_range,
	(array['Seaside','Hillside','Downtown','Uptown','Midtown','Riverside','Suburbia','Old Town'])[(floor(random()*8)+1)::int] as location_city,
	(array['North','South','East','West','Central','Harbor','Garden','Heights'])[(floor(random()*8)+1)::int] as location_neighborhood,
	concat('Sample project description for project ', s.id, '. Located conveniently with modern amenities.') as details,
	(floor(random()*4000)+400)::int as sq_ft_or_area
FROM generate_series(1,250) as s(id);

-- Properties (600) — associate randomly to projects above
INSERT INTO properties (name, image_urls, price, price_range, location_city, location_neighborhood, details, sq_ft_or_area, project_id)
SELECT
	concat('Property ', s.id, ' ', (array['Studio','1BR','2BR','3BR','Loft','Townhouse'])[(floor(random()*6)+1)::int]) as name,
	jsonb_build_array((array['/sample data/images/properties/property1.jpg','/sample data/images/properties/property2.jpg'])[(floor(random()*2)+1)::int]) as image_urls,
	round(((random()*950000)+50000)::numeric,2) as price,
	NULL as price_range,
	(array['Seaside','Hillside','Downtown','Uptown','Midtown','Riverside','Suburbia','Old Town'])[(floor(random()*8)+1)::int] as location_city,
	(array['North','South','East','West','Central','Harbor','Garden','Heights'])[(floor(random()*8)+1)::int] as location_neighborhood,
	concat('A lovely property: sample description for property ', s.id, '. Close to transport and amenities.') as details,
	(floor(random()*2500)+200)::int as sq_ft_or_area,
	(floor(random()*250)+1)::int as project_id
FROM generate_series(1,600) as s(id);

-- Lands (150)
INSERT INTO lands (name, image_urls, price, price_range, location_city, location_neighborhood, details, sq_ft_or_area, images)
SELECT
	concat('Land Plot ', s.id, ' - ', (array['Parcel','Acre','Lot','Block'])[(floor(random()*4)+1)::int]) as name,
	jsonb_build_array((array['/sample data/images/lands/land1.jpg','/sample data/images/lands/land2.jpg'])[(floor(random()*2)+1)::int]) as image_urls,
	round(((random()*200000)+10000)::numeric,2) as price,
	NULL as price_range,
	(array['Outskirts','Hillside','Downtown','Riverside','Valley','Plateau'])[(floor(random()*6)+1)::int] as location_city,
	(array['North','South','East','West','Central'])[(floor(random()*5)+1)::int] as location_neighborhood,
	concat('Open land suitable for development. Sample plot ', s.id, '.') as details,
	(floor(random()*3000)+300)::int as sq_ft_or_area,
	jsonb_build_array((array['/sample data/images/lands/land1.jpg','/sample data/images/lands/land2.jpg'])[(floor(random()*2)+1)::int]) as images
FROM generate_series(1,150) as s(id);

-- Refresh tsvector search columns for newly inserted rows
UPDATE projects SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(details, '')) WHERE search_vector IS NULL OR search_vector = '';
UPDATE properties SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(details, '')) WHERE search_vector IS NULL OR search_vector = '';
UPDATE lands SET search_vector = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(details, '')) WHERE search_vector IS NULL OR search_vector = '';

