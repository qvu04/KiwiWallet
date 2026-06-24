-- =============================================================
-- SCHEMA CO SO DU LIEU - QUAN LY CHI TIEU CA NHAN (Supabase / Postgres)
-- Chay toan bo file nay trong: Supabase Dashboard > SQL Editor
-- =============================================================

-- Bang nguoi dung (tu quan ly auth bang JWT trong backend)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Bang danh muc (hang muc thu/chi). type: 'income' | 'expense'
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  icon text default 'FaTag',
  color text default '#6366f1',
  created_at timestamptz not null default now()
);

-- Bang giao dich thu/chi
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type text not null check (type in ('income','expense')),
  amount numeric(14,2) not null check (amount >= 0),
  note text,
  occurred_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- Bang ngan sach theo hang muc / khoang thoi gian
-- period: 'weekly' | 'monthly'
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  amount_limit numeric(14,2) not null check (amount_limit > 0),
  period text not null default 'monthly' check (period in ('weekly','monthly')),
  created_at timestamptz not null default now()
);

-- Bang muc tieu tai chinh (ngan/dai han)
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  saved_amount numeric(14,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);

-- Bang nhac nho / hoa don dinh ky
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  amount numeric(14,2),
  due_date date not null,
  repeat text default 'none' check (repeat in ('none','weekly','monthly')),
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Chi muc tang toc truy van
create index if not exists idx_tx_user_date on transactions(user_id, occurred_at);
create index if not exists idx_cat_user on categories(user_id);
create index if not exists idx_budget_user on budgets(user_id);
create index if not exists idx_goal_user on goals(user_id);
create index if not exists idx_reminder_user on reminders(user_id);
