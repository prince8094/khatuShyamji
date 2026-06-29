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

  // Only target files that have goBack but don't define it
  if (content.includes('goBack') && !content.includes('const { goBack } = useNavigation()')) {
    
    // Make sure useNavigation is imported
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
      }
    }

    // Now inject the const { goBack } = useNavigation() hook.
    // The safest way is to find the line starting with "export function"
    // and then find the first opening brace "{" that follows it which opens the function body.
    
    const exportIndex = content.indexOf('export function ');
    if (exportIndex !== -1) {
      // Find the first { after the component name and props that opens the body
      // We look for ") {" or ") {" or we can just find the first "export function" 
      // then find the corresponding open brace that ends the function declaration.
      
      let braceIndex = -1;
      let depth = 0;
      let inDecl = false;
      
      for (let i = exportIndex; i < content.length; i++) {
        if (content[i] === '(') {
          inDecl = true;
          depth++;
        } else if (content[i] === ')') {
          depth--;
        } else if (content[i] === '{' && depth === 0 && inDecl) {
          braceIndex = i;
          break;
        }
      }

      if (braceIndex !== -1) {
        const insertPos = braceIndex + 1;
        content = content.slice(0, insertPos) + '\n  const { goBack } = useNavigation();' + content.slice(insertPos);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed missing goBack definition in ' + file);
  }
});
