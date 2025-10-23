// Type definitions for Electron APIs exposed via preload script

export interface PrinterInfo {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
  options: Record<string, any>;
}

export interface PrintResult {
  success: boolean;
  error?: string;
}

export interface ElectronAPI {
  isElectron: () => Promise<boolean>;
  printer: {
    getPrinters: () => Promise<PrinterInfo[]>;
    printDirect: (printerName: string, html: string) => Promise<PrintResult>;
    getPreferred: () => Promise<string | null>;
    setPreferred: (printerName: string) => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
