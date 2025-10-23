#!/bin/bash

###############################################################################
# Stream Cargo CRM - Standalone Installer for macOS
#
# Script này có thể chạy trên BẤT KỲ máy Mac nào
# KHÔNG cần source code, chỉ cần:
# 1. File .app đã build sẵn (hoặc .dmg)
# 2. File entitlements.mac.plist
# 3. Script này
#
# Usage:
#   ./installer-standalone.sh /path/to/Stream\ Cargo\ CRM.app
#
# Hoặc nếu từ .dmg:
#   ./installer-standalone.sh /Volumes/Stream\ Cargo\ CRM/Stream\ Cargo\ CRM.app
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_NAME="Stream Cargo CRM"
INSTALL_PATH="/Applications/${APP_NAME}.app"

###############################################################################
# Entitlements file (embedded trong script)
###############################################################################

create_entitlements() {
  local ENTITLEMENTS_FILE="/tmp/entitlements.mac.plist"

  cat > "$ENTITLEMENTS_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.cs.allow-jit</key>
	<true/>
	<key>com.apple.security.cs.allow-unsigned-executable-memory</key>
	<true/>
	<key>com.apple.security.cs.disable-library-validation</key>
	<true/>
	<key>com.apple.security.device.camera</key>
	<true/>
	<key>com.apple.security.device.microphone</key>
	<true/>
	<key>com.apple.security.network.client</key>
	<true/>
	<key>com.apple.security.network.server</key>
	<true/>
</dict>
</plist>
EOF

  echo "$ENTITLEMENTS_FILE"
}

###############################################################################
# Main Installation Logic
###############################################################################

main() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  Stream Cargo CRM - Standalone Installer${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  # Step 1: Get source app path
  local SOURCE_APP="$1"

  if [ -z "$SOURCE_APP" ]; then
    echo -e "${YELLOW}📂 Tìm file .app...${NC}"

    # Get script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

    # Try common locations
    if [ -d "$SCRIPT_DIR/${APP_NAME}.app" ]; then
      # Same directory as script (delivery package)
      SOURCE_APP="$SCRIPT_DIR/${APP_NAME}.app"
      echo -e "${GREEN}✅ Found: $SOURCE_APP${NC}\n"
    elif [ -d "$SCRIPT_DIR/../${APP_NAME}.app" ]; then
      # Parent directory
      SOURCE_APP="$SCRIPT_DIR/../${APP_NAME}.app"
      echo -e "${GREEN}✅ Found: $SOURCE_APP${NC}\n"
    elif [ -d "dist/mac/${APP_NAME}.app" ]; then
      # Developer build location
      SOURCE_APP="dist/mac/${APP_NAME}.app"
      echo -e "${GREEN}✅ Found: $SOURCE_APP${NC}\n"
    elif [ -d "/Volumes/${APP_NAME}/${APP_NAME}.app" ]; then
      # Mounted DMG
      SOURCE_APP="/Volumes/${APP_NAME}/${APP_NAME}.app"
      echo -e "${GREEN}✅ Found in mounted DMG: $SOURCE_APP${NC}\n"
    else
      echo -e "${RED}❌ Error: Không tìm thấy file .app${NC}"
      echo -e "${YELLOW}Các vị trí đã kiểm tra:${NC}"
      echo -e "   - $SCRIPT_DIR/${APP_NAME}.app"
      echo -e "   - dist/mac/${APP_NAME}.app"
      echo -e "   - /Volumes/${APP_NAME}/${APP_NAME}.app"
      echo -e "\n${YELLOW}Cách fix:${NC}"
      echo -e "   1. Đảm bảo file '${APP_NAME}.app' nằm cùng folder với script"
      echo -e "   2. Hoặc chỉ định path: $0 /path/to/Stream\\ Cargo\\ CRM.app"
      exit 1
    fi
  fi

  # Verify source app exists
  if [ ! -d "$SOURCE_APP" ]; then
    echo -e "${RED}❌ Error: App không tồn tại: $SOURCE_APP${NC}"
    exit 1
  fi

  echo -e "${GREEN}📦 Source app: $SOURCE_APP${NC}\n"

  # Step 2: Create entitlements file
  echo -e "${BLUE}📝 Creating entitlements file...${NC}"
  ENTITLEMENTS_FILE=$(create_entitlements)
  echo -e "${GREEN}✅ Entitlements created: $ENTITLEMENTS_FILE${NC}\n"

  # Step 3: Copy to temp location for signing
  echo -e "${BLUE}📋 Copying app to temp location...${NC}"
  local TEMP_APP="/tmp/${APP_NAME}.app"
  rm -rf "$TEMP_APP" 2>/dev/null || true
  cp -R "$SOURCE_APP" "$TEMP_APP"
  echo -e "${GREEN}✅ Copied to: $TEMP_APP${NC}\n"

  # Step 4: Sign app with entitlements
  echo -e "${BLUE}🔐 Signing app with camera entitlements...${NC}"
  codesign --remove-signature "$TEMP_APP" 2>/dev/null || true
  codesign --force --deep --sign - \
    --entitlements "$ENTITLEMENTS_FILE" \
    "$TEMP_APP"
  echo -e "${GREEN}✅ App signed${NC}\n"

  # Step 5: Verify signature
  echo -e "${BLUE}🔍 Verifying signature...${NC}"
  if codesign -dv "$TEMP_APP" 2>&1 | grep -q "adhoc"; then
    echo -e "${GREEN}✅ Signature verified${NC}\n"
  else
    echo -e "${RED}❌ Warning: Signature verification failed${NC}\n"
  fi

  # Step 6: Verify camera entitlement
  echo -e "${BLUE}🔍 Verifying camera entitlement...${NC}"
  if codesign -d --entitlements - "$TEMP_APP" 2>&1 | grep -q "com.apple.security.device.camera"; then
    echo -e "${GREEN}✅ Camera entitlement verified${NC}\n"
  else
    echo -e "${RED}❌ Warning: Camera entitlement not found${NC}\n"
  fi

  # Step 7: Remove old app from Applications
  echo -e "${BLUE}🗑️  Removing old app from Applications...${NC}"
  if [ -d "$INSTALL_PATH" ]; then
    rm -rf "$INSTALL_PATH"
    echo -e "${GREEN}✅ Old app removed${NC}\n"
  else
    echo -e "${YELLOW}ℹ️  No old app found${NC}\n"
  fi

  # Step 8: Install to Applications
  echo -e "${BLUE}📲 Installing to Applications...${NC}"
  cp -R "$TEMP_APP" "$INSTALL_PATH"

  # Remove quarantine attribute if exists
  xattr -cr "$INSTALL_PATH" 2>/dev/null || true

  echo -e "${GREEN}✅ Installed to: $INSTALL_PATH${NC}\n"

  # Step 9: Final verification
  echo -e "${BLUE}🔍 Final verification...${NC}"
  if [ -d "$INSTALL_PATH" ]; then
    echo -e "${GREEN}✅ App installed successfully${NC}"

    # Check signature
    if codesign -dv "$INSTALL_PATH" 2>&1 | grep -q "adhoc"; then
      echo -e "${GREEN}✅ Signature OK${NC}"
    fi
  else
    echo -e "${RED}❌ Installation failed${NC}"
    exit 1
  fi

  # Step 10: Reset camera permissions
  echo -e "\n${BLUE}🔄 Resetting camera permissions...${NC}"
  if tccutil reset Camera 2>/dev/null; then
    echo -e "${GREEN}✅ Camera permissions reset${NC}"
  else
    echo -e "${YELLOW}⚠️  Could not reset camera permissions${NC}"
    echo -e "${YELLOW}   Manual reset: System Preferences > Security & Privacy > Privacy > Camera${NC}"
  fi

  # Cleanup
  rm -rf "$TEMP_APP" 2>/dev/null || true
  rm -f "$ENTITLEMENTS_FILE" 2>/dev/null || true

  # Summary
  echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  echo -e "${BLUE}📌 Next steps:${NC}"
  echo -e "   1. Open ${GREEN}${APP_NAME}${NC} from Applications"
  echo -e "   2. When prompted, click ${GREEN}OK${NC} to allow camera access"
  echo -e "   3. If needed, check permissions in:"
  echo -e "      ${BLUE}System Preferences > Security & Privacy > Camera${NC}\n"

  # Ask to open app
  echo -e "${BLUE}Open app now? (y/n) [auto-open in 5s]${NC}"
  read -r -t 5 RESPONSE || RESPONSE="y"

  if [[ "$RESPONSE" =~ ^[Yy]$ ]] || [ -z "$RESPONSE" ]; then
    echo -e "\n${BLUE}🚀 Opening app...${NC}"
    open "$INSTALL_PATH"

    echo -e "\n${YELLOW}⏳ Waiting for camera permission popup...${NC}"
    echo -e "${YELLOW}   When the popup appears, click ${GREEN}OK${YELLOW} to allow camera access.${NC}\n"
  else
    echo -e "\n${YELLOW}Skipped app launch${NC}"
    echo -e "Open manually: ${BLUE}open \"$INSTALL_PATH\"${NC}\n"
  fi

  echo -e "${GREEN}✨ All done!${NC}\n"
}

# Run main function
main "$@"
