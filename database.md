# Database Schema — Mil

PostgreSQL database schema managed through Supabase.

---

## 1. Schema Overview

```text
auth.users
    │
    │ 1:1
    ▼
profiles
    │
    ├──────────────────────┐
    │                      │
    │ 1:N                  │ 1:N
    ▼                      ▼
categories              goals
    │                      │
    │ 1:N                  │ 1:N
    ▼                      ▼
transactions       goal_contributions
```

### Tables

| Table                | Description                          |
| -------------------- | ------------------------------------ |
| `auth.users`         | Supabase authentication users        |
| `profiles`           | Application user profile             |
| `categories`         | User-owned transaction categories    |
| `transactions`       | Financial income and expense records |
| `goals`              | Financial goals                      |
| `goal_contributions` | Contributions associated with goals  |

---

# 2. `auth.users`

Managed by Supabase Auth.

The application references:

```text
auth.users.id
```

as the primary user identifier.

Application tables use this identifier through foreign keys.

---

# 3. `profiles`

Stores application-specific information associated with an authenticated user.

### Definition

```sql
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);
```

### Columns

| Column       | Type        | Nullable | Constraint               |
| ------------ | ----------- | -------: | ------------------------ |
| `id`         | UUID        |       No | PK, FK → `auth.users.id` |
| `name`       | TEXT        |       No | —                        |
| `created_at` | TIMESTAMPTZ |      Yes | DEFAULT `now()`          |

### Relationship

```text
auth.users.id
      │
      ▼
profiles.id
```

Cardinality:

```text
auth.users 1 ───── 1 profiles
```

---

# 4. `categories`

Stores transaction categories owned by users.

### Definition

```sql
create table categories (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text not null,

    type text not null
        check (type in ('income', 'expense')),

    created_at timestamptz not null default now()
);
```

### Columns

| Column       | Type        | Nullable | Constraint           |
| ------------ | ----------- | -------: | -------------------- |
| `id`         | UUID        |       No | PK                   |
| `user_id`    | UUID        |       No | FK → `auth.users.id` |
| `name`       | TEXT        |       No | —                    |
| `type`       | TEXT        |       No | `income` / `expense` |
| `created_at` | TIMESTAMPTZ |       No | DEFAULT `now()`      |

### Relationship

```text
auth.users.id
      │
      ▼
categories.user_id
```

Cardinality:

```text
auth.users 1 ───── N categories
```

### Constraints

```sql
check (type in ('income', 'expense'))
```

---

# 5. `transactions`

Stores financial transactions.

### Definition

```sql
create table transactions (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    type text not null
        check (type in ('income', 'expense')),

    amount numeric(12, 2) not null
        check (amount > 0),

    description text,

    category_id uuid
        references categories(id)
        on delete set null,

    transaction_date date not null default current_date,

    created_at timestamptz not null default now()
);
```

### Columns

| Column             | Type          | Nullable | Constraint             |
| ------------------ | ------------- | -------: | ---------------------- |
| `id`               | UUID          |       No | PK                     |
| `user_id`          | UUID          |       No | FK → `auth.users.id`   |
| `type`             | TEXT          |       No | `income` / `expense`   |
| `amount`           | NUMERIC(12,2) |       No | `> 0`                  |
| `description`      | TEXT          |      Yes | —                      |
| `category_id`      | UUID          |      Yes | FK → `categories.id`   |
| `transaction_date` | DATE          |       No | DEFAULT `current_date` |
| `created_at`       | TIMESTAMPTZ   |       No | DEFAULT `now()`        |

### Relationships

```text
auth.users.id
      │
      ▼
transactions.user_id
```

```text
categories.id
      │
      ▼
transactions.category_id
```

Cardinality:

```text
auth.users 1 ───── N transactions

categories 1 ───── N transactions
```

### Constraints

Transaction type:

```sql
check (type in ('income', 'expense'))
```

Transaction amount:

```sql
check (amount > 0)
```

### Foreign Key behavior

```sql
category_id
    references categories(id)
    on delete set null
```

Deleting a category sets the associated `category_id` to `NULL` without deleting the transaction.

---

# 6. `goals`

Stores financial goals owned by users.

### Definition

```sql
create table goals (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text not null,

    target_amount numeric(12, 2) not null
        check (target_amount > 0),

    start_date date not null default current_date,

    end_date date,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    check (end_date is null or end_date >= start_date)
);
```

### Columns

