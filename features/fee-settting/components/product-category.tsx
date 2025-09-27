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
  faBaby,
  faCouch,
  faFlask,
  faGamepad,
  faGolfBallTee,
  faLaptop,
  faShoePrints,
  faShoppingBag,
  faTshirt,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";

const iconOptions = [
  { label: "Quần áo", value: "faTshirt", icon: faTshirt },
  { label: "Giày dép", value: "faShoePrints", icon: faShoePrints },
  { label: "Túi xách", value: "faShoppingBag", icon: faShoppingBag },
  { label: "Đồ gia dụng", value: "faCouch", icon: faCouch },
  { label: "Đồ trẻ em", value: "faBaby", icon: faBaby },
  { label: "Thực phẩm", value: "faUtensils", icon: faUtensils },
  { label: "Golf", value: "faGolfBallTee", icon: faGolfBallTee },
  { label: "Đồ chơi", value: "faGamepad", icon: faGamepad },
  { label: "Laptop", value: "faLaptop", icon: faLaptop },
  { label: "Mỹ phẩm", value: "faFlask", icon: faFlask },
];
const ProductTypeTable: React.FC = () => {
  const { t } = useTranslation();

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
              toast.success("Cập nhật loại sản phẩm thành công!");
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
        createNewProductTypeMutation.mutate(
          {
            name: values.name,
            description: values.description,
            icon: values.icon,
          },
          {
            onSuccess: () => {
              toast.success("Tạo loại sản mới thành công!");
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
    { title: "Tên loại sản phẩm", width: 350, dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      width: 350,
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Ngày tạo",
      width: 150,
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => {
        if (!value) return "-";
        return dayjs(value).format("DD-MM-YYYY");
      },
    },

    {
      title: t("websiteManage.table.region"),
      key: "action",
      width: 100,
      render: (_: any, record: CategoryItem) => (
        <div className="space-x-2">
          <Button
            type="primary"
            // className="!text-blue-500"
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
    <div className="p-6 bg-white rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{t("websiteManage.page.title")}</h2>
        <Button type="primary" onClick={() => handleOpenModal()}>
          + Thêm loại sản phẩm
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
        title={
          editingWebsite ? "Chỉnh sửa loại sản phẩm" : "Thêm loại sản phẩm"
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
            label={"Tên loại sản phẩm"}
            name="name"
            rules={[
              {
                required: true,
                message: "Tên loại sản phẩm là trường bắt buộc ",
              },
            ]}
          >
            <Input placeholder={t("websiteManage.form.placeholderName")} />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Mô tả là trường bắt buộc " }]}
          >
            <Input placeholder={t("websiteManage.form.placeholderUrl")} />
          </Form.Item>
          <Form.Item
            label="Icon"
            name="icon"
            rules={[{ required: true, message: "Vui lòng chọn icon" }]}
          >
            <Select
              showSearch
              placeholder="Chọn icon đại diện"
              optionLabelProp="label"
            >
              {iconOptions.map((opt) => (
                <Select.Option
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={opt.icon} />
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
