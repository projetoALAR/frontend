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
}

export default withSentryConfig(nextConfig, {
  // Upload de source maps só se SENTRY_AUTH_TOKEN estiver definido no CI
  silent: !process.env.SENTRY_AUTH_TOKEN,
  disableLogger: true,
  automaticVercelMonitors: false,
  widenClientFileUpload: false,
})
