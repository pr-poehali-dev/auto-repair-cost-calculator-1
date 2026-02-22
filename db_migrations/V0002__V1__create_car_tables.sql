CREATE TABLE IF NOT EXISTS car_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS car_models (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES car_brands(id),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS car_generations (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES car_models(id),
  name TEXT NOT NULL,
  years TEXT
);

CREATE TABLE IF NOT EXISTS car_modifications (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL REFERENCES car_generations(id),
  name TEXT NOT NULL,
  engine TEXT,
  transmission TEXT,
  power TEXT,
  body_type TEXT,
  seats INTEGER,
  length_mm INTEGER,
  width_mm INTEGER,
  height_mm INTEGER,
  wheelbase_mm INTEGER,
  track_front_mm INTEGER,
  track_rear_mm INTEGER,
  curb_weight_kg INTEGER,
  wheel_size TEXT,
  ground_clearance_mm INTEGER,
  trunk_max_l INTEGER,
  trunk_min_l INTEGER,
  gross_weight_kg INTEGER,
  disk_size TEXT,
  clearance_mm INTEGER,
  track_front_width_mm INTEGER,
  track_rear_width_mm INTEGER,
  payload_kg INTEGER,
  train_weight_kg INTEGER,
  axle_load_kg INTEGER,
  loading_height_mm INTEGER,
  cargo_compartment_dims TEXT,
  cargo_volume_m3 NUMERIC,
  bolt_pattern TEXT,
  engine_type TEXT,
  engine_volume_cc INTEGER,
  power_rpm INTEGER,
  torque_nm INTEGER,
  intake_type TEXT,
  cylinder_layout TEXT,
  cylinder_count INTEGER,
  compression_ratio NUMERIC,
  valves_per_cylinder INTEGER,
  turbo_type TEXT,
  bore_mm NUMERIC,
  stroke_mm NUMERIC,
  engine_model TEXT,
  engine_location TEXT,
  power_kw INTEGER,
  torque_rpm INTEGER,
  intercooler BOOLEAN,
  engine_code TEXT,
  timing_system TEXT,
  fuel_consumption_method TEXT,
  gear_count INTEGER,
  drive_type TEXT,
  turning_diameter_m NUMERIC,
  fuel_type TEXT,
  max_speed_kmh INTEGER,
  acceleration_100 NUMERIC,
  fuel_tank_l INTEGER,
  eco_standard TEXT,
  fuel_city_l NUMERIC,
  fuel_highway_l NUMERIC,
  fuel_mixed_l NUMERIC,
  range_km INTEGER,
  co2_g_km INTEGER,
  front_brakes TEXT,
  rear_brakes TEXT,
  front_suspension TEXT,
  rear_suspension TEXT,
  doors_count INTEGER,
  country_of_origin TEXT,
  vehicle_class TEXT,
  steering_position TEXT,
  safety_rating NUMERIC,
  safety_rating_name TEXT,
  norm_hours NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_car_models_brand ON car_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_car_generations_model ON car_generations(model_id);
CREATE INDEX IF NOT EXISTS idx_car_modifications_generation ON car_modifications(generation_id);
