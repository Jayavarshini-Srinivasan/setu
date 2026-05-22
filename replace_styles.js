const fs = require('fs');
const path = require('path');

const setuTokens = {
  primary: '#E85D26',
  primaryDark: '#C44A18',
  primaryLight: '#FDF0EB',
  secondary: '#1A1A2E',
  success: '#1D9E75',
  danger: '#E24B4A',
  info: '#185FA5',
  accent: '#F5A623',
  bg: '#F7F5F2',
  bgCard: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: '#6B6B80',
  border: 'rgba(26,26,46,0.12)',
};

const oldColorsMap = {
  '#2563EB': 'primary', // old primary
  '#BFDBFE': 'primaryLight', // old primaryLight
  '#10B981': 'success', // old secondary/success
  '#F8FAFC': 'bg', // old background
  '#FFFFFF': 'bgCard', // surface
  '#111827': 'text', // text
  '#6B7280': 'textMuted', // textSecondary
  '#9CA3AF': 'textMuted', // textLight
  '#E5E7EB': 'border', // border
  '#22C55E': 'success', // success
  '#EF4444': 'danger', // danger
  '#F59E0B': 'accent', // warning
  '#E85D04': 'primary', // old accent
  '#FFF4ED': 'primaryLight',
  '#FAF9F6': 'bg',
  '#4B5563': 'textMuted',
  '#F9FAFB': 'bg',
};

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Color replace
      for (const [oldColor, tokenName] of Object.entries(oldColorsMap)) {
        const regex = new RegExp(oldColor, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, setuTokens[tokenName]);
          changed = true;
        }
      }

      // Box shadow removal in JS styles
      if (content.includes('shadowColor') || content.includes('elevation')) {
         content = content.replace(/shadowColor:\s*['"][^'"]+['"]/g, 'shadowColor: "transparent"');
         content = content.replace(/shadowOffset:\s*\{[^}]+\}/g, 'shadowOffset: { width: 0, height: 0 }');
         content = content.replace(/shadowOpacity:\s*[\d.]+/g, 'shadowOpacity: 0');
         content = content.replace(/shadowRadius:\s*[\d.]+/g, 'shadowRadius: 0');
         content = content.replace(/elevation:\s*[\d.]+/g, 'elevation: 0');
         changed = true;
      }

      // Fix specific hardcoded "Kaam" string (although grep didn't find any, just in case for case-insensitive)
      if (/Kaam/i.test(content) && !fullPath.includes('replace_styles')) {
        content = content.replace(/Kaam/gi, 'Setu');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'mobile', 'screens'));
processDirectory(path.join(__dirname, 'mobile', 'components'));
processDirectory(path.join(__dirname, 'web', 'src', 'components'));
processDirectory(path.join(__dirname, 'web', 'src', 'pages'));
processDirectory(path.join(__dirname, 'web', 'src', 'styles'));

console.log("Replaced colors and shadows successfully!");
