# App Icons

To complete the desktop app setup, you need to add icon files for each platform.

## Required Icon Files:

### macOS:
- **File:** `electron/icon.icns`
- **Format:** .icns (Apple Icon Image)
- **Sizes:** 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
- **Tool:** Use [Image2icon](https://img2icns.com/) or `iconutil` on Mac

### Windows:
- **File:** `electron/icon.ico`
- **Format:** .ico (Windows Icon)
- **Sizes:** 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- **Tool:** Use [IcoFX](https://icofx.ro/) or online converter

### Linux:
- **File:** `electron/icon.png`
- **Format:** .png
- **Size:** 512x512 or 1024x1024 (high resolution)
- **Note:** Can also be used as fallback for Mac/Windows

## Quick Setup (For Development):

1. **Create a simple 512x512 PNG logo** for your app
2. **Save as** `electron/icon.png`
3. **Convert to .ico and .icns** using online tools:
   - https://convertio.co/png-ico/
   - https://cloudconvert.com/png-to-icns

## Optional:

If you don't have icons yet, the app will still build but may use default Electron icon.

For production release, proper icons are recommended for a professional look.

## Recommended Icon Design:

- **Simple and recognizable** at small sizes
- **Solid background** (avoid transparency for Windows .ico)
- **Square aspect ratio** (will be cropped to circle on some platforms)
- **High contrast** so it's visible on both light and dark backgrounds

Example: A shipping container icon, cargo truck, or "SC" letters for Stream Cargo.
