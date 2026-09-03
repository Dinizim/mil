# Mil

> Controle financeiro pessoal simples, visual e pensado para o dia a dia.

O **Mil** é uma aplicação web de controle financeiro pessoal desenvolvida para facilitar o acompanhamento de receitas, despesas, saldo disponível e metas financeiras.

O projeto foi construído com foco em uma experiência **mobile-first**, interface moderna e arquitetura preparada para evolução.

---

## Preview

<!-- Adicione uma screenshot do projeto aqui futuramente -->

![Mil Preview](./public/preview.png)

---

## Funcionalidades

- 🔐 Cadastro e login de usuários
- 💰 Controle de receitas e despesas
- 📊 Dashboard financeiro
- 💵 Visualização de saldo total e saldo disponível
- 🎯 Criação e acompanhamento de metas financeiras
- 💸 Contribuições para metas
- 🏷️ Gerenciamento de categorias
- ✏️ Edição e exclusão de transações
- 📱 Interface responsiva e mobile-first
- 📲 PWA — possibilidade de instalação como aplicativo
- 🌙 Interface dark moderna
- 🔒 Row Level Security (RLS) no banco de dados

---

## Tecnologias

### Front-end

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Geist

### Back-end / Dados

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

### Infraestrutura

- Vercel
- Git
- GitHub
- Progressive Web App (PWA)

---

## Arquitetura

A aplicação utiliza o **Next.js App Router**, separando responsabilidades entre páginas, componentes, serviços e integração com o Supabase.

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
