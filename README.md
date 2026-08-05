# Alar Frontend

Interface Next.js do workspace jurídico Alar.

## Setup

```bash
cp .env.example .env.local
npm install   # ou: corepack enable && pnpm install
npm run dev
```

Variáveis:

- `NEXT_PUBLIC_API_URL` — URL da API (padrão `http://localhost:3001`)
- `NEXT_PUBLIC_ALLOW_REGISTER` — deve espelhar `AUTH_ALLOW_PUBLIC_REGISTER` do backend

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` / `npm start` — produção
- `npm run lint` — ESLint

Veja o [README na raiz do backup](../README.md) para o setup completo com o backend.
