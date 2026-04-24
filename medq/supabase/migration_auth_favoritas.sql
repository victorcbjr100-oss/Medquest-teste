-- =============================================
-- MIGRATION: Login + Favoritas
-- Cole no Supabase > SQL Editor e clique Run
-- =============================================

-- Tabela de favoritas (vinculada ao usuário autenticado)
create table if not exists favoritas (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  questao_id int references questoes(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, questao_id)  -- evita duplicatas
);

-- Segurança: cada usuário só vê e altera suas próprias favoritas
alter table favoritas enable row level security;

create policy "Ver próprias favoritas"
  on favoritas for select
  using (auth.uid() = user_id);

create policy "Adicionar favoritas"
  on favoritas for insert
  with check (auth.uid() = user_id);

create policy "Remover favoritas"
  on favoritas for delete
  using (auth.uid() = user_id);
