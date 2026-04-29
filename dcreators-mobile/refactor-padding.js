const fs = require('fs');
const path = require('path');

const dir = 'd:/DCreatorsInitial/dcreators-mobile/src/screens';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace paddingBottom values in contentContainerStyle
    content = content.replace(/paddingBottom: 100/g, 'paddingBottom: 40');
    content = content.replace(/paddingBottom: 120/g, 'paddingBottom: 40');
    content = content.replace(/paddingBottom: 140/g, 'paddingBottom: 40');
    content = content.replace(/paddingBottom: 160/g, 'paddingBottom: 40');
    
    fs.writeFileSync(fullPath, content);
  }
});
console.log('Padding adjusted across all screens!');
