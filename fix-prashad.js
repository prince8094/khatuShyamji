const fs = require('fs');

const file = './components/screens/services/prashad.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useHistoryState')) {
  const importIndex = content.indexOf('import { useNavigation }');
  content = content.slice(0, importIndex) + 'import { useHistoryState } from "@/lib/hooks/useHistoryState"\n' + content.slice(importIndex);
}

content = content.replace(
  'const [checkout, setCheckout] = useState(false)',
  'const [checkout, setCheckout] = useHistoryState<boolean>("checkout", false)'
);

content = content.replace(
  'onClick={() => setCheckout(false)}',
  'onClick={goBack}'
);

content = content.replace(
  'setCheckout(false)',
  'goBack()'
);

fs.writeFileSync(file, content);
console.log('Fixed prashad.tsx');
