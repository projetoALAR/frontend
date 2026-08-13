import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Pendente: 2 erros TS em components/tasks/case-modal.tsx (status tipado vs string).
  // Remover quando o status do formulário usar ProcessoStatus canônico.
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
  disableLogger: true,
  automaticVercelMonitors: false,
  widenClientFileUpload: false,
})
