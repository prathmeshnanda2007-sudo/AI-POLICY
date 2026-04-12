import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = path.resolve(__dirname, '../src/index.css');
const srcPattern = path.resolve(__dirname, '../src/**/*.{tsx,ts,jsx,js}');

async function checkCssClasses() {
  if (!fs.existsSync(cssPath)) {
    console.error('❌ src/index.css missing');
    return;
  }

  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Find custom classes defined in CSS (e.g., .glass-card, .grid-pattern)
  const classRegex = /\.([a-zA-Z0-9_-]+)\s*\{/g;
  const definedClasses = new Set();
  let match;
  while ((match = classRegex.exec(cssContent)) !== null) {
    if (!['root', 'layer', 'base', 'components', 'utilities', 'apply', 'media', 'keyframes'].includes(match[1])) {
       definedClasses.add(match[1]);
    }
  }

  const files = await glob(srcPattern);
  const usedClasses = new Set();

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Simple regex to find class names in className="xxx" or className={`xxx`}
    // This is a naive implementation but catches most custom classes
    definedClasses.forEach(cls => {
      if (content.includes(cls)) {
        usedClasses.add(cls);
      }
    });
  });

  const unusedClasses = [...definedClasses].filter(cls => !usedClasses.has(cls));

  if (unusedClasses.length > 0) {
    console.warn('⚠️  Unused custom CSS classes found in src/index.css:');
    unusedClasses.forEach(cls => console.warn(`   .${cls}`));
    // We don't exit with 1 for unused classes, just a warning
  } else {
    console.log('✅ All custom CSS classes in src/index.css are in use');
  }
}

checkCssClasses();
