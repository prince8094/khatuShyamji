const fs = require('fs');

const files = [
  './components/screens/services/hotel-booking.tsx',
  './components/screens/services/restaurant.tsx',
  './components/screens/services/prashad.tsx',
  './components/screens/services/transport.tsx',
  './components/screens/services/shyam-bus.tsx',
  './components/screens/services/donation.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const stateRegex = /const \[selected([A-Za-z0-9_]+), (setSelected[A-Za-z0-9_]+)\] = useState<[^>]+>\(null\)/;
  let match = stateRegex.exec(content);

  // also try matching without generic type: useState(null)
  if (!match) {
    const stateRegex2 = /const \[selected([A-Za-z0-9_]+), (setSelected[A-Za-z0-9_]+)\] = useState\(null\)/;
    match = stateRegex2.exec(content);
  }

  if (match) {
    const keyName = match[1].toLowerCase(); 
    const setterName = match[2];

    if (!content.includes('useHistoryState')) {
      const importIndex = content.indexOf('import { useNavigation }');
      if (importIndex !== -1) {
        content = content.slice(0, importIndex) + 'import { useHistoryState } from "@/lib/hooks/useHistoryState"\n' + content.slice(importIndex);
      } else {
        const firstImport = content.indexOf('import ');
        content = content.slice(0, firstImport) + 'import { useHistoryState } from "@/lib/hooks/useHistoryState"\n' + content.slice(firstImport);
      }
    }

    content = content.replace(match[0], `const [selected${match[1]}, ${setterName}] = useHistoryState<any>("${keyName}", null)`);

    const backBtnRegex = new RegExp(`onClick=\\{\\(\\) => ${setterName}\\(null\\)\\}`);
    while (backBtnRegex.test(content)) {
      content = content.replace(backBtnRegex, `onClick={goBack}`);
    }

    const setTimeoutRegex = new RegExp(`${setterName}\\(null\\)`);
    while (setTimeoutRegex.test(content)) {
      content = content.replace(setTimeoutRegex, `goBack()`);
    }
    
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
