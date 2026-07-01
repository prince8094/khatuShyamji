const fs = require('fs');
let text = fs.readFileSync('components/screens/services/prashad.tsx', 'utf8');

text = text.replace(
  'import type { ScreenKey } from "@/lib/data"',
  'import { useNavigation } from "@/lib/contexts/NavigationContext"\nimport type { ScreenKey } from "@/lib/data"'
);

text = text.replace(
  'const { t } = useLanguage()',
  'const { t } = useLanguage()\n  const { goBack } = useNavigation()'
);

fs.writeFileSync('components/screens/services/prashad.tsx', text);
