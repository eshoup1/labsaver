const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Determine environment
const env = process.env.NODE_ENV || 'development';
console.log(`\n🔨 Building LabSaver for environment: ${env}\n`);

// Load configurations
const commonConfig = require('../config/common.json');
const envConfigPath = path.join(__dirname, `../config/${env}.json`);

if (!fs.existsSync(envConfigPath)) {
  console.error(`❌ ERROR: Configuration file not found: ${envConfigPath}`);
  console.error(`For production builds, create config/production.json with production OAuth credentials.`);
  process.exit(1);
}

const envConfig = require(envConfigPath);

// Merge configurations
const manifest = { ...commonConfig, ...envConfig };

// Create/clean dist directory
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// Write manifest.json
fs.writeFileSync(
  path.join(distDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✓ Generated manifest.json');

// Copy source files
const srcDir = path.join(__dirname, '../src');
copyRecursive(srcDir, distDir);
console.log('✓ Copied source files');

// Create ZIP file
const zipName = `labsaver-v${manifest.version}-${env}.zip`;
const output = fs.createWriteStream(zipName);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`\n✅ Created ${zipName} (${archive.pointer()} bytes)\n`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();

// Helper function
function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}