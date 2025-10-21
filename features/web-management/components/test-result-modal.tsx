"use client";
import React from "react";
import {
  Modal,
  Tabs,
  Card,
  Descriptions,
  Tag,
  Alert,
  Space,
  Typography,
  Divider,
  Empty,
  Table,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { TestSelectorConfigResponse } from "@/types/website-manage";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface TestResultModalProps {
  open: boolean;
  onClose: () => void;
  testResult: TestSelectorConfigResponse | null;
}

const TestResultModal: React.FC<TestResultModalProps> = ({
  open,
  onClose,
  testResult,
}) => {
  const { t } = useTranslation();

  if (!testResult) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return "green";
    if (score >= 3) return "orange";
    return "red";
  };

  const getScoreIcon = (success: boolean) => {
    return success ? (
      <CheckCircleOutlined style={{ color: "#52c41a" }} />
    ) : (
      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
    );
  };

  // Sort results by score descending
  const sortedResults = [...testResult.test_results].sort(
    (a, b) => b.extraction_score - a.extraction_score
  );

  // Comparison table columns
  const comparisonColumns = [
    {
      title: "Config Name",
      dataIndex: "config_name",
      key: "config_name",
      width: 200,
      render: (text: string, record: any) => (
        <Space>
          {record.config_name === testResult.best_config && (
            <CrownOutlined style={{ color: "#faad14", fontSize: 16 }} />
          )}
          <Text strong={record.config_name === testResult.best_config}>
            {text}
          </Text>
          {record.config_name === testResult.best_config && (
            <Tag color="gold">Best</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 80,
      align: "center" as const,
    },
    {
      title: "Score",
      dataIndex: "extraction_score",
      key: "extraction_score",
      width: 100,
      align: "center" as const,
      render: (score: number) => (
        <Tag color={getScoreColor(score)} style={{ minWidth: 60 }}>
          {score}/5
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "success",
      key: "success",
      width: 100,
      align: "center" as const,
      render: (success: boolean) =>
        success ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Success
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Failed
          </Tag>
        ),
    },
    {
      title: "Product Name",
      dataIndex: ["extracted_data", "product_name"],
      key: "product_name",
      ellipsis: true,
      render: (val: any) => (val ? <Text>{val}</Text> : <Text type="danger">✗</Text>),
    },
    {
      title: "Price",
      dataIndex: ["extracted_data", "price"],
      key: "price",
      width: 100,
      align: "right" as const,
      render: (val: any) =>
        typeof val === "number" ? (
          <Text style={{ color: "#52c41a", fontWeight: 500 }}>
            {val.toLocaleString()}
          </Text>
        ) : (
          <Text type="danger">✗</Text>
        ),
    },
    {
      title: "Qty",
      dataIndex: ["extracted_data", "quantity"],
      key: "quantity",
      width: 60,
      align: "center" as const,
      render: (val: any) =>
        typeof val === "number" ? (
          <Tag>{val}</Tag>
        ) : (
          <Text type="danger">✗</Text>
        ),
    },
    {
      title: "Images",
      dataIndex: ["extracted_data", "images"],
      key: "images",
      width: 80,
      align: "center" as const,
      render: (images: any[]) =>
        images && images.length > 0 ? (
          <Tag color="blue">{images.length}</Tag>
        ) : (
          <Text type="danger">✗</Text>
        ),
    },
    {
      title: "Description",
      dataIndex: ["extracted_data", "description"],
      key: "description",
      width: 100,
      align: "center" as const,
      render: (val: any) =>
        val ? (
          <Tag color="green">✓</Tag>
        ) : (
          <Text type="danger">✗</Text>
        ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined />
          <span>Test Results</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
    >
      {/* Summary Section */}
      <Card className="mb-4">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Alert
            message={
              <Space>
                <CrownOutlined style={{ color: "#faad14" }} />
                <span>Best Config:</span>
                <Text strong>{testResult.best_config}</Text>
                <Tag color={getScoreColor(testResult.best_score)}>
                  Score: {testResult.best_score}/5
                </Tag>
              </Space>
            }
            type={testResult.best_score >= 3 ? "success" : "warning"}
            showIcon
            icon={<TrophyOutlined />}
          />

          <Descriptions size="small" column={2}>
            <Descriptions.Item label="URL">
              <Text copyable ellipsis style={{ maxWidth: 300 }}>
                {testResult.url}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><ClockCircleOutlined />Execution Time</Space>}>
              <Text>{testResult.execution_time_ms}ms</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Total Configs">
              {testResult.test_results.length}
            </Descriptions.Item>
            <Descriptions.Item label="Successful Configs">
              {
                testResult.test_results.filter((r) => r.success).length
              }/{testResult.test_results.length}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {/* Comparison Table */}
      <Card className="mb-4" title={<Space><Text strong>Quick Comparison</Text><Text type="secondary">(Sorted by Score)</Text></Space>}>
        <Table
          dataSource={sortedResults}
          columns={comparisonColumns}
          pagination={false}
          size="small"
          rowKey={(record) => record.config_name}
          rowClassName={(record) =>
            record.config_name === testResult.best_config
              ? "bg-yellow-50"
              : ""
          }
          scroll={{ x: 1100 }}
          bordered
        />
      </Card>

      {/* Detailed Results */}
      <Divider orientation="left">
        <Text strong>Detailed Results</Text>
      </Divider>

      <Tabs defaultActiveKey="0">
        {sortedResults.map((result, index) => (
          <TabPane
            tab={
              <Space>
                {result.config_name === testResult.best_config && (
                  <CrownOutlined style={{ color: "#faad14" }} />
                )}
                {getScoreIcon(result.success)}
                <span>{result.config_name}</span>
                <Tag color={getScoreColor(result.extraction_score)}>
                  {result.extraction_score}/5
                </Tag>
              </Space>
            }
            key={index}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {/* Best Config Alert */}
              {result.config_name === testResult.best_config && (
                <Alert
                  message={
                    <Space>
                      <CrownOutlined />
                      <Text strong>This is the best performing config</Text>
                    </Space>
                  }
                  type="success"
                  showIcon={false}
                  banner
                />
              )}

              {/* Config Info */}
              <Card size="small" title="Config Information">
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="Config Name">
                    {result.config_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Priority">
                    {result.priority}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {result.success ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Success
                      </Tag>
                    ) : (
                      <Tag color="error" icon={<CloseCircleOutlined />}>
                        Failed
                      </Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Extraction Score">
                    <Tag color={getScoreColor(result.extraction_score)}>
                      {result.extraction_score}/5
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Error Message */}
              {result.error_message && (
                <Alert
                  message="Error"
                  description={result.error_message}
                  type="error"
                  showIcon
                />
              )}

              {/* Extracted Data */}
              <Card size="small" title="Extracted Data">
                {result.extracted_data ? (
                  <Space direction="vertical" style={{ width: "100%" }} size="small">
                    {/* Product Name */}
                    <div>
                      <Text type="secondary">Product Name:</Text>
                      <br />
                      <Text strong>
                        {result.extracted_data?.product_name || (
                          <Text type="danger">Not extracted</Text>
                        )}
                      </Text>
                    </div>

                    <Divider style={{ margin: "8px 0" }} />

                    {/* Price */}
                    <div>
                      <Text type="secondary">Price:</Text>
                      <br />
                      <Text strong>
                        {typeof result.extracted_data?.price === 'number' ? (
                          <Text style={{ fontSize: 16, color: "#52c41a" }}>
                            {result.extracted_data.price.toLocaleString()}
                          </Text>
                        ) : (
                          <Text type="danger">Not extracted</Text>
                        )}
                      </Text>
                    </div>

                    <Divider style={{ margin: "8px 0" }} />

                    {/* Quantity */}
                    <div>
                      <Text type="secondary">Quantity:</Text>
                      <br />
                      <Text strong>
                        {typeof result.extracted_data?.quantity === 'number' ? (
                          result.extracted_data.quantity
                        ) : (
                          <Text type="danger">Not extracted</Text>
                        )}
                      </Text>
                    </div>

                    <Divider style={{ margin: "8px 0" }} />

                    {/* Images */}
                    <div>
                      <Text type="secondary">Images:</Text>
                      <br />
                      {result.extracted_data?.images &&
                      result.extracted_data.images.length > 0 ? (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {result.extracted_data.images.slice(0, 8).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Product ${idx + 1}`}
                              className="w-full h-20 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Text type="danger">Not extracted</Text>
                      )}
                      {result.extracted_data?.images &&
                        result.extracted_data.images.length > 8 && (
                          <Text type="secondary" className="mt-1">
                            +{result.extracted_data.images.length - 8} more
                          </Text>
                        )}
                    </div>

                    <Divider style={{ margin: "8px 0" }} />

                    {/* Description */}
                    <div>
                      <Text type="secondary">Description:</Text>
                      <br />
                      {result.extracted_data?.description ? (
                        <div
                          className="mt-2 p-2 bg-gray-50 rounded border max-h-40 overflow-auto"
                          dangerouslySetInnerHTML={{
                            __html: result.extracted_data.description.substring(
                              0,
                              500
                            ),
                          }}
                        />
                      ) : (
                        <Text type="danger">Not extracted</Text>
                      )}
                      {result.extracted_data?.description &&
                        result.extracted_data.description.length > 500 && (
                          <Text type="secondary">
                            ... (truncated, total length:{" "}
                            {result.extracted_data.description.length} chars)
                          </Text>
                        )}
                    </div>
                  </Space>
                ) : (
                  <Empty description="No data extracted" />
                )}
              </Card>
            </Space>
          </TabPane>
        ))}
      </Tabs>
    </Modal>
  );
};

export default TestResultModal;
