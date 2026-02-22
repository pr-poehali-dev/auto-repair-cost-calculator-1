ALTER TABLE car_modifications
  ADD COLUMN IF NOT EXISTS battery_capacity_kwh NUMERIC,
  ADD COLUMN IF NOT EXISTS electric_range_km INTEGER,
  ADD COLUMN IF NOT EXISTS charge_time_h NUMERIC,
  ADD COLUMN IF NOT EXISTS battery_type TEXT,
  ADD COLUMN IF NOT EXISTS battery_temp_range_c TEXT,
  ADD COLUMN IF NOT EXISTS fast_charge_time_h NUMERIC,
  ADD COLUMN IF NOT EXISTS fast_charge_desc TEXT,
  ADD COLUMN IF NOT EXISTS charge_connector_type TEXT,
  ADD COLUMN IF NOT EXISTS consumption_kwh_per_100km NUMERIC,
  ADD COLUMN IF NOT EXISTS max_charge_power_kw NUMERIC,
  ADD COLUMN IF NOT EXISTS battery_available_kwh NUMERIC,
  ADD COLUMN IF NOT EXISTS charge_cycles INTEGER;
