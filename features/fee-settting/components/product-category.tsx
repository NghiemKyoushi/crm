"use client";
import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select } from "antd";
import TableComponent from "@/components/TableComponent";

import { ColumnsType } from "antd/es/table";
import { Website } from "@/types/website-manage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PopupConfirm from "@/components/PopupConfirm";
import {
  useCreateNewProductType,
  useListProductType,
  useUpdateProductType,
} from "../hooks/fee-setting";
import { CategoryItem } from "@/types/fee-setting";
import {
  SmileOutlined,
  HomeOutlined,
  ExperimentOutlined,
  PlaySquareOutlined,
  AimOutlined,
  LaptopOutlined,
  SkinOutlined,
  ShoppingOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const ProductTypeTable: React.FC = () => {
  const { t } = useTranslation();

  const iconOptions = [
    { label: t('productType.categories.clothes'), value: "faTshirt", icon: SkinOutlined },
    { label: t('productType.categories.shoes'), value: "faShoePrints", icon: SkinOutlined },
    { label: t('productType.categories.bags'), value: "faShoppingBag", icon: ShoppingOutlined },
    { label: t('productType.categories.household'), value: "faCouch", icon: HomeOutlined },
    { label: t('productType.categories.baby'), value: "faBaby", icon: SmileOutlined },
    { label: t('productType.categories.food'), value: "faUtensils", icon: CoffeeOutlined },
    { label: t('productType.categories.golf'), value: "faGolfBallTee", icon: AimOutlined },
    { label: t('productType.categories.toys'), value: "faGamepad", icon: PlaySquareOutlined },
    { label: t('productType.categories.laptop'), value: "faLaptop", icon: LaptopOutlined },
    { label: t('productType.categories.cosmetics'), value: "faFlask", icon: ExperimentOutlined },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<CategoryItem | null>(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState<string>(""); // 👈 thêm search state
  const queryClient = useQueryClient();
  const [id, setId] = useState("");
  const [openConfirmDeleteCate, setOpenConfirmDeleteCate] = useState(false);

  const { data } = useListProductType({
    page,
    size: 10,
    search: search || undefined,
  });
  const createNewProductTypeMutation = useCreateNewProductType();
  const updateWebMutation = useUpdateProductType();
  //   const deleteWebMutation = useDeleteWebsite();

  const handleOpenModal = (record?: CategoryItem) => {
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
      if (editingWebsite && editingWebsite.id) {
        updateWebMutation.mutate(
          {
            id: editingWebsite.id,
            param: {
              name: values.name,
              description: values.description,
              icon: values.icon,
            },
          },
          {
            onSuccess: () => {
              toast.success(t('productType.updateSuccess'));
              queryClient.invalidateQueries({
                queryKey: ["listProductType"],
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
        createNewProductTypeMutation.mutate(
          {
            name: values.name,
            description: values.description,
            icon: values.icon,
          },
          {
            onSuccess: () => {
              toast.success(t('productType.createSuccess'));
              queryClient.invalidateQueries({
                queryKey: ["listProductType"],
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
    // deleteWebMutation.mutate(
    //     {
    //         id: +id,
    //     },
    //     {
    //         onSuccess: () => {
    //             toast.success("Xóa Website thành công!");
    //             queryClient.invalidateQueries({
    //                 queryKey: ["listwebsite"],
    //             });
    //             setOpenConfirmDeleteCate(false);
    //         },
    //         onError: (err: any) =>
    //             toast.error(
    //                 err.response?.data?.localizedMessage || t("common.error")
    //             ),
    //     }
    // );
    // setId("null");
  };

  //   const { data: regionList } = useListRegion();
  const columns: ColumnsType<CategoryItem> = [
    {
      title: t('productType.name'),
      width: 350,
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <div className="text-sm text-gray-800">{text}</div>
      )
    },
    {
      title: t('productType.description'),
      width: 350,
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="text-sm text-gray-700">{text || "-"}</div>
      )
    },
    {
      title: t('productType.createdDate'),
      width: 150,
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => {
        if (!value) return <div className="text-sm text-gray-700">-</div>;
        return <div className="text-sm text-gray-700">{dayjs(value).format("DD-MM-YYYY")}</div>;
      },
    },

    {
      title: t("websiteManage.table.region"),
      key: "action",
      width: 100,
      fixed: "right",
      render: (_: any, record: CategoryItem) => (
        <div className="flex justify-center">
          <Button
            type="primary"
            size="small"
            onClick={() => handleOpenModal(record)}
          >
            {t("websiteManage.action.edit")}
          </Button>
          {/* <Button
                        type="link"
                        className="!text-red-500"
                        onClick={() => {
                            // setId(record.id.toString());
                            setOpenConfirmDeleteCate(true);
                        }}
                    >
                        {t("websiteManage.action.delete")}
                    </Button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-medium text-gray-800">{t('productType.title')}</h2>
        <Button type="primary" size="large" onClick={() => handleOpenModal()}>
          {t('productType.addButton')}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <TableComponent
          columns={columns}
          dataSource={data?.data || []}
          rowHeight={55}
          pageSize={10}
          page={(data && data?.current_page + 1) || 0}
          onPageChange={handleChangePage}
          response={data}
          fontSize={13}
          headerHeight={46}
        />
      </div>

      <Modal
        title={
          editingWebsite ? t('productType.editTitle') : t('productType.addTitle')
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText={t("common.save")}
        cancelText={t("common.cancel")}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('productType.name')}
            name="name"
            rules={[
              {
                required: true,
                message: t('productType.nameRequired'),
              },
            ]}
          >
            <Input placeholder={t('productType.namePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('productType.description')}
            name="description"
            rules={[{ required: true, message: t('productType.descriptionRequired') }]}
          >
            <Input placeholder={t('productType.descriptionPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('productType.icon')}
            name="icon"
            rules={[{ required: true, message: t('productType.iconRequired') }]}
          >
            <Select
              showSearch
              placeholder={t('productType.iconPlaceholder')}
              optionLabelProp="label"
            >
              {iconOptions.map((opt) => (
                <Select.Option
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                >
                  <div className="flex items-center gap-2">
                    <opt.icon />
                    <span>{opt.label}</span>
                  </div>
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

export default ProductTypeTable;
