const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../lib/translations/en.json');
const hiPath = path.join(__dirname, '../lib/translations/hi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// Helper to convert English string to a camelCase slug
function toCamelCase(str) {
  // Clean special characters and keep alphanumeric and spaces
  let cleaned = str.replace(/[^\w\s-]/g, '').trim();
  // Limit length to avoid extremely long keys
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50).trim();
  }
  const words = cleaned.split(/[\s_-]+/);
  if (words.length === 0 || !words[0]) return 'text';
  
  let result = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (word) {
      result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }
  return result || 'text';
}

// Helper to set nested value in object
function setNestedValue(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

// Helper to get nested value in object
function getNestedValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

// Generate namespace base from file path
function getNamespaceBase(filePath) {
  const relPath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
  
  const baseName = path.basename(filePath, path.extname(filePath));
  const camelBaseName = toCamelCase(baseName);
  
  if (relPath.includes('components/screens/auth/')) {
    return `auth.${camelBaseName}`;
  } else if (relPath.includes('components/screens/services/')) {
    return `screens.services.${camelBaseName}`;
  } else if (relPath.includes('components/screens/')) {
    return `screens.${camelBaseName}`;
  } else if (relPath.includes('components/ui/')) {
    return `ui.${camelBaseName}`;
  } else if (relPath.includes('components/features/')) {
    return `features.${camelBaseName}`;
  } else if (relPath.includes('components/')) {
    return `components.${camelBaseName}`;
  } else {
    return `app.${camelBaseName}`;
  }
}

const targetDirs = [
  path.join(__dirname, '../components'),
  path.join(__dirname, '../app')
];

// Safer regex: \bt( ensures we don't match setTranscript(, and [^\r\n] prevents matching across multiple lines.
const tRegex = /\bt\(\s*(["'])((?:\\.|(?!\1)[^\r\n])*?)\1\s*,\s*(["'])((?:\\.|(?!\3)[^\r\n])*?)\3\s*\)/g;

let totalMigrated = 0;

function scanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let match;
  let modified = false;
  
  const base = getNamespaceBase(filePath);
  let newContent = content;
  
  // Find all matches
  const matches = [];
  tRegex.lastIndex = 0;
  while ((match = tRegex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      quote1: match[1],
      englishText: match[2].replace(/\\(.)/g, '$1'), // unescape
      quote2: match[3],
      hindiText: match[4].replace(/\\(.)/g, '$1') // unescape
    });
  }
  
  for (const m of matches) {
    const slug = toCamelCase(m.englishText);
    let keyPath = `${base}.${slug}`;
    
    // Check for collisions (different English text mapping to same key)
    let collisionCounter = 2;
    let existingEn = getNestedValue(en, keyPath);
    while (existingEn !== undefined && existingEn !== m.englishText) {
      keyPath = `${base}.${slug}_${collisionCounter}`;
      existingEn = getNestedValue(en, keyPath);
      collisionCounter++;
    }
    
    // Save to translation catalogs
    setNestedValue(en, keyPath, m.englishText);
    setNestedValue(hi, keyPath, m.hindiText);
    
    // Replace the exact matching string with t("keyPath")
    // Escape regex characters in fullMatch
    const escapedMatch = m.fullMatch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    newContent = newContent.replace(new RegExp(escapedMatch, 'g'), `t("${keyPath}")`);
    modified = true;
    totalMigrated++;
    console.log(`Migrated in [${path.basename(filePath)}]: "${m.englishText}" -> "${keyPath}"`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      scanFile(fullPath);
    }
  }
}

// Run walk on directories
for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    walk(dir);
  }
}

// Write translations back
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');

console.log(`\nSuccess! Total migrated strings: ${totalMigrated}`);
