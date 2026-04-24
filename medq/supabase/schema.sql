-- ========================================
-- MEDQ — Schema do banco de dados
-- Cole este SQL no Supabase > SQL Editor
-- ========================================

-- Tabela de temas (especialidades)
create table if not exists temas (
  id serial primary key,
  nome text not null,
  icone text default '📚',
  created_at timestamptz default now()
);

-- Tabela de subtemas
create table if not exists subtemas (
  id serial primary key,
  tema_id int references temas(id) on delete cascade,
  nome text not null,
  created_at timestamptz default now()
);

-- Tabela de questões
create table if not exists questoes (
  id serial primary key,
  subtema_id int references subtemas(id) on delete cascade,
  origem text,
  enunciado text not null,
  comentario text,
  created_at timestamptz default now()
);

-- Tabela de alternativas
create table if not exists alternativas (
  id serial primary key,
  questao_id int references questoes(id) on delete cascade,
  letra char(1) not null,
  texto text not null,
  correta boolean default false
);

-- Tabela de respostas dos usuários (sem autenticação por enquanto — usa session_id)
create table if not exists respostas (
  id serial primary key,
  session_id text not null,
  questao_id int references questoes(id) on delete cascade,
  alternativa_id int references alternativas(id),
  acertou boolean not null,
  created_at timestamptz default now()
);

-- Habilitar leitura pública (sem login por enquanto)
alter table temas enable row level security;
alter table subtemas enable row level security;
alter table questoes enable row level security;
alter table alternativas enable row level security;
alter table respostas enable row level security;

create policy "Leitura pública de temas" on temas for select using (true);
create policy "Leitura pública de subtemas" on subtemas for select using (true);
create policy "Leitura pública de questões" on questoes for select using (true);
create policy "Leitura pública de alternativas" on alternativas for select using (true);
create policy "Inserir respostas" on respostas for insert with check (true);
create policy "Ler respostas por session" on respostas for select using (true);

-- ========================================
-- DADOS INICIAIS — Temas e questões
-- ========================================

insert into temas (nome, icone) values
  ('Cardiologia', '❤️'),
  ('Infectologia', '🦠'),
  ('Neurologia', '🧠'),
  ('Pneumologia', '🫁'),
  ('Gastroenterologia', '🫃'),
  ('Pediatria', '👶'),
  ('Ginecologia', '🌸'),
  ('Endocrinologia', '⚗️'),
  ('Reumatologia', '🦴'),
  ('Nefrologia', '🫘')
on conflict do nothing;

-- Subtemas de Cardiologia
insert into subtemas (tema_id, nome)
select id, s from temas, unnest(array[
  'Arritmias','Síndrome Coronariana Aguda','Insuficiência Cardíaca',
  'Valvopatias','Hipertensão Arterial','Pericardiopatias'
]) as s where nome = 'Cardiologia'
on conflict do nothing;

-- Subtemas de Infectologia
insert into subtemas (tema_id, nome)
select id, s from temas, unnest(array[
  'Meningites','HIV/AIDS','Tuberculose','Pneumonias','Hepatites','Parasitoses'
]) as s where nome = 'Infectologia'
on conflict do nothing;

-- Subtemas de Neurologia
insert into subtemas (tema_id, nome)
select id, s from temas, unnest(array[
  'AVC','Epilepsia','Cefaleias','Demências','Doenças Desmielinizantes'
]) as s where nome = 'Neurologia'
on conflict do nothing;

-- Questão 1: Cardiologia > Arritmias
with sub as (select id from subtemas where nome = 'Arritmias' limit 1),
     q as (insert into questoes (subtema_id, origem, enunciado, comentario)
            select sub.id,
              'REVALIDA 2023',
              'Paciente de 68 anos, hipertenso, diabético, chega à UPA com palpitações e dispneia há 2 horas. ECG mostra ausência de ondas P, intervalo RR irregular e frequência ventricular de 140 bpm. Qual é o diagnóstico mais provável e a conduta imediata?',
              'A ausência de ondas P com intervalo RR irregular e FC elevada é o padrão clássico de fibrilação atrial (FA). A conduta inicial visa ao controle da frequência com betabloqueadores (metoprolol) ou bloqueadores de canal de cálcio não-dihidropiridínicos (diltiazem, verapamil). Não se deve cardioverter sem anticoagulação adequada se FA com mais de 48h de duração desconhecida.'
            from sub returning id)
