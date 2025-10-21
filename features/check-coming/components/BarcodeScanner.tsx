"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, Space, Typography, Alert, Spin } from "antd";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

const { Text } = Typography;

interface BarcodeScannerProps {
  onScan: (code: string, type: "qr" | "barcode") => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  autoStart = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerIdRef = useRef<string>("qr-reader");
  const hasStartedRef = useRef(false);

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
    };
  }, [autoStart]);

  const startScanner = () => {
    if (isScanning || scannerRef.current) return;

    setError("");
    setIsInitializing(true);

    try {
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

      scannerRef.current.render(
        (decodedText) => {
          // Success callback
          const type = decodedText.length > 20 ? "qr" : "barcode";
          onScan(decodedText, type);
        },
        (errorMessage) => {
          // Error callback - usually just means no QR/barcode found in frame
          // Don't show these to user as they're too noisy
          console.debug(errorMessage);
        }
      );

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

  if (isInitializing) {
    return (
      <Card>
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">
            <Text type="secondary">Đang khởi động camera...</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card bodyStyle={{ padding: 0 }}>
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

        <div
          id={scannerIdRef.current}
          style={{
            width: "100%",
            display: "block",
          }}
        />

        {isScanning && (
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
