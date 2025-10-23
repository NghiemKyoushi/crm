import { useState, useEffect } from 'react';
import { PrinterInfo } from '@/types/electron';

export const useElectronPrinter = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [preferredPrinter, setPreferredPrinter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkElectron = async () => {
      try {
        if (typeof window !== 'undefined' && window.electron) {
          const isElectronEnv = await window.electron.isElectron();
          setIsElectron(isElectronEnv);

          if (isElectronEnv) {
            // Load printers
            const printerList = await window.electron.printer.getPrinters();
            setPrinters(printerList);

            // Load preferred printer
            const preferred = await window.electron.printer.getPreferred();
            setPreferredPrinter(preferred);
          }
        }
      } catch (error) {
        console.error('Error checking Electron environment:', error);
      } finally {
        setLoading(false);
      }
    };

    checkElectron();
  }, []);

  const refreshPrinters = async () => {
    if (!isElectron || !window.electron) return;

    try {
      const printerList = await window.electron.printer.getPrinters();
      setPrinters(printerList);
    } catch (error) {
      console.error('Error refreshing printers:', error);
    }
  };

  const printDirect = async (html: string, printerName?: string) => {
    if (!isElectron || !window.electron) {
      // Fallback to browser print
      window.print();
      return { success: true };
    }

    try {
      const targetPrinter = printerName || preferredPrinter;

      if (!targetPrinter) {
        throw new Error('No printer selected');
      }

      const result = await window.electron.printer.printDirect(targetPrinter, html);
      return result;
    } catch (error: any) {
      console.error('Error printing:', error);
      return { success: false, error: error.message };
    }
  };

  const savePreferredPrinter = async (printerName: string) => {
    if (!isElectron || !window.electron) return { success: false };

    try {
      const result = await window.electron.printer.setPreferred(printerName);
      if (result.success) {
        setPreferredPrinter(printerName);
      }
      return result;
    } catch (error: any) {
      console.error('Error saving preferred printer:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    isElectron,
    printers,
    preferredPrinter,
    loading,
    refreshPrinters,
    printDirect,
    savePreferredPrinter,
  };
};
