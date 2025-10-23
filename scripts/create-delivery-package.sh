#!/bin/bash

###############################################################################
# Create Delivery Package for Customer
# Tạo package để gửi cho khách hàng (không cần source code)
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
VERSION=${1:-"1.0.0"}
APP_NAME="Stream Cargo CRM"
PACKAGE_NAME="StreamCargoCRM-Delivery-v${VERSION}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Creating Delivery Package v${VERSION}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Step 1: Check if app exists
echo -e "${BLUE}📦 Checking for built app...${NC}"
APP_PATH="dist/mac/${APP_NAME}.app"

if [ ! -d "$APP_PATH" ]; then
  echo -e "${RED}❌ Error: App not found at $APP_PATH${NC}"
  echo -e "${YELLOW}Run: yarn build && yarn build:mac${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Found app: $APP_PATH${NC}\n"

# Step 2: Create package directory
echo -e "${BLUE}📁 Creating package directory...${NC}"
rm -rf "$PACKAGE_NAME"
mkdir -p "$PACKAGE_NAME"
echo -e "${GREEN}✅ Created: $PACKAGE_NAME${NC}\n"

# Step 3: Copy app
echo -e "${BLUE}📋 Copying app...${NC}"
cp -R "$APP_PATH" "$PACKAGE_NAME/"
echo -e "${GREEN}✅ Copied app${NC}\n"

# Step 4: Copy installer script
echo -e "${BLUE}📋 Copying installer script...${NC}"
cp scripts/installer-standalone.sh "$PACKAGE_NAME/"
chmod +x "$PACKAGE_NAME/installer-standalone.sh"
echo -e "${GREEN}✅ Copied installer${NC}\n"

# Step 5: Create README
echo -e "${BLUE}📝 Creating README...${NC}"
cat > "$PACKAGE_NAME/README-INSTALL.txt" << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║         STREAM CARGO CRM - HƯỚNG DẪN CÀI ĐẶT                 ║
╚═══════════════════════════════════════════════════════════════╝

