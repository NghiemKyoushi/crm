"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, Space, Typography, Alert, Spin } from "antd";
import type { Html5QrcodeScanner as Html5QrcodeScannerType } from "html5-qrcode";

const { Text } = Typography;

interface BarcodeScannerProps {
  onScan: (code: string, type: "qr" | "barcode") => void;
  onError?: (error: string) => void;
  onCodeLeftView?: () => void;
  autoStart?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  onCodeLeftView,
  autoStart = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScannerType | null>(null);
  const scannerIdRef = useRef<string>("qr-reader");
  const hasStartedRef = useRef(false);
  const lastDetectedCodeRef = useRef<string | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const detectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoStart && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setTimeout(() => {
        startScanner();
      }, 500);
    }

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      // Cleanup detection check interval
      if (detectionCheckIntervalRef.current) {
        clearInterval(detectionCheckIntervalRef.current);
      }
    };
  }, [autoStart]);

  // Monitor if code has left the view
  useEffect(() => {
    if (!isScanning || !onCodeLeftView) return;

    // Check every 500ms if code is still in view
    detectionCheckIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastDetection = now - lastDetectionTimeRef.current;

      // If we had a code and it hasn't been detected for 1 second, it left the view
      if (lastDetectedCodeRef.current && timeSinceLastDetection > 1000) {
        console.log("📤 Code left view:", lastDetectedCodeRef.current);
        lastDetectedCodeRef.current = null;
        onCodeLeftView();
      }
    }, 500);

    return () => {
      if (detectionCheckIntervalRef.current) {
        clearInterval(detectionCheckIntervalRef.current);
      }
    };
  }, [isScanning, onCodeLeftView]);

  const startScanner = async () => {
    if (isScanning || scannerRef.current) return;

    setError("");
    setIsInitializing(true);

    try {
      // Dynamic import to avoid SSR issues
      const { Html5QrcodeScanner, Html5QrcodeScanType } = await import("html5-qrcode");

      // Initialize scanner
      scannerRef.current = new Html5QrcodeScanner(
        scannerIdRef.current,
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false
      );

      console.log("🎥 Calling scanner.render()...");

      scannerRef.current.render(
        (decodedText) => {
          // Success callback - code detected
          const type = decodedText.length > 20 ? "qr" : "barcode";

          // Update last detection time and code
          lastDetectionTimeRef.current = Date.now();
          lastDetectedCodeRef.current = decodedText;

          onScan(decodedText, type);
        },
        (errorMessage) => {
          // Error callback - usually just means no QR/barcode found in frame
          // Don't show these to user as they're too noisy
          console.debug(errorMessage);
        }
      );

      console.log("✅ Scanner.render() called");

      // Hide loading overlay immediately after render is called
      // DON'T wait - let scanner show its own UI
      setIsScanning(true);
      setIsInitializing(false);
    } catch (err: any) {
      console.error("Failed to start scanner:", err);
      setError("Failed to start scanner. Please check camera permissions.");
      setIsInitializing(false);
      if (onError) {
        onError("Failed to start scanner");
      }
    }
  };

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {error && (
          <Alert
            message="Scanner Error"
            description={error}
            type="error"
            closable
            onClose={() => setError("")}
            style={{ margin: 16 }}
          />
        )}

        {isInitializing && (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">
              <Text type="secondary">Đang khởi động camera...</Text>
            </div>
          </div>
        )}

        <div
          id={scannerIdRef.current}
          key="scanner-container"
          style={{
            width: "100%",
            minHeight: 400,
            display: "block",
          }}
        />

        {isScanning && !isInitializing && (
          <div className="text-center p-3 bg-blue-50">
            <Text type="secondary" style={{ fontSize: 13 }}>
              📷 Camera đang hoạt động - Đưa mã vào khung quét
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default BarcodeScanner;
