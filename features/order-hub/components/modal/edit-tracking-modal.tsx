import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Spin } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { genPackageCode, getTrackingOrder } from "../../apis/orderhub";
import { CreateTrackingModel, OrderStatusType } from "@/types/orderhub";

export function EditTrackingModal({
  open,
  onClose,
  onSave,
  orderId,
  status,
}: {
  orderId: number;
  open: boolean;
  onClose: () => void;
  initialData?: {
    orderId: number;
    records: CreateTrackingModel[];
  };
  onSave: (data: CreateTrackingModel[]) => void;
  status: string;
}) {
  const [records, setRecords] = React.useState<CreateTrackingModel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isExisting, setIsExisting] = React.useState(false); // true nếu đã có data từ API

  // load data khi mở modal
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      getTrackingOrder(orderId)
        .then(async (data: any) => {
          if (data && data && data.length > 0) {
            setRecords(data);
            // setIsExisting(true);
          } else {
            // chưa có record → tạo mặc định
            const code = await genPackageCode();
            setRecords([
              {
                tracking_code: "",
                package_code: code,
                package_number: 0,
                weight: 0,
              },
            ]);
            setIsExisting(false);
          }
        })
        .catch(() => {
          toast.error("Không tải được dữ liệu tracking");
        })
        .finally(() => setLoading(false));
    }
  }, [open, orderId]);

  const handleAddRecord = async () => {
    if (
      status === OrderStatusType.PENDING_PAYMENT ||
      status === OrderStatusType.READY_TO_SHIP
    ) {
      return;
    }
    const code = await genPackageCode();
    setRecords((prev) => [
      ...prev,
      { tracking_code: "", package_code: code, package_number: 0, weight: 0 },
    ]);
  };

  const handleRemoveRecord = (index: number) => {
    if (
      status === OrderStatusType.PENDING_PAYMENT ||
      status === OrderStatusType.READY_TO_SHIP
    ) {
      return;
    }
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRecordChange = (
    index: number,
    field: keyof CreateTrackingModel,
    value: any
  ) => {
    setRecords((prev) => {
      const newRecords = [...prev];
      newRecords[index] = { ...newRecords[index], [field]: value };
      return newRecords;
    });
  };

  const handleGeneratePackageCode = async (index: number) => {
    if (isExisting) return; // nếu đã có record từ API thì không cho gen lại
    const code = await genPackageCode();
    handleRecordChange(index, "package_code", code);
  };

  const handleSubmit = () => {
    if (
      status === OrderStatusType.PENDING_PAYMENT ||
      status === OrderStatusType.READY_TO_SHIP
    ) {
      return;
    }
    onSave(records);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Cập nhật Tracking / Kiện / Số lượng / Cân nặng"
      width={800}
      centered
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          disabled={
            status === OrderStatusType.PENDING_PAYMENT ||
            status === OrderStatusType.READY_TO_SHIP
          }
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          Lưu
        </Button>,
      ]}
    >
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin />
        </div>
      ) : (
        <div className="space-y-3 py-4">
          {/* Header */}
          <div className="grid grid-cols-[40px_200px_180px_100px_100px_50px] gap-2 bg-gray-100 p-2 rounded font-medium text-xs text-gray-700">
            <div className="text-center">#</div>
            <div>Mã Tracking</div>
            <div>Mã Kiện</div>
            <div className="text-center">Số Kiện</div>
            <div className="text-center">Cân Nặng</div>
            <div></div>
          </div>

          {/* Rows */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {records.map((record, index) => (
              <div
                key={index}
                className="grid grid-cols-[40px_200px_180px_100px_100px_50px] gap-2 items-center p-2 bg-white border rounded hover:bg-gray-50"
              >
                <div className="text-center text-xs text-gray-600 font-medium">
                  {index + 1}
                </div>

                <Input
                  value={record.tracking_code}
                  onChange={(e) =>
                    handleRecordChange(index, "tracking_code", e.target.value)
                  }
                  placeholder="Mã tracking"
                  size="small"
                  className="text-xs"
                />

                <Input
                  value={record.package_code}
                  onChange={(e) =>
                    handleRecordChange(index, "package_code", e.target.value)
                  }
                  placeholder="Mã kiện"
                  size="small"
                  className="text-xs"
                  suffix={
                    !record.id && (
                      <ReloadOutlined
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        onClick={() => handleGeneratePackageCode(index)}
                        title="Generate mã kiện"
                      />
                    )
                  }
                />

                <Input
                  type="number"
                  value={record.package_number}
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

                <Input
                  value={record.weight}
                  onChange={(e) =>
                    handleRecordChange(index, "weight", +e.target.value)
                  }
                  placeholder="3.5kg"
                  size="small"
                  className="text-xs"
                />

                {records.length > 1 && !isExisting && (
                  <Button
                    danger
                    size="small"
                    onClick={() => handleRemoveRecord(index)}
                    className="!px-2"
                    title="Xóa"
                    disabled={
                      status === OrderStatusType.PENDING_PAYMENT ||
                      status === OrderStatusType.READY_TO_SHIP
                    }
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!isExisting && (
            <Button
              type="dashed"
              onClick={handleAddRecord}
              icon={<PlusOutlined />}
              className="w-full"
              size="small"
              disabled={
                status === OrderStatusType.PENDING_PAYMENT ||
                status === OrderStatusType.READY_TO_SHIP
              }
            >
              Thêm dòng mới
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
