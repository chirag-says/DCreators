const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Load from env — NEVER hardcode credentials
require('dotenv').config({ path: '../.env' });

cloudinary.config({
  cloud_name: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const FILES = [
  'bg-texture.png',
  'dcreators-logo.png',
  'd-icon.png',
  'photographer.png',
  'designer.png',
  'sculptor.png',
  'artisan.png',
  'photo_archive_1.png',
  'photo_archive_2.png',
  'photo_archive_3.png',
  'design_hub_1.png',
  'design_hub_2.png',
  'design_hub_3.png',
  'page_1.png',
  'page_3.png',
];

async function main() {
  console.log('Uploading signed assets to Cloudinary...');
  
  const results = {};
  for (const file of FILES) {
    const filePath = path.join(ASSETS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} (not found)`);
      continue;
    }
    
    const publicId = file.replace('.png', '');
    console.log(`Uploading ${file}...`);
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: 'dcreators/app_assets',
        overwrite: true
      });
      const sizeKB = Math.round(result.bytes / 1024);
      console.log(`  ✅ ${sizeKB}KB -> ${result.secure_url}`);
      results[publicId] = result.secure_url;
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
    }
  }
  
  console.log('\n--- UPLOAD COMPLETE ---');
  fs.writeFileSync(path.join(__dirname, 'upload-results.json'), JSON.stringify(results, null, 2));
}

main().catch(console.error);
