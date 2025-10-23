"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  List,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  ReloadOutlined,
  HistoryOutlined,
  BarcodeOutlined,
  PrinterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import BarcodeScanner from "../components/BarcodeScannerV2";
import PrintLabel from "../components/PrintLabel";
import { PackageInfo, CheckComingRecord } from "../types";
import { checkComingApi } from "../apis/check-coming.api";
import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { useElectronPrinter } from "../hooks/useElectronPrinter";

const { Title, Text } = Typography;

const CheckComingView: React.FC = () => {
  const { t } = useTranslation();
  const [packageCode, setPackageCode] = useState<string>("");
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [scanHistory, setScanHistory] = useState<PackageInfo[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [lastPrintedPackage, setLastPrintedPackage] = useState<PackageInfo | null>(null);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const lastScanRef = useRef<{ code: string; timestamp: number } | null>(null);
  const packageCodeRef = useRef<string>("");
  const isSubmittingRef = useRef<boolean>(false);
  const isCodeInViewRef = useRef<boolean>(false);

  // Electron printer support
  const { isElectron, printers, preferredPrinter, printDirect } = useElectronPrinter();

  // Load history from API on mount
  useEffect(() => {
    const init = async () => {
      await generatePackageCode();
      await loadHistory();
    };
    init();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await checkComingApi.getList(0, 50);
      if (response && response.content && Array.isArray(response.content)) {
        const records: PackageInfo[] = response.content.map((record: CheckComingRecord) => ({
          id: record.id,
          packageCode: record.package_code,
          trackingCode: record.tracking_code,
          senderName: record.sender_name,
          sentDate: record.sent_date,
          timestamp: record.created_at,
          status: "completed" as const,
        }));
        setScanHistory(records);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      // Don't crash - just log error and continue with empty history
      setScanHistory([]);
    }
  };

  const generatePackageCode = async () => {
    console.log("🔄 generatePackageCode called");
    try {
      const response = await api.get<{ data: string }>(API_TYPE_CONST.GEN_PACKAGE_CODE);
      const generatedCode = response.data.data;
      console.log("📦 Generated package code from API:", generatedCode);
      if (generatedCode) {
        setPackageCode(generatedCode);
        packageCodeRef.current = generatedCode;
        console.log("✅ Package code set to:", generatedCode);
      } else {
        throw new Error("Empty package code from API");
      }
      setTrackingCode("");
      lastScanRef.current = null;
    } catch (error) {
      console.error("❌ Failed to generate package code:", error);
      const randomCode = `PKG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      console.log("⚠️ Using fallback package code:", randomCode);
      setPackageCode(randomCode);
      packageCodeRef.current = randomCode;
      setTrackingCode("");
      lastScanRef.current = null;
    }
  };

  const handleCodeLeftView = () => {
    console.log("📤 Barcode left camera view - ready for next scan");
    isCodeInViewRef.current = false;
  };

  const handleScan = (code: string, type: "qr" | "barcode") => {
    const now = Date.now();

    // Check if this is the same code still in view
    if (lastScanRef.current && lastScanRef.current.code === code) {
      const timeDiff = now - lastScanRef.current.timestamp;

      // If code is still in view and recently scanned, ignore
      if (isCodeInViewRef.current && timeDiff < 5000) {
        console.log("🚫 Same code still in view, ignored:", code, "timeDiff:", timeDiff, "ms");
        return;
      }

      // If it's been more than 5 seconds, allow rescan (backup safety)
      if (timeDiff < 5000) {
        console.log("🚫 Duplicate scan ignored (time-based):", code, "timeDiff:", timeDiff, "ms");
        return;
      }
    }

    // Don't scan if a different code is still in view
    if (isCodeInViewRef.current && lastScanRef.current && lastScanRef.current.code !== code) {
      console.log("🚫 Another code still in view, wait for it to leave");
      return;
    }

    // Also check if already processing
    if (loading || isSubmittingRef.current) {
      console.log("🚫 Scan ignored - already processing");
      return;
    }

    console.log("📸 Scan detected:", code, "Current packageCode:", packageCodeRef.current);

    // Mark code as in view
    isCodeInViewRef.current = true;

    // Record this scan BEFORE calling submit
    lastScanRef.current = { code, timestamp: now };

    setTrackingCode(code);
    // Auto submit after scan
    setTimeout(() => {
      handleSubmit(code);
    }, 300);
  };

  const handleSubmit = async (code?: string) => {
    // Prevent submit if already processing
    if (loading || isSubmittingRef.current) {
      console.log("⏳ Already processing, ignoring submit (loading:", loading, "isSubmitting:", isSubmittingRef.current, ")");
      return;
    }

    const finalCode = code || trackingCode;
    const currentPackageCode = packageCodeRef.current;

    console.log("🔍 handleSubmit called - packageCode (state):", packageCode, "packageCode (ref):", currentPackageCode, "trackingCode:", finalCode);

    // Validate tracking code
    if (!finalCode || !finalCode.trim()) {
      console.error("❌ Tracking code is empty!");
      toast.error(t("checkComing.error.emptyTracking"));
      return;
    }

    // Validate package code using ref value
    if (!currentPackageCode || !currentPackageCode.trim()) {
      console.error("❌ Package code is empty! Current value:", currentPackageCode);
      toast.error(t("checkComing.error.emptyPackageCode"));
      return;
    }

    // Lock submission
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      // Call API to create record
      const now = new Date().toISOString();
      console.log("✅ Submitting with packageCode:", currentPackageCode, "trackingCode:", finalCode);

      const createdRecord = await checkComingApi.create({
        package_code: currentPackageCode,
        tracking_code: finalCode,
        sent_date: now,
        status: 0,
      });

      // Create entry for display and printing
      const newEntry: PackageInfo = {
        id: createdRecord.id,
        packageCode: createdRecord.package_code,
        trackingCode: createdRecord.tracking_code,
        senderName: createdRecord.sender_name,
        sentDate: createdRecord.sent_date,
        timestamp: createdRecord.created_at,
        status: "completed",
      };

      setLastPrintedPackage(newEntry); // Save for printing

      // Reload history from API instead of updating local state
      await loadHistory();

      // Show success effect
      setShowSuccessEffect(true);
      setTimeout(() => {
        setShowSuccessEffect(false);
      }, 2000);

      // Generate new package code for next scan
      await generatePackageCode();
    } catch (error: any) {
      console.error("Failed to create record:", error);
      if (error?.response?.status === 409) {
        toast.error("Mã kiện và mã tracking đã tồn tại!");
      } else {
        toast.error("Lỗi khi lưu dữ liệu");
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
      console.log("🔓 Submission unlocked");
    }
  };

  const handlePrint = async (packageInfo: PackageInfo) => {
    setLastPrintedPackage(packageInfo);

    if (isElectron && preferredPrinter) {
      // Electron: Direct print to thermal printer
      try {
        // Get the print label HTML
        const printElement = document.querySelector('.print-label');
        if (!printElement) {
          toast.error('Print template not found');
          return;
        }

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @page {
                  size: 60mm 40mm; /* Toshiba B-EV4D: 60x40mm */
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: "Courier New", monospace;
                  width: 60mm;
                  height: 40mm;
                  overflow: hidden;
                }
                ${document.querySelector('style')?.textContent || ''}
              </style>
            </head>
            <body>
              ${printElement.outerHTML}
            </body>
          </html>
        `;

        const result = await printDirect(html);

        if (result.success) {
          toast.success('In nhãn thành công!');
        } else {
          toast.error(`Lỗi in: ${result.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.error('Print error:', error);
        toast.error('Lỗi khi in nhãn');
      }
    } else {
      // Browser: Use window.print()
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) return;

    try {
      await checkComingApi.delete(id);
      // Reload history from API to ensure consistency
      await loadHistory();
      toast.success("Đã xóa thành công");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Lỗi khi xóa");
    }
  };

  const handleReset = () => {
    generatePackageCode();
  };

  // Auto focus input when not scanning
  useEffect(() => {
    if (!isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning, packageCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Effect Overlay */}
        {showSuccessEffect && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(82, 196, 26, 0.15)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeInOut 2s ease-in-out",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "40px 60px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                animation: "scaleIn 0.3s ease-out",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{
                    fontSize: 80,
                    color: "#52c41a",
                    marginBottom: 16,
                  }}
                />
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
                  ĐÃ GHI NHẬN!
                </div>
                <div style={{ fontSize: 16, color: "#666", marginTop: 8 }}>
                  Quét thành công
                </div>
              </div>
            </div>
          </div>
        )}

        <Row gutter={16}>
          {/* Main Scanning Area */}
          <Col xs={24} lg={16}>
            <Card className="shadow-lg" bodyStyle={{ padding: "32px" }}>
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Package Code - Large Display */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <Text className="text-white opacity-90 block mb-2" style={{ fontSize: 16, color: "white" }}>
                    {t("checkComing.label.packageCode")}
                  </Text>
                  <div className="flex items-center justify-center gap-3">
                    <Text
                      strong
                      className="text-white"
                      style={{ fontSize: 28, fontFamily: "monospace", color: "white" }}
                    >
                      {packageCode || "Đang tạo mã..."}
                    </Text>
                    <Button
                      type="text"
                      icon={<ReloadOutlined style={{ color: "white" }} />}
                      onClick={handleReset}
                      className="hover:bg-white/20"
                      disabled={!packageCode}
                    />
                  </div>
                </div>

                {/* Scanner Area */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Space>
                      <BarcodeOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                      <Text strong style={{ fontSize: 16 }}>
                        {t("checkComing.card.scanTitle")}
                      </Text>
                    </Space>
                    <Button
                      type={isScanning ? "primary" : "default"}
                      size="small"
                      onClick={() => setIsScanning(!isScanning)}
                    >
                      {isScanning ? "Scanner ON" : "Scanner OFF"}
                    </Button>
                  </div>

                  {isScanning ? (
                    <BarcodeScanner
                      onScan={handleScan}
                      onError={(err) => toast.error(err)}
                      onCodeLeftView={handleCodeLeftView}
                      autoStart={true}
                    />
                  ) : (
                    <div>
                      <Input
                        ref={inputRef}
                        size="large"
                        placeholder={t("checkComing.placeholder.tracking")}
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        onPressEnter={() => handleSubmit()}
                        prefix={<BarcodeOutlined style={{ color: "#1890ff" }} />}
                        style={{
                          fontSize: 18,
                          padding: "12px 16px",
                          borderRadius: 8,
                        }}
                        autoFocus
                      />
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleSubmit()}
                        className="mt-3"
                        style={{ height: 50, fontSize: 16 }}
                      >
                        {t("checkComing.button.confirm")}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <Alert
                  message={
                    <Text>
                      {isScanning
                        ? "🎯 Đưa mã QR/Barcode vào trước camera để quét tự động"
                        : "⌨️ Nhập mã tracking bằng tay và nhấn Enter hoặc nút Xác nhận"}
                    </Text>
                  }
                  type="info"
                  showIcon={false}
                  className="text-center"
                />
              </Space>
            </Card>
          </Col>

          {/* History Section - Compact */}
          <Col xs={24} lg={8}>
            <Card
              className="shadow-lg"
              title={
                <Space>
                  <HistoryOutlined />
                  <span>{t("checkComing.card.historyTitle")}</span>
                  <Badge count={scanHistory.length} showZero overflowCount={999} />
                </Space>
              }
              bodyStyle={{ padding: 0 }}
            >
              <List
                dataSource={scanHistory.slice(0, 15)}
                locale={{
                  emptyText: (
                    <div className="py-8">
                      <HistoryOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                      <div className="mt-2">
                        <Text type="secondary">{t("checkComing.empty.noHistory")}</Text>
                      </div>
                    </div>
                  ),
                }}
                renderItem={(item, index) => (
                  <List.Item
                    className="px-4 hover:bg-gray-50"
                    style={{
                      position: "relative",
                      paddingRight: 40,
                      paddingTop: 12,
                      paddingBottom: 12,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {/* Delete button - small, top right corner */}
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => item.id && handleDelete(item.id)}
                      size="small"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    />

                    <Space direction="vertical" style={{ width: "100%" }} size={8}>
                      <div style={{ width: "100%", display: "flex", alignItems: "center", paddingLeft: 8, paddingRight: 8 }}>
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center" style={{ flexShrink: 0 }}>
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        </div>
                        <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                          <Text strong ellipsis style={{ fontSize: 13, display: "block" }}>
                            {item.trackingCode}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                            {item.packageCode}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                            {new Date(item.timestamp).toLocaleTimeString("vi-VN")}
                          </Text>
                        </div>
                      </div>

                      {/* Print button - full width, smaller height */}
                      <div style={{ paddingLeft: 40 }}>
                        <Button
                          type="primary"
                          icon={<PrinterOutlined />}
                          onClick={() => handlePrint(item)}
                          block
                          style={{
                            height: 32,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          IN NHÃN
                        </Button>
                      </div>
                    </Space>
                  </List.Item>
                )}
                style={{ maxHeight: "calc(100vh - 280px)", overflow: "auto" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Hidden Print Label */}
        {lastPrintedPackage && <PrintLabel packageInfo={lastPrintedPackage} />}

        {/* Success Animation Styles */}
        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
          }

          @keyframes scaleIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CheckComingView;