| Column          | Type          | Nullable | Constraint             |
| --------------- | ------------- | -------: | ---------------------- |
| `id`            | UUID          |       No | PK                     |
| `user_id`       | UUID          |       No | FK → `auth.users.id`   |
| `name`          | TEXT          |       No | —                      |
| `target_amount` | NUMERIC(12,2) |       No | `> 0`                  |
| `start_date`    | DATE          |       No | DEFAULT `current_date` |
| `end_date`      | DATE          |      Yes | `>= start_date`        |
| `is_active`     | BOOLEAN       |       No | DEFAULT `true`         |
| `created_at`    | TIMESTAMPTZ   |       No | DEFAULT `now()`        |

### Relationship

```text
auth.users.id
      │
      ▼
goals.user_id
```

Cardinality:

```text
auth.users 1 ───── N goals
```

### Constraints

Target amount:

```sql
check (target_amount > 0)
```

Date range:

```sql
check (
    end_date is null
    or end_date >= start_date
)
```

---

# 7. `goal_contributions`

Stores monetary contributions associated with goals.

### Definition

```sql
create table goal_contributions (
    id uuid primary key default gen_random_uuid(),

    goal_id uuid not null
        references goals(id)
        on delete cascade,

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    amount numeric(12, 2) not null
        check (amount > 0),

    description text,

    contribution_date date not null default current_date,

    created_at timestamptz not null default now()
);
```

### Columns

| Column              | Type          | Nullable | Constraint             |
| ------------------- | ------------- | -------: | ---------------------- |
| `id`                | UUID          |       No | PK                     |
| `goal_id`           | UUID          |       No | FK → `goals.id`        |
| `user_id`           | UUID          |       No | FK → `auth.users.id`   |
| `amount`            | NUMERIC(12,2) |       No | `> 0`                  |
| `description`       | TEXT          |      Yes | —                      |
| `contribution_date` | DATE          |       No | DEFAULT `current_date` |
| `created_at`        | TIMESTAMPTZ   |       No | DEFAULT `now()`        |

### Relationships

```text
goals.id
    │
    ▼
goal_contributions.goal_id
```

```text
auth.users.id
      │
      ▼
goal_contributions.user_id
```

Cardinality:

```text
auth.users 1 ───── N goal_contributions

goals 1 ───── N goal_contributions
```

---

# 8. Foreign Keys

| Table                | Column        | References      | ON DELETE |
| -------------------- | ------------- | --------------- | --------- |
| `profiles`           | `id`          | `auth.users.id` | CASCADE   |
| `categories`         | `user_id`     | `auth.users.id` | CASCADE   |
| `transactions`       | `user_id`     | `auth.users.id` | CASCADE   |
| `transactions`       | `category_id` | `categories.id` | SET NULL  |
| `goals`              | `user_id`     | `auth.users.id` | CASCADE   |
| `goal_contributions` | `goal_id`     | `goals.id`      | CASCADE   |
| `goal_contributions` | `user_id`     | `auth.users.id` | CASCADE   |

---

# 9. Indexes

```sql
create index idx_categories_user_id
    on categories(user_id);

create index idx_transactions_user_id
    on transactions(user_id);

create index idx_transactions_date
    on transactions(transaction_date);

create index idx_goals_user_id
    on goals(user_id);

create index idx_goal_contributions_goal_id
    on goal_contributions(goal_id);

create index idx_goal_contributions_user_id
    on goal_contributions(user_id);
```

### Index mapping

| Index                            | Table                | Column             |
| -------------------------------- | -------------------- | ------------------ |
| `idx_categories_user_id`         | `categories`         | `user_id`          |
| `idx_transactions_user_id`       | `transactions`       | `user_id`          |
| `idx_transactions_date`          | `transactions`       | `transaction_date` |
| `idx_goals_user_id`              | `goals`              | `user_id`          |
| `idx_goal_contributions_goal_id` | `goal_contributions` | `goal_id`          |
| `idx_goal_contributions_user_id` | `goal_contributions` | `user_id`          |

---

# 10. Row Level Security

RLS is enabled on all application tables.

```sql
alter table profiles enable row level security;

alter table categories enable row level security;

alter table transactions enable row level security;

alter table goals enable row level security;

alter table goal_contributions enable row level security;
```

---

# 11. RLS Authentication Context

Supabase provides the authenticated user's UUID through:

```sql
auth.uid()
```

For user-owned records, access is restricted using:

```sql
user_id = auth.uid()
```

For `profiles`, the authenticated user's ID corresponds directly to:

```sql
id = auth.uid()
```

---

# 12. RLS — `profiles`

### SELECT

```sql
create policy "Users can view their own profile"
on profiles
for select
using (id = auth.uid());
```

### INSERT

```sql
create policy "Users can insert their own profile"
on profiles
for insert
with check (id = auth.uid());
```

