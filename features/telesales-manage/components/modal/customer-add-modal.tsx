import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Spin, Divider, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { fetchTagsByType } from "./filter-telesale-modal";
import { TelesaleCustomerFormInput } from "../../types/telesales-mng";
import { addTelesaleTag } from "../../apis/telesale-mng";
import { toast } from "react-toastify";

interface CustomerModalProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: TelesaleCustomerFormInput) => void;
}

export const CustomerAddModal: React.FC<CustomerModalProps> = ({
  open,
  loading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<TelesaleCustomerFormInput>();

  const [serviceOptions, setServiceOptions] = useState<any[]>([]);
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState<{
    service: boolean;
    source: boolean;
    situation: boolean;
  }>({ service: false, source: false, situation: false });

  // State for adding new tags
  const [newServiceTagName, setNewServiceTagName] = useState("");
  const [newSourceTagName, setNewSourceTagName] = useState("");
  const [addingServiceTag, setAddingServiceTag] = useState(false);
  const [addingSourceTag, setAddingSourceTag] = useState(false);

  // Function to reload tags
  const reloadServiceTags = async () => {
    setLoadingTags((prev) => ({ ...prev, service: true }));
    try {
      const data = await fetchTagsByType("SERVICE");
      setServiceOptions(
        (data || []).map((item: any) => ({
          label: item.name,
          value: item.id?.toString(),
        }))
      );
    } catch {
      setServiceOptions([]);
    } finally {
      setLoadingTags((prev) => ({ ...prev, service: false }));
    }
  };

  const reloadSourceTags = async () => {
    setLoadingTags((prev) => ({ ...prev, source: true }));
    try {
      const data = await fetchTagsByType("SOURCE");
      setSourceOptions(
        (data || []).map((item: any) => ({
          label: item.name,
          value: item.id?.toString(),
        }))
      );
    } catch {
      setSourceOptions([]);
    } finally {
      setLoadingTags((prev) => ({ ...prev, source: false }));
    }
  };

  // Add new service tag
  const handleAddServiceTag = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (!newServiceTagName.trim()) return;

    setAddingServiceTag(true);
    try {
      const result = await addTelesaleTag({
        name: newServiceTagName.trim(),
        color: "#3b82f6", // default blue color
        tag_type: "SERVICE",
      });
      toast.success("Thêm loại dịch vụ thành công!");
      setNewServiceTagName("");
      await reloadServiceTags();
      // Auto select the new tag
      if (result?.data?.id) {
        form.setFieldValue("service_tag", result.data.id.toString());
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thêm loại dịch vụ thất bại!");
    } finally {
      setAddingServiceTag(false);
    }
  };

  // Add new source tag
  const handleAddSourceTag = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (!newSourceTagName.trim()) return;

    setAddingSourceTag(true);
    try {
      const result = await addTelesaleTag({
        name: newSourceTagName.trim(),
        color: "#10b981", // default green color
        tag_type: "SOURCE",
      });
      toast.success("Thêm nguồn thành công!");
      setNewSourceTagName("");
      await reloadSourceTags();
      // Auto select the new tag
      if (result?.data?.id) {
        form.setFieldValue("source_tag", result.data.id.toString());
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thêm nguồn thất bại!");
    } finally {
      setAddingSourceTag(false);
    }
  };

  useEffect(() => {
    setLoadingTags((prev) => ({ ...prev, service: true }));
    fetchTagsByType("SERVICE")
      .then((data) =>
        setServiceOptions(
          (data || []).map((item: any) => ({
            label: item.name,
            value: item.id?.toString(),
          }))
        )
      )
      .catch(() => setServiceOptions([]))
      .finally(() => setLoadingTags((prev) => ({ ...prev, service: false })));

    setLoadingTags((prev) => ({ ...prev, source: true }));
    fetchTagsByType("SOURCE")
      .then((data) =>
        setSourceOptions(
          (data || []).map((item: any) => ({
            label: item.name,
            value: item.id?.toString(),
          }))
        )
      )
      .catch(() => setSourceOptions([]))
      .finally(() => setLoadingTags((prev) => ({ ...prev, source: false })));

    setLoadingTags((prev) => ({ ...prev, situation: true }));
    fetchTagsByType("STATUS")
      .then((data) =>
        setStatusOptions(
          (data || []).map((item: any) => ({
            label: item.name,
            value: item.id?.toString(),
          }))
        )
      )
      .catch(() => setStatusOptions([]))
      .finally(() => setLoadingTags((prev) => ({ ...prev, situation: false })));
  }, []);

  useEffect(() => {
    form.resetFields();
  }, [open, form]);

  const handleFinish = (values: TelesaleCustomerFormInput) => {
    onSubmit(values);
  };

  const isAnyLoading =
    loadingTags.service || loadingTags.source || loadingTags.situation;
  return (
    <Modal
      open={open}
      title="Tạo thông tin khách hàng"
      onCancel={onCancel}
      centered
      width={800}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button
            className="!h-10 px-6"
            onClick={onCancel}
            disabled={isAnyLoading}
          >
            Hủy
          </Button>
          <Button
            className="!h-10 px-8"
            type="primary"
            loading={loading || isAnyLoading}
            onClick={() => form.submit()}
            disabled={isAnyLoading}
          >
            Lưu
          </Button>
        </div>
      }
    >
      {isAnyLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Spin size="large" />
          <div className="mt-2">Đang tải dữ liệu lựa chọn...</div>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="space-y-0.5"
        >
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            {/* Left column */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Form.Item
                label="Tên khách hàng"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                className="!mb-1"
              >
                <Input
                  placeholder="Nhập tên khách hàng"
                  className="!h-10"
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
                className="!mb-1"
              >
                <Input
                  placeholder="098..."
                  maxLength={15}
                  className="!h-10"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Vui lòng nhập email" }]}
                className="!mb-1"
              >
                <Input
                  placeholder="Nhập email"
                  className="!h-10"
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                className="!mb-1"
              >
                <Input
                  placeholder="Địa chỉ khách hàng"
                  className="!h-10"
                  maxLength={255}
                />
              </Form.Item>

              <Form.Item
                name="business_field"
                label="Lĩnh vực kinh doanh"
                rules={[{ required: true, message: "Vui lòng nhập lĩnh vực kinh doanh" }]}
                className="!mb-1"
              >
                <Input
                  placeholder="Nhập lĩnh vực kinh doanh"
                  className="!h-10"
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="customer_info"
                label="Thông tin khách hàng"
                rules={[{ required: true, message: "Vui lòng nhập thông tin khách hàng" }]}
                className="!mb-1"
              >
                <Input
                  placeholder="Nhập thông tin khách hàng"
                  className="!h-10"
                  maxLength={200}
                />
              </Form.Item>
            </div>
            {/* Right column */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Form.Item
                name="service_tag"
                label="Loại dịch vụ"
                rules={[{ required: true, message: "Chọn loại dịch vụ" }]}
                className="!mb-1"
              >
                <Select
                  options={serviceOptions}
                  placeholder="Chọn hoặc thêm dịch vụ"
                  className="!h-10"
                  popupClassName="h-48"
                  style={{ width: "100%" }}
                  loading={loadingTags.service}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 8px" }}>
                        <Input
                          placeholder="Nhập tên dịch vụ mới"
                          value={newServiceTagName}
                          onChange={(e) => setNewServiceTagName(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          style={{ width: 180 }}
                        />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddServiceTag}
                          loading={addingServiceTag}
                          disabled={!newServiceTagName.trim()}
                        >
                          Thêm
                        </Button>
                      </Space>
                    </>
                  )}
                />
              </Form.Item>

              <Form.Item
                name="source_tag"
                label="Nguồn"
                rules={[{ required: true, message: "Chọn nguồn" }]}
                className="!mb-1"
              >
                <Select
                  options={sourceOptions}
                  placeholder="Chọn hoặc thêm nguồn"
                  className="!h-10"
                  popupClassName="h-48"
                  style={{ width: "100%" }}
                  loading={loadingTags.source}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 8px" }}>
                        <Input
                          placeholder="Nhập tên nguồn mới"
                          value={newSourceTagName}
                          onChange={(e) => setNewSourceTagName(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          style={{ width: 180 }}
                        />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddSourceTag}
                          loading={addingSourceTag}
                          disabled={!newSourceTagName.trim()}
                        >
                          Thêm
                        </Button>
                      </Space>
                    </>
                  )}
                />
              </Form.Item>

              {/* <Form.Item
                name="status_tag"
                label="Tình trạng"
                rules={[{ required: true, message: "Chọn tình trạng" }]}
                className="!mb-1"
              >
                <Select
                  options={statusOptions}
                  placeholder="Tình trạng khách hàng"
                  className="!h-10"
                  dropdownClassName="h-48"
                  style={{ width: "100%" }}
                  loading={loadingTags.situation}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item> */}

              <Form.Item
                name="note_request"
                label="Yêu cầu ghi chú"
                rules={[{ required: true, message: "Vui lòng nhập yêu cầu ghi chú" }]}
                className="!mb-1"
              >
                <Input
                  placeholder="Yêu cầu ghi chú"
                  className="!h-10"
                  maxLength={200}
                />
              </Form.Item>

              {/* <Form.Item
                name="call_note"
                label="Ghi chú cuộc gọi"
                rules={[{ required: true, message: "Vui lòng nhập ghi chú cuộc gọi" }]}
                className="!mb-1"
              >
                <Input
                  placeholder="Ghi chú cuộc gọi"
                  className="!h-10"
                  maxLength={200}
                />
              </Form.Item> */}
            </div>
          </div>
        </Form>
      )}
    </Modal>
  );
};
