const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');

/**
 * Load environment variables from .env file
 * This allows us to configure URLs for different environments:
 * - NEXT_PUBLIC_FRONTEND_URL: Frontend app URL (for Electron to load)
 * - NEXT_PUBLIC_API_BASE_URL: Backend API URL (for axios API calls)
 *
 * Development:
 *   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
 *   NEXT_PUBLIC_API_BASE_URL=https://proxy-3r9s.onrender.com
 *
 * Production:
 *   NEXT_PUBLIC_FRONTEND_URL=https://crm-r88w.onrender.com
 *   NEXT_PUBLIC_API_BASE_URL=https://proxy-3r9s.onrender.com
 */
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Force production mode for packaged apps
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

let mainWindow;

/**
 * Get frontend URL from NEXT_PUBLIC_FRONTEND_URL environment variable
 * This is the URL where Electron will load the Next.js app
 * Falls back to NEXT_PUBLIC_ROOT_STATIC_URL for backwards compatibility
 *
 * @returns {string} Clean frontend URL (e.g., "http://localhost:3000")
 */
function getBaseUrl() {
  // Prefer new NEXT_PUBLIC_FRONTEND_URL, fallback to legacy NEXT_PUBLIC_ROOT_STATIC_URL
  const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXT_PUBLIC_ROOT_STATIC_URL;

  if (!envUrl) {
    console.error('⚠️ NEXT_PUBLIC_FRONTEND_URL not set in .env file!');
    console.error('💡 Using fallback URL. Please configure .env file for production builds.');
    // Fallback to default URLs
    return isDev ? 'http://localhost:3000' : 'https://crm-r88w.onrender.com';
  }

  // Clean up the URL (remove trailing slash, add protocol if missing)
  let cleanUrl = envUrl.trim().replace(/\/$/, '');

  // Add protocol if missing
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = isDev ? `http://${cleanUrl}` : `https://${cleanUrl}`;
  }

  console.log(`📡 Frontend URL from env: ${cleanUrl}`);
  return cleanUrl;
}

function getAppUrl() {
  const baseUrl = getBaseUrl();

  // Start at login, will auto-redirect to /check-coming after authentication
  return `${baseUrl}/login?redirect=%2Fcheck-coming`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // CRITICAL: Must be true for HTTPS remote content, but permissions still work
      webSecurity: true,
      // Performance optimizations
      backgroundThrottling: false,
      spellcheck: false,
      // Enable hardware acceleration for video
      offscreen: false,
      // Allow video autoplay
      autoplayPolicy: 'no-user-gesture-required',
    },
    title: 'Stream Cargo CRM',
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    backgroundColor: '#ffffff',
  });

  // CRITICAL: Handle ALL permission requests - grant automatically
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();
    console.log(`🔐 Permission requested: "${permission}" from "${url}"`);

    // Always grant these permissions
    const allowedPermissions = ['media', 'camera', 'microphone', 'mediaKeySystem', 'geolocation', 'notifications'];

    if (allowedPermissions.includes(permission)) {
      console.log(`✅ GRANTED: ${permission}`);
      callback(true);
    } else {
      console.log(`❌ DENIED: ${permission}`);
      callback(false);
    }
  });

  // CRITICAL: Handle permission checks (called before request)
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    console.log(`🔍 Permission check: "${permission}" from origin "${requestingOrigin}"`);

    // Always allow media permissions for any origin
    if (permission === 'media' || permission === 'camera' || permission === 'microphone') {
      console.log(`✅ CHECK PASSED: ${permission}`);
      return true;
    }

    // Also allow these
    const allowedPermissions = ['mediaKeySystem', 'geolocation', 'notifications'];
    const result = allowedPermissions.includes(permission);
    console.log(`${result ? '✅' : '❌'} CHECK ${result ? 'PASSED' : 'FAILED'}: ${permission}`);
    return result;
  });

  // Load the app with loading screen
  mainWindow.loadFile(path.join(__dirname, 'loading.html'));

  // Load actual app after showing loading screen
  setTimeout(async () => {
    // Check if we have auth token
    const { session } = require('electron');
    const cookies = await session.defaultSession.cookies.get({ name: 'token' });
    const hasToken = cookies.length > 0;

    const baseUrl = getBaseUrl();
    let appUrl;

    if (hasToken) {
      // Has token - go directly to check-coming
      appUrl = `${baseUrl}/check-coming`;
      console.log('✅ Auth token found - loading check-coming directly');
    } else {
      // No token - go to login first
      appUrl = getAppUrl();
      console.log('⚠️ No auth token - loading login page first');
    }

    console.log('Loading actual app:', appUrl);
    mainWindow.loadURL(appUrl);
  }, 1000); // Show loading for at least 1 second

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window immediately (loading screen will be visible)
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');

    // Inject code to help with camera access
    mainWindow.webContents.executeJavaScript(`
      (function() {
        console.log('🎥 Electron: Injecting camera helper');

        // Override navigator.mediaDevices to ensure it works
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = async function(constraints) {
            console.log('🎥 getUserMedia called with:', constraints);
            try {
              const stream = await originalGetUserMedia(constraints);
              // Don't log stream object directly - it can't be cloned
              console.log('✅ getUserMedia SUCCESS - Stream ID:', stream.id, 'Active:', stream.active);
              return stream;
            } catch (error) {
              console.error('❌ getUserMedia FAILED:', error.name, error.message);
              throw error;
            }
          };
        }

        // Return simple value to avoid cloning issues
        return 'Camera helper injected';
      })();
    `).then((result) => {
      console.log('✅', result);
    }).catch(err => {
      console.error('Failed to inject camera helper:', err);
    });
  });

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    // Retry loading after a delay
    setTimeout(() => {
      console.log('Retrying load...');
      const appUrl = getAppUrl();
      mainWindow.loadURL(appUrl);
    }, 2000);
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  // Performance optimizations
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  app.commandLine.appendSwitch('disable-background-timer-throttling');
  app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

  // Enable hardware acceleration for video
  app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
  app.commandLine.appendSwitch('enable-gpu-rasterization');

  // Enable video capture
  app.commandLine.appendSwitch('enable-usermedia-screen-capturing');

  // Autoplay policy
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

  // No server needed in production - just load static files!
  console.log('App mode:', isDev ? 'development' : 'production');
  if (!isDev) {
    console.log('Resources path:', process.resourcesPath);
    console.log('App path:', app.getAppPath());
  }

  // Enable persistent session for cookies
  const { session } = require('electron');
  const ses = session.defaultSession;

  // Log existing cookies on startup
  const cookies = await ses.cookies.get({});
  console.log('📦 Stored cookies on startup:', cookies.length);
  const hasToken = cookies.some(cookie => cookie.name === 'token');
  console.log('🔐 Has auth token:', hasToken);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Get list of available printers
