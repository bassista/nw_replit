import { useState, useCallback } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { isNative } from '@/lib/platform';

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);

  const startScan = useCallback(async (): Promise<string | null> => {
    if (!isNative()) {
      console.warn('Barcode scanner only available on native platforms');
      return null;
    }

    try {
      // Check permission
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (!status.granted) {
        if (status.denied) {
          // Permission permanently denied, user must enable it in settings
          console.error('Camera permission denied permanently');
          return null;
        }
        // Permission was denied but not permanently
        console.error('Camera permission not granted');
        return null;
      }

      // Prepare scanner (make background transparent)
      await BarcodeScanner.prepare();
      setIsScanning(true);

      // Hide background to show camera
      document.body.classList.add('scanner-active');
      
      // Add scanner UI overlay
      const scannerOverlay = document.createElement('div');
      scannerOverlay.className = 'scanner-ui';
      scannerOverlay.innerHTML = `
        <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; background: rgba(0,0,0,0.7); padding: 12px 24px; border-radius: 8px; color: white; font-size: 16px;">
          Inquadra il codice a barre
        </div>
        <button id="cancel-scan" style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 10000; background: #ef4444; color: white; padding: 12px 32px; border-radius: 8px; border: none; font-size: 16px; font-weight: 600;">
          Annulla
        </button>
      `;
      document.body.appendChild(scannerOverlay);

      // Handle cancel button
      const cancelButton = document.getElementById('cancel-scan');
      const cancelPromise = new Promise<null>((resolve) => {
        cancelButton?.addEventListener('click', () => {
          resolve(null);
        });
      });

      // Start scanning
      const result = await Promise.race([
        BarcodeScanner.startScan({ targetedFormats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39'] }),
        cancelPromise
      ]);

      // Clean up
      document.body.classList.remove('scanner-active');
      scannerOverlay.remove();
      await BarcodeScanner.stopScan();
      setIsScanning(false);

      if (result && typeof result === 'object' && 'hasContent' in result && result.hasContent) {
        return result.content || null;
      }

      return null;
    } catch (error) {
      console.error('Barcode scan error:', error);
      document.body.classList.remove('scanner-active');
      setIsScanning(false);
      await BarcodeScanner.stopScan().catch(() => {});
      return null;
    }
  }, []);

  const stopScan = useCallback(async () => {
    if (isScanning) {
      await BarcodeScanner.stopScan();
      document.body.classList.remove('scanner-active');
      const overlay = document.querySelector('.scanner-ui');
      overlay?.remove();
      setIsScanning(false);
    }
  }, [isScanning]);

  return {
    startScan,
    stopScan,
    isScanning
  };
}
