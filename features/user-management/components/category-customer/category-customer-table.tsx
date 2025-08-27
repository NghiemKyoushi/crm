import { useState } from "react";
import { Button, Form, Tag, Tooltip } from "antd";
import AddCustomerTypeModal from "./modal-edit-category-customer";
import TableComponent from "@/components/TableComponent";
import {
  useCreateNewCateGoryCus,
  useDeleteCateGoryCus,
  useListCateGoryCus,
  useUpdateCateGoryCus,
} from "../../hooks/staff-manage";
import { ColumnsType } from "antd/es/table";
import { Category, CategoryRequest } from "@/types/category-customer";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTags, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import PopupConfirm from "@/components/PopupConfirm";

export default function CategoryCustomerTable() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [id, setId] = useState("");
  const { t } = useTranslation();
  const [openConfirmDeleteCate, setOpenConfirmDeleteCate] = useState(false);

  const queryClient = useQueryClient();
  const [editingCate, setEditingCate] = useState<CategoryRequest | null>(null);
  const { data } = useListCateGoryCus({
    page,
    page_size: 10,
    search: undefined,
  });
  const updateCateMutation = useUpdateCateGoryCus();
  const deleteCateMutation = useDeleteCateGoryCus();
  const createNewCateMutation = useCreateNewCateGoryCus();
  const handleAdd = (dataForm: CategoryRequest) => {
    const { category_name, description, deposit_percentage } = dataForm;
    createNewCateMutation.mutate(
      {
        category_name,
        description,
        deposit_percentage,
      },
      {
        onSuccess: () => {
          toast.success("Tạo loại khách hàng mới thành công!");
          queryClient.invalidateQueries({
            queryKey: ["listCate"],
          });
          setOpen(false);
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  const handleUpdate = (dataForm: CategoryRequest) => {
    const { category_name, description, deposit_percentage, color } = dataForm;
    updateCateMutation.mutate(
      {
        param: { category_name, description, deposit_percentage, color },
        id,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật loại khách hàng thành công!");
          queryClient.invalidateQueries({ queryKey: ["listCate"] });
          setOpen(false);
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
  };

  const handleDelete = () => {
    deleteCateMutation.mutate(
      {
        id,
      },
      {
        onSuccess: () => {
          toast.success("Xóa loại khách hàng thành công!");
          queryClient.invalidateQueries({ queryKey: ["listCate"] });
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
  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const columns: ColumnsType<Category> = [
    {
      title: t("customerCate.name"),
      dataIndex: "category_name",
      key: "category_name",
      render: (text: string, record: Category) => (
        <Tag
          style={{
            backgroundColor: record.color ? record.color : undefined,
            color: "#fff",
          }}
          className="font-semibold text-[13px] px-3 py-1"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: t("customerCate.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("customerCate.customerCount"),
      dataIndex: "customer_count",
      key: "customer_count",
    },
    {
      title: t("customerCate.actions"),
      key: "actions",
      render: (_: any, record: Category) => (
        <div className="flex space-x-3">
          <Tooltip title={t("customerCate.editPolicy")}>
            <Button
              type="text"
              icon={
                <FontAwesomeIcon
                  icon={faEdit}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                />
              }
            />
          </Tooltip>

          <Tooltip title={t("customerCate.editCategory")}>
            <Button
              onClick={() => {
                setId(record.id.toString());
                setEditingCate({
                  category_name: record.category_name,
                  description: record.description,
                  deposit_percentage: record.deposit_percentage,
                  color: record.color
                });
                setOpen(true);
              }}
              type="text"
              icon={
                <FontAwesomeIcon
                  icon={faTags}
                  className="text-green-600 hover:text-green-800 transition-colors duration-200"
                />
              }
            />
          </Tooltip>
          <Tooltip title={t("customerCate.delete")}>
            <Button
              type="text"
              danger
              icon={
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                />
              }
              onClick={() => {
                setId(record.id.toString());
                setOpenConfirmDeleteCate(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white shadow-md rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Phân loại Khách hàng & Chính sách đi kèm
        </h2>
        <Button
          type="primary"
          onClick={() => setOpen(true)}
          className="!bg-blue-500 !hover:bg-blue-600 !font-medium"
        >
          + Thêm Loại mới
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
      />
      <AddCustomerTypeModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingCate(null);
          setId("null");
        }}
        initialData={editingCate} // 👈 nếu null = thêm mới, có data = edit
        onSubmit={(data, isEdit) => {
          if (isEdit) {
            handleUpdate(data); // gọi API update
          } else {
            handleAdd(data); // gọi API create
          }
        }}
      />
      <PopupConfirm
        open={openConfirmDeleteCate}
        type={"delete"}
        title={"Xác nhận xoá loại khách hàng"}
        content={`Bạn có chắc chắn muốn xoá loại khách hàng?`}
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirmDeleteCate(false)}
        confirmText={"Xoá"}
        cancelText="Huỷ"
      />
    </div>
  );
}
