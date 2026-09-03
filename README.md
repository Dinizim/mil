# Mil

Controle financeiro pessoal simples, visual e moderno.

O **Mil** é uma aplicação web para controle financeiro pessoal, permitindo acompanhar receitas, despesas, saldo, categorias e metas financeiras em um único lugar.

O projeto foi desenvolvido com foco em uma experiência **mobile-first**, interface moderna e arquitetura preparada para evolução.

## Funcionalidades

- Cadastro e login de usuários
- Controle de receitas e despesas
- Dashboard financeiro
- Visualização do saldo total
- Visualização do saldo disponível e reservado
- Criação e acompanhamento de metas
- Contribuições para metas financeiras
- Gerenciamento de categorias
- Edição e exclusão de transações
- Perfil do usuário
- Interface responsiva
- Navegação mobile
- PWA
- Página offline
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
│   ├── category.services.ts
│   ├── dashboard.service.ts
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

### 5. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

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
- [ ] Melhorias nos relatórios
- [ ] Testes automatizados
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
