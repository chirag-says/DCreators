const fs = require('fs');
const path = require('path');

const dir = 'd:/DCreatorsInitial/dcreators-mobile/src/screens';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const fullPath = path.join(dir, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if it has a header with borderBottomWidth (i.e. separation line)
  if (content.includes('borderBottomWidth') && content.includes('header: {')) {
    
    const before = content;

    // 1. Swap the opening tags
    const imageBgMatch = /<ImageBackground\s+source=\{require\('\.\.\/\.\.\/assets\/bg-texture\.png'\)\}\s+style=\{styles\.backgroundImage\}\s+imageStyle=\{\{ opacity: 1 \}\}\s*>/;
    const safeAreaMatch = /<SafeAreaView style=\{styles\.safeArea\} edges=\{\['top'\]\}>/;
    
    if (imageBgMatch.test(content) && safeAreaMatch.test(content)) {
      content = content.replace(imageBgMatch, "<SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFF' }]} edges={['top']}>\n      <ImageBackground \n        source={require('../../assets/bg-texture.png')} \n        style={styles.backgroundImage}\n        imageStyle={{ opacity: 1 }}\n      >");
      content = content.replace(safeAreaMatch, ""); // remove the old safe area
    }

    // 2. Swap the closing tags
    // Usually it looks like:
    //       </SafeAreaView>
    //     </ImageBackground>
    const closingTagsRegex = /<\/SafeAreaView>\s*<\/ImageBackground>/;
    if (closingTagsRegex.test(content)) {
      content = content.replace(closingTagsRegex, "</ImageBackground>\n    </SafeAreaView>");
    }

    // 3. Ensure the header has a white background so the texture doesn't show behind it
    // Some headers already have backgroundColor, some don't.
    if (!content.includes("backgroundColor: '#FFF'") && !content.includes('backgroundColor: "#FFF"')) {
      content = content.replace(/header: \{/g, "header: {\n    backgroundColor: '#FFF',");
    } else {
      // If the file already has some backgroundColor '#FFF', make sure header specifically has it
      // if it doesn't already.
      const headerIndex = content.indexOf('header: {');
      if (headerIndex !== -1) {
        const headerEnd = content.indexOf('},', headerIndex);
        const headerContent = content.slice(headerIndex, headerEnd);
        if (!headerContent.includes('backgroundColor')) {
           content = content.replace(/header: \{/g, "header: {\n    backgroundColor: '#FFF',");
        }
      }
    }

    if (content !== before) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed ${file}`);
    }
  }
});
console.log('Done!');
