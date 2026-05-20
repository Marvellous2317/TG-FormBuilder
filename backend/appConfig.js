import fs from 'fs';
import os from 'os';
import path from 'path';

async function loadConfig() {
  const hostname = os.hostname();
  let configPath;


    configPath = path.resolve('./appConfig.json');


  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to load config from ${configPath}:`, error.message);
    process.exit(1);
  }
}

const config = await loadConfig();
export default config;
