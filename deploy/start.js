const { spawn } = require('node:child_process');
const { join } = require('node:path');

const isLocal = process.argv.includes('--local');
const apiPort = process.env.API_PORT || '3002';
const frontendPort = process.env.FRONTEND_PORT || '3000';
const repositoryRoot = join(__dirname, '..');
const services = isLocal
  ? [
      {
        name: 'backend',
        command: process.execPath,
        args: ['node_modules/@nestjs/cli/bin/nest.js', 'start', '--watch'],
        cwd: join(repositoryRoot, 'backend'),
        env: { PORT: apiPort },
      },
      {
        name: 'frontend',
        command: process.execPath,
        args: ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', frontendPort],
        cwd: join(repositoryRoot, 'frontend'),
        env: { NEXT_PUBLIC_API_URL: `http://localhost:${apiPort}` },
      },
    ]
  : [
      {
        name: 'backend',
        command: 'node',
        args: ['dist/src/main.js'],
        cwd: '/app/backend',
        env: { PORT: '3001', TRUST_PROXY: '1' },
      },
      {
        name: 'frontend',
        command: 'node',
        args: ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3000'],
        cwd: '/app/frontend',
        env: {},
      },
      {
        name: 'nginx',
        command: 'nginx',
        args: ['-g', 'daemon off;'],
        cwd: '/app',
        env: {},
      },
    ];

console.log(
  isLocal
    ? `Starting local frontend on http://localhost:${frontendPort} and API on http://localhost:${apiPort}`
    : 'Starting frontend, API, and Nginx',
);

const children = services.map(({ name, command, args, cwd, env }) => {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    console.error(`Failed to start ${name}:`, error);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(`${name} exited unexpectedly (code=${code}, signal=${signal})`);
      stop(code || 1);
    }
  });

  return child;
});

let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(exitCode), 5000).unref();
}

process.on('SIGTERM', () => stop(0));
process.on('SIGINT', () => stop(0));
