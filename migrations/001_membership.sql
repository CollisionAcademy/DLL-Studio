CREATE SCHEMA IF NOT EXISTS dll;
CREATE TABLE IF NOT EXISTS dll.households (
 id text PRIMARY KEY, customer_id text UNIQUE, parent_confirmed_at timestamptz,
 timezone text NOT NULL DEFAULT 'America/New_York', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS dll.memberships (
 household_id text PRIMARY KEY REFERENCES dll.households(id), subscription_id text UNIQUE NOT NULL,
 plan_key text NOT NULL CHECK (plan_key IN ('crew','adventure','super','family')),
 status text NOT NULL, period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
 cancel_at_period_end boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS dll.billing_events (id text PRIMARY KEY, processed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS dll.service_periods (
 id text PRIMARY KEY, household_id text NOT NULL REFERENCES dll.households(id),
 subscription_id text NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
 plan_key text NOT NULL, video_limit integer NOT NULL CHECK(video_limit BETWEEN 0 AND 2),
 UNIQUE(subscription_id, starts_at)
);
CREATE TABLE IF NOT EXISTS dll.profiles (
 household_id text PRIMARY KEY REFERENCES dll.households(id), character_id text NOT NULL,
 birthday_month integer CHECK(birthday_month BETWEEN 1 AND 12), birthday_day integer CHECK(birthday_day BETWEEN 1 AND 31),
 consent_at timestamptz NOT NULL, birthday_saved_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS dll.video_requests (
 id uuid PRIMARY KEY, household_id text NOT NULL REFERENCES dll.households(id),
 period_id text REFERENCES dll.service_periods(id), kind text NOT NULL CHECK(kind IN ('custom','birthday')),
 occurrence_year integer, request_key uuid NOT NULL, script text NOT NULL CHECK(length(script)<=500), character_id text NOT NULL,
 state text NOT NULL DEFAULT 'moderating' CHECK(state IN ('moderating','rejected','queued','submitting','processing','review','ready','failed','uncertain')),
 provider_endpoint text, provider_request_id text, provider_response_url text, provider_status_url text,
 asset_url text, duration_seconds integer NOT NULL CHECK(duration_seconds IN (10,15)),
 parent_publish boolean NOT NULL DEFAULT false, staff_approved_at timestamptz,
 dispatched_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(household_id, request_key), UNIQUE(household_id, kind, occurrence_year)
);
CREATE TABLE IF NOT EXISTS dll.credit_ledger (
 id bigserial PRIMARY KEY, period_id text NOT NULL REFERENCES dll.service_periods(id),
 request_id uuid NOT NULL REFERENCES dll.video_requests(id), action text NOT NULL CHECK(action IN ('reserve','release','consume')),
 quantity integer NOT NULL CHECK(quantity IN (-1,0,1)), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(request_id, action)
);
CREATE TABLE IF NOT EXISTS dll.box_allocations (
 id bigserial PRIMARY KEY, household_id text NOT NULL REFERENCES dll.households(id), period_id text UNIQUE NOT NULL REFERENCES dll.service_periods(id),
 item_count integer NOT NULL DEFAULT 5 CHECK(item_count=5), state text NOT NULL DEFAULT 'awaiting_fulfillment' CHECK(state IN ('awaiting_fulfillment','address_needed','packing','shipped','delivered','held')),
 shipping_reference text, tracking_url text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS dll.votes (household_id text NOT NULL REFERENCES dll.households(id), poll_id text NOT NULL, option_id text NOT NULL, PRIMARY KEY(household_id,poll_id));
CREATE TABLE IF NOT EXISTS dll.badges (household_id text NOT NULL REFERENCES dll.households(id), badge_id text NOT NULL, points integer NOT NULL DEFAULT 10, PRIMARY KEY(household_id,badge_id));
CREATE TABLE IF NOT EXISTS dll.content (
 id text PRIMARY KEY, title text NOT NULL, kind text NOT NULL CHECK(kind IN ('episode','story','activity')),
 body text, asset_url text, approved_at timestamptz, member_at timestamptz NOT NULL DEFAULT now(), early_at timestamptz, first_at timestamptz
);
CREATE TABLE IF NOT EXISTS dll.audit (id bigserial PRIMARY KEY, actor text NOT NULL, action text NOT NULL, target text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS dll.products (
 id text PRIMARY KEY, name text NOT NULL, category text NOT NULL CHECK(category IN ('individual','mega_box')),
 amount_cents integer CHECK(amount_cents>0), item_count integer NOT NULL DEFAULT 1,
 discount_eligible boolean NOT NULL DEFAULT true, stripe_price_id text UNIQUE,
 state text NOT NULL DEFAULT 'preview' CHECK(state IN ('preview','available','sold_out')),
 CHECK(category<>'individual' OR amount_cents<5000), CHECK(category<>'mega_box' OR item_count=10)
);
CREATE TABLE IF NOT EXISTS dll.orders (
 id uuid PRIMARY KEY, household_id text NOT NULL REFERENCES dll.households(id), stripe_payment_id text UNIQUE,
 state text NOT NULL DEFAULT 'pending', subtotal_cents integer NOT NULL CHECK(subtotal_cents>=0),
 discount_cents integer NOT NULL DEFAULT 0, shipping_cents integer, tax_cents integer,
 shipping_reference text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS dll.order_lines (
 order_id uuid NOT NULL REFERENCES dll.orders(id), product_id text NOT NULL REFERENCES dll.products(id),
 quantity integer NOT NULL CHECK(quantity>0), unit_cents integer NOT NULL CHECK(unit_cents>0), PRIMARY KEY(order_id,product_id)
);
CREATE INDEX IF NOT EXISTS video_queue ON dll.video_requests(state,created_at);
CREATE INDEX IF NOT EXISTS video_owner ON dll.video_requests(household_id,created_at);
CREATE INDEX IF NOT EXISTS period_owner ON dll.service_periods(household_id,ends_at);
