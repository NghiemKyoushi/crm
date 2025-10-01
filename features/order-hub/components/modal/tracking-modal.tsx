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
  Spin,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFinish = (values: any) => {
    if (take_photo && uploadedIds.length === 0) {
      toast.warning(t("validation.pleaseUploadImage"));
      return;
    }
    onSubmit({
      isRepackage: values.is_repacked,
      images: uploadedIds,
      count: values.count,
    });
    form.resetFields();
    setFileList([]);
    setUploadedIds([]);
  };

  const handleChange = ({ fileList }: { fileList: any[] }) => {
    setFileList(fileList);
  };

  const beforeUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error(t("validation.onlyImageFiles"));
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error(t("validation.imageSizeLimit"));
      return Upload.LIST_IGNORE;
    }

    setUploading(true); // 👉 bật loading

    try {
      const newId = await uploadImage(file);
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
      message.error(t("validation.uploadFailed"));
      return Upload.LIST_IGNORE;
    } finally {
      setUploading(false); // 👉 tắt loading
    }
  };

  return (
    <Modal
      title={t("modal.addTrackingCode")}
      open={open}
      onCancel={uploading ? undefined : onCancel} 
      footer={null}
      width={600}
      centered
      destroyOnClose
      maskClosable={!uploading}
    >
      <Spin spinning={uploading} >
        {/* Thông tin đơn hàng */}
        <div className="bg-blue-50 rounded p-3 mb-4">
          <p className="font-semibold text-blue-900 !mb-1">
            {t("form.orderInformation")}
          </p>
          <p className="!mb-1">
            <span className="font-semibold">{t("table.orderCode")}:</span>{" "}
            {orderCode}
          </p>
          <p className="!mb-1">
            <span className="font-semibold">{t("form.customer")}:</span>{" "}
            {customerName}
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {is_verify_count && (
            <Form.Item
              name="count"
              label={t("tracking.countCheck")}
              rules={[
                {
                  required: true,
                  message: t("validation.pleaseEnterCount"),
                },
              ]}
            >
              <InputNumber
                style={{ display: "flex", alignItems: "center" }}
                className="!w-full !h-11"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value.replace(/[^\d.]/g, "")}
                placeholder={t("tracking.countCheck")}
              />
            </Form.Item>
          )}

          {is_repacked && (
            <Form.Item
              name="is_repacked"
              valuePropName="checked"
              rules={[
                {
                  required: true,
                  message: t("validation.pleaseSelectRepackage"),
                },
              ]}
            >
              <Checkbox>
                <span className="font-semibold">
                  {t("tracking.repackage")}
                </span>
              </Checkbox>
            </Form.Item>
          )}

          {take_photo && (
            <Form.Item label={t("tracking.documentImages")}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                multiple
                disabled={uploading} // disable khi upload
              >
                {fileList.length >= 10 ? null : (
                  <div>
                    {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  </div>
                )}
              </Upload>
            </Form.Item>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={onCancel} disabled={uploading}>
              {t("button.cancel")}
            </Button>
            <Button type="primary" htmlType="submit" loading={uploading}>
              {t("button.save")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default TrackingModal;
