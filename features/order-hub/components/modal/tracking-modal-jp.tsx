// "use client";
// import React, { useEffect } from "react";
// import { Modal, Form, Input, Button, Space } from "antd";
// import { TruckOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

// interface TrackingModalProps {
//   open: boolean;
//   onCancel: () => void;
//   onSubmit: (values: { trackingCodes: string[] }) => void;
//   orderCode: string;
//   customerName: string;
// }

// const TrackingModalJP: React.FC<TrackingModalProps> = ({
//   open,
//   onCancel,
//   onSubmit,
//   orderCode,
//   customerName,
// }) => {
//   const [form] = Form.useForm();

//   const handleFinish = (values: any) => {
//     // values.trackingCodes = array string    
//     onSubmit(values);
//   };

//   useEffect(() => {
//     if (!open) {
//       form.resetFields();
//     }
//   }, [open, form]);

//   return (
//     <Modal
//       title="Thêm mã tracking"
//       open={open}
//       onCancel={onCancel}
//       footer={null}
//       width={600}
//       styles={{
//         body: {
//           maxHeight: "75vh",
//           overflowY: "auto",
//         },
//       }}
//       centered
//     >
//       {/* Thông tin đơn hàng */}
//       <div className="bg-blue-50 rounded p-3 mb-2">
//         <p className="font-semibold text-blue-900 !mb-1">Thông tin đơn hàng</p>
//         <p className="!mb-1">
//           <span className="font-semibold">Mã đơn:</span> {orderCode}
//         </p>
//         <p className="!mb-1">
//           <span className="font-semibold">Khách hàng:</span> {customerName}
//         </p>
//       </div>

//       {/* Form */}
//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={handleFinish}
//         initialValues={{ trackingCodes: [""] }}
//         className="!mb-2"
//       >
//         {/* Danh sách mã tracking */}
//         <Form.List name="trackingCodes">
//           {(fields, { add, remove }) => (
//             <>
//               {fields.map((field, index) => (
//                 <Form.Item
//                   key={field.key}
//                   label={index === 0 ? "Mã tracking" : `Mã kiện ${index + 1}`}
//                   required={false}
//                   className="!mb-2"
//                 >
//                   <div  className="!w-full flex gap-2">
//                     <Form.Item
//                       {...field}
//                       validateTrigger={["onChange", "onBlur"]}
//                       rules={[
//                         {
//                           pattern: /^[A-Za-z0-9-]*$/,
//                           message: "Mã tracking không hợp lệ",
//                         },
//                       ]}
//                       noStyle
//                     >
//                       <Input
//                         className="!h-11 !w-full"
//                         placeholder="VD: 1234567890123"
//                       />
//                     </Form.Item>
//                     {fields.length > 1 && (
//                       <Button
//                         danger
//                         type="text"
//                         icon={<DeleteOutlined />}
//                         onClick={() => remove(field.name)}
//                       />
//                     )}
//                   </div>
//                 </Form.Item>
//               ))}

//               <Form.Item>
//                 <Button
//                   type="dashed"
//                   onClick={() => add()}
//                   block
//                   icon={<PlusOutlined />}
//                 >
//                   Thêm mã kiện
//                 </Button>
//               </Form.Item>
//             </>
//           )}
//         </Form.List>

//         {/* Footer Buttons */}
//         <div className="flex justify-end gap-3">
//           <Button onClick={onCancel}>Hủy</Button>
//           <Button
//             type="primary"
//             htmlType="submit"
//             className="bg-purple-600 hover:bg-purple-700"
//             icon={<TruckOutlined />}
//           >
//             Cập nhật tracking
//           </Button>
//         </div>
//       </Form>
//     </Modal>
//   );
// };

// export default TrackingModalJP;


"use client";
import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Spin } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  TruckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { genPackageCode, getTrackingOrder } from "../../apis/orderhub";

interface TrackingModalJPProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (records: CreateTrackingJPModel[]) => void;
  orderId: number;
  orderCode: string;
  customerName: string;
}

