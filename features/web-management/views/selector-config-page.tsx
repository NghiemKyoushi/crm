"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Divider,
  Switch,
  Alert,
  Modal,
  Table,
  Descriptions,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CrawlConfig,
  SelectorConfig,
  Website,
  UpdateSelectorConfigRequest,
  TestSelectorConfigResponse,
} from "@/types/website-manage";
import {
  useUpdateSelectorConfig,
  useListWebsite,
  useTestSelectorConfig,
} from "../hooks/web-manage";
import TestResultModal from "../components/test-result-modal";

const { Title, Text } = Typography;

const FIELD_OPTIONS = [
  { label: "Product Name", value: "productName", icon: "" },
  { label: "Price", value: "price", icon: "" },
  { label: "Quantity", value: "quantity", icon: "" },
  { label: "Images", value: "images", icon: "" },
  { label: "Description", value: "description", icon: "" },
];

const ATTRIBUTE_OPTIONS = [
  { label: "Text", value: "text" },
  { label: "HTML", value: "html" },
  { label: "Source (src)", value: "src" },
  { label: "Link (href)", value: "href" },
  { label: "Data Attribute", value: "data-price" },
];

const TRANSFORM_OPTIONS = [
  { label: "Remove Non-Digits", value: "removeNonDigits" },
  { label: "Trim", value: "trim" },
  { label: "Lowercase", value: "lowercase" },
  { label: "Uppercase", value: "uppercase" },
];

const SelectorConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("id");
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const updateMutation = useUpdateSelectorConfig();
  const testMutation = useTestSelectorConfig();

  const [configs, setConfigs] = useState<CrawlConfig[]>([]);
  const [selectedConfigIndex, setSelectedConfigIndex] = useState<number>(0);
  const [website, setWebsite] = useState<Website | null>(null);

  // Test Config state
  const [testUrlModalOpen, setTestUrlModalOpen] = useState(false);
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState<TestSelectorConfigResponse | null>(null);
  const [testResultModalOpen, setTestResultModalOpen] = useState(false);

  // Fetch website data
  const { data: websiteListData } = useListWebsite({
    page: 0,
    size: 1000,
  });

  useEffect(() => {
    if (websiteListData && websiteId) {
      const foundWebsite = websiteListData.data.find(
        (w) => w.id === Number(websiteId)
      );
      if (foundWebsite) {
        setWebsite(foundWebsite);
        const initialConfigs = foundWebsite.selector_configs || [];
        setConfigs(
          initialConfigs.length > 0
            ? initialConfigs
            : [
                {
                  name: `${foundWebsite.name} v1 (Current)`,
                  priority: 1,
                  selectors: {},
                },
              ]
        );
        form.setFieldsValue({
          cache_duration_hours: foundWebsite.cache_duration_hours || 12,
        });
      }
    }
  }, [websiteListData, websiteId, form]);

  const handleAddConfig = () => {
    const newConfig: CrawlConfig = {
      name: `${website?.name || "New"} v${configs.length + 1}`,
      priority: configs.length + 1,
      selectors: {},
    };
    setConfigs([...configs, newConfig]);
    setSelectedConfigIndex(configs.length);
  };

  const handleDeleteConfig = (index: number) => {
    if (configs.length <= 1) {
      toast.warning("Cần có ít nhất 1 config!");
      return;
    }
    const newConfigs = configs.filter((_, i) => i !== index);
    setConfigs(newConfigs);
    setSelectedConfigIndex(Math.max(0, selectedConfigIndex - 1));
  };

  const handleDuplicateConfig = (index: number) => {
    const configToDuplicate = configs[index];
    const newConfig: CrawlConfig = {
      ...JSON.parse(JSON.stringify(configToDuplicate)),
      name: `${configToDuplicate.name} (Copy)`,
      priority: configs.length + 1,
    };
    setConfigs([...configs, newConfig]);
    setSelectedConfigIndex(configs.length);
  };

  const handleConfigChange = (field: string, value: any) => {
    const newConfigs = [...configs];
    (newConfigs[selectedConfigIndex] as any)[field] = value;
    setConfigs(newConfigs);
  };

  const handleSelectorChange = (
    fieldName: string,
    selectorField: keyof SelectorConfig,
    value: any
  ) => {
    const newConfigs = [...configs];
    const currentConfig = newConfigs[selectedConfigIndex];

    if (!currentConfig.selectors[fieldName as keyof typeof currentConfig.selectors]) {
      currentConfig.selectors[fieldName as keyof typeof currentConfig.selectors] = {
        selector: "",
      } as any;
    }

    const selector = currentConfig.selectors[fieldName as keyof typeof currentConfig.selectors] as SelectorConfig;
    (selector as any)[selectorField] = value;
    setConfigs(newConfigs);
  };

  const handleRemoveSelector = (fieldName: string) => {
    const newConfigs = [...configs];
    delete newConfigs[selectedConfigIndex].selectors[fieldName as keyof typeof newConfigs[typeof selectedConfigIndex]['selectors']];
    setConfigs(newConfigs);
  };

  const handleAddSelector = (fieldName: string) => {
    const newConfigs = [...configs];
    newConfigs[selectedConfigIndex].selectors[fieldName as keyof typeof newConfigs[typeof selectedConfigIndex]['selectors']] = {
      selector: "",
      attribute: "text",
    } as any;
    setConfigs(newConfigs);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (!website) return;

      const requestBody: UpdateSelectorConfigRequest = {
        cache_duration_hours: values.cache_duration_hours,
        selector_configs: configs,
      };

      updateMutation.mutate(
        {
          id: website.id,
          body: requestBody,
        },
        {
          onSuccess: () => {
            toast.success(t("websiteManage.toast.updateSelectorSuccess"));
            queryClient.invalidateQueries({
              queryKey: ["listwebsite"],
            });
            // Không redirect, để user tiếp tục config
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
    });
  };

  const handleTestConfig = () => {
    if (!testUrl.trim()) {
      toast.error("Please enter a URL to test");
      return;
    }

    testMutation.mutate(
      {
        url: testUrl,
        configs: configs,
      },
      {
        onSuccess: (data) => {
          setTestResult(data);
          setTestUrlModalOpen(false);
          setTestResultModalOpen(true);
          toast.success("Test completed successfully!");
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.localizedMessage || "Test failed. Please check your URL and configs."
          );
        },
      }
    );
  };

  const currentConfig = configs[selectedConfigIndex];
  const currentSelectors = currentConfig?.selectors || {};
  const selectorFields = Object.keys(currentSelectors);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/settings/website-management")}
            >
              {t("common.back")}
            </Button>
            <div>
              <Title level={3} className="!mb-0">
                Config Selectors - {website?.name}
              </Title>
              <Text type="secondary">{website?.domain}</Text>
            </div>
          </div>
          <Space>
            <Button
              icon={<ExperimentOutlined />}
              size="large"
              onClick={() => setTestUrlModalOpen(true)}
              disabled={configs.length === 0}
            >
              Test Config
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              onClick={handleSave}
              loading={updateMutation.isPending}
            >
              {t("common.save")}
            </Button>
          </Space>
        </div>

        {/* Info Alerts */}
        <Space direction="vertical" style={{ width: "100%" }} className="mb-6">
          <Alert
            message="Hướng dẫn sử dụng"
            description="Tạo nhiều configs cho mỗi website để xử lý khi website thay đổi cấu trúc HTML. Backend sẽ tự động chọn config có extraction score cao nhất."
            type="info"
            showIcon
            closable
          />

          {website?.proxy_enabled && (
            <Alert
              message="Proxy Enabled"
              description={
                <Space direction="vertical" size="small">
                  <Text>
                    <Text strong>Host:</Text> {website.proxy_host}
                    {website.proxy_port && `:${website.proxy_port}`}
                  </Text>
                  {website.proxy_username && (
                    <Text>
                      <Text strong>Username:</Text> {website.proxy_username}
                    </Text>
                  )}
                </Space>
              }
              type="success"
              showIcon
            />
          )}
        </Space>

        <Row gutter={24}>
          {/* Left Sidebar - Config List */}
          <Col xs={24} lg={6}>
            <Card
              title="Configs"
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleAddConfig}
                >
                  Add
                </Button>
              }
              className="sticky top-6"
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {configs.map((config, index) => (
                  <Card
                    key={index}
                    size="small"
                    className={`cursor-pointer transition-all ${
                      selectedConfigIndex === index
                        ? "border-blue-500 shadow-md"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedConfigIndex(index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag color={index === 0 ? "green" : "default"}>
                            Priority {config.priority}
                          </Tag>
                          {selectedConfigIndex === index && (
                            <CheckCircleOutlined className="text-blue-500" />
                          )}
                        </div>
                        <Text strong className="text-sm">
                          {config.name}
                        </Text>
                        <div className="mt-2">
                          <Text type="secondary" className="text-xs">
                            {Object.keys(config.selectors).length} fields
                          </Text>
                        </div>
                      </div>
                      <Space size="small" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleDuplicateConfig(index)}
                        />
                        {configs.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteConfig(index)}
                          />
                        )}
                      </Space>
                    </div>
                  </Card>
                ))}
              </Space>

              <Divider />

              {/* Cache Duration */}
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Cache Duration (hours)"
                  name="cache_duration_hours"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <InputNumber
                    min={1}
                    max={168}
                    style={{ width: "100%" }}
                    placeholder="Default: 12"
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Right Content - Config Editor */}
          <Col xs={24} lg={18}>
            {currentConfig && (
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Config Info - Table Style */}
                <Card title="Config Information">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Config Name" span={2}>
                      <Input
                        value={currentConfig.name}
                        onChange={(e) =>
                          handleConfigChange("name", e.target.value)
                        }
                        placeholder="E.g., Yahoo Auction v1 (Current - Dec 2024)"
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Priority">
                      <InputNumber
                        value={currentConfig.priority}
                        onChange={(value) => handleConfigChange("priority", value)}
                        min={1}
                        style={{ width: "100%" }}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Fields">
                      <Tag color="blue">{selectorFields.length} fields</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Selectors Table */}
                <Card
                  title="Selector Fields"
                  extra={
                    <Select
                      placeholder="+ Add field..."
                      style={{ width: 200 }}
                      onChange={(value) => value && handleAddSelector(value)}
                      value={undefined}
                    >
                      {FIELD_OPTIONS.filter(
                        (opt) => !selectorFields.includes(opt.value)
                      ).map((opt) => (
                        <Select.Option key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  }
                >
                  <Table
                    dataSource={selectorFields.map((fieldName) => ({
                      key: fieldName,
                      fieldName,
                      selector: currentSelectors[
                        fieldName as keyof typeof currentSelectors
                      ] as SelectorConfig,
                    }))}
                    columns={[
                      {
                        title: "Field Name",
                        dataIndex: "fieldName",
                        key: "fieldName",
                        width: 150,
                        render: (fieldName: string) => {
                          const fieldOption = FIELD_OPTIONS.find(
                            (opt) => opt.value === fieldName
                          );
                          return (
                            <Space>
                              <span>{fieldOption?.icon}</span>
                              <Text strong>{fieldOption?.label}</Text>
                            </Space>
                          );
                        },
                      },
                      {
                        title: "CSS Selector",
                        dataIndex: "selector",
                        key: "selector",
                        width: 250,
                        render: (_: any, record: any) => (
                          <Input
                            placeholder="e.g., #itemTitle, .price"
                            value={record.selector?.selector || ""}
                            onChange={(e) =>
                              handleSelectorChange(
                                record.fieldName,
                                "selector",
                                e.target.value
                              )
                            }
                          />
                        ),
                      },
                      {
                        title: "Attribute",
                        dataIndex: "attribute",
                        key: "attribute",
                        width: 140,
                        render: (_: any, record: any) => (
                          <Select
                            value={record.selector?.attribute || "text"}
                            onChange={(value) =>
                              handleSelectorChange(
                                record.fieldName,
                                "attribute",
                                value
                              )
                            }
                            style={{ width: "100%" }}
                          >
                            {ATTRIBUTE_OPTIONS.map((attr) => (
                              <Select.Option key={attr.value} value={attr.value}>
                                {attr.label}
                              </Select.Option>
                            ))}
                          </Select>
                        ),
                      },
                      {
                        title: "Transform",
                        dataIndex: "transform",
                        key: "transform",
                        width: 160,
                        render: (_: any, record: any) => (
                          <Select
                            value={record.selector?.transform}
                            onChange={(value) =>
                              handleSelectorChange(
                                record.fieldName,
                                "transform",
                                value
                              )
                            }
                            allowClear
                            placeholder="None"
                            style={{ width: "100%" }}
                          >
                            {TRANSFORM_OPTIONS.map((transform) => (
                              <Select.Option
                                key={transform.value}
                                value={transform.value}
                              >
                                {transform.label}
                              </Select.Option>
                            ))}
                          </Select>
                        ),
                      },
                      {
                        title: "Multiple",
                        dataIndex: "multiple",
                        key: "multiple",
                        width: 80,
                        align: "center" as const,
                        render: (_: any, record: any) => (
                          <Switch
                            size="small"
                            checked={record.selector?.multiple || false}
                            onChange={(checked) =>
                              handleSelectorChange(
                                record.fieldName,
                                "multiple",
                                checked
                              )
                            }
                          />
                        ),
                      },
                      {
                        title: "Last",
                        dataIndex: "selectLast",
                        key: "selectLast",
                        width: 70,
                        align: "center" as const,
                        render: (_: any, record: any) => (
                          <Switch
                            size="small"
                            checked={record.selector?.selectLast || false}
                            onChange={(checked) =>
                              handleSelectorChange(
                                record.fieldName,
                                "selectLast",
                                checked
                              )
                            }
                          />
                        ),
                      },
                      {
                        title: "Index",
                        dataIndex: "selectIndex",
                        key: "selectIndex",
                        width: 90,
                        render: (_: any, record: any) => (
                          <InputNumber
                            placeholder="Index"
                            value={record.selector?.selectIndex}
                            onChange={(value) =>
                              handleSelectorChange(
                                record.fieldName,
                                "selectIndex",
                                value
                              )
                            }
                            style={{ width: "100%" }}
                            size="small"
                            min={0}
                          />
                        ),
                      },
                      {
                        title: "Actions",
                        key: "actions",
                        width: 100,
                        align: "center" as const,
                        render: (_: any, record: any) => (
                          <Popconfirm
                            title="Delete this field?"
                            description="Are you sure to delete this selector field?"
                            onConfirm={() => handleRemoveSelector(record.fieldName)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              danger
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        ),
                      },
                    ]}
                    pagination={false}
                    locale={{
                      emptyText: (
                        <div className="py-8">
                          <Text type="secondary">
                            Chưa có selector nào. Click &quot;Add field...&quot; để thêm.
                          </Text>
                        </div>
                      ),
                    }}
                    scroll={{ x: 1200 }}
                  />
                </Card>
              </Space>
            )}
          </Col>
        </Row>

        {/* Test URL Input Modal */}
        <Modal
          title="Test Selector Config"
          open={testUrlModalOpen}
          onCancel={() => {
            setTestUrlModalOpen(false);
            setTestUrl("");
          }}
          onOk={handleTestConfig}
          okText="Test"
          cancelText="Cancel"
          confirmLoading={testMutation.isPending}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Alert
              message="Test your configs before saving"
              description="Enter a product URL to test all configs and see which one extracts data best."
              type="info"
              showIcon
            />
            <Input
              placeholder={`e.g., https://${website?.domain}/item/abc123`}
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              size="large"
            />
            <Text type="secondary">
              Testing {configs.length} config{configs.length > 1 ? "s" : ""}
            </Text>
          </Space>
        </Modal>

        {/* Test Result Modal */}
        <TestResultModal
          open={testResultModalOpen}
          onClose={() => {
            setTestResultModalOpen(false);
            setTestResult(null);
          }}
          testResult={testResult}
        />
      </div>
    </div>
  );
};

export default SelectorConfigPage;
