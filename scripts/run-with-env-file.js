/**
 * Roda um comando com variáveis de um arquivo .env específico.
 *
 * Uso: node scripts/run-with-env-file.js .env.staging -- next dev
 */
const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');

const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const sep = argv.indexOf('--');

if (sep < 1 || sep === argv.length - 1) {
  console.error(
    'Uso: node scripts/run-with-env-file.js <ficheiro.env> -- <comando> [args...]',
  );
  process.exit(1);
}

const envFile = argv[0];
const envPath = path.isAbsolute(envFile)
  ? envFile
  : path.join(root, envFile);

if (!fs.existsSync(envPath)) {
  console.error(`Arquivo não encontrado: ${envPath}`);
  console.error('Copie .env.staging.example → .env.staging e preencha.');
  process.exit(1);
}

function loadEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvFile(envPath);

if (envFile.includes('staging')) {
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT =
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'staging';
}

const cmd = argv.slice(sep + 1);
console.log(`[env] ${envFile} → ${cmd.join(' ')}\n`);

const result = spawnSync(cmd[0], cmd.slice(1), {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: root,
});

process.exit(result.status ?? 1);
