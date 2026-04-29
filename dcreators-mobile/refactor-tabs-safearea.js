const fs = require('fs');
const path = require('path');

// Tab screens - these are inside the Tab Navigator which already handles the bottom
const tabScreens = [
  'DashboardScreen.tsx',
  'SearchScreen.tsx',
  'HistoryScreen.tsx',
  'CreatorProfileScreen.tsx',
  'AssignProjectScreen.tsx',
  'FloatingQueryScreen.tsx',
  'CreatorWorkorderScreen.tsx',
  'ClientWorkorderScreen.tsx',
  'ClientReviewScreen.tsx',
  'PaymentScreen.tsx',
];

const dir = 'd:/DCreatorsInitial/dcreators-mobile/src/screens';

tabScreens.forEach(file => {
  const fullPath = path.join(dir, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const before = content;
  
  content = content.replace(
    /<SafeAreaView style={styles\.safeArea}>/,
    "<SafeAreaView style={styles.safeArea} edges={['top']}>"
  );
  
  if (content !== before) {
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${file}`);
  } else {
    console.log(`Skipped ${file} (already fixed or different pattern)`);
  }
});
console.log('Done!');
