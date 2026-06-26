/**
 * fix_hi_padyatra.js
 * Replaces corrupted Mojibake padyatra section in hi.json with proper Devanagari UTF-8 content.
 * Also runs the migrate.js logic to convert remaining legacy t("English", "Hindi") calls.
 */

const fs = require('fs');
const path = require('path');

const hiPath = path.join(__dirname, '../lib/translations/hi.json');
const enPath = path.join(__dirname, '../lib/translations/en.json');

const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// ── 1. Replace corrupted padyatra section in hi.json ──────────────────────────

hi.padyatra = {
  stages: [
    {
      id: 1,
      name: "रींगस – आरंभ बिंदु",
      distanceLeft: 17,
      desc: "भगवान खाटू श्याम की पवित्र भूमि की ओर आपकी आध्यात्मिक पदयात्रा यहाँ से आरंभ होती है। भजन और जयघोष से वातावरण भक्तिमय हो जाता है।",
      bgImage: "linear-gradient(to bottom, #d97706, #78350f)",
      activity: "जय श्री श्याम का जाप करते हुए अपनी यात्रा शुरू करें।"
    },
    {
      id: 2,
      name: "राजस्थानी ग्राम पथ",
      distanceLeft: 14,
      desc: "परंपरागत ग्रामीण पगडंडियों से गुजरें जहाँ भक्तजन जल और प्रसाद वितरित करते हैं।",
      bgImage: "linear-gradient(to bottom, #b45309, #451a03)",
      activity: "किसी भक्त से प्रसाद ग्रहण करें और यात्रा जारी रखें।"
    },
    {
      id: 3,
      name: "श्याम कुंड और बाजार",
      distanceLeft: 8,
      desc: "पवित्र श्याम कुंड पर पहुँचें। मंदिर का बाजार ध्वज, फूल और नारियल से सजा हुआ है।",
      bgImage: "linear-gradient(to bottom, #854d0e, #3f2c00)",
      activity: "श्याम कुंड पर विधिवत स्नान करें और एक निशान (पवित्र ध्वज) खरीदें।"
    },
    {
      id: 4,
      name: "मंदिर तोरण द्वार",
      distanceLeft: 3,
      desc: "भव्य स्वर्णिम प्रवेश द्वार। बाबा के दर्शन की उत्सुकता में यहाँ भीड़ बढ़ जाती है।",
      bgImage: "linear-gradient(to bottom, #78350f, #270e00)",
      activity: "तोरण द्वार पर नमन करें और निशान ऊँचा उठाकर चलें।"
    },
    {
      id: 5,
      name: "मंदिर प्रांगण",
      distanceLeft: 0.5,
      desc: "संगमरमर से बने आंतरिक प्रांगण में प्रवेश करें। घंटियों और भावपूर्ण जयकारों से माहौल दिव्य हो जाता है।",
      bgImage: "linear-gradient(to bottom, #451a03, #1c0a00)",
      activity: "मंदिर की कतार में लगें और द्वार खुलने की प्रतीक्षा करें।"
    },
    {
      id: 6,
      name: "श्री श्याम दरबार (मुख्य मंदिर)",
      distanceLeft: 0,
      desc: "फूलों से सजे दिव्य रूप, भगवान खाटू श्याम जी के साक्षात दर्शन। यह क्षण आपकी सम्पूर्ण यात्रा का फल है।",
      bgImage: "linear-gradient(to bottom, #78350f, #0d0907)",
      activity: "अपनी प्रार्थनाएँ अर्पित करें और दिव्य आशीर्वाद प्राप्त करें।"
    }
  ],
  devotionalItems: [
    {
      id: "aarti",
      title: "श्री श्याम आरती",
      type: "aarti",
      lyrics: "ॐ जय श्री श्याम हरे, बाबा जय श्री श्याम हरे...\nभक्त जनों के संकट, क्षण में दूर करे...\nॐ जय श्री श्याम हरे...\n\nश्याम सुंदर मुख अरविंद, छवि अति प्यारी लगे...\nकमल नयन विशाला, शोभा मन भावे...\nॐ जय श्री श्याम हरे..."
    },
    {
      id: "chalisa",
      title: "श्री श्याम चालीसा",
      type: "chalisa",
      lyrics: "श्री गुरु चरण प्रताप से, बुद्धि कान्ति बल होय...\nश्याम देव के यश करन, कहूँ हर्षित होय...\nजय जय खाटू श्याम देव, जय जय खाटू धाम...\nद्वार तिहारे जो आवे, सिद्ध होय सब काम..."
    },
    {
      id: "bhajan",
      title: "हारे का सहारा बाबा श्याम हमारा",
      type: "bhajan",
      lyrics: "हारे का सहारा बाबा श्याम हमारा...\nजब दुनिया ठुकराये मुझे, तब तूने ही तो संभाला...\nमेरी नैया बीच भँवर में, खाटू वाले तूने निकाला...\nहारे का सहारा बाबा श्याम हमारा..."
    }
  ]
};

fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
console.log('✅ hi.json padyatra section fixed with proper Devanagari UTF-8 text.');

// ── 2. Migrate remaining legacy t("English", "Hindi") calls in khatu-path.tsx ──

function toCamelCase(str) {
  let cleaned = str.replace(/[^\w\s-]/g, '').trim();
  if (cleaned.length > 50) cleaned = cleaned.substring(0, 50).trim();
  const words = cleaned.split(/[\s_-]+/);
  if (words.length === 0 || !words[0]) return 'text';
  let result = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (word) result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  return result || 'text';
}

function setNestedValue(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

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

// Re-read en/hi after modifying hi
const enFresh = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hiFresh = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

const khatuPathFile = path.join(__dirname, '../components/screens/khatu-path.tsx');
let content = fs.readFileSync(khatuPathFile, 'utf8');

// Match t("English", "Hindi") pattern but not inside tObject or other function calls
const tRegex = /\bt\(\s*(["`'])((?:\\.|(?!\1)[^\r\n])*?)\1\s*,\s*(["`'])((?:\\.|(?!\3)[^\r\n])*?)\3\s*\)/g;

const base = 'screens.khatuPath';
const matches = [];
let match;
tRegex.lastIndex = 0;
while ((match = tRegex.exec(content)) !== null) {
  // Skip template literal matches like t(`Stage ${...}`, ...)
  if (match[2].includes('${')) continue;
  matches.push({
    fullMatch: match[0],
    englishText: match[2].replace(/\\(.)/g, '$1'),
    hindiText: match[4].replace(/\\(.)/g, '$1')
  });
}

console.log(`\nFound ${matches.length} legacy t() calls to migrate in khatu-path.tsx:`);

let newContent = content;
for (const m of matches) {
  const slug = toCamelCase(m.englishText);
  let keyPath = `${base}.${slug}`;
  
  // Handle collisions
  let collisionCounter = 2;
  let existingEn = getNestedValue(enFresh, keyPath);
  while (existingEn !== undefined && existingEn !== m.englishText) {
    keyPath = `${base}.${slug}_${collisionCounter}`;
    existingEn = getNestedValue(enFresh, keyPath);
    collisionCounter++;
  }
  
  setNestedValue(enFresh, keyPath, m.englishText);
  setNestedValue(hiFresh, keyPath, m.hindiText);
  
  // Replace ONLY the exact match string (escape special regex chars)
  const escapedMatch = m.fullMatch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  newContent = newContent.replace(new RegExp(escapedMatch, 'g'), `t("${keyPath}")`);
  console.log(`  ✓ "${m.englishText.substring(0, 40)}" → "${keyPath}"`);
}

fs.writeFileSync(khatuPathFile, newContent, 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enFresh, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hiFresh, null, 2), 'utf8');

console.log(`\n✅ Done! Migrated ${matches.length} strings in khatu-path.tsx.`);
console.log('✅ Translation catalogs updated.');
