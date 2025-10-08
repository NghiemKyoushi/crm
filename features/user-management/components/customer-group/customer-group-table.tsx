import { useState } from "react";
import { Button, Form, Input, Tag, Tooltip } from "antd";
import AddCustomerTypeModal from "./modal-edit-customer-group";
import TableComponent from "@/components/TableComponent";
import {
  useCreateNewCateGoryCus,
  useDeleteCateGoryCus,
  useListCateGoryCus,
  useUpdateCateGoryCus,
} from "../../hooks/staff-manage";
import { ColumnsType } from "antd/es/table";
import { Category, CategoryRequest } from "@/types/customer-group";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSearch, faTags, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import PopupConfirm from "@/components/PopupConfirm";
import { getContrastColor } from "../customer-manage/customer-type-select";
import FeeConfigModal from "./fee-config-modal";
import { useRouter } from "next/navigation";

export default function CategoryCustomerTable() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [id, setId] = useState("");
  const { t } = useTranslation();
  const [openConfirmDeleteCate, setOpenConfirmDeleteCate] = useState(false);
  const [search, setSearch] = useState<string>(""); // 👈 thêm search state
  const [isOpenFeeSetting, setIsOpenFeeSetting] = useState(false);
  const queryClient = useQueryClient();
  const [editingCate, setEditingCate] = useState<CategoryRequest | null>(null);
  const { data } = useListCateGoryCus({
    page,
    page_size: 10,
    search: search || undefined,
  });
  const updateCateMutation = useUpdateCateGoryCus();
  const deleteCateMutation = useDeleteCateGoryCus();
  const createNewCateMutation = useCreateNewCateGoryCus();
  const router = useRouter();
  const handleSearch = () => {
    setPage(0); // reset về trang 1 khi search
    queryClient.invalidateQueries({ queryKey: ["listCate"] });
  };
  const handleAdd = (dataForm: CategoryRequest) => {
    const { group_name, description, deposit_percentage, color } = dataForm;
    createNewCateMutation.mutate(
      {
        group_name,
        description,
        deposit_percentage,
        color
      },
      {
        onSuccess: () => {
          toast.success(t('categoryCustomer.createSuccess'));
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
    const { group_name, description, deposit_percentage, color } = dataForm;
    updateCateMutation.mutate(
      {
        param: { group_name, description, deposit_percentage, color },
        id,
      },
      {
        onSuccess: () => {
          toast.success(t('categoryCustomer.updateSuccess'));
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
          toast.success(t('categoryCustomer.deleteSuccess'));
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
      dataIndex: "group_name",
      key: "group_name",
      width: 180,
      render: (text: string, record: Category) => (
        <Tag
          style={{
            backgroundColor: record.color ? record.color : undefined,
            color: record.color ? getContrastColor(record.color): "#ffffff",
          }}
          className="text-xs px-3 py-1"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: t("customerCate.description"),
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (text: string) => (
        <div className="text-sm text-gray-700">{text || "-"}</div>
      ),
    },
    {
      title: t("customerCate.customerCount"),
      dataIndex: "customer_count",
      key: "customer_count",
      width: 130,
      align: "center",
      render: (count: number) => (
        <div className="text-sm text-gray-700">{count || 0}</div>
      ),
    },
    {
      title: t("customerCate.actions"),
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_: any, record: Category) => (
        <div className="flex space-x-2 justify-center">
          <Tooltip title={t("customerCate.editPolicy")}>
            <Button
              type="text"
              size="small"
              icon={
                <FontAwesomeIcon
                  icon={faEdit}
                  className={"text-indigo-600 hover:text-indigo-800 text-sm"}
                />
              }
              onClick={()=>{
                router.push(`/customer-group/${record.id}`)
              }}
            />
          </Tooltip>

          <Tooltip title={t("customerCate.editCategory")}>
            <Button
              onClick={() => {
                setId(record.id.toString());
                setEditingCate({
                  group_name: record.group_name,
                  description: record.description,
                  deposit_percentage: record.deposit_percentage,
                  color: record.color,
                });
                setOpen(true);
              }}
              type="text"
              size="small"
              disabled={record.id === 1}
              icon={
                <FontAwesomeIcon
                  icon={faTags}
                  className={record.id === 1 ? "text-gray-400 text-sm" : "text-green-600 hover:text-green-800 text-sm"}
                />
              }
            />
          </Tooltip>
          <Tooltip title={record.id === 1 ? t("categoryCustomer.cannotDeleteDefaultGroup") : t("customerCate.delete")}>
            <Button
              type="text"
              size="small"
              danger
              disabled={record.id === 1}
              icon={
                <FontAwesomeIcon
                  icon={faTrash}
                  className={record.id === 1 ? "text-gray-400 transition-colors duration-200" : "text-red-600 hover:text-red-800 transition-colors duration-200"}
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
          {t('categoryCustomer.title')}
        </h2>
        <Button
          type="primary"
          onClick={() => setOpen(true)}
          className="!bg-blue-500 !hover:bg-blue-600 !font-medium"
        >
          {t('categoryCustomer.addNewType')}
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder={t('categoryCustomer.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faSearch} />}
          onClick={handleSearch}
        >
          {t('common.search')}
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
      <AddCustomerTypeModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingCate(null);
          setId("null");
        }}
        initialData={editingCate}
        onSubmit={(data, isEdit) => {
          if (isEdit) {
            handleUpdate(data);
          } else {
            handleAdd(data);
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
      <FeeConfigModal open={isOpenFeeSetting} onCancel={()=> setIsOpenFeeSetting(false)}/>

    </div>
  );
}
