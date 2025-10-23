#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

async function prepareElectron() {
  console.log('📦 Preparing Electron build...');

  const rootDir = path.join(__dirname, '..');
  const outDir = path.join(rootDir, 'out');

  // Check if static export exists
  if (!fs.existsSync(outDir)) {
    console.error('❌ out/ directory not found. Run "yarn build" first!');
    process.exit(1);
  }

  console.log('✅ Static export found');

  // Just verify the build exists - electron-builder will copy it
  const indexHtml = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error('❌ index.html not found in out/ directory');
    process.exit(1);
  }

  console.log('✅ Static files ready');
  console.log('🎉 Electron build preparation complete!');
}

prepareElectron().catch(err => {
  console.error('❌ Error preparing Electron build:', err);
  process.exit(1);
});
