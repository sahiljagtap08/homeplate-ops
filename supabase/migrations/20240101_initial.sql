-- ============================================================
-- HomePlate Ops - Initial Schema
-- ============================================================

-- Cached USDA ingredient data (per 100g values from FDC)
create table if not exists ingredients (
  id            uuid primary key default gen_random_uuid(),
  fdc_id        integer unique not null,
  name          text not null,
  data_type     text,
  energy_kcal   numeric,
  protein_g     numeric,
  total_fat_g   numeric,
  saturated_fat_g  numeric,
  trans_fat_g   numeric,
  cholesterol_mg   numeric,
  sodium_mg     numeric,
  total_carb_g  numeric,
  dietary_fiber_g  numeric,
  total_sugars_g   numeric,
  phosphorus_mg numeric,
  potassium_mg  numeric,
  created_at    timestamptz default now()
);

-- Recipes (at 1-serving scale)
create table if not exists recipes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  servings    integer not null default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Junction: recipe → ingredients with gram amounts
create table if not exists recipe_ingredients (
  id            uuid primary key default gen_random_uuid(),
  recipe_id     uuid not null references recipes(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  amount_g      numeric not null check (amount_g > 0),
  created_at    timestamptz default now(),
  unique (recipe_id, ingredient_id)
);

-- Dietician-approved dietary condition thresholds
create table if not exists dietary_conditions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  metric      text not null,  -- e.g. 'sodium_mg', 'saturated_fat_g'
  operator    text not null check (operator in ('<', '>')),
  threshold   numeric not null,
  description text,
  created_at  timestamptz default now()
);

-- Weekly plans
create table if not exists weekly_plans (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null,
  created_at  timestamptz default now()
);

-- Items in a weekly plan
create table if not exists weekly_plan_items (
  id        uuid primary key default gen_random_uuid(),
  plan_id   uuid not null references weekly_plans(id) on delete cascade,
  recipe_id uuid not null references recipes(id),
  servings  integer not null default 1 check (servings > 0)
);

-- ============================================================
-- Seed some starter dietary conditions (dietician defaults)
-- ============================================================
insert into dietary_conditions (name, metric, operator, threshold, description) values
  ('Low Sodium',          'sodium_mg',         '<', 600,  'Less than 600mg sodium per serving'),
  ('Low Saturated Fat',   'saturated_fat_g',   '<', 5,    'Less than 5g saturated fat per serving'),
  ('No Trans Fat',        'trans_fat_g',       '<', 0.5,  'Less than 0.5g trans fat per serving'),
  ('Low Cholesterol',     'cholesterol_mg',    '<', 100,  'Less than 100mg cholesterol per serving'),
  ('High Protein',        'protein_g',         '>', 20,   'More than 20g protein per serving'),
  ('Low Carb',            'total_carb_g',      '<', 30,   'Less than 30g total carbs per serving'),
  ('High Fiber',          'dietary_fiber_g',   '>', 5,    'More than 5g dietary fiber per serving')
on conflict do nothing;

-- Auto-update updated_at on recipes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at();
