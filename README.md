# ◈ CONFLICT WATCH — Geopolitical Intelligence SaaS

> Plataforma SaaS de Monitoramento Geopolítico em Tempo Real (Irã × EUA)  
> Com assinaturas, alertas premium, IA integrada e infraestrutura escalável.

---

## 🏗️ Arquitetura

```
conflictwatch/
├── backend/                    # Node.js + Express API
│   ├── routes/
│   │   ├── auth.js             # Login, registro, Google OAuth
│   │   ├── analysis.js         # Análise IA (com rate limit por plano)
│   │   ├── events.js           # Feed de eventos do Supabase
│   │   ├── tension.js          # Histórico índice de tensão
│   │   ├── alerts.js           # Sistema de alertas PRO
│   │   ├── stripe.js           # Checkout, portal, webhook
│   │   └── export.js           # Exportação CSV (PRO)
│   ├── middleware/
│   │   ├── auth.js             # JWT + Supabase session validation
│   │   ├── planGate.js         # Bloqueio por plano (free/pro)
│   │   ├── rateLimit.js        # Rate limiting por IP e usuário
│   │   └── logger.js           # Logs estruturados (pino)
│   ├── services/
│   │   ├── supabase.js         # Client Supabase (service role)
│   │   ├── openai.js           # Claude/OpenAI para classificação
│   │   ├── stripe.js           # Stripe SDK wrapper
│   │   ├── news.js             # NewsAPI / GNews fetcher
│   │   └── telegram.js         # Webhook alertas Telegram (opcional)
│   ├── jobs/
│   │   └── newsCron.js         # Cron job: busca + classifica + salva
│   ├── utils/
│   │   ├── tensionCalc.js      # Algoritmo índice de tensão
│   │   ├── sanitize.js         # Sanitização de inputs
│   │   └── response.js         # Helpers de resposta padronizada
│   ├── server.js               # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── index.html          # Dashboard principal (adaptado)
│   │   ├── login.html          # Página de login/registro
│   │   ├── pricing.html        # Página de planos
│   │   └── assets/
│   │       ├── app.js          # Lógica frontend principal
│   │       ├── auth.js         # Auth Supabase client
│   │       └── style.css       # Estilos extraídos
│   └── auth/
│       └── callback.html       # OAuth callback
├── supabase/
│   ├── schema.sql              # Schema completo do banco
│   └── rls_policies.sql        # Row Level Security policies
├── docs/
│   ├── DEPLOY.md               # Guia de deploy (Vercel + Render)
│   ├── STRIPE_SETUP.md         # Configuração Stripe passo a passo
│   └── ARCHITECTURE.md         # Diagrama de arquitetura detalhado
├── .env.example                # Template de variáveis de ambiente
├── vercel.json                 # Configuração Vercel
└── README.md                   # Este arquivo
```

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Frontend | HTML/CSS/JS vanilla | Leve, sem build step, CDN-friendly |
| Auth | Supabase Auth | OAuth, JWT, magic link built-in |
| Backend | Node.js + Express | Familiar, ecossistema rico |
| Banco de dados | Supabase (PostgreSQL) | Realtime, RLS, REST automático |
| Pagamentos | Stripe | Padrão da indústria, webhooks robustos |
| IA | Anthropic Claude API | Classificação e análise geopolítica |
| Notícias | NewsAPI / GNews | Feeds de notícias em tempo real |
| Deploy | Vercel (frontend) + Render (backend) | Gratuito para começar, escalável |
| Logs | Pino | Estruturado, performance |
| Rate Limit | express-rate-limit + Redis | Proteção por IP e usuário |

---

## 💰 Planos de Monetização

| Feature | FREE | PRO ($29/mês) |
|---------|------|---------------|
| Análises IA por dia | 5 | Ilimitadas |
| Alertas críticos | ❌ | ✅ Tempo real |
| Histórico tensão | 24h | 90 dias |
| Atualização | A cada 5min | Instantânea (Realtime) |
| Dashboard avançado | ❌ | ✅ |
| Exportação CSV | ❌ | ✅ |
| Câmeras ao vivo | 1 | 6+ |
| Suporte | Community | Priority |

---

## ⚡ Quick Start

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-user/conflictwatch
cd conflictwatch/backend
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas chaves (veja docs/DEPLOY.md)
```

### 3. Configure Supabase

```bash
# No Supabase SQL Editor, execute:
# supabase/schema.sql
# supabase/rls_policies.sql
```

### 4. Configure Stripe

```bash
# Siga docs/STRIPE_SETUP.md
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### 5. Rode em desenvolvimento

```bash
cd backend
npm run dev

# Em outro terminal:
cd frontend
npx serve public -p 3000
```

---

## 🔒 Segurança

- ✅ Todas as API keys exclusivamente no backend
- ✅ JWT validado em cada request
- ✅ RLS no Supabase (usuário só acessa seus dados)
- ✅ Rate limiting por IP (100 req/15min) e por usuário
- ✅ Sanitização de todos os inputs
- ✅ Headers de segurança (Helmet.js)
- ✅ CORS configurado por domínio
- ✅ Webhook Stripe com validação de assinatura
- ✅ Logs estruturados sem dados sensíveis

---

## 📊 Índice de Tensão — Algoritmo

```
Evento militar (ataque, míssil)     → +8 pontos
Enriquecimento nuclear              → +6 pontos
Novas sanções econômicas            → +5 pontos
Ataque cibernético                  → +4 pontos
Ruptura diplomática                 → +3 pontos
Movimentação de tropas              → +4 pontos
Declaração hostil                   → +2 pontos
Negociação/acordo                   → -3 pontos
```

Classificado por IA (Claude) com score 0-10 por evento.

---

## 🔔 Sistema de Alertas

Palavras-chave que disparam alerta vermelho:
`strike`, `missile`, `retaliation`, `enrichment above 80%`, `attack`, `nuclear`, `warship`, `blockade`

Ações ao detectar:
1. Salva alerta no Supabase
2. Notifica usuários PRO via Supabase Realtime
3. Envia webhook Telegram (se configurado)
4. Destaca evento no feed com badge CRÍTICO

---

## 📁 Variáveis de Ambiente

Veja `.env.example` para lista completa.

---

## 🌐 Deploy

Veja `docs/DEPLOY.md` para guia completo de deploy em produção.

---

## 📄 Licença

MIT — use livremente para fins comerciais.
