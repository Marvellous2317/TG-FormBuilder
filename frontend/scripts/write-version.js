import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const distDir = path.join(frontendRoot, 'dist');
const packageJsonPath = path.join(frontendRoot, 'package.json');
const versionPath = path.join(distDir, 'version.json');

const getGitCommit = () => {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: frontendRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
};

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const builtAt = new Date().toISOString();
const commit = globalThis.process?.env?.APP_VERSION || getGitCommit();

const versionInfo = {
  version: commit || builtAt,
  packageVersion: packageJson.version,
  builtAt,
  commit,
};

mkdirSync(distDir, { recursive: true });
writeFileSync(versionPath, `${JSON.stringify(versionInfo, null, 2)}\n`);

console.log(`Wrote ${path.relative(frontendRoot, versionPath)}`);
