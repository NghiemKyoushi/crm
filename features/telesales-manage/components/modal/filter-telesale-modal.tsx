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
      className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
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
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search - improved design */}
          <Form.Item name="search" className="!mb-0">
            <Input
              placeholder="Tìm kiếm..."
              className="!h-9 !text-sm !rounded-md !border-gray-300 hover:!border-blue-400 focus:!border-blue-500 focus:!shadow-lg !transition-all"
              style={{ width: 200 }}
              allowClear
              prefix={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </Form.Item>

          {/* Telesale */}
          <Form.Item name="saleId" className="!mb-0">
            <Select
              className="custom-select"
              style={{ width: 150 }}
              loading={loadingUsers}
              allowClear
              placeholder="Telesale"
              showSearch
              optionFilterProp="children"
              suffixIcon={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            >
              {Array.isArray(telesaleUserList) &&
                telesaleUserList.map((telesale: any) => (
                  <Option value={telesale.id} key={telesale.id}>
                    {telesale.fullname}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {/* Status */}
          <Form.Item name="status" className="!mb-0">
            <Select
              className="custom-select"
              style={{ width: 130 }}
              allowClear
              placeholder="Trạng thái"
              suffixIcon={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <Option value="CALLED">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Đã gọi
                </span>
              </Option>
              <Option value="NOT_CALLED">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Chưa gọi
                </span>
              </Option>
              <Option value="FAILED">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Thất bại
                </span>
              </Option>
              <Option value="UNASSIGNED">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Chưa gán
                </span>
              </Option>
            </Select>
          </Form.Item>

          {/* Service Tag */}
          <Form.Item name="service_tag_id" className="!mb-0">
            <Select
              className="custom-select"
              style={{ width: 130 }}
              loading={loading.service}
              allowClear
              placeholder="Dịch vụ"
              showSearch
              suffixIcon={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            >
              {serviceTags.map((tag) => (
                <Option value={tag.id} key={tag.id}>
                  {tag.label ?? tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Source Tag */}
          <Form.Item name="source_tag_id" className="!mb-0">
            <Select
              className="custom-select"
              style={{ width: 120 }}
              loading={loading.source}
              allowClear
              placeholder="Nguồn"
              showSearch
              suffixIcon={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              {sourceTags.map((tag) => (
                <Option value={tag.id} key={tag.id}>
                  {tag.label ?? tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Filter Button */}
          <Form.Item className="!mb-0">
            <Button
              type="primary"
              icon={<FontAwesomeIcon icon={faFilter} className="!h-3.5 !w-3.5" />}
              htmlType="submit"
              className="!h-9 !px-5 !rounded-md !shadow-md hover:!shadow-lg !transition-all !font-medium"
            >
              Lọc
            </Button>
          </Form.Item>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Bulk Assign Button */}
          <Form.Item className="!mb-0">
            <Button
              icon={<FontAwesomeIcon icon={faUserTag} className="!h-3.5 !w-3.5" />}
              className="!bg-gradient-to-r !from-purple-600 !to-purple-700 hover:!from-purple-700 hover:!to-purple-800 !text-white disabled:!opacity-40 disabled:!cursor-not-allowed !h-9 !px-5 !rounded-md !shadow-md hover:!shadow-lg !transition-all !font-medium"
              disabled={selectedRowKeys.length === 0}
              onClick={onBulkAssign}
            >
              Gán loạt {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
            </Button>
          </Form.Item>
        </div>
      </div>

      <style jsx global>{`
        .custom-select .ant-select-selector {
          height: 36px !important;
          border-radius: 6px !important;
          border-color: #d1d5db !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          transition: all 0.2s !important;
        }
        .custom-select .ant-select-selector:hover {
          border-color: #60a5fa !important;
        }
        .custom-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        .custom-select .ant-select-selection-placeholder {
          line-height: 36px !important;
          color: #9ca3af !important;
          font-size: 14px !important;
        }
        .custom-select .ant-select-selection-item {
          line-height: 36px !important;
          font-size: 14px !important;
        }
      `}</style>
    </Form>
  );
};