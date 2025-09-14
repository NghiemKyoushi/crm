"use client";
import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select } from "antd";
import TableComponent from "@/components/TableComponent";
import {
  useCreateNewWebsite,
  useDeleteWebsite,
  useListRegion,
  useListWebsite,
  useUpdateWebsite,
} from "../hooks/web-manage";
import { ColumnsType } from "antd/es/table";
import {Website } from "@/types/website-manage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PopupConfirm from "@/components/PopupConfirm";

const WebsiteManageTable: React.FC = () => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState<string>(""); // 👈 thêm search state
  const queryClient = useQueryClient();
  const [id, setId] = useState("");
  const [openConfirmDeleteCate, setOpenConfirmDeleteCate] = useState(false);

  const { data } = useListWebsite({
    page,
    size: 10,
    search: search || undefined,
  });
  const createNewWebMutation = useCreateNewWebsite();
  const updateWebMutation = useUpdateWebsite();
  const deleteWebMutation = useDeleteWebsite();

  const handleOpenModal = (record?: Website) => {
    if (record) {
      setEditingWebsite(record);
      form.setFieldsValue(record);
    } else {
      setEditingWebsite(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingWebsite) {
        updateWebMutation.mutate(
          {
            id: editingWebsite.id,
            param: {
              name: values.name,
              domain: values.domain,
              region_id: values.region_id,
            },
          },
          {
            onSuccess: () => {
              toast.success("Cập nhật Website thành công!");
              queryClient.invalidateQueries({
                queryKey: ["listwebsite"],
              });
              setIsModalOpen(false);
            },
            onError: (err: any) =>
              toast.error(
                err.response?.data?.localizedMessage || t("common.error")
              ),
          }
        );
      } else {
        createNewWebMutation.mutate(
          {
            domain: values.domain,
            name: values.name,
            region_id: values.region_id,
          },
          {
            onSuccess: () => {
              toast.success("Tạo Website mới thành công!");
              queryClient.invalidateQueries({
                queryKey: ["listwebsite"],
              });
              setIsModalOpen(false);
            },
            onError: (err: any) =>
              toast.error(
                err.response?.data?.localizedMessage || t("common.error")
              ),
          }
        );
      }
    });
  };
  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const handleDelete = () => {
    deleteWebMutation.mutate(
      {
        id: +id,
      },
      {
        onSuccess: () => {
          toast.success("Xóa Website thành công!");
          queryClient.invalidateQueries({
            queryKey: ["listwebsite"],
          });
          setOpenConfirmDeleteCate(false);
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
    setId("null");
  };

  const { data: regionList } = useListRegion();
  const columns: ColumnsType<Website> = [
    { title: t("websiteManage.table.name"), dataIndex: "name", key: "name" },
    { title: "URL", dataIndex: "domain", key: "domain" },
    {
      title: t("websiteManage.table.region"),
      dataIndex: "region",
      key: "region",
      render: (region_id: number, record: Website) => {     
        console.log('regionList?.data', regionList?.data, record.region_id);
           
        if (record.region !== null && record.region?.name) return record.region.name;
        const regionName = regionList?.data.find(
          (r) => r.id === record.region_id
        )?.name;
        return regionName ?? "-";
      },
    },
    {
      title: t("websiteManage.table.region"),
      key: "action",
      render: (_: any, record: Website) => (
        <div className="space-x-2">
          <Button
            type="link"
            className="!text-blue-500"
            onClick={() => handleOpenModal(record)}
          >
            {t("websiteManage.action.edit")}
          </Button>
          <Button
            type="link"
            className="!text-red-500"
            onClick={() => {
              setId(record.id.toString());
              setOpenConfirmDeleteCate(true);
            }}
          >
            {t("websiteManage.action.delete")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{t("websiteManage.page.title")}</h2>
        <Button type="primary" onClick={() => handleOpenModal()}>
          + {t("websiteManage.page.add")}
        </Button>
      </div>

      <TableComponent
        columns={columns}
        dataSource={data?.data || []}
        rowHeight={45}
        pageSize={10}
        page={(data && data?.current_page + 1) || 0}
        onPageChange={handleChangePage}
        response={data}
        fontSize={14}
        headerHeight={44}
      />

      <Modal
        title={editingWebsite ? t("websiteManage.modal.editTitle") : t("websiteManage.modal.addTitle")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("websiteManage.form.name")}
            name="name"
            rules={[{ required: true, message: t("websiteManage.form.requiredName") }]}
          >
            <Input placeholder={t("websiteManage.form.placeholderName")} />
          </Form.Item>

          <Form.Item
            label="URL"
            name="domain"
            rules={[{ required: true, message: t("websiteManage.form.requiredUrl") }]}
          >
            <Input placeholder={t("websiteManage.form.placeholderUrl")}/>
          </Form.Item>

          <Form.Item
            label={t("websiteManage.form.region")}
            name="region_id"
            rules={[{ required: true, message: t("websiteManage.form.requiredRegion") }]}
          >
            <Select placeholder={t("websiteManage.form.placeholderRegion")}>
              {regionList?.data?.map((region) => (
                <Select.Option key={region.id} value={region.id}>
                  {region.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <PopupConfirm
        open={openConfirmDeleteCate}
        type={"delete"}
        title={t("websiteManage.delete.title")}
        content={t("websiteManage.delete.content")}
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirmDeleteCate(false)}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
};

export default WebsiteManageTable;
