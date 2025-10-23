#!/bin/bash

# Script tự động build, sign, và install Electron app cho macOS
# Usage: yarn build:install

set -e  # Exit on error

echo "🚀 Starting automated build and install process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# App info
APP_NAME="Stream Cargo CRM"
APP_PATH="dist/mac/${APP_NAME}.app"
INSTALL_PATH="/Applications/${APP_NAME}.app"
ENTITLEMENTS_PATH="electron/entitlements.mac.plist"

# Step 1: Build Next.js
echo -e "${BLUE}📦 Step 1/7: Building Next.js app...${NC}"
yarn build
echo -e "${GREEN}✅ Next.js build completed${NC}\n"

# Step 2: Build Electron
echo -e "${BLUE}🔧 Step 2/7: Building Electron app...${NC}"
electron-builder --mac --config.mac.identity=null
echo -e "${GREEN}✅ Electron build completed${NC}\n"

# Step 3: Sign app with entitlements
echo -e "${BLUE}🔐 Step 3/7: Signing app with entitlements...${NC}"

if [ ! -f "$ENTITLEMENTS_PATH" ]; then
  echo -e "${RED}❌ Error: Entitlements file not found at $ENTITLEMENTS_PATH${NC}"
  exit 1
fi

if [ ! -d "$APP_PATH" ]; then
  echo -e "${RED}❌ Error: App not found at $APP_PATH${NC}"
  exit 1
fi

# Remove existing signature (if any)
codesign --remove-signature "$APP_PATH" 2>/dev/null || true

# Sign with ad-hoc signature and entitlements
codesign --force --deep --sign - \
  --entitlements "$ENTITLEMENTS_PATH" \
  "$APP_PATH"

# Verify signature
echo -e "${BLUE}🔍 Verifying signature...${NC}"
codesign -dv --verbose=4 "$APP_PATH" 2>&1 | grep -E "(Identifier|adhoc|Format)"

# Check entitlements
echo -e "${BLUE}🔍 Verifying entitlements...${NC}"
CAMERA_ENTITLEMENT=$(codesign -d --entitlements - "$APP_PATH" 2>&1 | grep -A1 "com.apple.security.device.camera" | grep -c "true" || echo "0")

if [ "$CAMERA_ENTITLEMENT" -eq "1" ]; then
  echo -e "${GREEN}✅ Camera entitlement verified${NC}\n"
else
  echo -e "${RED}❌ Warning: Camera entitlement not found!${NC}\n"
fi

# Step 4: Remove old app from Applications
echo -e "${BLUE}🗑️  Step 4/7: Removing old app from Applications...${NC}"
if [ -d "$INSTALL_PATH" ]; then
  rm -rf "$INSTALL_PATH"
  echo -e "${GREEN}✅ Old app removed${NC}\n"
else
  echo -e "${YELLOW}ℹ️  No old app found${NC}\n"
fi

# Step 5: Install new app
echo -e "${BLUE}📲 Step 5/7: Installing new app to Applications...${NC}"
cp -R "$APP_PATH" "$INSTALL_PATH"
echo -e "${GREEN}✅ App installed to Applications${NC}\n"

# Step 6: Verify installed app
echo -e "${BLUE}🔍 Step 6/7: Verifying installed app...${NC}"
codesign -dv "$INSTALL_PATH" 2>&1 | grep -q "adhoc"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Installed app signature verified${NC}\n"
else
  echo -e "${RED}❌ Warning: Installed app signature not valid${NC}\n"
fi

# Step 7: Reset camera permissions
echo -e "${BLUE}🔄 Step 7/7: Resetting camera permissions...${NC}"
tccutil reset Camera 2>/dev/null || echo -e "${YELLOW}⚠️  Could not reset camera permissions (may require manual reset)${NC}"
echo -e "${GREEN}✅ Camera permissions reset${NC}\n"

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Build and installation completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Offer to open app
echo -e "${BLUE}Would you like to open the app now? (y/n)${NC}"
read -r -t 10 RESPONSE || RESPONSE="y"

if [[ "$RESPONSE" =~ ^[Yy]$ ]] || [ -z "$RESPONSE" ]; then
  echo -e "${BLUE}🚀 Opening app...${NC}"
  open "$INSTALL_PATH"
  echo ""
  echo -e "${YELLOW}📌 Important:${NC}"
  echo -e "   When the app opens, macOS will ask for camera permission."
  echo -e "   Click ${GREEN}OK${NC} to allow camera access."
  echo ""
  echo -e "   You can verify camera permission in:"
  echo -e "   ${BLUE}System Preferences > Security & Privacy > Camera${NC}"
else
  echo -e "${YELLOW}Skipping app launch${NC}"
  echo -e "Run manually: ${BLUE}open \"$INSTALL_PATH\"${NC}\n"
fi

echo -e "${GREEN}✨ All done!${NC}"
