"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  message,
  Checkbox,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { uploadAvatar } from "@/features/user-profile/hooks/user-profile";
import { toast } from "react-toastify";

interface TrackingModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  orderCode: string;
  customerName: string;
  is_verify_count: boolean;
  is_repacked: boolean;
  take_photo: boolean;
}

const TrackingModal: React.FC<TrackingModalProps> = ({
  open,
  onCancel,
  onSubmit,
  orderCode,
  customerName,
  is_verify_count,
  is_repacked,
  take_photo,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);
  const handleFinish = (values: any) => {
    console.log("values", values);
   if(take_photo && uploadedIds.length === 0){
    toast.warning("Vui lòng upload ảnh lên")
   } 
    // onSubmit({
    //   isRepackage: values.is_repacked,
    //   images: uploadedIds,
    //   count: values.count
    // });
    // form.resetFields();
    // setFileList([]);
  };

  const handleChange = ({ fileList }: { fileList: any[] }) => {
    setFileList(fileList);
  };

  const beforeUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error("Ảnh phải nhỏ hơn 5MB!");
      return Upload.LIST_IGNORE;
    }

    try {
      const newId = await uploadAvatar(file);
      setUploadedIds((prev) => [...prev, newId]);

      setFileList((prev) => [
        ...prev,
        {
          uid: String(Date.now()),
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
        },
      ]);
      return false;
    } catch (err) {
      message.error("Upload thất bại");
      return Upload.LIST_IGNORE;
    }
  };

  console.log("uploadedIds", uploadedIds);

  return (
    <Modal
      title="Thêm mã tracking"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      destroyOnClose
    >
      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 rounded p-3 mb-4">
        <p className="font-semibold text-blue-900 !mb-1">Thông tin đơn hàng</p>
        <p className="!mb-1">
          <span className="font-semibold">Mã đơn:</span> {orderCode}
        </p>
        <p className="!mb-1">
          <span className="font-semibold">Khách hàng:</span> {customerName}
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {is_verify_count && (
          <Form.Item
            name="count"
            label="Kiểm đếm"
            rules={[{ required: true, message: "Vui lòng nhập kiểm đếm!" }]}
          >
            <InputNumber
              style={{ display: "flex", alignItems: "center" }}
              className="!w-full !h-11"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: any) => value.replace(/[^\d.]/g, "")}
              placeholder="kiểm đếm"
            />
          </Form.Item>
        )}

        {is_repacked && (
          <Form.Item
            name="is_repacked"
            valuePropName="checked"
            rules={[{ required: true, message: "Vui lòng chọn Repackage!" }]}
          >
            <Checkbox><span className="font-semibold">Repackage</span></Checkbox>
          </Form.Item>
        )}

        {take_photo && (
          <Form.Item label="Ảnh chứng từ / ảnh sản phẩm">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleChange}
              beforeUpload={beforeUpload}
              multiple
            >
              {fileList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} className="mr-2">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TrackingModal;
