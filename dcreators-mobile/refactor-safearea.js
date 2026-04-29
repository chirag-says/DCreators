const fs = require('fs');
const path = require('path');

// These screens are in the root Stack (not inside Tab), so their SafeAreaView
// bottom inset creates an ugly gap. We fix by adding edges={['top']}.
const stackScreens = [
  'SettingsScreen.tsx',
  'FinalizeOfferScreen.tsx',
  'AssignMultipleScreen.tsx',
  'TermsScreen.tsx',
  'NotificationsScreen.tsx',
  'ChatScreen.tsx',
  'ForgotPasswordScreen.tsx',
];

const dir = 'd:/DCreatorsInitial/dcreators-mobile/src/screens';

stackScreens.forEach(file => {
  const fullPath = path.join(dir, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Only fix the first SafeAreaView (the outer wrapper), not nested ones
  // Replace <SafeAreaView style={styles.safeArea}> with edges={['top']}
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
