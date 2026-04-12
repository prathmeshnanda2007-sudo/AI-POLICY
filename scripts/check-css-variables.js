import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tailwindConfigPath = path.resolve(__dirname, '../tailwind.config.cjs');
const cssPath = path.resolve(__dirname, '../src/index.css');

function checkCssVariables() {
  if (!fs.existsSync(tailwindConfigPath) || !fs.existsSync(cssPath)) {
    console.error('❌ Required files missing for CSS variable check');
    return;
  }

  const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Find all var(--variable-name) in tailwind config
  const varRegex = /var\((--[^)]+)\)/g;
  const usedVars = new Set();
  let match;
  while ((match = varRegex.exec(tailwindConfig)) !== null) {
    usedVars.add(match[1]);
  }

  // Find all --variable-name: in CSS
  const defRegex = /(--[^:]+):/g;
  const definedVars = new Set();
  while ((match = defRegex.exec(cssContent)) !== null) {
    definedVars.add(match[1].trim());
  }

  const missingVars = [...usedVars].filter(v => !definedVars.has(v));

  if (missingVars.length > 0) {
    console.error('❌ Undefined CSS variables found in tailwind.config.cjs:');
    missingVars.forEach(v => console.error(`   ${v}`));
    console.error('\nAdd these variables to src/index.css');
    process.exit(1);
  } else {
    console.log('✅ All CSS variables in tailwind.config.cjs are defined');
  }
}

checkCssVariables();
