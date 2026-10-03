# Mil

Controle financeiro pessoal simples, visual e moderno.

O **Mil** é uma aplicação web para controle financeiro pessoal, permitindo acompanhar receitas, despesas, saldo, categorias e metas financeiras em um único lugar.

O projeto foi desenvolvido com foco em uma experiência **mobile-first**, interface moderna e arquitetura preparada para evolução.

## Funcionalidades

- Cadastro e login com e-mail ou Google, recuperação e troca de senha
- Controle de receitas e despesas, com filtros, busca e navegação por mês
- Edição de transações (o lançamento original é cancelado e preservado no histórico)
- Lançamento rápido em texto livre ("mercado 85") e atalho no app instalado
- Importação de extrato OFX/CSV com detecção de duplicadas
- Dashboard com saldo total, disponível e reservado, mês a mês
- Metas com valor mensal sugerido, ritmo (no ritmo, atrasada, adiantada), histórico de aportes, edição e reativação
- Relatórios mensais comparados à média dos 3 meses anteriores, exportação em CSV e PDF
- Modo privacidade para ocultar valores
- LGPD: política de privacidade, termos, exportar meus dados (JSON/CSV) e excluir minha conta
- Gerenciamento de categorias
- Interface responsiva, navegação mobile, PWA e página offline
- Row Level Security (RLS)

## Tecnologias

### Front-end

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Geist

### Back-end e banco de dados

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

### Infraestrutura

- Vercel
- Git
- GitHub
- Progressive Web App (PWA)

## Arquitetura

O projeto utiliza o **Next.js App Router**, com separação entre páginas, componentes, serviços e integração com o Supabase.

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── goals/
│   │   └── profile/
│   │
│   ├── offline/
│   └── manifest.ts
│
├── components/
│   ├── navigation/
│   └── ui/
│
├── lib/
│   └── supabase/
│
├── services/
│   ├── account.service.ts
│   ├── category.services.ts
│   ├── finance.service.ts
│   ├── goal.service.ts
│   └── transaction.service.ts
│
└── proxy.ts
```

## Banco de dados

O Mil utiliza PostgreSQL através do Supabase.

Principais entidades:

```text
auth.users
     |
     v
 profiles
     |
     +-------------+
     |             |
     v             v
categories       goals
     |             |
     v             v
transactions   goal_contributions
```

### Principais tabelas

- `profiles`
- `categories`
- `transactions`
- `goals`
- `goal_contributions`

O banco utiliza **Row Level Security (RLS)** para garantir que cada usuário tenha acesso somente aos seus próprios dados.

## Autenticação

A autenticação é realizada utilizando o **Supabase Auth**.

Fluxo principal:

```text
Cadastro
   |
   v
Supabase Auth
   |
   v
Profile
   |
   v
Login
   |
   v
Dashboard protegido
```

As sessões são utilizadas para proteger as áreas autenticadas da aplicação.

## Regras financeiras

O Mil diferencia o saldo financeiro das reservas destinadas às metas.

### Saldo total

```text
Receitas - Despesas
```

### Saldo reservado

```text
Contribuições de metas ativas
```

### Saldo disponível

```text
Saldo total - Saldo reservado
```

As contribuições para metas não são registradas como despesas. Dessa forma, o sistema mantém separado o histórico de movimentações e o dinheiro reservado para objetivos financeiros.

## PWA

O Mil possui suporte a **Progressive Web App (PWA)**.

A aplicação conta com:

- Web App Manifest
- Service Worker
- Ícones para instalação
- Página offline
- Suporte à instalação como aplicativo
- Interface adaptada para dispositivos móveis

## Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Dinizim/mil.git
```

### 2. Entre na pasta

```bash
cd mil
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo chamado:

```text
.env.local
```

Utilize o arquivo `.env.example` como referência.

Configure as credenciais do seu projeto Supabase.

> O arquivo `.env.local` não deve ser enviado para o GitHub.

Variáveis:

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexão com o Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Só no servidor, para excluir a conta do usuário |
| `NEXT_PUBLIC_PRIVACY_EMAIL` | Contato de privacidade exibido no app |

Para o login com Google, ative o provedor Google no painel do Supabase e inclua `https://SEU-DOMINIO/auth/callback` (e `http://localhost:3000/auth/callback`) em *Authentication → URL Configuration → Redirect URLs*. Os links de recuperação de senha e de troca de e-mail usam a mesma rota.

### 5. Banco de dados

O schema (tabelas, RLS, triggers e funções) está versionado em `supabase/migrations`. Em um projeto novo:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

No projeto que já existe, marque a migration inicial como aplicada:

```bash
npx supabase migration repair --status applied 20260930000000
```

### 6. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
```

As regras de dinheiro, datas, saldo, metas, importação de extrato e lançamento rápido ficam em `src/lib` como funções puras e têm testes unitários.

## Build de produção

Para gerar o build:

```bash
npm run build
```

Para executar a aplicação:

```bash
npm start
```

## Roadmap

- [x] Autenticação
- [x] Dashboard financeiro
- [x] Transações
- [x] Categorias
- [x] Metas financeiras
- [x] Perfil
- [x] Navegação mobile
- [x] PWA
- [ ] Deploy em produção
- [x] Melhorias nos relatórios
- [x] Testes automatizados (Vitest) e CI no GitHub Actions
- [ ] Melhorias de performance

## Objetivo do projeto

Além de ser uma aplicação de controle financeiro, o Mil também é um projeto de estudo e portfólio voltado para desenvolvimento **full-stack moderno**.

O projeto busca aplicar na prática conceitos como:

- Next.js
- TypeScript
- PostgreSQL
- Autenticação
- Controle de acesso
- RLS
- Server Components
- Client Components
- Organização por serviços
- Desenvolvimento responsivo
- PWA
- Git e GitHub
- Deploy em produção

## Autor

**Nicollas Diniz Fernandes**

Desenvolvedor Back-end / Full-stack

## Licença

Este projeto está em desenvolvimento e é utilizado como projeto de estudo e portfólio.


## Integridade e histórico

O MVP usa soft delete em transações e categorias. Registros cancelados/arquivados permanecem no banco para preservar o histórico e permitir uma futura área de auditoria e relatórios de cancelamentos. Os fluxos normais exibem somente registros ativos.
