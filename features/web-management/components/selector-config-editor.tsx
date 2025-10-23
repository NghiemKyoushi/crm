"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Collapse,
  Select,
  Space,
  Card,
  Divider,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined, CopyOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  CrawlConfig,
  SelectorConfig,
  Website,
  UpdateSelectorConfigRequest,
} from "@/types/website-manage";
import { useUpdateSelectorConfig } from "../hooks/web-manage";

const { Panel } = Collapse;

interface SelectorConfigEditorProps {
  open: boolean;
  onCancel: () => void;
  website: Website | null;
}

const FIELD_OPTIONS = [
  { label: "Product Name", value: "productName" },
  { label: "Price", value: "price" },
  { label: "Quantity", value: "quantity" },
  { label: "Images", value: "images" },
  { label: "Description", value: "description" },
];

const ATTRIBUTE_OPTIONS = ["text", "html", "src", "href", "data-price"];
const TRANSFORM_OPTIONS = [
  "removeNonDigits",
  "trim",
  "lowercase",
  "uppercase",
];

const SelectorConfigEditor: React.FC<SelectorConfigEditorProps> = ({
  open,
  onCancel,
  website,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateSelectorConfig();
  const [configs, setConfigs] = useState<CrawlConfig[]>([]);

  useEffect(() => {
    if (website && open) {
      const initialConfigs = website.selector_configs || [];
      setConfigs(
        initialConfigs.length > 0
          ? initialConfigs
          : [
              {
                name: `${website.name} v1 (Current)`,
                priority: 1,
                selectors: {},
              },
            ]
      );
      form.setFieldsValue({
        cache_duration_hours: website.cache_duration_hours || 12,
      });
    }
  }, [website, open, form]);

  const handleAddConfig = () => {
    const newConfig: CrawlConfig = {
      name: `${website?.name || "New"} v${configs.length + 1}`,
      priority: configs.length + 1,
      selectors: {},
    };
    setConfigs([...configs, newConfig]);
  };

  const handleDeleteConfig = (index: number) => {
    const newConfigs = configs.filter((_, i) => i !== index);
    setConfigs(newConfigs);
  };

  const handleDuplicateConfig = (index: number) => {
    const configToDuplicate = configs[index];
    const newConfig: CrawlConfig = {
      ...JSON.parse(JSON.stringify(configToDuplicate)),
      name: `${configToDuplicate.name} (Copy)`,
      priority: configs.length + 1,
    };
    setConfigs([...configs, newConfig]);
  };

  const handleConfigChange = (index: number, field: string, value: any) => {
    const newConfigs = [...configs];
    (newConfigs[index] as any)[field] = value;
    setConfigs(newConfigs);
  };

  const handleSelectorChange = (
    configIndex: number,
    fieldName: string,
    selectorField: keyof SelectorConfig,
    value: any
  ) => {
    const newConfigs = [...configs];
    if (!newConfigs[configIndex].selectors[fieldName as keyof typeof newConfigs[typeof configIndex]['selectors']]) {
      newConfigs[configIndex].selectors[fieldName as keyof typeof newConfigs[typeof configIndex]['selectors']] = {
        selector: "",
      } as any;
    }
    const selector = newConfigs[configIndex].selectors[fieldName as keyof typeof newConfigs[typeof configIndex]['selectors']] as SelectorConfig;
    (selector as any)[selectorField] = value;
    setConfigs(newConfigs);
  };

  const handleRemoveSelector = (configIndex: number, fieldName: string) => {
    const newConfigs = [...configs];
    delete newConfigs[configIndex].selectors[fieldName as keyof typeof newConfigs[typeof configIndex]['selectors']];
    setConfigs(newConfigs);
  };

  const handleAddSelector = (configIndex: number, fieldName: string) => {
    const newConfigs = [...configs];
    newConfigs[configIndex].selectors[fieldName as keyof typeof newConfigs[typeof configIndex]['selectors']] = {
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
            onCancel();
          },
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
    });
  };

  const renderSelectorFields = (configIndex: number, config: CrawlConfig) => {
    const selectors = config.selectors;
    const fields = Object.keys(selectors);

    return (
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {fields.map((fieldName) => {
          const selector = selectors[fieldName as keyof typeof selectors] as SelectorConfig;
          return (
            <Card
              key={fieldName}
              size="small"
              title={
                <Space>
                  <Tag color="blue">{fieldName}</Tag>
                </Space>
              }
              extra={
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveSelector(configIndex, fieldName)}
                >
                  {t("common.delete")}
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  placeholder="CSS Selector (e.g., #itemTitle, .price)"
                  value={selector?.selector || ""}
                  onChange={(e) =>
                    handleSelectorChange(
                      configIndex,
                      fieldName,
                      "selector",
                      e.target.value
                    )
                  }
                  addonBefore="Selector"
                />

                <Select
                  placeholder="Attribute"
                  value={selector?.attribute || "text"}
                  onChange={(value) =>
                    handleSelectorChange(
                      configIndex,
                      fieldName,
                      "attribute",
                      value
                    )
                  }
                  style={{ width: "100%" }}
                >
                  {ATTRIBUTE_OPTIONS.map((attr) => (
                    <Select.Option key={attr} value={attr}>
                      {attr}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  placeholder="Transform (optional)"
                  value={selector?.transform}
                  onChange={(value) =>
                    handleSelectorChange(
                      configIndex,
                      fieldName,
                      "transform",
                      value
                    )
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  {TRANSFORM_OPTIONS.map((transform) => (
                    <Select.Option key={transform} value={transform}>
                      {transform}
                    </Select.Option>
                  ))}
                </Select>

                <Space>
                  <label>
                    <input
                      type="checkbox"
                      checked={selector?.multiple || false}
                      onChange={(e) =>
                        handleSelectorChange(
                          configIndex,
                          fieldName,
                          "multiple",
                          e.target.checked
                        )
                      }
                    />{" "}
                    Multiple
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selector?.selectLast || false}
                      onChange={(e) =>
                        handleSelectorChange(
                          configIndex,
                          fieldName,
                          "selectLast",
                          e.target.checked
                        )
                      }
                    />{" "}
                    Select Last
                  </label>

                  <InputNumber
                    placeholder="Select Index"
                    value={selector?.selectIndex}
                    onChange={(value) =>
                      handleSelectorChange(
                        configIndex,
                        fieldName,
                        "selectIndex",
                        value
                      )
                    }
                    style={{ width: 120 }}
                    min={0}
                  />
                </Space>
              </Space>
            </Card>
          );
        })}

        <Select
          placeholder="Add selector field..."
          onChange={(value) => value && handleAddSelector(configIndex, value)}
          style={{ width: "100%" }}
          value={undefined}
        >
          {FIELD_OPTIONS.filter(
            (opt) => !fields.includes(opt.value)
          ).map((opt) => (
            <Select.Option key={opt.value} value={opt.value}>
              + {opt.label}
            </Select.Option>
          ))}
        </Select>
      </Space>
    );
  };

  return (
    <Modal
      title={`Config Selectors - ${website?.name}`}
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      width={900}
      centered
      confirmLoading={updateMutation.isPending}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Cache Duration (hours)"
          name="cache_duration_hours"
          rules={[
            {
              required: true,
              message: "Please enter cache duration",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={168}
            style={{ width: "100%" }}
            placeholder="Default: 12 hours"
          />
        </Form.Item>

        <Divider>Selector Configs</Divider>

        <Collapse accordion>
          {configs.map((config, index) => (
            <Panel
              header={
                <Space>
                  <Tag color={index === 0 ? "green" : "default"}>
                    Priority {config.priority}
                  </Tag>
                  <span>{config.name}</span>
                </Space>
              }
              key={index}
              extra={
                <Space onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleDuplicateConfig(index)}
                  />
                  {configs.length > 1 && (
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteConfig(index)}
                    />
                  )}
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Input
                  placeholder="Config Name"
                  value={config.name}
                  onChange={(e) =>
                    handleConfigChange(index, "name", e.target.value)
                  }
                  addonBefore="Name"
                />

                <InputNumber
                  placeholder="Priority"
                  value={config.priority}
                  onChange={(value) =>
                    handleConfigChange(index, "priority", value)
                  }
                  min={1}
                  style={{ width: "100%" }}
                  addonBefore="Priority"
                />

                <Divider>Selectors</Divider>

                {renderSelectorFields(index, config)}
              </Space>
            </Panel>
          ))}
        </Collapse>

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddConfig}
          style={{ width: "100%", marginTop: 16 }}
        >
          Add Config
        </Button>
      </Form>
    </Modal>
  );
};

export default SelectorConfigEditor;
