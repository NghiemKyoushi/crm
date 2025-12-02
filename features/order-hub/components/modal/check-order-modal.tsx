"use client";

import React, { useEffect, useState } from "react";
import { Modal, Input, InputNumber, Button, Form, Spin } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  genPackageCode,
  getTrackingOrder,
  getDataWeight,
} from "../../apis/orderhub";
import { OrderStatusType } from "@/types/orderhub";

interface CreateTrackingModel {
  package_code: string;
  package_number: number;
  tracking_code: string;
  weight: number;
  id?: number;
}

interface CombinedModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { records: CreateTrackingModel[]; form: any }) => void;
  orderId: number;
  orderCode: string;
  customerName: string;
  productName?: string;
  customerId: number;
  status: string;
}

const CombinedTrackingCheckModal: React.FC<CombinedModalProps> = ({
  open,
  onClose,
  onSubmit,
  orderId,
  orderCode,
  customerName,
  productName,
  customerId,
  status,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [records, setRecords] = useState<CreateTrackingModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [feeKg, setFeeKg] = useState(0);

  // Load dữ liệu tracking khi mở modal
  useEffect(() => {
    if (open) {
      setLoading(true);
      getTrackingOrder(orderId)
        .then(async (data: any) => {
          if (data && data.length > 0) {
            setRecords(data);
          } else {
            const code = await genPackageCode();
            setRecords([
              {
                tracking_code: "",
                package_number: 0,
                package_code: code,
                weight: 0,
              },
            ]);
          }
        })
        .catch(() => toast.error("Không tải được dữ liệu tracking"))
        .finally(() => setLoading(false));
      // load fee kg
      if (customerId) {
        getDataWeight(customerId)
          .then((res) => {            
            setFeeKg(res)
          })
          .catch(() => toast.error("Không lấy được dữ liệu cân nặng"));
      }
    }
  }, [open, orderId, customerId]);

  // ✅ Khi thay đổi list weight => cập nhật tổng cân nặng thực tế
  useEffect(() => {
    const total = records.reduce((sum, r) => sum + (r.weight || 0), 0);
    form.setFieldsValue({ actualWeight: total });
  }, [records, form]);

  // ✅ Thêm dòng mới
  const handleAddRecord = async () => {
    const code = await genPackageCode();
    setRecords((prev) => [
      ...prev,
      { tracking_code: "", package_number: 0, package_code: code, weight: 0 },
    ]);
  };

  // ✅ Xóa dòng
  const handleRemoveRecord = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Cập nhật giá trị từng ô
  const handleRecordChange = (
    index: number,
    field: keyof CreateTrackingModel,
    value: any
  ) => {
    setRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleGeneratePackageCode = async (index: number) => {
    const code = await genPackageCode();
    handleRecordChange(index, "package_code", code);
  };

  // ✅ Lưu & kiểm tra hàng
  const handleSubmit = async () => {
    if (
      status === OrderStatusType.PENDING_PAYMENT ||
      status === OrderStatusType.READY_TO_SHIP
    ) {
      return;
    }
    try {
      // Validate từng record
      for (const [i, r] of records.entries()) {
        if (!r.tracking_code) {
          toast.error(`Dòng ${i + 1}: Vui lòng nhập mã tracking`);
          return;
        }
        if (!r.package_code) {
          toast.error(`Dòng ${i + 1}: Thiếu mã kiện`);
          return;
        }
        // if (r.package_number === undefined || r.package_number === null || r.package_number <= 0) {
        //   toast.error(`Dòng ${i + 1}: Số lượng kiện phải lớn hơn 0`);
        //   return;
        // }
        // Kiểm tra trọng lượng (weight)
        if (r.weight === undefined || r.weight === null || r.weight <= 0) {
          toast.error(`Dòng ${i + 1}: Trọng lượng phải lớn hơn 0`);
          return;
        }
      }

      const values = await form.validateFields();
      onSubmit({ records, form: values });
      onClose();
    } catch (e) {
      console.error("Validation failed:", e);
    }
  };

  // Theo dõi realtime phí cân nặng
  const actualWeight = Form.useWatch("actualWeight", form);
  useEffect(() => {
    if (actualWeight) {
      const totalFee = actualWeight * feeKg;
      form.setFieldsValue({ feePerKg: totalFee });
    }
  }, [actualWeight, feeKg, form]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Cập nhật Tracking & Kiểm tra hàng"
      width={850}
      centered
      footer={null}
      styles={{
        body: { maxHeight: "76vh", overflowY: "auto" },
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin />
        </div>
      ) : (
        <>
          {/* Order Information */}
          <div className="bg-blue-50 p-3 rounded mb-4">
            <p className="!mb-1">
              <strong>{t("table.orderCode")}:</strong> {orderCode}
            </p>
            <p className="!mb-1">
              <strong>{t("form.customer")}:</strong> {customerName}
            </p>
            <p className="!mb-1">
              <strong>{t("form.productName")}:</strong> {productName ?? "N/A"}
            </p>
          </div>
          {/* --- Danh sách Tracking --- */}
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-[40px_200px_180px_100px_100px_50px] gap-2 bg-gray-100 p-2 rounded text-xs font-medium text-gray-700">
              <div className="text-center">#</div>
              <div>Mã Tracking</div>
              <div>Mã Kiện</div>
              <div className="text-center">Số Kiện</div>
              <div className="text-center">Cân Nặng (kg)</div>
              <div></div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2">
              {records.map((r, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[40px_200px_180px_100px_100px_50px] gap-2 items-center bg-white border rounded p-2"
                >
                  <div className="text-center text-gray-600 text-xs">
                    {index + 1}
                  </div>

                  <Input
                    placeholder="Mã tracking"
                    size="small"
                    value={r.tracking_code}
                    onChange={(e) =>
                      handleRecordChange(index, "tracking_code", e.target.value)
                    }
                  />

                  <Input
                    placeholder="Mã kiện"
                    size="small"
                    value={r.package_code}
                    onChange={(e) =>
                      handleRecordChange(index, "package_code", e.target.value)
                    }
                    // suffix={
                    //   !r.id && (
                    //     <ReloadOutlined
                    //       className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    //       onClick={() => handleGeneratePackageCode(index)}
                    //       title="Generate mã kiện"
                    //     />
                    //   )
                    // }
                  />

                  <Input
                    type="number"
                    value={r.package_number}
                    onChange={(e) =>
                      handleRecordChange(
                        index,
                        "package_number",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    size="small"
                    className="text-xs text-center"
                  />

                  <InputNumber
                    placeholder="0"
                    size="small"
                    className="!w-full"
                    min={0}
                    stringMode
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    value={r.weight}
                    onChange={(v) =>
                      handleRecordChange(
                        index,
                        "weight",
                        v ? parseFloat(v.toString()) : 0
                      )
                    }
                  />

                  {records.length > 1 && (
                    <Button
                      danger
                      size="small"
                      onClick={() => handleRemoveRecord(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleAddRecord}
              className="w-full"
              disabled={
                status === OrderStatusType.PENDING_PAYMENT ||
                status === OrderStatusType.READY_TO_SHIP
              }
            >
              Thêm dòng mới
            </Button>
          </div>

          {/* --- Form Kiểm tra hàng --- */}
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="actualWeight"
                label="Cân nặng thực tế (kg)"
                rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
              >
                <InputNumber className="!w-full" disabled />
              </Form.Item>

              <Form.Item name="feePerKg" label="Phí cân nặng (VNĐ)">
                <InputNumber className="!w-full" disabled />
              </Form.Item>
            </div>

            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={onClose}>Hủy</Button>
              <Button
                type="primary"
                className="!bg-green-600"
                icon={<CheckOutlined />}
                onClick={handleSubmit}
                disabled={
                  status === OrderStatusType.PENDING_PAYMENT ||
                  status === OrderStatusType.READY_TO_SHIP
                }
              >
                Lưu & Kiểm tra hàng
              </Button>
            </div>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default CombinedTrackingCheckModal;