export interface CreateTrackingJPModel {
  package_code: string;
  tracking_code: string;
}

const TrackingModalJP: React.FC<TrackingModalJPProps> = ({
  open,
  onCancel,
  onSubmit,
  orderId,
  orderCode,
  customerName,
}) => {
  const [records, setRecords] = useState<CreateTrackingJPModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  // load data khi mở modal
  useEffect(() => {
    if (open) {
      setLoading(true);
      getTrackingOrder(orderId)
        .then(async (data: any) => {
          if (data && data.length > 0) {
            setRecords(data);
            setIsExisting(true);
          } else {
            const code = await genPackageCode();
            setRecords([
              {
                tracking_code: "",
                package_code: code,
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
    const code = await genPackageCode();
    setRecords((prev) => [
      ...prev,
      { tracking_code: "", package_code: code },
    ]);
  };

  const handleRemoveRecord = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRecordChange = (
    index: number,
    field: keyof CreateTrackingJPModel,
    value: any
  ) => {
    setRecords((prev) => {
      const newRecords = [...prev];
      newRecords[index] = { ...newRecords[index], [field]: value };
      return newRecords;
    });
  };

  const handleGeneratePackageCode = async (index: number) => {
    if (isExisting) return;
    const code = await genPackageCode();
    handleRecordChange(index, "package_code", code);
  };

  const handleSubmit = () => {
    onSubmit(records);
  };

  return (
    <Modal
      title="Cập nhật Tracking / Mã Kiện"
      open={open}
      onCancel={onCancel}
      width={700}
      centered
      footer={null}
      styles={{
        body: { maxHeight: "75vh", overflowY: "auto" },
      }}
    >
      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 rounded p-3 mb-3">
        <p className="font-semibold text-blue-900 mb-1">Thông tin đơn hàng</p>
        <p className="mb-1">
          <span className="font-semibold">Mã đơn:</span> {orderCode}
        </p>
        <p className="mb-1">
          <span className="font-semibold">Khách hàng:</span> {customerName}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_1fr_50px] gap-2 bg-gray-100 p-2 rounded font-medium text-xs text-gray-700">
            <div className="text-center">#</div>
            <div>Mã Tracking</div>
            <div>Mã Kiện</div>
            <div></div>
          </div>

          {/* Rows */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {records.map((record, index) => (
              <div
                key={index}
                className="grid grid-cols-[40px_1fr_1fr_50px] gap-2 items-center p-2 bg-white border rounded hover:bg-gray-50"
              >
                <div className="text-center text-xs text-gray-600 font-medium">
                  {index + 1}
                </div>

                {/* Tracking code */}
                <Input
                  value={record.tracking_code}
                  onChange={(e) =>
                    handleRecordChange(index, "tracking_code", e.target.value)
                  }
                  placeholder="Mã tracking"
                  size="small"
                  className="text-xs"
                />

                {/* Package code */}
                <Input
                  value={record.package_code}
                  onChange={(e) =>
                    handleRecordChange(index, "package_code", e.target.value)
                  }
                  placeholder="Mã kiện"
                  size="small"
                  className="text-xs"
                  suffix={
                    !isExisting && (
                      <ReloadOutlined
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        onClick={() => handleGeneratePackageCode(index)}
                        title="Sinh mã kiện"
                      />
                    )
                  }
                />

                {records.length > 1 && !isExisting && (
                  <Button
                    danger
                    size="small"
                    onClick={() => handleRemoveRecord(index)}
                    className="!px-2"
                    title="Xóa"
                    icon={<DeleteOutlined />}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add line button */}
          {!isExisting && (
            <Button
              type="dashed"
              onClick={handleAddRecord}
              icon={<PlusOutlined />}
              className="w-full"
              size="small"
            >
              Thêm dòng mới
            </Button>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3">
            <Button onClick={onCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700"
              icon={<TruckOutlined />}
            >
              Cập nhật Tracking JP
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TrackingModalJP;
