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

const { Title, Text } = Typography;

const CheckComingView: React.FC = () => {
  const { t } = useTranslation();
  const [packageCode, setPackageCode] = useState<string>("");
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [scanHistory, setScanHistory] = useState<PackageInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastPrintedPackage, setLastPrintedPackage] = useState<PackageInfo | null>(null);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const lastScanRef = useRef<{ code: string; timestamp: number } | null>(null);
  const packageCodeRef = useRef<string>("");
  const isSubmittingRef = useRef<boolean>(false);
  const isCodeInViewRef = useRef<boolean>(false);
  const uploadQueueRef = useRef<Map<number, File[]>>(new Map());

  // Order list management
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrders, setCurrentOrders] = useState<OrderInfo[]>([]);
  const [currentTrackingCode, setCurrentTrackingCode] = useState<string>("");
  const [processingOrders, setProcessingOrders] = useState(false);

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
          printCount: (record as any).print_count,
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

      // BƯỚC 3: Xử lý tất cả orders (không filter theo status)
      console.log(`📋 Processing ${relatedOrders.length} orders`);

      if (relatedOrders.length > 0) {
        // BƯỚC 4: Phân loại orders thành auto-done và cần làm
        const mappedOrders = relatedOrders.map((order) => ({
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
          // Additional fields
          admin_note: order.admin_note,
          customer_note: (order as any).customer_request,
          product_link: (order as any).product_url,
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
        // BƯỚC 7: Không có orders → chỉ reload history
        console.log("✅ No orders found");

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

    // Browser print: call printed API immediately on click, then open print dialog
    if (packageInfo.id) {
      try {
        await checkComingApi.markPrinted(packageInfo.id);
        setScanHistory(prev => prev.map(item => item.id === packageInfo.id ? { ...item, printCount: (item.printCount ?? 0) + 1 } : item));
        // No await here to avoid blocking UI before print dialog
        loadHistory();
      } catch (e) {
        console.error('Failed to mark printed:', e);
      }
    }
    setTimeout(() => {
      window.print();
    }, 100);
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

  // Handle click on history item - mở lại modal với orders (hiển thị TẤT CẢ orders)
  const handleHistoryItemClick = (item: PackageInfo) => {
    const orders = item.relatedOrders || [];

    // Hiển thị modal với TẤT CẢ orders (không filter theo trạng thái)
    const mappedOrders = orders.map((order) => ({
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
      // Additional fields
      admin_note: order.admin_note,
      customer_note: (order as any).customer_request,
      product_link: (order as any).product_url,
    }));

    setCurrentOrders(mappedOrders);
    setCurrentTrackingCode(item.trackingCode || "");
    setShowOrderModal(true);
  };

  // Handle order field update - only update local metadata (API will be called on Done)
  const handleOrderFieldUpdate = (
    orderId: number,
    metadataField: "verify_counts" | "is_repacked" | "inspection_photo_ids",
    value: number | boolean | number[]
  ) => {
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
  };

  // Handle upload image - update metadata.inspection_photo_ids
  const handleUploadImage = async (orderId: number, file: File) => {
    // Add file to queue for this order
    const queue = uploadQueueRef.current;
    if (!queue.has(orderId)) {
      queue.set(orderId, []);
    }
    queue.get(orderId)!.push(file);

    // Process upload queue for this order
    const processQueue = async () => {
      const filesToUpload = queue.get(orderId) || [];
      if (filesToUpload.length === 0) return;

      // Clear queue for this order before processing
      queue.delete(orderId);

      setProcessingOrders(true);
      const uploadedIds: number[] = [];

      try {
        // Upload all files sequentially
        for (const file of filesToUpload) {
          const uploadResult = await checkComingApi.uploadImage(file, 1);
          uploadedIds.push(uploadResult.id);
          console.log(`✅ Uploaded image ID: ${uploadResult.id} for order ${orderId}`);
        }

        // Update order with all new image IDs using functional update
        setCurrentOrders((prevOrders) => {
          return prevOrders.map((order) => {
            if (order.id === orderId) {
              const currentImages = order.metadata?.inspection_photo_ids || [];
              const newImages = [...currentImages, ...uploadedIds];
              return {
                ...order,
                metadata: {
                  ...order.metadata,
                  inspection_photo_ids: newImages,
                },
              };
            }
            return order;
          });
        });

        toast.success(`Upload ${uploadedIds.length} ảnh thành công!`);
      } catch (error: any) {
        console.error("Failed to upload image:", error);
        toast.error("Lỗi khi upload ảnh");
      } finally {
        setProcessingOrders(false);
        // Process any remaining files in queue
        const remainingFiles = queue.get(orderId);
        if (remainingFiles && remainingFiles.length > 0) {
          setTimeout(() => processQueue(), 100);
        }
      }
    };

    // Use setTimeout to batch multiple files together
    setTimeout(() => processQueue(), 50);
  };

  // Check if order has any requirements at all
  const hasAnyRequirement = (order: OrderInfo) => {
    return order.take_photo === true || order.is_repacked === true || order.is_verify_count === true;
  };

  // Check if single order is ready for Done - based on metadata
  const isOrderReadyForDone = (order: OrderInfo) => {
    // Nếu có yêu cầu take_photo (= true) thì BẮT BUỘC phải có ảnh trong metadata.inspection_photo_ids
    // false hoặc null = không có yêu cầu = OK
    const photoOk = order.take_photo !== true ||
      ((order.metadata?.inspection_photo_ids?.length || 0) > 0);

    // Nếu có yêu cầu repack (= true) thì phải có metadata.is_repacked = true
    const repackOk = order.is_repacked !== true || order.metadata?.is_repacked === true;

    // Nếu có yêu cầu verify_count (= true) thì phải có metadata.verify_counts > 0
    const countOk = order.is_verify_count !== true ||
      ((order.metadata?.verify_counts || 0) > 0);

    return photoOk && repackOk && countOk;
  };

  // Get count of orders with pending requirements
  const getPendingOrdersCount = () => {
    return currentOrders.filter(order => hasAnyRequirement(order) && !isOrderReadyForDone(order)).length;
  };

  // Check if all orders with requirements are ready
  const areAllOrdersReady = () => {
    const ordersWithRequirements = currentOrders.filter(hasAnyRequirement);
    // Nếu không có order nào có requirements, coi như đã xong
    if (ordersWithRequirements.length === 0) {
      return true;
    }
    return ordersWithRequirements.every((order) => isOrderReadyForDone(order));
  };

  // Handle mark order as done - use metadata
  const handleMarkOrderDone = async (order: OrderInfo) => {
    if (!isOrderReadyForDone(order)) {
      toast.warning("Vui lòng hoàn thành tất cả yêu cầu trước khi Done");
      return;
    }

    setProcessingOrders(true);
    try {
      // Chuẩn bị data theo yêu cầu endpoint (PUT /features/v1/admin/orders/arrived-vn-warehouse/{orderId})
      // Chỉ gửi các trường tương ứng nếu requirement là true
      const payload: {
        image_ids?: number[];
        is_repacked?: boolean;
        count_verify?: number;
      } = {};

      // Nếu có yêu cầu take_photo → gửi image_ids
      if (order.take_photo === true) {
        payload.image_ids = order.metadata?.inspection_photo_ids || [];
      }

      // Nếu có yêu cầu is_repacked → gửi is_repacked
      if (order.is_repacked === true) {
        payload.is_repacked = order.metadata?.is_repacked || false;
      }

      // Nếu có yêu cầu is_verify_count → gửi count_verify
      if (order.is_verify_count === true) {
        payload.count_verify = order.metadata?.verify_counts || 0;
      }

      await checkComingApi.completeOrderArrivedVN(order.id, payload);
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

    // Đóng modal trực tiếp không cần confirm
    setShowOrderModal(false);
    setCurrentOrders([]);
    setCurrentTrackingCode("");
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

        {/* Top Section - Input and Camera */}
        <Card className="shadow-lg mb-4">
          <Row gutter={16}>
            {/* Left Column - Package Code + Input/Button */}
            <Col xs={24} lg={12}>
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

                {/* Input/Button Area */}
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

                  {!isScanning && (
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
            </Col>

            {/* Right Column - Camera Preview */}
            <Col xs={24} lg={12}>
              <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {/*<div className="flex items-center justify-between mb-3">*/}
                {/*  <Space>*/}
                {/*    <BarcodeOutlined style={{ fontSize: 20, color: "#1890ff" }} />*/}
                {/*    <Text strong style={{ fontSize: 16 }}>*/}
                {/*      Camera Preview*/}
                {/*    </Text>*/}
                {/*  </Space>*/}
                {/*</div>*/}
                {isScanning ? (
                  <div style={{ height: 200, width: "100%" }}>
                    <BarcodeScanner
                      onScan={handleScan}
                      onError={(err) => toast.error(err)}
                      onCodeLeftView={handleCodeLeftView}
                      autoStart={true}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      borderRadius: 8,
                      border: "2px dashed #d9d9d9"
                    }}
                  >
                    <Space direction="vertical" align="center">
                      <BarcodeOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                      <Text type="secondary">Bật scanner để xem camera</Text>
                    </Space>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Bottom Section - Scan History Table */}
        <Card
          className="shadow-lg"
          title={
            <Space>
              <HistoryOutlined />
              <span>Lịch Sử Quét</span>
              <Badge count={scanHistory.length} showZero overflowCount={999} />
            </Space>
          }
        >
          <Table
            dataSource={scanHistory}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} bản ghi`,
            }}
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
            columns={[
              {
                title: "Mã Kiện / Tracking",
                key: "codes",
                width: 180,
                ellipsis: true,
                render: (_: any, record: PackageInfo) => (
                  <Space direction="vertical" size={2} style={{ width: "100%" }}>
                    <Text strong ellipsis style={{ fontFamily: "monospace", display: "block" }}>
                      {record.packageCode}
                    </Text>
                    <Text type="secondary" ellipsis style={{ fontFamily: "monospace", display: "block" }}>
                      {record.trackingCode}
                    </Text>
                  </Space>
                ),
              },
              {
                title: "Thời Gian",
                dataIndex: "timestamp",
                key: "timestamp",
                width: 130,
                render: (date: string) => {
                  if (!date) return "-";
                  const dateObj = new Date(date);
                  const dateStr = dateObj.toLocaleDateString("vi-VN", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  });
                  const timeStr = dateObj.toLocaleTimeString("vi-VN", {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <Space direction="vertical" size={2}>
                      <Text>{dateStr}</Text>
                      <Text type="secondary">{timeStr}</Text>
                    </Space>
                  );
                },
              },
              {
                title: "Đơn Hàng",
                key: "ordersStatus",
                width: 140,
                align: "center",
                render: (_: any, record: PackageInfo) => {
                  const orders = record.relatedOrders || [];

                  if (orders.length === 0) {
                    return <Text type="secondary">Không có đơn</Text>;
                  }

                  // Đếm số đơn đã hoàn thành và chưa hoàn thành (tất cả orders, không filter theo status)
                  let completedCount = 0;
                  let incompleteCount = 0;

                  orders.forEach(order => {
                    const photoOk = order.take_photo !== true ||
                      ((order.metadata?.inspection_photo_ids?.length || 0) > 0);
                    const repackOk = order.is_repacked !== true || order.metadata?.is_repacked === true;
                    const countOk = order.is_verify_count !== true ||
                      ((order.metadata?.verify_counts || 0) > 0);

                    if (photoOk && repackOk && countOk) {
                      completedCount++;
                    } else {
                      incompleteCount++;
                    }
                  });

                  return (
                    <Space direction="vertical" size={2} align="center" style={{ width: "100%" }}>
                      <Space size={8}>
                        {completedCount > 0 && (
                          <Badge
                            count={completedCount}
                            style={{ backgroundColor: "#52c41a" }}
                            title="Đã hoàn thành"
                          />
                        )}
                        {incompleteCount > 0 && (
                          <Badge
                            count={incompleteCount}
                            style={{ backgroundColor: "#faad14" }}
                            title="Chưa hoàn thành"
                          />
                        )}
                      </Space>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleHistoryItemClick(record)}
                        style={{ padding: 0, height: "auto", fontSize: 12 }}
                      >
                        Xem chi tiết
                      </Button>
                    </Space>
                  );
                },
              },
              {
                title: "Thao Tác",
                key: "action",
                width: 120,
                align: "center",
                render: (_: any, record: PackageInfo) => {
                  return (
                    <Space size="small">
                      {(record.printCount ?? 0) > 0 && (
                        <Text type="secondary" style={{ fontSize: 12 }}>Đã in ({record.printCount})</Text>
                      )}
                      <Button
                        type="primary"
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={() => handlePrint(record)}
                      >
                        In
                      </Button>
                      <Button
                        danger
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => record.id && handleDelete(record.id)}
                      />
                    </Space>
                  );
                },
              },
            ]}
          />
        </Card>

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
          width={1600}
          footer={
            <Space>
              <Text type="secondary">
                Còn lại: <strong>{getPendingOrdersCount()}</strong> đơn hàng chưa hoàn thành
              </Text>
              <Button onClick={handleCloseModal} disabled={processingOrders}>
                Đóng
              </Button>
              {/* {areAllOrdersReady() && (
                <Button
                  type="primary"
                  onClick={handleConfirmOrders}
                  loading={processingOrders}
                  icon={<CheckCircleOutlined />}
                >
                  Hoàn thành
                </Button>
              )} */}
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
            scroll={{ x: 1400, y: 400 }}
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
                title: "Thông tin bổ sung",
                key: "additional_info",
                width: 400,
                render: (_: any, record: OrderInfo) => (
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <Text strong style={{ fontSize: 11, color: "#1890ff" }}>Link:</Text>
                      {record.product_link ? (
                        <a href={record.product_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11 }}>
                          {record.product_link.length > 30 ? record.product_link.substring(0, 30) + "..." : record.product_link}
                        </a>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 11 }}>-</Text>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Text strong style={{ fontSize: 11, color: "#1890ff", whiteSpace: "nowrap" }}>KH:</Text>
                      <Text style={{ fontSize: 11, flex: 1 }} ellipsis={{ tooltip: record.customer_note }}>
                        {record.customer_note || "-"}
                      </Text>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Text strong style={{ fontSize: 11, color: "#1890ff", whiteSpace: "nowrap" }}>Admin:</Text>
                      <Text style={{ fontSize: 11, flex: 1 }} ellipsis={{ tooltip: record.admin_note }}>
                        {record.admin_note || "-"}
                      </Text>
                    </div>
                  </Space>
                ),
              },
              {
                title: "Trạng thái",
                key: "order_status",
                width: 110,
                align: "center",
                render: (_: any, record: OrderInfo) => {
                  const photoOk = record.take_photo !== true ||
                    ((record.metadata?.inspection_photo_ids?.length || 0) > 0);
                  const repackOk = record.is_repacked !== true || record.metadata?.is_repacked === true;
                  const countOk = record.is_verify_count !== true ||
                    ((record.metadata?.verify_counts || 0) > 0);

                  const isCompleted = photoOk && repackOk && countOk;

                  return isCompleted
                    ? <Badge status="success" text="Hoàn thành" />
                    : <Badge status="processing" text="Chưa xong" />;
                },
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
                  // Luôn hiển thị input; chỉ khóa khi đang xử lý API
                  return (
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Nhập số lượng kiểm đếm</Text>
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

                  // Luôn hiển thị checkbox; chỉ khóa khi đang xử lý API
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

                  // Luôn hiển thị upload button; chỉ khóa khi đang xử lý API
                  const imageCount = record.metadata?.inspection_photo_ids?.length || 0;
                  return (
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Yêu cầu</Text>
                      <Upload
                        multiple
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
                          Upload ({imageCount})
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
                  // Kiểm tra xem order đã hoàn thành chưa
                  const photoOk = record.take_photo !== true ||
                    (record.metadata?.inspection_photo_ids && record.metadata.inspection_photo_ids.length > 0);
                  const repackOk = record.is_repacked !== true || record.metadata?.is_repacked === true;
                  const countOk = record.is_verify_count !== true ||
                    (record.metadata?.verify_counts != null && record.metadata.verify_counts > 0);

                  const isCompleted = photoOk && repackOk && countOk;

                  // Luôn hiển thị nút Done; chỉ enable khi đủ điều kiện
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
