const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Check if running in Electron
  isElectron: () => ipcRenderer.invoke('is-electron'),

  // Printer APIs
  printer: {
    // Get list of available printers
    getPrinters: () => ipcRenderer.invoke('get-printers'),

    // Print directly to a specific printer (silent, no dialog)
    printDirect: (printerName, html) =>
      ipcRenderer.invoke('print-direct', { printerName, html }),

    // Get saved printer preference
    getPreferred: () => ipcRenderer.invoke('get-preferred-printer'),

    // Save printer preference
    setPreferred: (printerName) =>
      ipcRenderer.invoke('set-preferred-printer', printerName),
  },
});

console.log('Electron preload script loaded');
