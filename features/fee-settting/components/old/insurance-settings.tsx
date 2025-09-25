"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import TableComponent from "@/components/TableComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import {
  useListInsurance,
  useCreateInsurance,
  useUpdateInsurance,
  useDeleteInsurance,
} from "../../hooks/fee-setting";
import { InsuranceModel } from "@/types/fee-setting";
import PopupConfirm from "@/components/PopupConfirm";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const { Option } = Select;

const InsuranceSettings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<InsuranceModel | null>(null);

  const [page, setPage] = useState(0);
  const [openConfirmDeleteCate, setOpenConfirmDeleteCate] = useState(false);
  const { t } = useTranslation();
  const [id, setId] = useState("");

  const [form] = Form.useForm<InsuranceModel>();

  // Query
  const { data, isLoading } = useListInsurance();

  // Mutations
  const createMutation = useCreateInsurance();
  const updateMutation = useUpdateInsurance();
  const deleteMutation = useDeleteInsurance();

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  // Thêm mới hoặc cập nhật
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (editMode && currentItem) {
          updateMutation.mutate(
            {
              id: currentItem.id,
              body: {
                name: values.name,
                description: values.description,
                fee_percentage: +values.fee_percentage,
                max_value_vnd: +values.max_value_vnd,
                status: values.status,
              },
            },
            {
              onSuccess: () => {
                message.success(t("insurance.confirm_update") + " " + t("common.success"));
                setIsModalOpen(false);
                form.resetFields();
                setEditMode(false);
                setCurrentItem(null);
              },
              onError: (err: any) =>
                toast.error(
                  err.response?.data?.localizedMessage || t("common.error")
                ),
            }
          );
        } else {
          createMutation.mutate(
            {
              description: values.description,
              fee_percentage: values.fee_percentage,
              max_value_vnd: values.max_value_vnd,
              name: values.name,
              status: values.status,
            },
            {
              onSuccess: () => {
                message.success(t("insurance.confirm_add") + " " + t("common.success"));
                setIsModalOpen(false);
                form.resetFields();
              },
              onError: (err: any) =>
                toast.error(
                  err.response?.data?.localizedMessage || t("common.error")
                ),
            }
          );
        }
      })
      .catch(() => {});
  };

  // Xoá
  const handleDelete = () => {
    deleteMutation.mutate(+id, {
      onSuccess: () => {
        message.success(t("insurance.delete_title") + " " + t("common.success"));
      },
      onError: (err: any) =>
        toast.error(err.response?.data?.localizedMessage || t("common.error")),
    });
  };

  // Map API data -> UI data
  const tableData: InsuranceModel[] =
    data?.map((item: InsuranceModel) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      fee_percentage: item.fee_percentage ? item.fee_percentage : "-",
      max_value_vnd: item.max_value_vnd ? item.max_value_vnd : 0,
      status: item.status,
    })) || [];

  const columns: ColumnsType<InsuranceModel> = [
    {
      title: t("insurance.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("insurance.description"),
      dataIndex: "description",
      key: "description",
      render: (val: string) => (
        <div className="text-sm max-w-xs whitespace-pre-line break-words">
          {val}
        </div>
      ),
    },
    {
      title: t("insurance.fee"),
      dataIndex: "fee_percentage",
      key: "fee_percentage",
    },
    {
      title: t("insurance.max_value"),
      dataIndex: "max_value_vnd",
      key: "max_value_vnd",
      render: (val: string) => (
        <span className="text-green-600 whitespace-pre-line">
          {val && (+val).toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      title: t("insurance.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        switch (status) {
          case "ACTIVE":
            return <Tag color="green">{t("insurance.status_active")}</Tag>;
          case "INACTIVE":
            return <Tag color="red">{t("insurance.status_inactive")}</Tag>;
          case "DEFAULT":
            return <Tag color="blue">{t("insurance.status_default")}</Tag>;
          default:
            return <Tag>{status}</Tag>;
        }
      },
    },
    {
      title: t("common.action"),
      key: "action",
      render: (_, record: InsuranceModel) => {
        return (
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setEditMode(true);
                setCurrentItem(record);
                form.setFieldsValue({
                  name: record.name,
                  description: record.description,
                  fee_percentage: record.fee_percentage,
                  max_value_vnd: record.max_value_vnd,
                  status: record.status,
                });
                setIsModalOpen(true);
              }}
            >
              {t("common.edit")}
            </Button>
            <Button
              danger
              size="small"
              onClick={() => {
                setId(record.id.toString());
                setOpenConfirmDeleteCate(true);
              }}
            >
              {t("common.delete")}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg ">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t("insurance.title")}</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!bg-green-500"
          onClick={() => {
            setEditMode(false);
            form.resetFields();
            form.setFieldsValue({ status: "ACTIVE" });
            setIsModalOpen(true);
          }}
        >
          {t("insurance.add")}
        </Button>
      </div>
      {/* Alert */}
      <div className="flex gap-3 p-4 mb-4 border-l-4 border-red-500 bg-red-50 rounded">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-red-500 text-lg mt-1"
        />
        <div>
          <h4 className="font-semibold text-red-600 mb-1">
            {t("insurance.alert_title")}
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>{t("insurance.alert_rule_1")}</li>
            <li>{t("insurance.alert_rule_2")}</li>
            <li>{t("insurance.alert_rule_3")}</li>
          </ul>
        </div>
      </div>

      {/* Table */}
      <TableComponent
        columns={columns}
        dataSource={tableData || []}
        loading={isLoading}
        rowHeight={45}
        pageSize={10}
        page={page}
        onPageChange={handleChangePage}
        response={undefined}
        fontSize={14}
        headerHeight={44}
      />

      {/* Modal */}
      <Modal
        title={editMode ? t("insurance.update") : t("insurance.add_new")}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditMode(false);
          setCurrentItem(null);
        }}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t("insurance.name")}
            rules={[
              { required: true, message: t("insurance.name") + " " + t("common.required") },
            ]}
          >
            <Input placeholder={t("insurance.name_placeholder")} />
          </Form.Item>
          <Form.Item name="description" label={t("insurance.description")}>
            <Input.TextArea
              rows={3}
              placeholder={t("insurance.description_placeholder")}
            />
          </Form.Item>
          <Form.Item
            name="fee_percentage"
            label={t("insurance.fee")}
            rules={[{ required: true, message: t("insurance.fee") + " " + t("common.required") }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={t("insurance.fee_placeholder")}
              min={0}
              step={0.1}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: any) => value.replace(/,/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="max_value_vnd"
            label={t("insurance.max_value")}
            rules={[
              { required: true, message: t("insurance.max_value") + " " + t("common.required") },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={t("insurance.max_value_placeholder")}
              min={0}
              step={1000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: any) => value.replace(/,/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={t("insurance.status")}
            rules={[{ required: true, message: t("insurance.status") + " " + t("common.required") }]}
          >
            <Select>
              <Option value="ACTIVE">{t("insurance.status_active")}</Option>
              <Option value="INACTIVE">{t("insurance.status_inactive")}</Option>
              <Option value="DEFAULT">{t("insurance.status_default")}</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditMode(false);
                setCurrentItem(null);
              }}
            >
              {t("insurance.cancel")}
            </Button>
            <Button
              type="primary"
              className="!bg-green-500"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {editMode ? t("insurance.confirm_update") : t("insurance.confirm_add")}
            </Button>
          </div>
        </Form>
      </Modal>

      <PopupConfirm
        open={openConfirmDeleteCate}
        type={"delete"}
        title={t("insurance.delete_title")}
        content={t("insurance.delete_content")}
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirmDeleteCate(false)}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
};

export default InsuranceSettings;
