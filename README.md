# ROCAM Metroville — Painel Policial

Sistema de gestão da ROCAM (Rondas Ostensivas com Apoio de Motocicletas) do
servidor Metroville RP. Login obrigatório via Discord, com cargos
sincronizados automaticamente a partir dos cargos do usuário no servidor
Discord da organização.

## Stack

- **Frontend + Backend**: Next.js 16 (App Router, TypeScript) — as API Routes
  em `src/app/api/*` funcionam como a camada de middleware entre o front e o
  banco de dados.
- **Autenticação**: NextAuth.js (Auth.js) v5, provider Discord (OAuth2) +
  sincronização de cargo via Discord Bot API.
- **Banco de dados**: Neon (Postgres serverless), acessado via Prisma ORM 7
  com o driver adapter `@prisma/adapter-neon`.

O mock original (HTML estático, sem backend real) foi preservado em
[`legacy/index.html`](legacy/index.html) para referência histórica.

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Banco de dados (Neon)

1. Crie um projeto em [neon.tech](https://neon.tech) (ou uma branch de
   desenvolvimento em um projeto existente).
2. No painel da Neon, copie a **pooled connection string** e a **direct
   (unpooled) connection string**.
3. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (pooled) e
   `DIRECT_URL` (direct).
4. Rode a migração inicial e o seed de dados padrão (fardamentos, perguntas
   de PTR, membros de Staff iniciais):

   ```bash
   npm run db:migrate:deploy
   npm run db:seed
   ```

### 3. Discord (login + sincronização de cargos)

1. Crie uma aplicação em
   [discord.com/developers/applications](https://discord.com/developers/applications).
2. Em **OAuth2 → General**, copie o **Client ID** e **Client Secret** para
   `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` no `.env`.
3. Em **OAuth2 → Redirects**, adicione:
   - `http://localhost:3000/api/auth/callback/discord` (desenvolvimento)
   - a URL de produção equivalente, quando for publicar o site.
4. Na aba **Bot**, crie um bot, copie o **Token** para `DISCORD_BOT_TOKEN`, e
   habilite **"Server Members Intent"** em *Privileged Gateway Intents*.
5. Convide o bot para o servidor da ROCAM Metroville (permissão mínima:
   `View Channels`, para conseguir ler os membros via API).
6. Habilite o **Modo Desenvolvedor** no Discord (Configurações de Usuário →
   Avançado) para conseguir clicar com o botão direito e copiar IDs:
   - Clique com o botão direito no ícone do servidor → **Copiar ID do
     Servidor** → cole em `DISCORD_GUILD_ID`.
   - Clique com o botão direito em cada cargo (Configurações do Servidor →
     Cargos) → **Copiar ID do Cargo**.
7. Preencha `ROLE_ID_MAP` no `.env` mapeando cada ID de cargo do Discord para
   o cargo correspondente no sistema (`STAFF`, `GESTOR`, `SUBGESTOR`,
   `SUPERVISOR`, `ELITE`, `GRADUADOS` ou `PROBATORIOS`). Membros sem nenhum
   cargo mapeado, ou que não pertençam ao servidor, têm o acesso negado no
   login.
8. Gere `AUTH_SECRET` com `openssl rand -base64 32` e preencha no `.env`.

### 4. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` — você será redirecionado para `/login`.

## Scripts úteis

| Comando                     | Descrição                                              |
| ---------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Servidor de desenvolvimento                             |
| `npm run build` / `start`    | Build e start de produção                               |
| `npm run db:migrate:dev`     | Cria/aplica migrações Prisma em ambiente de dev          |
| `npm run db:migrate:deploy`  | Aplica migrações já geradas (produção/CI)                |
| `npm run db:seed`            | Popula fardamentos, perguntas de PTR e Staff padrão       |
| `npm run db:studio`          | Abre o Prisma Studio (explorar/editar dados manualmente) |

## Estrutura do projeto

```
prisma/schema.prisma      Modelo de dados (Officer, Arrest, EvalRequest, ...)
prisma/seed.ts            Seed de dados padrão
prisma.config.ts          Config do Prisma CLI (usa DIRECT_URL para migrações)
src/auth.ts               Configuração do NextAuth (Discord + sync de cargo)
src/proxy.ts              Proteção de rotas (equivalente ao middleware no Next 16)
src/lib/                  db.ts, permissions.ts, discord.ts, api-auth.ts, ...
src/app/login/            Tela de login
src/app/dashboard/        Páginas do painel (uma pasta por aba)
src/app/api/              Rotas de API (camada de middleware front↔back)
src/components/           Componentes React por área/feature
legacy/index.html         Mock original (HTML estático), mantido como referência
```

## Cargos e permissões

Hierarquia (do maior para o menor nível de acesso): `Staff > Gestor >
Subgestor > Supervisor > Elite > Graduados > Probatórios`. O cargo é
determinado pelos cargos do usuário no Discord (via `ROLE_ID_MAP`) e é a
única fonte de verdade para autorização — cada rota de API em
`src/app/api/*` reverifica o cargo do usuário autenticado no servidor,
nunca confiando em nenhum valor enviado pelo cliente. O seletor "Visualizar
como" no painel (exclusivo de Staff) é apenas uma conveniência visual e não
altera as permissões reais.
