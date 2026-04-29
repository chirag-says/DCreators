const fs = require('fs');
const path = require('path');

const dir = 'd:/DCreatorsInitial/dcreators-mobile/src/screens';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove the import line
    content = content.replace(/import ActionBanner from '..\/components\/ActionBanner';\r?\n/g, '');
    
    // Remove the component tag (with optional whitespace)
    content = content.replace(/\s*<ActionBanner \/>\s*/g, '\n');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Cleaned ${file}`);
  }
});
console.log('Done! ActionBanner removed from all screens.');
