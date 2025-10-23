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
  Modal,
  Checkbox,
  Table,
  InputNumber,
  Upload,
  Image,
} from "antd";
import {
  CheckCircleOutlined,
  ReloadOutlined,
  HistoryOutlined,
  BarcodeOutlined,
  PrinterOutlined,
  DeleteOutlined,
  WarningOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import BarcodeScanner from "../components/BarcodeScannerV2";
import PrintLabel from "../components/PrintLabel";
import { PackageInfo, CheckComingRecord, OrderInfo, ScanTrackingResponse, RelatedOrderInfo } from "../types";
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

  // Order list management
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrders, setCurrentOrders] = useState<OrderInfo[]>([]);
  const [currentTrackingCode, setCurrentTrackingCode] = useState<string>("");
  const [processingOrders, setProcessingOrders] = useState(false);

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
          code: record.code, // Map code field for barcode (API v2.0.0)
          relatedOrders: record.related_orders || [], // Map related_orders (API v2.0.0)
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
    // Prevent submit if already processing or modal is open
    if (loading || isSubmittingRef.current || showOrderModal) {
      console.log("⏳ Already processing or modal open, ignoring submit");
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
      const now = new Date().toISOString();
      console.log("📝 Creating check_coming record first...");

      // BƯỚC 1: Insert vào check_coming NGAY LẬP TỨC
      const createdRecord = await checkComingApi.create({
        package_code: currentPackageCode,
        tracking_code: finalCode,
        sent_date: now,
        status: 0,
      });

      console.log("✅ Check_coming created with ID:", createdRecord.id);

      // BƯỚC 2: Lấy related_orders từ response (API v2.0.0)
      const relatedOrders = createdRecord.related_orders || [];
      console.log("📋 Found", relatedOrders.length, "related orders");

      // Create PackageInfo for printing
      const newEntry: PackageInfo = {
        id: createdRecord.id,
        packageCode: createdRecord.package_code,
        trackingCode: createdRecord.tracking_code,
        senderName: createdRecord.sender_name,
        sentDate: createdRecord.sent_date,
        timestamp: createdRecord.created_at,
        status: "completed",
        code: createdRecord.code,
        relatedOrders: relatedOrders,
      };

      setLastPrintedPackage(newEntry);

      // BƯỚC 3: Filter chỉ lấy orders ở trạng thái ARRIVED_JP_WAREHOUSE
      const arrivedOrders = relatedOrders.filter(
        (order) => order.status === "ARRIVED_JP_WAREHOUSE"
      );
      console.log(`📋 Found ${arrivedOrders.length}/${relatedOrders.length} orders at ARRIVED_JP_WAREHOUSE`);

      if (arrivedOrders.length > 0) {
        // BƯỚC 4: Phân loại orders thành auto-done và cần làm
        const mappedOrders = arrivedOrders.map((order) => ({
          id: order.order_id,
          order_code: order.invoice_no || `#${order.order_id}`,
          tracking_code: finalCode,
          // Requirements
          take_photo: order.take_photo,
          is_repacked: order.is_repacked,
          is_verify_count: order.is_verify_count,
          status: order.status,
          // Metadata - actual values
          metadata: order.metadata,
        }));

        // BƯỚC 5: Auto-done những orders không có yêu cầu gì
        // Chỉ true mới là có yêu cầu, false/null đều là không có yêu cầu
        const ordersNeedWork = mappedOrders.filter(
          (order) => order.take_photo === true || order.is_repacked === true || order.is_verify_count === true
        );
        const autoCompleteOrders = mappedOrders.filter(
          (order) => order.take_photo !== true && order.is_repacked !== true && order.is_verify_count !== true
        );

        console.log(`✅ Auto-complete ${autoCompleteOrders.length} orders (no requirements)`);
        console.log(`📝 Need work: ${ordersNeedWork.length} orders`);

        // Auto-complete orders không có yêu cầu gì (background)
        if (autoCompleteOrders.length > 0) {
          Promise.all(
            autoCompleteOrders.map((order) =>
              checkComingApi.completeOrderArrivedVN(order.id, {
                count_verify: 0,
                image_ids: [],
                is_repacked: false,
              }).catch((err) => console.error(`Failed to auto-complete order ${order.id}:`, err))
            )
          );
        }

        // BƯỚC 6: Hiển thị modal chỉ cho orders cần làm
        if (ordersNeedWork.length > 0) {
          setCurrentOrders(ordersNeedWork);
          setCurrentTrackingCode(finalCode);
          setShowOrderModal(true);
          toast.info(`Cần xử lý ${ordersNeedWork.length} đơn hàng`);
        } else {
          toast.success(`Tự động hoàn thành ${autoCompleteOrders.length} đơn hàng!`);
        }
      } else {
        // BƯỚC 7: Không có orders ở ARRIVED_JP_WAREHOUSE → chỉ reload history
        console.log("✅ No orders at ARRIVED_JP_WAREHOUSE");

        // Show success effect
        setShowSuccessEffect(true);
        setTimeout(() => {
          setShowSuccessEffect(false);
        }, 2000);

        toast.success("Đã ghi nhận thành công! (Không có đơn hàng)");
      }

      // Reload history để hiển thị record mới
      await loadHistory();

      // Generate new package code for next scan
      await generatePackageCode();
    } catch (error: any) {
      console.error("Failed to create check_coming:", error);
      if (error?.response?.status === 409) {
        toast.error("Mã kiện và mã tracking đã tồn tại!");
      } else {
        toast.error(error?.response?.data?.message || "Lỗi khi lưu dữ liệu");
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

  // Handle click on history item - mở lại modal với orders
  const handleHistoryItemClick = (item: PackageInfo) => {
    const orders = item.relatedOrders || [];

    if (orders.length > 0) {
      // Filter chỉ lấy orders ở ARRIVED_JP_WAREHOUSE và cần làm
      // Chỉ true mới là có yêu cầu
      const arrivedOrders = orders.filter(
        (order) => order.status === "ARRIVED_JP_WAREHOUSE" &&
          (order.take_photo === true || order.is_repacked === true || order.is_verify_count === true)
      );

      if (arrivedOrders.length > 0) {
        // Có orders cần làm → mở modal
        setCurrentOrders(
          arrivedOrders.map((order) => ({
            id: order.order_id,
            order_code: order.invoice_no || `#${order.order_id}`,
            tracking_code: item.trackingCode || "",
            // Requirements
            take_photo: order.take_photo,
            is_repacked: order.is_repacked,
            is_verify_count: order.is_verify_count,
            status: order.status,
            // Metadata - actual values
            metadata: order.metadata,
          }))
        );
        setCurrentTrackingCode(item.trackingCode || "");
        setShowOrderModal(true);
        toast.info(`Mở lại ${arrivedOrders.length} đơn hàng`);
      } else {
        toast.info("Tất cả đơn hàng đã hoàn thành hoặc không cần xử lý");
      }
    }
  };

  // Handle order field update - update metadata
  const handleOrderFieldUpdate = async (
    orderId: number,
    metadataField: "verify_counts" | "is_repacked" | "inspection_photo_ids",
    value: number | boolean | number[]
  ) => {
    setProcessingOrders(true);
    try {
      // Map metadata field to API field
      const apiFieldMap: Record<string, string> = {
        verify_counts: "verify_count_value",
        is_repacked: "is_repacked_done",
        inspection_photo_ids: "document_image_ids", // API vẫn dùng document_image_ids
      };
      const apiField = apiFieldMap[metadataField];

      // Call API to update order
      await checkComingApi.updateOrderArrivedVN(orderId, {
        [apiField]: value,
      });

      // Update local state - update metadata object
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              metadata: {
                ...order.metadata,
                [metadataField]: value,
              },
            };
          }
          return order;
        })
      );

      console.log(`✅ Updated order ${orderId} metadata.${metadataField} to`, value);
    } catch (error: any) {
      console.error("Failed to update order:", error);
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật đơn hàng");
    } finally {
      setProcessingOrders(false);
    }
  };

  // Handle upload image - update metadata.inspection_photo_ids
  const handleUploadImage = async (orderId: number, file: File) => {
    setProcessingOrders(true);
    try {
      // Upload image
      const uploadResult = await checkComingApi.uploadImage(file, 1);
      const imageId = uploadResult.id;

      console.log(`✅ Uploaded image ID: ${imageId} for order ${orderId}`);

      // Get current images from metadata
      const currentOrder = currentOrders.find((o) => o.id === orderId);
      const currentImages = currentOrder?.metadata?.inspection_photo_ids || [];
      const newImages = [...currentImages, imageId];

      // Update order with new image ID in metadata.inspection_photo_ids
      await handleOrderFieldUpdate(orderId, "inspection_photo_ids", newImages);

      toast.success("Upload ảnh thành công!");
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      toast.error("Lỗi khi upload ảnh");
    } finally {
      setProcessingOrders(false);
    }
  };

  // Check if single order is ready for Done - based on metadata
  const isOrderReadyForDone = (order: OrderInfo) => {
    // Nếu có yêu cầu take_photo (= true) thì BẮT BUỘC phải có ảnh trong metadata.inspection_photo_ids
    // false hoặc null = không có yêu cầu = OK
    const photoOk = order.take_photo !== true ||
      (order.metadata?.inspection_photo_ids && order.metadata.inspection_photo_ids.length > 0);

    // Nếu có yêu cầu repack (= true) thì phải có metadata.is_repacked = true
    const repackOk = order.is_repacked !== true || order.metadata?.is_repacked === true;

    // Nếu có yêu cầu verify_count (= true) thì phải có metadata.verify_counts > 0
    const countOk = order.is_verify_count !== true ||
      (order.metadata?.verify_counts != null && order.metadata.verify_counts > 0);

    return photoOk && repackOk && countOk;
  };

  // Check if all orders are ready for Done
  const areAllOrdersReady = () => {
    return currentOrders.every((order) => isOrderReadyForDone(order));
  };

  // Handle mark order as done - use metadata
  const handleMarkOrderDone = async (order: OrderInfo) => {
    if (!isOrderReadyForDone(order)) {
      toast.warning("Vui lòng hoàn thành tất cả yêu cầu trước khi Done");
      return;
    }

    setProcessingOrders(true);
    try {
      // Chuẩn bị data từ metadata
      const imageIds = order.metadata?.inspection_photo_ids || [];
      const verifyCount = order.metadata?.verify_counts || 0;
      const isRepacked = order.metadata?.is_repacked || false;

      await checkComingApi.completeOrderArrivedVN(order.id, {
        count_verify: verifyCount,
        image_ids: imageIds,
        is_repacked: isRepacked,
      });

      console.log(`✅ Order ${order.id} marked as done`);

      // Remove from current orders (đã xong)
      setCurrentOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));

      // Reload history để cập nhật trạng thái
      await loadHistory();

      toast.success(`Đơn hàng ${order.order_code} đã hoàn thành!`);

      // Nếu không còn orders nào → tự động đóng modal
      if (currentOrders.length === 1) {
        setShowOrderModal(false);
        setCurrentTrackingCode("");

        // Show success effect
        setShowSuccessEffect(true);
        setTimeout(() => {
          setShowSuccessEffect(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Failed to mark order as done:", error);
      toast.error(error?.response?.data?.message || "Lỗi khi hoàn thành đơn hàng");
    } finally {
      setProcessingOrders(false);
    }
  };

  // Handle confirm all orders completed (close modal if no remaining orders)
  const handleConfirmOrders = async () => {
    if (currentOrders.length > 0) {
      toast.warning("Vui lòng Done từng đơn hàng trước khi đóng");
      return;
    }

    // Tất cả orders đã Done → đóng modal
    setShowOrderModal(false);
    setCurrentOrders([]);
    setCurrentTrackingCode("");

    // Reload history để cập nhật trạng thái
    await loadHistory();

    // Show success effect
    setShowSuccessEffect(true);
    setTimeout(() => {
      setShowSuccessEffect(false);
    }, 2000);

    toast.success("Đã hoàn thành tất cả đơn hàng!");
  };

  // Handle modal close
  const handleCloseModal = () => {
    if (processingOrders) return;

    // Nếu còn orders trong list → cảnh báo (vì orders đã Done sẽ bị remove)
    if (currentOrders.length > 0) {
      Modal.confirm({
        title: "Bạn có chắc muốn đóng?",
        content: `Còn ${currentOrders.length} đơn hàng chưa hoàn thành. Bạn có muốn đóng không?`,
        okText: "Đóng",
        cancelText: "Hủy",
        onOk: () => {
          setShowOrderModal(false);
          setCurrentOrders([]);
          setCurrentTrackingCode("");
        },
      });
    } else {
      // Không còn orders → đóng luôn
      setShowOrderModal(false);
      setCurrentOrders([]);
      setCurrentTrackingCode("");
    }
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
                        ? "Đưa mã QR/Barcode vào trước camera để quét tự động"
                        : "Nhập mã tracking bằng tay và nhấn Enter hoặc nút Xác nhận"}
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
                renderItem={(item, index) => {
                  // Kiểm tra xem có orders không (hiển thị button tương ứng)
                  const hasOrders = item.relatedOrders && item.relatedOrders.length > 0;

                  return (
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
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            flexShrink: 0,
                            backgroundColor: "#f6ffed",
                          }}
                        >
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

                          {/* Display related orders from API v2.0.0 if available */}
                          {item.relatedOrders && item.relatedOrders.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary" style={{ fontSize: 10, display: "block" }}>
                                <Badge
                                  count={item.relatedOrders.length}
                                  style={{ backgroundColor: "#1890ff" }}
                                />
                                <span style={{ marginLeft: 4 }}>
                                  {item.relatedOrders.map(o => `#${o.order_id}`).join(", ")}
                                </span>
                              </Text>
                            </div>
                          )}

                          {/* Display scan tracking orders if available (for backward compatibility) */}
                          {item.orders && item.orders.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary" style={{ fontSize: 10, display: "block" }}>
                                <Badge count={item.orders.length} style={{ backgroundColor: "#52c41a" }} />
                                <span style={{ marginLeft: 4 }}>
                                  {item.orders.map(o => o.order_code).join(", ")}
                                </span>
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ paddingLeft: 40, display: "flex", gap: 8 }}>
                        {/* Button xem orders nếu có */}
                        {hasOrders && (
                          <Button
                            type="default"
                            icon={<BarcodeOutlined />}
                            onClick={() => handleHistoryItemClick(item)}
                            block
                            style={{
                              height: 32,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            XEM ĐƠN HÀNG
                          </Button>
                        )}

                        {/* Print button */}
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
                  );
                }}
                style={{ maxHeight: "calc(100vh - 280px)", overflow: "auto" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Order List Modal */}
        <Modal
          title={
            <Space>
              <BarcodeOutlined style={{ color: "#1890ff" }} />
              <span>Danh sách đơn hàng - {currentTrackingCode}</span>
            </Space>
          }
          open={showOrderModal}
          onCancel={handleCloseModal}
          width={1200}
          footer={
            <Space>
              <Text type="secondary">
                Còn lại: <strong>{currentOrders.length}</strong> đơn hàng
              </Text>
              <Button onClick={handleCloseModal} disabled={processingOrders}>
                Đóng
              </Button>
              {currentOrders.length === 0 && (
                <Button
                  type="primary"
                  onClick={handleConfirmOrders}
                  loading={processingOrders}
                  icon={<CheckCircleOutlined />}
                >
                  Hoàn thành
                </Button>
              )}
            </Space>
          }
          closable={!processingOrders}
          maskClosable={false}
        >
          <Table
            dataSource={currentOrders}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 1200, y: 400 }}
            columns={[
              {
                title: "STT",
                width: 50,
                fixed: "left",
                render: (_: any, __: any, index: number) => index + 1,
              },
              {
                title: "Mã đơn hàng",
                dataIndex: "order_code",
                key: "order_code",
                width: 130,
                fixed: "left",
                render: (text: string) => (
                  <Text strong style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {text}
                  </Text>
                ),
              },
              {
                title: "Kiểm đếm",
                key: "verify_count",
                width: 150,
                align: "center",
                render: (_: any, record: OrderInfo) => {
                  // Chỉ hiển thị nếu is_verify_count = true
                  if (record.is_verify_count !== true) {
                    return <Text type="secondary">-</Text>;
                  }
                  return (
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Yêu cầu</Text>
                      <InputNumber
                        min={1}
                        placeholder="Số lượng"
                        value={record.metadata?.verify_counts}
                        onChange={(value) =>
                          handleOrderFieldUpdate(record.id, "verify_counts", value || 0)
                        }
                        disabled={processingOrders}
                        style={{ width: "100%" }}
                        size="small"
                      />
                    </Space>
                  );
                },
              },
              {
                title: "Đóng lại (Repack)",
                key: "repack",
                width: 120,
                align: "center",
                render: (_: any, record: OrderInfo) => {
                  // Chỉ hiển thị nếu is_repacked = true
                  if (record.is_repacked !== true) {
                    return <Text type="secondary">-</Text>;
                  }
                  return (
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Yêu cầu</Text>
                      <Checkbox
                        checked={record.metadata?.is_repacked}
                        onChange={(e) =>
                          handleOrderFieldUpdate(record.id, "is_repacked", e.target.checked)
                        }
                        disabled={processingOrders}
                      >
                        <Text style={{ fontSize: 12 }}>Đã đóng</Text>
                      </Checkbox>
                    </Space>
                  );
                },
              },
              {
                title: "Ảnh kiểm tra",
                key: "inspection_images",
                width: 180,
                align: "center",
                render: (_: any, record: OrderInfo) => {
                  // Chỉ hiển thị nếu take_photo = true
                  if (record.take_photo !== true) {
                    return <Text type="secondary">-</Text>;
                  }
                  return (
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Yêu cầu</Text>
                      <Upload
                        beforeUpload={(file) => {
                          handleUploadImage(record.id, file);
                          return false;
                        }}
                        showUploadList={false}
                        disabled={processingOrders}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          size="small"
                          block
                          disabled={processingOrders}
                        >
                          Upload ({record.metadata?.inspection_photo_ids?.length || 0})
                        </Button>
                      </Upload>
                    </Space>
                  );
                },
              },
              {
                title: "Thao tác",
                key: "action",
                width: 100,
                fixed: "right",
                align: "center",
                render: (_: any, record: OrderInfo) => {
                  const ready = isOrderReadyForDone(record);

                  return (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleMarkOrderDone(record)}
                      disabled={!ready || processingOrders}
                      icon={ready ? <CheckCircleOutlined /> : <WarningOutlined />}
                      style={{
                        backgroundColor: ready ? "#52c41a" : "#d9d9d9",
                        borderColor: ready ? "#52c41a" : "#d9d9d9",
                      }}
                    >
                      Done
                    </Button>
                  );
                },
              },
            ]}
          />
        </Modal>

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
