const fs = require('fs');
const path = require('path');

const dir = 'd:/DCreatorsInitial/dcreators-mobile/src/screens';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace paddingBottom: 40 in contentContainerStyle with 8
    const before = content;
    content = content.replace(/contentContainerStyle=\{\{ paddingBottom: 40 \}\}/g, 'contentContainerStyle={{ paddingBottom: 8 }}');
    
    if (content !== before) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed padding in ${file}`);
    }
  }
});
console.log('Done!');
