const fs = require('fs');
const path = require('path');

const en = require('./lib/translations/en.json');
const hi = require('./lib/translations/hi.json');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = [
  ...walk('./components'),
  ...walk('./app'),
  ...walk('./lib')
];

function getValueByPath(obj, pathArr) {
  let current = obj;
  for (const p of pathArr) {
    if (current && typeof current === 'object' && p in current) {
      current = current[p];
    } else {
      return null;
    }
  }
  return current;
}

const missingEn = new Set();
const missingHi = new Set();
const foundKeys = new Set();
const legacyKeys = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find t("some.key") or t('some.key') or t(`some.key`)
  // and legacy t("English", "Hindi")
  // We will use a regex to match the first argument.
  
  // Match t("...") or t('...')
  const regex = /t\((['"`])((?:(?!\1)[^\\]|\\.)*)\1(?:,\s*(['"`]((?:(?!\3)[^\\]|\\.)*)\3|\{[^}]*\}))?/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const firstArg = match[2];
    const secondArgFull = match[3];
    const secondArgString = match[4]; // if the second arg was a string
    
    // If second arg is a string, it's likely a legacy call
    if (secondArgFull && secondArgString !== undefined) {
      // It's legacy t("English", "Hindi")
      // Do nothing for this audit script unless the user wants to remove legacy calls
      legacyKeys.add(`File: ${file} | Key: ${firstArg}`);
      continue;
    }

    // It's a dot notation key like "navigation.items.help"
    // Wait, sometimes the first arg is not a key.
    // E.g., t("Baba Shyam Khazana", "बाबा श्याम खजाना")
    // Wait! The regex above captured secondArgString if it was a string.
    // If it's t("screens.some.key", { param: 1 }), secondArgString is undefined.
    
    // Some texts are used with dot notation.
    if (firstArg.includes('.') || firstArg.match(/^[a-z]+$/i)) {
      foundKeys.add(firstArg);
      
      const parts = firstArg.split('.');
      
      const enVal = getValueByPath(en, parts);
      if (typeof enVal !== 'string') {
        missingEn.add(`${firstArg} (in ${file})`);
      }
      
      const hiVal = getValueByPath(hi, parts);
      if (typeof hiVal !== 'string') {
        missingHi.add(`${firstArg} (in ${file})`);
      }
    }
  }
});

console.log("=== MISSING IN EN.JSON ===");
missingEn.forEach(k => console.log(k));

console.log("\n=== MISSING IN HI.JSON ===");
missingHi.forEach(k => console.log(k));

console.log(`\nFound ${foundKeys.size} dot-notation keys.`);
console.log(`Found ${legacyKeys.size} legacy calls.`);
