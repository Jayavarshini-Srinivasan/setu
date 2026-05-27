const fs = require('fs');
const path = require('path');

const dirs = [
  'e:/projects/setu/mobile/screens',
  'e:/projects/setu/mobile/screens/professional',
  'e:/projects/setu/mobile/components'
];

let files = [];
for (const d of dirs) {
  if (fs.existsSync(d)) {
    const list = fs.readdirSync(d).filter(f => f.endsWith('.js')).map(f => path.join(d, f));
    files = files.concat(list);
  }
}

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let matches = [];
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('eslint') || line.trim().startsWith('//')) continue;
    
    // Check for hardcoded English in JSX text, skip t(...) calls
    if (line.match(/>\s*[A-Za-z0-9][A-Za-z0-9\s,\.\?!]+\s*</) && !line.includes('{t(')) {
        matches.push(i + 1 + ': ' + line.trim());
    } else if (line.match(/placeholder="[A-Za-z0-9 ]+"/)) {
        matches.push(i + 1 + ': ' + line.trim());
    } else if (line.match(/Alert\.alert\(\s*"[A-Za-z0-9 ]+"/)) {
        matches.push(i + 1 + ': ' + line.trim());
    } else if (line.match(/title="[A-Za-z0-9 ]+"/)) {
        matches.push(i + 1 + ': ' + line.trim());
    }
  }
  
  if (matches.length > 0) {
    console.log(`\n--- ${path.basename(f)} ---`);
    console.log(matches.slice(0, 10).join('\n'));
    if (matches.length > 10) console.log(`...and ${matches.length - 10} more`);
  }
}
