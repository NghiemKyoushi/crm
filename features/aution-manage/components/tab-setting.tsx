import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import {
  ClockCircleOutlined,
  SettingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  getAuctionSettings,
  updateAuctionSettings,
} from "../apis/aution-manage";
import { toast } from "react-toastify";

const { Item } = Form;

interface FormValues {
  live_safe_seconds: number;
  max_violation_count: number;
}

export const TabSettings: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        const settings = await getAuctionSettings();
        form.setFieldsValue({
          live_safe_seconds: settings?.live_safe_seconds,
          max_violation_count: settings?.max_violation_count,
        });
      } catch (e) {
        toast.error("Không thể lấy dữ liệu cấu hình. Vui lòng thử lại.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      await updateAuctionSettings({
        live_safe_seconds: Number(values.live_safe_seconds),
        max_violation_count: Number(values.max_violation_count),
      });
      toast.success("Đã lưu cài đặt thành công!");
    } catch (e) {
      toast.error("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const renderCardTitle = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-semibold text-base">{title}</span>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-6"
        initialValues={{
          live_safe_seconds: "",
          max_violation_count: "",
        }}
        disabled={initialLoading}
      >
        {/* 1. THỜI GIAN & VI PHẠM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thẻ Thời gian an toàn tối thiểu */}
          <Card
            title={renderCardTitle(
              <ClockCircleOutlined className="text-blue-500" />,
              "Thời gian"
            )}
            className="rounded-xl shadow-sm border border-gray-200"
          >
            <Item
              name="live_safe_seconds"
              label={
                <span className="font-medium text-gray-700">
                  Thời gian an toàn tối thiểu (giây)
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập thời gian",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Phải lớn hơn 0",
                  transform: (value) => Number(value),
                },
              ]}
            >
              <Input
                type="number"
                min={1}
                addonAfter="giây"
                placeholder="E.g., 15"
                className="!h-10 !rounded-lg"
              />
            </Item>
          </Card>

          {/* Thẻ Số lần vi phạm tối đa */}
          <Card
            title={renderCardTitle(
              <WarningOutlined className="text-red-500" />,
              "Vi phạm"
            )}
            className="rounded-xl shadow-sm border border-gray-200"
          >
            <Item
              name="max_violation_count"
              label={
                <span className="font-medium text-gray-700">
                  Số lần vi phạm tối đa
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số lần",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Không được nhỏ hơn 0",
                  transform: (value) => Number(value),
                },
              ]}
            >
              <Input
                type="number"
                min={0}
                placeholder="E.g., 3"
                className="!h-10 !rounded-lg"
              />
            </Item>
          </Card>
        </div>

        {/* Footer - Nút Lưu */}
        <div className="pt-4 border-t">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading || initialLoading}
            icon={<SettingOutlined />}
            className="!h-12 !px-8 !rounded-lg !font-bold"
            disabled={initialLoading}
          >
            Lưu cài đặt
          </Button>
        </div>
      </Form>
    </div>
  );
};
