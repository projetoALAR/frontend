import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone só para Docker/self-host. Na Vercel (VERCEL=1) quebra o build
  // no Next 16.3+ (ENOENT .next/next-server.js.nft.json).
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  // Pendente: erros de tipo em components/auth/auth-provider.tsx,
  // components/tasks/case-modal.tsx, lib/chat-api.ts e lib/processo-mapper.ts.
  // Ver auditoria (Passo 4) para a lista completa antes de remover esta flag.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/tasks',
        has: [{ type: 'query', key: 'caseId' }],
        destination: '/casos/:caseId',
        permanent: false,
      },
      { source: '/tasks', destination: '/casos', permanent: false },
      { source: '/clients', destination: '/clientes', permanent: false },
      { source: '/clients/:id', destination: '/clientes/:id', permanent: false },
      { source: '/calendar', destination: '/agenda', permanent: false },
      { source: '/analytics', destination: '/relatorios', permanent: false },
      { source: '/templates', destination: '/modelos', permanent: false },
      { source: '/team', destination: '/equipe', permanent: false },
      { source: '/settings', destination: '/configuracoes', permanent: false },
      { source: '/help', destination: '/ajuda', permanent: false },
      { source: '/messages', destination: '/mensagens', permanent: false },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Upload de source maps só se SENTRY_AUTH_TOKEN estiver definido no CI
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: false,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: false,
  },
})
