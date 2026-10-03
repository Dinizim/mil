-- Schema inicial do Mil, reconstruído a partir do banco em produção em 2026-09-30.
-- Este arquivo documenta e versiona o que JÁ EXISTE no projeto Supabase.
-- Em um projeto novo, rode tudo. No projeto atual, marque como aplicado:
--   npx supabase migration repair --status applied 20260930000000

-- ============================================================
-- Tabelas
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint categories_type_check check (type = any (array['income'::text, 'expense'::text])),
  constraint categories_name_not_blank check (length(trim(both from name)) > 0),
  constraint categories_name_max_length check (length(name) <= 60),
  constraint categories_id_user_id_unique unique (id, user_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  amount numeric not null,
  description text,
  category_id uuid,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint transactions_type_check check (type = any (array['income'::text, 'expense'::text])),
  constraint transactions_amount_check check (amount > (0)::numeric),
  constraint transactions_description_max_length check (description is null or length(description) <= 200),
  constraint transactions_category_owner_fk foreign key (category_id, user_id) references public.categories (id, user_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint goals_target_amount_check check (target_amount > (0)::numeric),
  constraint goals_check check (end_date is null or end_date >= start_date),
  constraint goals_name_not_blank check (length(trim(both from name)) > 0),
  constraint goals_name_max_length check (length(name) <= 100),
  constraint goals_id_user_id_unique unique (id, user_id)
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null,
  description text,
  contribution_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint goal_contributions_amount_check check (amount > (0)::numeric),
  constraint goal_contributions_description_max_length check (description is null or length(description) <= 200),
  constraint goal_contributions_goal_owner_fk foreign key (goal_id, user_id) references public.goals (id, user_id) on delete cascade
);

-- ============================================================
-- Índices
-- ============================================================

create index idx_transactions_user_id on public.transactions using btree (user_id);
create index idx_transactions_date on public.transactions using btree (transaction_date);
create index idx_transactions_active_user_date on public.transactions using btree (user_id, transaction_date desc) where (deleted_at is null);
create index idx_goals_user_id on public.goals using btree (user_id);
create index idx_categories_user_id on public.categories using btree (user_id);
create index idx_categories_active_user_name on public.categories using btree (user_id, name) where (deleted_at is null);
create index idx_goal_contributions_goal_id on public.goal_contributions using btree (goal_id);
create index idx_goal_contributions_user_id on public.goal_contributions using btree (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

create policy "Users can view their own profile" on public.profiles for select using (id = auth.uid());
create policy "Users can insert their own profile" on public.profiles for insert with check (id = auth.uid());
create policy "Users can update their own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Users can delete their own profile" on public.profiles for delete using (id = auth.uid());

-- Categorias e transações não têm política de DELETE: o app usa soft delete (deleted_at).
create policy "Users can view their own categories" on public.categories for select using (user_id = auth.uid());
create policy "Users can insert their own categories" on public.categories for insert with check (user_id = auth.uid());
create policy "Users can update their own categories" on public.categories for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can view their own transactions" on public.transactions for select using (user_id = auth.uid());
create policy "Users can insert their own transactions" on public.transactions for insert with check (user_id = auth.uid());
create policy "Users can update their own transactions" on public.transactions for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can view their own goals" on public.goals for select using (user_id = auth.uid());
create policy "Users can insert their own goals" on public.goals for insert with check (user_id = auth.uid());
create policy "Users can update their own goals" on public.goals for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete their own goals" on public.goals for delete using (user_id = auth.uid());

create policy "Users can view their own contributions" on public.goal_contributions for select using (user_id = auth.uid());
create policy "Users can insert their own contributions" on public.goal_contributions for insert with check (user_id = auth.uid());
create policy "Users can update their own contributions" on public.goal_contributions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete their own contributions" on public.goal_contributions for delete using (user_id = auth.uid());

-- ============================================================
-- Funções e triggers
-- ============================================================

-- Cria o perfil quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categorias: só o soft delete (deleted_at) pode mudar.
create or replace function public.prevent_category_history_changes()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
     or new.user_id <> old.user_id
     or new.name <> old.name
     or new.type <> old.type
     or new.created_at <> old.created_at
  then
    raise exception 'Categorias existentes não podem ser alteradas. Arquive a categoria e crie outra.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_category_history_changes
  before update on public.categories
  for each row execute function public.prevent_category_history_changes();

-- Transações são imutáveis: para corrigir, cancela e registra outra.
create or replace function public.prevent_transaction_history_changes()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id
     or new.user_id <> old.user_id
     or new.type <> old.type
     or new.amount <> old.amount
     or new.description is distinct from old.description
     or new.category_id is distinct from old.category_id
     or new.transaction_date <> old.transaction_date
     or new.created_at <> old.created_at
  then
    raise exception 'Transações são imutáveis. Para corrigir um lançamento, cancele a transação e registre uma nova.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_transaction_history_changes
  before update on public.transactions
  for each row execute function public.prevent_transaction_history_changes();
