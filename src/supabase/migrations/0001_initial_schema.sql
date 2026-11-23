
-- Enable UUID generation
create extension if not exists pgcrypto;

-- PROPERTIES
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name varchar(150) not null,
  address text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ROOMS
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id),
  owner_id uuid not null references auth.users(id),
  room_number varchar(50) not null,
  monthly_price numeric(15,2) not null default 0,
  status varchar(20) not null default 'AVAILABLE'
    check (status in ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, room_number)
);

-- TENANTS
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name varchar(150) not null,
  phone varchar(30),
  email varchar(150),
  identity_number varchar(100),
  address text,
  created_at timestamptz not null default now()
);

-- RENTAL CONTRACTS
create table public.rental_contracts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id),
  tenant_id uuid not null references public.tenants(id),
  owner_id uuid not null references auth.users(id),
  start_date date not null,
  end_date date,
  monthly_price numeric(15,2) not null,
  payment_due_day integer not null default 1
    check (payment_due_day between 1 and 28),
  status varchar(20) not null default 'ACTIVE'
    check (status in ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at timestamptz not null default now()
);

-- TRANSACTION CATEGORIES
create table public.transaction_categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name varchar(100) not null,
  type varchar(10) not null
    check (type in ('INCOME', 'EXPENSE')),
  created_at timestamptz not null default now()
);

-- RENTAL INVOICES
create table public.rental_invoices (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.rental_contracts(id),
  owner_id uuid not null references auth.users(id),
  billing_period date not null,
  amount numeric(15,2) not null,
  due_date date not null,
  status varchar(20) not null default 'UNPAID'
    check (status in ('UNPAID', 'PARTIAL', 'PAID', 'OVERDUE')),
  created_at timestamptz not null default now(),
  unique(contract_id, billing_period)
);

-- TRANSACTIONS
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  category_id uuid references public.transaction_categories(id),
  invoice_id uuid references public.rental_invoices(id),
  type varchar(10) not null
    check (type in ('INCOME', 'EXPENSE')),
  amount numeric(15,2) not null check (amount > 0),
  description text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.rental_invoices(id),
  owner_id uuid not null references auth.users(id),
  transaction_id uuid references public.transactions(id),
  amount numeric(15,2) not null check (amount > 0),
  payment_date timestamptz not null default now(),
  payment_method varchar(30),
  proof_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- INDEXES
create index idx_rooms_property on public.rooms(property_id);
create index idx_contracts_room on public.rental_contracts(room_id);
create index idx_contracts_tenant on public.rental_contracts(tenant_id);
create index idx_invoices_contract on public.rental_invoices(contract_id);
create index idx_transactions_date on public.transactions(transaction_date);
create index idx_payments_invoice on public.payments(invoice_id);

-- ROW LEVEL SECURITY
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'properties',
    'rooms',
    'tenants',
    'rental_contracts',
    'transaction_categories',
    'rental_invoices',
    'transactions',
    'payments'
  ]
  loop
    execute format(
      'alter table public.%I enable row level security',
      table_name
    );

    execute format(
      'create policy "Owner can manage own data" on public.%I
       for all to authenticated
       using (owner_id = (select auth.uid()))
       with check (owner_id = (select auth.uid()))',
      table_name
    );
  end loop;
end $$;
