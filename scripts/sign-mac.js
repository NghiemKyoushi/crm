/**
 * Post-build script to sign macOS app with entitlements
 * This ensures the app has proper camera permissions
 */

const { execSync } = require('child_process');
const path = require('path');

async function signApp() {
  const appPath = path.join(__dirname, '..', 'dist', 'mac', 'Stream Cargo CRM.app');
  const entitlementsPath = path.join(__dirname, '..', 'electron', 'entitlements.mac.plist');

  console.log('🔐 Signing macOS app with entitlements...');
  console.log('App path:', appPath);
  console.log('Entitlements:', entitlementsPath);

  try {
    // Remove existing signature
    console.log('Removing existing signature...');
    execSync(`codesign --remove-signature "${appPath}"`, { stdio: 'inherit' });

    // Sign with ad-hoc signature and entitlements
    console.log('Signing with ad-hoc signature...');
    execSync(
      `codesign --force --deep --sign - --entitlements "${entitlementsPath}" "${appPath}"`,
      { stdio: 'inherit' }
    );

    // Verify signature
    console.log('Verifying signature...');
    execSync(`codesign -dv --verbose=4 "${appPath}"`, { stdio: 'inherit' });

    // Check entitlements
    console.log('\nChecking entitlements...');
    execSync(`codesign -d --entitlements - "${appPath}"`, { stdio: 'inherit' });

    console.log('\n✅ App signed successfully!');
  } catch (error) {
    console.error('❌ Failed to sign app:', error.message);
    process.exit(1);
  }
}

signApp();
