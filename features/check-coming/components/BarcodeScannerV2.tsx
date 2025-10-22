"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, Space, Typography, Alert, Spin, Button } from "antd";
import type { Html5Qrcode } from "html5-qrcode";

const { Text } = Typography;

interface BarcodeScannerProps {
  onScan: (code: string, type: "qr" | "barcode") => void;
  onError?: (error: string) => void;
  onCodeLeftView?: () => void;
  autoStart?: boolean;
}

const BarcodeScannerV2: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  onCodeLeftView,
  autoStart = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef<string>("qr-reader-v2");
  const hasStartedRef = useRef(false);
  const lastDetectedCodeRef = useRef<string | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const detectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedCodeRef = useRef<string | null>(null);
  const lastReportTimeRef = useRef<number>(0);

  useEffect(() => {
    if (autoStart && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setTimeout(() => {
        startScanner();
      }, 500);
    }

    return () => {
      // Cleanup scanner on unmount
      stopScanner();
      // Cleanup detection check interval
      if (detectionCheckIntervalRef.current) {
        clearInterval(detectionCheckIntervalRef.current);
      }
    };
  }, [autoStart]);

  // Monitor if code has left the view
  useEffect(() => {
    if (!isScanning || !onCodeLeftView) return;

    detectionCheckIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastDetection = now - lastDetectionTimeRef.current;

      if (lastDetectedCodeRef.current && timeSinceLastDetection > 1000) {
        console.log("📤 Code left view:", lastDetectedCodeRef.current);
        lastDetectedCodeRef.current = null;
        lastReportedCodeRef.current = null; // Reset to allow re-scan
        onCodeLeftView();
      }
    }, 500);

    return () => {
      if (detectionCheckIntervalRef.current) {
        clearInterval(detectionCheckIntervalRef.current);
      }
    };
  }, [isScanning, onCodeLeftView]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        console.log("📷 Scanner stopped");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    if (isScanning || scannerRef.current) return;

    setError("");
    setIsInitializing(true);

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      console.log("🎥 Initializing Html5Qrcode...");

      scannerRef.current = new Html5Qrcode(scannerIdRef.current);

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 },
      };

      await scannerRef.current.start(
        { facingMode: "environment" }, // Use rear camera if available
        config,
        (decodedText) => {
          const now = Date.now();

          // Debounce: Only report same code once every 5 seconds
          if (
            lastReportedCodeRef.current === decodedText &&
            now - lastReportTimeRef.current < 5000
          ) {
            console.log("🚫 Duplicate detection ignored:", decodedText, "within 5s");
            return;
          }

          // Update last detection time and code
          lastDetectionTimeRef.current = now;
          lastDetectedCodeRef.current = decodedText;
          lastReportedCodeRef.current = decodedText;
          lastReportTimeRef.current = now;

          const type = decodedText.length > 20 ? "qr" : "barcode";
          console.log("📸 Code scanned and reported:", decodedText);
          onScan(decodedText, type);
        },
        (errorMessage) => {
          // Error callback - usually just means no QR/barcode found in frame
          // Don't show these to user as they're too noisy
          // console.debug(errorMessage);
        }
      );

      console.log("✅ Scanner started successfully");
      setIsScanning(true);
      setIsInitializing(false);
    } catch (err: any) {
      console.error("Failed to start scanner:", err);
      setError(`Failed to start scanner: ${err.message}`);
      setIsInitializing(false);
      if (onError) {
        onError("Failed to start scanner");
      }
    }
  };

  return (
    <>
      <style>{`
        #${scannerIdRef.current} video {
          width: 100% !important;
          height: auto !important;
          display: block !important;
          border-radius: 8px;
        }
        #${scannerIdRef.current} canvas {
          display: none !important;
        }
        #${scannerIdRef.current} {
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
      <Card styles={{ body: { padding: 0 } }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
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
          style={{
            width: "100%",
            minHeight: isInitializing ? 0 : 400,
            display: isInitializing ? "none" : "block",
          }}
        >
          {/* Html5Qrcode will inject video element here */}
        </div>

        {isScanning && !isInitializing && (
          <div className="text-center p-3 bg-blue-50">
            <Text type="secondary" style={{ fontSize: 13 }}>
              📷 Camera đang hoạt động - Đưa mã vào khung quét
            </Text>
          </div>
        )}
      </Space>
    </Card>
    </>
  );
};

export default BarcodeScannerV2;