insert into alternativas (questao_id, letra, texto, correta)
select q.id, letra, texto, correta from q, (values
  ('A', 'Flutter atrial 2:1; cardioversão elétrica imediata', false),
  ('B', 'Fibrilação atrial com resposta ventricular rápida; controle da frequência cardíaca', true),
  ('C', 'Taquicardia supraventricular paroxística; manobra vagal', false),
  ('D', 'Taquicardia ventricular monomórfica; amiodarona IV', false),
  ('E', 'Bloqueio atrioventricular total; marcapasso temporário', false)
) as alt(letra, texto, correta);

-- Questão 2: Cardiologia > Arritmias
with sub as (select id from subtemas where nome = 'Arritmias' limit 1),
     q as (insert into questoes (subtema_id, origem, enunciado, comentario)
            select sub.id,
              'USP-SP 2022',
              'Homem de 55 anos apresenta síncope. ECG: QRS largo (0,18s), morfologia de BRE, FC 38 bpm, sem relação entre ondas P e complexos QRS. Qual é o diagnóstico e a conduta correta?',
              'Bloqueio atrioventricular de 3º grau (BAV total) caracteriza-se por dissociação atrioventricular completa — as ondas P ocorrem em ritmo independente dos QRS. QRS largo sugere escape ventricular (abaixo do feixe de His). Indicação absoluta de marcapasso definitivo.'
            from sub returning id)
insert into alternativas (questao_id, letra, texto, correta)
select q.id, letra, texto, correta from q, (values
  ('A', 'BAV 1º grau; observação e acompanhamento ambulatorial', false),
  ('B', 'BAV 2º grau Mobitz I; atropina e monitorização', false),
  ('C', 'BAV 2º grau Mobitz II; considerar marcapasso definitivo', false),
  ('D', 'BAV 3º grau (total); marcapasso definitivo', true),
  ('E', 'Taquicardia ventricular; cardioversão elétrica sincronizada', false)
) as alt(letra, texto, correta);

-- Questão 3: Infectologia > Meningites
with sub as (select id from subtemas where nome = 'Meningites' limit 1),
     q as (insert into questoes (subtema_id, origem, enunciado, comentario)
            select sub.id,
              'REVALIDA 2022',
              'Criança de 8 anos com febre alta (39,5°C), cefaleia intensa, rigidez de nuca e petéquias no tronco. Líquor: turvo, proteína 280mg/dL, glicose 25mg/dL (glicemia 90mg/dL), 2.800 células com 90% PMN. Qual o agente mais provável e o antibiótico de escolha?',
              'Petéquias + febre + síndrome meníngea em criança/jovem é meningococcemia até prova em contrário. LCR purulento (turvo, hiperproteinorraquia, hipoglicorraquia, pleocitose neutrofílica) confirma meningite bacteriana. Neisseria meningitidis é o principal agente em crianças e jovens. Tratamento: ceftriaxona 100mg/kg/dia IV. Dexametasona pode ser usada para reduzir sequelas neurológicas.'
            from sub returning id)
insert into alternativas (questao_id, letra, texto, correta)
select q.id, letra, texto, correta from q, (values
  ('A', 'Streptococcus pneumoniae; penicilina G cristalina', false),
  ('B', 'Neisseria meningitidis; ceftriaxona IV', true),
  ('C', 'Listeria monocytogenes; ampicilina + gentamicina', false),
  ('D', 'Haemophilus influenzae; amoxicilina oral', false),
  ('E', 'Cryptococcus neoformans; fluconazol', false)
) as alt(letra, texto, correta);

-- Questão 4: Infectologia > Meningites
with sub as (select id from subtemas where nome = 'Meningites' limit 1),
     q as (insert into questoes (subtema_id, origem, enunciado, comentario)
            select sub.id,
              'FMUSP 2023',
              'Paciente de 72 anos, imunossuprimido (em uso de corticoide), com meningite bacteriana confirmada ao LCR. Qual é o antibiótico que deve ser ACRESCENTADO ao esquema para cobrir Listeria monocytogenes?',
              'Listeria monocytogenes é naturalmente resistente a cefalosporinas de 3ª geração. Idosos (>50 anos), imunossuprimidos e gestantes têm risco aumentado para Listeria. Nesses grupos, ampicilina deve ser adicionada à ceftriaxona. Se alergia a penicilina: usar sulfametoxazol-trimetoprim.'
            from sub returning id)
insert into alternativas (questao_id, letra, texto, correta)
select q.id, letra, texto, correta from q, (values
  ('A', 'Vancomicina', false),
  ('B', 'Ampicilina', true),
  ('C', 'Metronidazol', false),
  ('D', 'Azitromicina', false),
  ('E', 'Meropeném', false)
) as alt(letra, texto, correta);
