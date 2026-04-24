/**
 * Dev server launcher.
 *
 * Problem: .next is a Windows junction pointing to %TEMP%\cruxly-next so that
 * OneDrive can't lock the build artifacts (EPERM). But Node.js resolves
 * junctions to their real path, so server bundles in the temp dir can't find
 * node_modules via normal directory traversal.
 *
 * Fix: set NODE_PATH to the project's node_modules before spawning Next.js.
 * Node.js checks NODE_PATH as a fallback in its module resolution algorithm,
 * so requires from the temp-located bundles will still find react, etc.
 */
const path = require('path');
const { spawn } = require('child_process');

const env = {
  ...process.env,
  NODE_PATH: path.resolve(__dirname, '..', 'node_modules'),
};

const child = spawn('npx', ['next', 'dev'], {
  env,
  stdio: 'inherit',
  shell: true,  // required on Windows to resolve .cmd shims
});

child.on('exit', (code) => process.exit(code ?? 0));
