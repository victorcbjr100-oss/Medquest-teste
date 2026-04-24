# 🩺 MedQ — Questões de Residência Médica

Plataforma web de questões para preparação para residência médica, construída com Next.js + Supabase.

---

## 🚀 Como rodar o projeto

### Passo 1 — Configurar o banco de dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Abra seu projeto
3. Clique em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Abra o arquivo `supabase/schema.sql` deste projeto
6. Copie TODO o conteúdo e cole no editor do Supabase
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde — isso vai criar as tabelas e inserir as questões iniciais ✅

---

### Passo 2 — Instalar as dependências do projeto

Abra o terminal (PowerShell ou CMD) dentro da pasta `medq` e execute:

```bash
npm install
```

Aguarde o download das dependências (pode demorar 1-2 minutos na primeira vez).

---

### Passo 3 — Rodar o projeto

```bash
npm run dev
```

Abra o navegador e acesse: **http://localhost:3000**

O app estará funcionando com as questões do Supabase! 🎉

---

## 📁 Estrutura do projeto

```
medq/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Tela inicial (lista de temas)
│   │   ├── temas/[id]/page.tsx   ← Subtemas de cada especialidade
│   │   ├── questoes/[subtemaId]/ ← Tela de questões (o coração do app)
│   │   ├── estatisticas/         ← Seus números em tempo real
│   │   ├── simulados/            ← Em breve
│   │   ├── favoritas/            ← Em breve
│   │   ├── caderno/              ← Em breve
│   │   ├── desempenho/           ← Em breve
│   │   ├── perfil/               ← Em breve
│   │   ├── globals.css           ← Estilos globais
│   │   └── layout.tsx            ← Layout raiz
│   ├── components/
│   │   └── Sidebar.tsx           ← Menu lateral
│   └── lib/
│       └── supabase.ts           ← Conexão com o banco
├── supabase/
│   └── schema.sql                ← SQL para criar tabelas + questões iniciais
├── .env.local                    ← Suas chaves do Supabase (não comitar!)
└── package.json
```

---

## ➕ Como adicionar mais questões

### Opção 1 — Via SQL Editor do Supabase

```sql
-- 1. Descobrir o ID do subtema
select id, nome from subtemas where nome = 'Insuficiência Cardíaca';

-- 2. Inserir a questão
insert into questoes (subtema_id, origem, enunciado, comentario)
values (
  3,  -- substitua pelo ID real do subtema
  'FMUSP 2023',
  'Seu enunciado aqui...',
  'Comentário explicando o gabarito...'
) returning id;

-- 3. Inserir as alternativas (substitua 99 pelo ID retornado acima)
insert into alternativas (questao_id, letra, texto, correta) values
  (99, 'A', 'Primeira alternativa', false),
  (99, 'B', 'Segunda alternativa', true),   -- ← correta: true
  (99, 'C', 'Terceira alternativa', false),
  (99, 'D', 'Quarta alternativa', false),
  (99, 'E', 'Quinta alternativa', false);
```

### Opção 2 — Via Table Editor do Supabase
1. Acesse **Table Editor** no painel do Supabase
2. Clique na tabela `questoes` → **Insert row**
3. Depois clique em `alternativas` → **Insert rows** para as alternativas

---

## 🌐 Deploy gratuito na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Instale a Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Na pasta do projeto, execute:
   ```bash
   vercel
   ```
4. Siga os passos e quando pedir as variáveis de ambiente, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anon

O app ficará disponível numa URL pública gratuita! 🚀

---

## 🔐 Segurança

> ⚠️ As chaves do Supabase foram compartilhadas em conversa. Após configurar tudo, acesse:
> **Supabase → Settings → API → Regenerate anon key**
> e atualize o arquivo `.env.local` com a nova chave.

---

## 📍 Próximas funcionalidades

- [ ] Login com e-mail (Supabase Auth)
- [ ] Favoritar questões
- [ ] Caderno de anotações e flashcards
- [ ] Desempenho inteligente por tema
- [ ] Simulados cronometrados
- [ ] Ranking entre usuários
