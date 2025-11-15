import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Row, Col } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faUserTag } from "@fortawesome/free-solid-svg-icons";

const { Option } = Select;

// Utility function to fetch tags by type
import { getTelesaleTagFilter } from "../../apis/telesale-mng";

export async function fetchTagsByType(type: string) {
  try {
    return await getTelesaleTagFilter(type);
  } catch (e) {
    return [];
  }
}

export const FilterForm: React.FC<{
  telesaleUserList: any[];
  loadingUsers: boolean;
  onFilter: (params: {
    search: string;
    business_field: string | null;
    saleId: string | null;
    status: string | null;
    service_tag_id: string | null;
    source_tag_id: string | null;
    status_tag_id: string | null;
  }) => void;
  onBulkAssign: () => void;
  selectedRowKeys: React.Key[];
}> = ({
  telesaleUserList,
  loadingUsers,
  onFilter,
  onBulkAssign,
  selectedRowKeys,
}) => {
  const [form] = Form.useForm();

  const [serviceTags, setServiceTags] = useState<any[]>([]);
  const [sourceTags, setSourceTags] = useState<any[]>([]);
  const [situationTags, setSituationTags] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    service: false,
    source: false,
    situation: false,
  });

  useEffect(() => {
    setLoading((prev) => ({ ...prev, service: true }));
    fetchTagsByType("SERVICE")
      .then((data) => setServiceTags(data))
      .catch(() => setServiceTags([]))
      .finally(() => setLoading((prev) => ({ ...prev, service: false })));

    setLoading((prev) => ({ ...prev, source: true }));
    fetchTagsByType("SOURCE")
      .then((data) => setSourceTags(data))
      .catch(() => setSourceTags([]))
      .finally(() => setLoading((prev) => ({ ...prev, source: false })));

    setLoading((prev) => ({ ...prev, situation: true }));
    fetchTagsByType("STATUS")
      .then((data) => setSituationTags(data))
      .catch(() => setSituationTags([]))
      .finally(() => setLoading((prev) => ({ ...prev, situation: false })));
  }, []);
 
//   console.log("check data", serviceTags, sourceTags, situationTags );
  
  const handleSubmit = (values: any) => {
    onFilter({
      search: values.search ?? "",
      business_field: values.business_field !== undefined && values.business_field !== "" ? values.business_field : null,
      saleId: values.saleId !== undefined && values.saleId !== "" ? values.saleId : null,
      status: values.status !== undefined && values.status !== "" ? values.status : null,
      service_tag_id: values.service_tag_id !== undefined && values.service_tag_id !== "" ? values.service_tag_id : null,
      source_tag_id: values.source_tag_id !== undefined && values.source_tag_id !== "" ? values.source_tag_id : null,
      status_tag_id: values.status_tag_id !== undefined && values.status_tag_id !== "" ? values.status_tag_id : null,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="mb-4 bg-white px-4 py-3 rounded-lg "
      initialValues={{
        search: "",
        business_field: null,
        saleId: null,
        status: null,
        service_tag_id: null,
        source_tag_id: null,
        status_tag_id: null,
      }}
      onFinish={handleSubmit}
    >
      <Row gutter={16} style={{ marginBottom: 0 }}>
        <Col xs={24} md={8} lg={6}>
          <Form.Item name="search" label="Tìm kiếm">
            <Input
              placeholder="Tên, SĐT, Email..."
              className="!h-10"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Form.Item name="business_field" label="Lĩnh vực kinh doanh">
            <Input
              placeholder="Ngành nghề, lĩnh vực kinh doanh..."
              className="!h-10"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Form.Item name="saleId" label="Telesale phụ trách">
            <Select
              className="!h-10"
              loading={loadingUsers}
              allowClear
              placeholder="-- Tất cả Telesale --"
              showSearch
              optionFilterProp="children"
            >
              <Option value={null}>-- Tất cả Telesale --</Option>
              {Array.isArray(telesaleUserList) &&
                telesaleUserList.map((telesale: any) => (
                  <Option value={telesale.id} key={telesale.id}>
                    {telesale.fullname} - {telesale.email}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Form.Item name="status" label="Trạng thái">
            <Select className="!h-10" allowClear placeholder="-- Tất cả trạng thái --">
              <Option value={null}>-- Tất cả trạng thái --</Option>
              <Option value="CALLED">Thành công</Option>
              <Option value="NOT_CALLED">Chưa gọi</Option>
              <Option value="FAILED">Thất bại</Option>
              <Option value="UNASSIGNED">Chưa gán</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Form.Item name="service_tag_id" label="Loại dịch vụ">
            <Select
              className="!h-10"
              loading={loading.service}
              allowClear
              placeholder="-- Loại dịch vụ --"
              showSearch
              optionFilterProp="children"
            >
              <Option value={null}>-- Tất cả loại dịch vụ --</Option>
              {serviceTags.map((tag) => (
                <Option value={tag.id} key={tag.id}>
                  {tag.label ?? tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Form.Item name="source_tag_id" label="Nguồn">
            <Select
              className="!h-10"
              loading={loading.source}
              allowClear
              placeholder="-- Nguồn --"
              showSearch
              optionFilterProp="children"
            >
              <Option value={null}>-- Tất cả nguồn --</Option>
              {sourceTags.map((tag) => (
                <Option value={tag.id} key={tag.id}>
                  {tag.label ?? tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Form.Item name="status_tag_id" label="Tình trạng">
            <Select
              className="!h-10"
              loading={loading.situation}
              allowClear
              placeholder="-- Tình trạng --"
              showSearch
              optionFilterProp="children"
            >
              <Option value={null}>-- Tất cả tình trạng --</Option>
              {situationTags.map((tag) => (
                <Option value={tag.id} key={tag.id}>
                  {tag.label ?? tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col
          style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 5,
          }}
        >
          <Form.Item >
            <Button
              type="primary"
              icon={
                <FontAwesomeIcon
                  icon={faFilter}
                  className="text-white !h-6 !w-4"
                />
              }
              className="!h-10 !w-[130px]"
              htmlType="submit"
              style={{ minWidth: 110, fontWeight: 500 }}
            >
              Lọc
            </Button>
          </Form.Item>
          <Form.Item >
            <Button
              icon={
                <FontAwesomeIcon
                  icon={faUserTag}
                  className="text-white !h-6 !w-4"
                />
              }
              className="!bg-purple-600 !text-white !h-10 !w-[130px]"
              style={{ minWidth: 110, fontWeight: 500 }}
              disabled={selectedRowKeys.length === 0}
              onClick={onBulkAssign}
            >
              Gán hàng Loạt
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};