### UPDATE

```sql
create policy "Users can update their own profile"
on profiles
for update
using (id = auth.uid())
with check (id = auth.uid());
```

### DELETE

```sql
create policy "Users can delete their own profile"
on profiles
for delete
using (id = auth.uid());
```

---

# 13. RLS — `categories`

### SELECT

```sql
create policy "Users can view their own categories"
on categories
for select
using (user_id = auth.uid());
```

### INSERT

```sql
create policy "Users can insert their own categories"
on categories
for insert
with check (user_id = auth.uid());
```

### UPDATE

```sql
create policy "Users can update their own categories"
on categories
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

### DELETE

```sql
create policy "Users can delete their own categories"
on categories
for delete
using (user_id = auth.uid());
```

---

# 14. RLS — `transactions`

### SELECT

```sql
create policy "Users can view their own transactions"
on transactions
for select
using (user_id = auth.uid());
```

### INSERT

```sql
create policy "Users can insert their own transactions"
on transactions
for insert
with check (user_id = auth.uid());
```

### UPDATE

```sql
create policy "Users can update their own transactions"
on transactions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

### DELETE

```sql
create policy "Users can delete their own transactions"
on transactions
for delete
using (user_id = auth.uid());
```

---

# 15. RLS — `goals`

### SELECT

```sql
create policy "Users can view their own goals"
on goals
for select
using (user_id = auth.uid());
```

### INSERT

```sql
create policy "Users can insert their own goals"
on goals
for insert
with check (user_id = auth.uid());
```

### UPDATE

```sql
create policy "Users can update their own goals"
on goals
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

### DELETE

```sql
create policy "Users can delete their own goals"
on goals
for delete
using (user_id = auth.uid());
```

---

# 16. RLS — `goal_contributions`

### SELECT

```sql
create policy "Users can view their own contributions"
on goal_contributions
for select
using (user_id = auth.uid());
```

### INSERT

```sql
create policy "Users can insert their own contributions"
on goal_contributions
for insert
with check (user_id = auth.uid());
```

### UPDATE

```sql
create policy "Users can update their own contributions"
on goal_contributions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

### DELETE

```sql
create policy "Users can delete their own contributions"
on goal_contributions
for delete
using (user_id = auth.uid());
```

---

# 17. RLS Policy Matrix

| Table                | SELECT      | INSERT      | UPDATE      | DELETE      |
| -------------------- | ----------- | ----------- | ----------- | ----------- |
| `profiles`           | Own profile | Own profile | Own profile | Own profile |
| `categories`         | Own records | Own records | Own records | Own records |
| `transactions`       | Own records | Own records | Own records | Own records |
| `goals`              | Own records | Own records | Own records | Own records |
| `goal_contributions` | Own records | Own records | Own records | Own records |

---

# 18. `USING` and `WITH CHECK`

### `USING`

Defines which existing rows are accessible by the policy.

Example:

```sql
using (user_id = auth.uid())
```

Applied to:

```text
SELECT
UPDATE
DELETE
```

---

### `WITH CHECK`

Defines which rows are allowed to be inserted or remain after an update.

Example:

```sql
with check (user_id = auth.uid())
```

Applied to:

```text
INSERT
UPDATE
```

---

# 19. Financial Data Model

Transactions:

```text
income
expense
```

Amounts are stored as positive values:

```text
amount > 0
```

Financial direction is determined by `type`.

Goal contributions are stored separately from transactions.

```text
transactions
    ├── income
    └── expense

goal_contributions
    └── reserved amount
```

Goal accumulated amount is derived from:

```sql
sum(goal_contributions.amount)
```

Available balance can be derived from:

```text
SUM(income)
- SUM(expense)
- SUM(goal_contributions)
```

---

# 20. Current Database Structure

```text
┌──────────────────────┐
│      auth.users      │
│──────────────────────│
│ id                   │
└──────────┬───────────┘
           │
           │
     ┌─────┴──────┐
     │            │
     ▼            ▼
┌──────────┐  ┌────────────┐
│ profiles │  │ categories │
└──────────┘  └─────┬──────┘
                    │
                    │
                    ▼
              ┌──────────────┐
              │ transactions │
              └──────────────┘

           auth.users
                │
                ▼
           ┌─────────┐
           │  goals  │
           └────┬────┘
                │
                ▼
      ┌─────────────────────┐
      │ goal_contributions  │
      └─────────────────────┘
```

---

## Database Status

```text
PostgreSQL       ✓
Supabase Auth    ✓
Foreign Keys     ✓
Constraints      ✓
Indexes          ✓
RLS              ✓
```
