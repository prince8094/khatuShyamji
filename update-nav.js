const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') && !file.includes('app-shell.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./components/screens');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We only modify files that have navigation calls to "services", "home", "welcome", "login" inside an onClick
  const navigatePatterns = [
    /onClick=\{\(\) => navigate\("services"\)\}/g,
    /onClick=\{\(\) => navigate\("home"\)\}/g,
    /onClick=\{\(\) => navigate\("welcome"\)\}/g,
    /onClick=\{\(\) => navigate\("login"\)\}/g,
  ];

  let matchesAny = false;
  navigatePatterns.forEach(pattern => {
    if (pattern.test(content)) matchesAny = true;
  });

  if (matchesAny) {
    // Add import if not present
    if (!content.includes('useNavigation')) {
      const importRegex = /^import .* from .*$/gm;
      let lastMatch;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
      }
      
      if (lastMatch) {
        const importIndex = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, importIndex) + '\nimport { useNavigation } from "@/lib/contexts/NavigationContext"' + content.slice(importIndex);
        changed = true;
      }
    }

    // Insert const { goBack } = useNavigation() inside the component
    const funcRegex = /export function [A-Za-z0-9_]+\([^)]*\)\s*\{/;
    const funcMatch = funcRegex.exec(content);
    if (funcMatch && !content.includes('const { goBack } = useNavigation()')) {
      const insertIndex = funcMatch.index + funcMatch[0].length;
      content = content.slice(0, insertIndex) + '\n  const { goBack } = useNavigation();' + content.slice(insertIndex);
      changed = true;
    }

    // Replace common patterns
    navigatePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, 'onClick={goBack}');
        changed = true;
      }
    });
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
