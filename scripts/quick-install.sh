#!/bin/bash

# Quick install script - chỉ sign và install app đã build sẵn
# Usage: yarn build:quick (sau khi đã build Electron)

set -e

echo "⚡ Quick install (skip Next.js build)..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_NAME="Stream Cargo CRM"
APP_PATH="dist/mac/${APP_NAME}.app"
INSTALL_PATH="/Applications/${APP_NAME}.app"
ENTITLEMENTS_PATH="electron/entitlements.mac.plist"

# Check if app exists
if [ ! -d "$APP_PATH" ]; then
  echo -e "${RED}❌ Error: App not found at $APP_PATH${NC}"
  echo -e "${YELLOW}Run 'yarn build:install' for full build${NC}"
  exit 1
fi

# Sign app
echo -e "${BLUE}🔐 Signing app...${NC}"
codesign --remove-signature "$APP_PATH" 2>/dev/null || true
codesign --force --deep --sign - --entitlements "$ENTITLEMENTS_PATH" "$APP_PATH"
echo -e "${GREEN}✅ App signed${NC}\n"

# Remove old app
echo -e "${BLUE}🗑️  Removing old app...${NC}"
rm -rf "$INSTALL_PATH" 2>/dev/null || true
echo -e "${GREEN}✅ Old app removed${NC}\n"

# Install new app
echo -e "${BLUE}📲 Installing...${NC}"
cp -R "$APP_PATH" "$INSTALL_PATH"
echo -e "${GREEN}✅ Installed to Applications${NC}\n"

# Reset camera permissions
echo -e "${BLUE}🔄 Resetting camera permissions...${NC}"
tccutil reset Camera 2>/dev/null || true
echo -e "${GREEN}✅ Done${NC}\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}⚡ Quick install completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Ask to open
echo -e "${BLUE}Open app now? (y/n)${NC}"
read -r -t 5 RESPONSE || RESPONSE="y"

if [[ "$RESPONSE" =~ ^[Yy]$ ]] || [ -z "$RESPONSE" ]; then
  open "$INSTALL_PATH"
  echo -e "${GREEN}🚀 App opened${NC}"
fi