YÊU CẦU HỆ THỐNG:
- macOS 10.13 (High Sierra) trở lên
- Kết nối internet (để truy cập https://crm-r88w.onrender.com)
- Camera (để quét mã barcode/QR)

═══════════════════════════════════════════════════════════════

CÁCH 1: TỰ ĐỘNG (KHUYẾN NGHỊ)

1. Mở Terminal:
   - Finder > Applications > Utilities > Terminal
   - Hoặc nhấn Cmd+Space, gõ "Terminal"

2. Kéo thả file "installer-standalone.sh" vào cửa sổ Terminal

3. Nhấn Enter

4. Đợi script chạy (khoảng 30 giây)

5. Khi app mở, cho phép truy cập camera (click OK)

═══════════════════════════════════════════════════════════════

CÁCH 2: THỦ CÔNG (KHÔNG KHUYẾN NGHỊ)

1. Kéo "Stream Cargo CRM.app" vào thư mục Applications

2. Lần đầu mở app:
   - Right-click app > Open > Open
   (để bypass cảnh báo "unidentified developer")

3. Cho phép camera khi được hỏi

⚠️  LƯU Ý: Cách 2 có thể KHÔNG hoạt động do thiếu camera permission!
   Vui lòng dùng CÁCH 1 để đảm bảo camera hoạt động.

═══════════════════════════════════════════════════════════════

XỬ LÝ LỖI THƯỜNG GẶP:

▶ "Permission denied" khi chạy script:
   chmod +x installer-standalone.sh
   ./installer-standalone.sh

▶ "App is damaged and can't be opened":
   xattr -cr "/Applications/Stream Cargo CRM.app"

▶ Camera không hoạt động:
   - Vào System Preferences > Security & Privacy > Camera
   - Tìm "Stream Cargo CRM" và check vào checkbox
   - Restart app

▶ App không kết nối được server:
   - Kiểm tra kết nối internet
   - Truy cập https://crm-r88w.onrender.com trên browser
   - Contact IT support nếu website không load

▶ "tccutil reset Camera" không hoạt động:
   - Restart máy
   - Mở lại app và cho phép camera

═══════════════════════════════════════════════════════════════

TÍNH NĂNG CHÍNH:

✅ Quét barcode/QR code bằng camera
✅ Check-in package tự động
✅ In nhãn nhiệt (Toshiba B-EV4D 60x40mm)
✅ Kết nối real-time với server
✅ Giao diện tiếng Việt/English

═══════════════════════════════════════════════════════════════

HỖ TRỢ:

📧 Email: support@streamcargo.com
📞 Phone: 1900-xxxx-xxx
💬 Internal: Slack #it-support

═══════════════════════════════════════════════════════════════

THÔNG TIN PHIÊN BẢN:

Version: VERSION_PLACEHOLDER
Release Date: DATE_PLACEHOLDER
Server: https://crm-r88w.onrender.com

═══════════════════════════════════════════════════════════════

Copyright © 2025 Stream Cargo. All rights reserved.

EOF

# Replace placeholders
sed -i '' "s/VERSION_PLACEHOLDER/$VERSION/g" "$PACKAGE_NAME/README-INSTALL.txt"
sed -i '' "s/DATE_PLACEHOLDER/$(date +%d\\/%m\\/%Y)/g" "$PACKAGE_NAME/README-INSTALL.txt"

echo -e "${GREEN}✅ Created README${NC}\n"

# Step 6: Create CHANGELOG
echo -e "${BLUE}📝 Creating CHANGELOG...${NC}"
cat > "$PACKAGE_NAME/CHANGELOG.txt" << EOF
═══════════════════════════════════════════════════════════════
CHANGELOG - Stream Cargo CRM
═══════════════════════════════════════════════════════════════

Version $VERSION ($(date +%d/%m/%Y))
--------------------------------
✨ Features:
- Barcode/QR scanner với camera integration
- Package check-in tự động
- Thermal label printing (Toshiba B-EV4D, 60x40mm)
- Real-time sync với server
- Dark/Light theme support
- Multi-language (Vietnamese/English)

🔧 System:
- Electron-based desktop app
- Kết nối tới https://crm-r88w.onrender.com
- Auto camera permission setup
- Compatible với macOS 10.13+

🐛 Bug Fixes:
- Camera initialization on first launch
- Permission handling improvements
- Scan-line animation performance

📝 Notes:
- Cần internet để hoạt động
- Camera permission mandatory cho scanning
- Printer setup: xem PRINTER-SETUP.md (nếu có)

═══════════════════════════════════════════════════════════════

Previous Versions
-----------------
[Sẽ update khi có version mới]

═══════════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ Created CHANGELOG${NC}\n"

# Step 7: Create .env.example
echo -e "${BLUE}📝 Creating .env.example...${NC}"
cat > "$PACKAGE_NAME/.env.example" << 'EOF'
# Stream Cargo CRM - Environment Configuration
# Copy file này thành .env nếu cần customize server URLs

# Frontend URL (nơi load UI)
NEXT_PUBLIC_FRONTEND_URL=https://crm-r88w.onrender.com

# API Backend URL
NEXT_PUBLIC_API_BASE_URL=https://proxy-3r9s.onrender.com

# Legacy (backwards compatibility)
NEXT_PUBLIC_ROOT_STATIC_URL=https://proxy-3r9s.onrender.com

# Notes:
# - Thường không cần thay đổi các giá trị này
# - Chỉ customize nếu deploy trên server riêng
# - Sau khi sửa, cần rebuild app
EOF

echo -e "${GREEN}✅ Created .env.example${NC}\n"

# Step 8: Create deployment instructions for IT
echo -e "${BLUE}📝 Creating IT deployment guide...${NC}"
cat > "$PACKAGE_NAME/IT-DEPLOYMENT.txt" << 'EOF'
═══════════════════════════════════════════════════════════════
HƯỚNG DẪN DEPLOY CHO IT ADMIN
═══════════════════════════════════════════════════════════════

DEPLOY CHO 1 MÁY:
-----------------
cd StreamCargoCRM-Delivery-vX.X.X
./installer-standalone.sh

DEPLOY CHO NHIỀU MÁY:
---------------------

Option 1: Shared Network Drive
   1. Copy folder này lên network drive
   2. Nhân viên tự download và chạy script

Option 2: Remote SSH Deploy
   for mac in mac1 mac2 mac3; do
     scp -r . user@$mac:/tmp/crm-install/
     ssh user@$mac "cd /tmp/crm-install && ./installer-standalone.sh"
   done

Option 3: ARD (Apple Remote Desktop)
   1. Upload package lên ARD
   2. Send Unix command: "./installer-standalone.sh"
   3. Monitor installation status

VERIFY INSTALLATION:
--------------------
# Check app installed
ls -la "/Applications/Stream Cargo CRM.app"

# Check signature
codesign -dv "/Applications/Stream Cargo CRM.app"

# Check camera entitlement
codesign -d --entitlements - "/Applications/Stream Cargo CRM.app" | grep camera

TROUBLESHOOTING:
----------------
# Reset all permissions
tccutil reset Camera

# Remove quarantine
xattr -cr "/Applications/Stream Cargo CRM.app"

# Reinstall
rm -rf "/Applications/Stream Cargo CRM.app"
./installer-standalone.sh

MONITORING:
-----------
# Check app logs
tail -f ~/Library/Logs/Stream\ Cargo\ CRM/main.log

# Network connectivity
curl -I https://crm-r88w.onrender.com

SUPPORT:
--------
Level 1: README-INSTALL.txt
Level 2: support@streamcargo.com
Level 3: Emergency hotline

═══════════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ Created IT deployment guide${NC}\n"

# Step 9: Calculate package size
echo -e "${BLUE}📊 Package info:${NC}"
PACKAGE_SIZE=$(du -sh "$PACKAGE_NAME" | cut -f1)
APP_SIZE=$(du -sh "$PACKAGE_NAME/${APP_NAME}.app" | cut -f1)
echo -e "   Package: ${GREEN}$PACKAGE_SIZE${NC}"
echo -e "   App: ${GREEN}$APP_SIZE${NC}\n"

# Step 10: Create ZIP
echo -e "${BLUE}🗜️  Creating ZIP archive...${NC}"
zip -r -q "${PACKAGE_NAME}.zip" "$PACKAGE_NAME"
ZIP_SIZE=$(du -sh "${PACKAGE_NAME}.zip" | cut -f1)
echo -e "${GREEN}✅ Created: ${PACKAGE_NAME}.zip ($ZIP_SIZE)${NC}\n"

# Step 11: Generate checksum
echo -e "${BLUE}🔐 Generating checksum...${NC}"
CHECKSUM=$(shasum -a 256 "${PACKAGE_NAME}.zip" | cut -d' ' -f1)
echo "$CHECKSUM  ${PACKAGE_NAME}.zip" > "${PACKAGE_NAME}.zip.sha256"
echo -e "${GREEN}✅ SHA256: $CHECKSUM${NC}\n"

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Package created successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📦 Deliverables:${NC}"
echo -e "   1. ${GREEN}${PACKAGE_NAME}.zip${NC} ($ZIP_SIZE)"
echo -e "   2. ${GREEN}${PACKAGE_NAME}.zip.sha256${NC} (checksum)"
echo -e "\n${BLUE}📤 Next steps:${NC}"
echo -e "   1. Test package trên máy sạch"
echo -e "   2. Upload lên Google Drive/Dropbox"
echo -e "   3. Share link với khách hàng"
echo -e "   4. Send email với hướng dẫn"
echo -e "\n${BLUE}📧 Email template:${NC}"
echo -e "   Subject: Stream Cargo CRM v$VERSION - Package cài đặt"
echo -e "   Attach: README-INSTALL.txt content"
echo -e "\n${YELLOW}⚠️  Reminder:${NC}"
echo -e "   - Test installer trước khi gửi khách hàng"
echo -e "   - Verify app kết nối được tới server"
echo -e "   - Camera permission popup phải xuất hiện"
echo -e "\n${GREEN}✨ Done!${NC}\n"