ipcMain.handle('get-printers', async () => {
  try {
    if (!mainWindow) return [];
    const printers = mainWindow.webContents.getPrinters();
    console.log('Available printers:', printers);
    return printers.map(printer => ({
      name: printer.name,
      displayName: printer.displayName || printer.name,
      description: printer.description || '',
      status: printer.status || 0,
      isDefault: printer.isDefault || false,
      options: printer.options || {}
    }));
  } catch (error) {
    console.error('Error getting printers:', error);
    return [];
  }
});

// Print directly to a specific printer (silent print)
ipcMain.handle('print-direct', async (event, { printerName, html }) => {
  try {
    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    // Create a hidden window for printing
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load the HTML content
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Print options for Toshiba B-EV4D (60x40mm thermal label)
    const printOptions = {
      silent: true, // Don't show print dialog
      printBackground: true,
      deviceName: printerName,
      pageSize: {
        width: 60000,  // 60mm in microns (60mm * 1000)
        height: 40000, // 40mm in microns (40mm * 1000)
      },
      margins: {
        marginType: 'none',
      },
      dpi: {
        horizontal: 203, // Toshiba B-EV4D is typically 203 DPI
        vertical: 203,
      },
      scaleFactor: 100, // No scaling
    };

    // Print
    await printWindow.webContents.print(printOptions, (success, failureReason) => {
      if (!success) {
        console.error('Print failed:', failureReason);
      }
      printWindow.close();
    });

    return { success: true };
  } catch (error) {
    console.error('Error printing:', error);
    return { success: false, error: error.message };
  }
});

// Get saved printer preference
ipcMain.handle('get-preferred-printer', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();
    return store.get('preferred-printer', null);
  } catch (error) {
    console.error('Error getting preferred printer:', error);
    return null;
  }
});

// Save printer preference
ipcMain.handle('set-preferred-printer', async (event, printerName) => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();
    store.set('preferred-printer', printerName);
    return { success: true };
  } catch (error) {
    console.error('Error saving preferred printer:', error);
    return { success: false, error: error.message };
  }
});

// Check if running in Electron
ipcMain.handle('is-electron', async () => {
  return true;
});

console.log('Electron main process started');
console.log('Environment:', isDev ? 'development' : 'production');
