const fs = require('fs');
const path = require('path');

const dir = 'd:/DCreatorsInitial/dcreators-mobile/src/screens';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove the import line
    content = content.replace(/import BottomNavigation from '..\/components\/BottomNavigation';\r?\n/g, '');
    
    // Remove the component tag
    content = content.replace(/<BottomNavigation \/>\r?\n?/g, '');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  }
});
