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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef<string>("qr-reader-v2");
  const hasStartedRef = useRef(false);
  const lastDetectedCodeRef = useRef<string | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const detectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedCodeRef = useRef<string | null>(null);
  const lastReportTimeRef = useRef<number>(0);
  const videoMonitorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor video element to ensure it's playing
  useEffect(() => {
    if (!isScanning) {
      if (videoMonitorIntervalRef.current) {
        clearInterval(videoMonitorIntervalRef.current);
        videoMonitorIntervalRef.current = null;
      }
      return;
    }

    // Check video element every 2 seconds
    videoMonitorIntervalRef.current = setInterval(() => {
      const containerElement = document.getElementById(scannerIdRef.current);
      if (containerElement) {
        const videoElement = containerElement.querySelector('video') as HTMLVideoElement;
        if (videoElement) {
          // If video is paused, try to play it
          if (videoElement.paused && videoElement.srcObject) {
            console.log('⚠️ Video is paused, attempting to play...');
            videoElement.play().catch((err: any) => {
              console.error('Failed to play video:', err);
            });
          }

          // Check if video is black (no actual video data)
          if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            console.warn('⚠️ Video has no dimensions:', {
              videoWidth: videoElement.videoWidth,
              videoHeight: videoElement.videoHeight,
            });
          }
        }
      }
    }, 2000);

    return () => {
      if (videoMonitorIntervalRef.current) {
        clearInterval(videoMonitorIntervalRef.current);
      }
    };
  }, [isScanning]);

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

    // CRITICAL: Force cleanup all video streams
    try {
      const containerElement = document.getElementById(scannerIdRef.current);
      if (containerElement) {
        const videoElement = containerElement.querySelector('video') as HTMLVideoElement;
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            track.stop();
            console.log("🛑 Stopped track:", track.label);
          });
          videoElement.srcObject = null;
        }
      }
    } catch (err) {
      console.error("Error cleaning up video streams:", err);
    }

    setIsScanning(false);
  };

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      // Check if we can access camera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');

      if (!hasCamera) {
        console.error('No camera device found');
        return false;
      }

      // Try to get permission state
      if ('permissions' in navigator) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          console.log('Camera permission status:', permissionStatus.state);

          if (permissionStatus.state === 'denied') {
            setPermissionDenied(true);
            return false;
          }
        } catch (err) {
          // Permission query might not be supported, continue anyway
          console.log('Permission query not supported, will try to access camera directly');
        }
      }

      return true;
    } catch (err) {
      console.error('Error checking camera permission:', err);
      return true; // Continue anyway if check fails
    }
  };

  const startScanner = async () => {
    if (isScanning) {
      console.warn("⚠️ Scanner already running, ignoring start request");
      return;
    }

    // Force cleanup any existing scanner
    if (scannerRef.current) {
      console.log("🧹 Cleaning up existing scanner before restart...");
      try {
        // Just stop, don't wait for full cleanup
        await scannerRef.current.stop();
        scannerRef.current = null;
        // Wait a bit for camera to be released
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (err) {
        // Ignore cleanup errors, scanner might not be running
        console.log("ℹ️ Cleanup skipped (scanner not running)");
        scannerRef.current = null;
      }
    }

    setError("");
    setPermissionDenied(false);
    setIsInitializing(true);

    try {
      // Check camera permission first
      const hasPermission = await checkCameraPermission();
      if (!hasPermission) {
        setError("Camera permission is required to scan barcodes");
        setIsInitializing(false);
        setPermissionDenied(true);
        if (onError) {
          onError("Camera permission denied");
        }
        return;
      }

      // Note: No need to manually cleanup media streams
      // Html5Qrcode will handle this when calling start()

      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      console.log("🎥 Initializing Html5Qrcode...");

      scannerRef.current = new Html5Qrcode(scannerIdRef.current);

      const config = {
        fps: 10,
        qrbox: { width: 200, height: 200 }, // Reduced from 280x280
        aspectRatio: 1.0,
        disableFlip: false,
      };

      // Get available cameras for logging
      let videoDevices: MediaDeviceInfo[] = [];
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log("📹 Available cameras:", videoDevices.map(d => ({ label: d.label, deviceId: d.deviceId })));
      } catch (err) {
        console.warn("Could not enumerate devices:", err);
      }

      // Try to start camera with simple constraint first
      // Don't use complex retry logic as it causes state transition errors
      const cameraConstraints = videoDevices.length > 0
        ? { deviceId: videoDevices[0].deviceId }
        : { video: true };

      console.log(`🎥 Starting camera with constraints:`, cameraConstraints);

      await scannerRef.current.start(
        cameraConstraints,
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

      // DEBUG: Check if video element is created and visible
      console.log("🔍 DEBUG: Checking video element after scanner start...");
      setTimeout(() => {
        const containerElement = document.getElementById(scannerIdRef.current);
        console.log("📦 Container element:", containerElement);

        if (containerElement) {
          const videoElement = containerElement.querySelector('video');
          console.log("🎥 Video element:", videoElement);

          if (videoElement) {
            console.log("📊 Video dimensions:", {
              width: videoElement.videoWidth,
              height: videoElement.videoHeight,
              clientWidth: videoElement.clientWidth,
              clientHeight: videoElement.clientHeight,
              offsetWidth: videoElement.offsetWidth,
              offsetHeight: videoElement.offsetHeight,
              style: videoElement.getAttribute('style'),
            });

            // Check if video has a stream
            if (videoElement.srcObject) {
              const stream = videoElement.srcObject as MediaStream;
              console.log("📡 Video stream:", {
                id: stream.id,
                active: stream.active,
                tracks: stream.getTracks().map(track => ({
                  kind: track.kind,
                  enabled: track.enabled,
                  muted: track.muted,
                  readyState: track.readyState,
                  label: track.label,
                }))
              });
            } else {
              console.error("❌ Video element has no srcObject!");
            }

            // Force video to be visible and playing
            videoElement.style.display = 'block';
            videoElement.style.visibility = 'visible';
            videoElement.style.opacity = '1';
            videoElement.style.width = '100%';
            videoElement.style.height = 'auto';

            // CRITICAL: Force video to play (Electron sometimes doesn't autoplay)
            if (videoElement.paused) {
              console.log('🎬 Video is paused, forcing play...');
              videoElement.play()
                .then(() => console.log('✅ Video playing'))
                .catch(err => console.error('❌ Failed to play video:', err));
            }

            // Add event listeners to monitor video state
            videoElement.addEventListener('loadedmetadata', () => {
              console.log('📺 Video metadata loaded:', {
                width: videoElement.videoWidth,
                height: videoElement.videoHeight,
              });
            });

            videoElement.addEventListener('playing', () => {
              console.log('▶️ Video is playing');
            });

            videoElement.addEventListener('pause', () => {
              console.warn('⏸️ Video paused unexpectedly');
            });

            videoElement.addEventListener('error', (e) => {
              console.error('❌ Video error:', e);
            });
          } else {
            console.error("❌ No video element found in container!");
          }
        } else {
          console.error("❌ Container element not found!");
        }
      }, 1000);

      console.log("✅ Scanner started successfully");
      setIsScanning(true);
      setIsInitializing(false);
      setPermissionDenied(false);
    } catch (err: any) {
      console.error("Failed to start scanner:", err);

      // Check error type and provide helpful messages
      if (err.name === 'NotAllowedError' || err.message.includes('Permission') || err.message.includes('permission')) {
        setError("Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera trong cài đặt.");
        setPermissionDenied(true);
        if (onError) {
          onError("Camera permission denied");
        }
      } else if (err.name === 'NotReadableError' || err.message.includes('Could not start video source')) {
        setError("Camera đang được sử dụng bởi ứng dụng khác hoặc bị lỗi. Vui lòng:\n1. Đóng các ứng dụng khác đang sử dụng camera\n2. Khởi động lại ứng dụng\n3. Nếu vẫn lỗi, hãy khởi động lại máy tính");
        if (onError) {
          onError("Camera busy or not readable");
        }
      } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
        setError("Không tìm thấy camera. Vui lòng kiểm tra xem camera có được kết nối không.");
        if (onError) {
          onError("Camera not found");
        }
      } else {
        setError(`Không thể khởi động camera: ${err.message}\n\nVui lòng thử:\n1. Tắt Scanner và bật lại\n2. Khởi động lại ứng dụng\n3. Kiểm tra camera trong System Preferences`);
        if (onError) {
          onError("Failed to start scanner");
        }
      }
      setIsInitializing(false);
    }
  };

  return (
    <>
      <style>{`
        #${scannerIdRef.current} {
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          min-height: 280px;
          max-width: 100%;
        }

        #${scannerIdRef.current} video {
          width: 100% !important;
          height: auto !important;
          max-height: 350px !important;
          display: block !important;
          border-radius: 8px;
          object-fit: cover !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          z-index: 1 !important;
          background: #000 !important;
        }

        #${scannerIdRef.current} canvas {
          display: none !important;
        }

        /* Ensure the container has the right layout */
        #${scannerIdRef.current} > div {
          width: 100% !important;
          position: relative !important;
        }
      `}</style>
      <Card styles={{ body: { padding: 0 } }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {error && (
          <Alert
            message={permissionDenied ? "Cần quyền truy cập Camera" : "Lỗi Scanner"}
            description={
              <div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{error}</div>
                <Button
                  type="primary"
                  onClick={startScanner}
                  style={{ marginTop: 12 }}
                  disabled={isInitializing}
                >
                  Thử lại
                </Button>
              </div>
            }
            type={permissionDenied ? "warning" : "error"}
            closable
            onClose={() => {
              setError("");
              setPermissionDenied(false);
            }}
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
            minHeight: isInitializing ? 0 : 280,
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
