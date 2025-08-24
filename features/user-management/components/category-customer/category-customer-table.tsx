import { useState } from "react";
import { Button, Form, Tag, Tooltip } from "antd";
import AddCustomerTypeModal from "./modal-edit-category-customer";
import TableComponent from "@/components/TableComponent";
import {
  useCreateNewCateGoryCus,
  useListCateGoryCus,
  useUpdateCateGoryCus,
} from "../../hooks/staff-manage";
import { ColumnsType } from "antd/es/table";
import { Category, CategoryRequest } from "@/types/category-customer";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTags } from "@fortawesome/free-solid-svg-icons";

export default function CategoryCustomerTable() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [id, setId] = useState('');

  const queryClient = useQueryClient();
  const [editingCate, setEditingCate] = useState<CategoryRequest | null>(null);
  const { data } = useListCateGoryCus({
    page,
    page_size: 10,
    search: undefined,
  });
  const updateCateMutation = useUpdateCateGoryCus();

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
        onError: () => {
          toast.error("Tạo loại khách hàng mới thất bại");
        },
      }
    );
  };

  const handleUpdate = (dataForm: CategoryRequest)=> {
    const { category_name, description, deposit_percentage } = dataForm;
    updateCateMutation.mutate(
      {
        param: { category_name, description, deposit_percentage },
        id,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật loại khách hàng thành công!");
          queryClient.invalidateQueries({ queryKey: ["listCate"] });
          setOpen(false);
        },
        onError: () => {
          toast.error("Cập nhật loại khách hàng thất bại");
        },
      }
    );
  }

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Tên Loại",
      dataIndex: "category_name",
      key: "category_name",
      render: (text: string) => (
        <Tag className="font-semibold text-[13px] px-3 py-1">{text}</Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số lượng KH",
      dataIndex: "customer_count",
      key: "customer_count",
    },
    {
      title: "Hành động",
      key: "actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Category) => (
        <div className="flex space-x-3">
          {/* Sửa chính sách */}
          <Tooltip title="Sửa Chính sách">
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

          <Tooltip title="Chỉnh sửa phân loại">
            <Button
            onClick={()=>{
              setId(record.id.toString());
              setEditingCate({
                category_name: record.category_name,
                description: record.description,
                deposit_percentage: record.deposit_percentage
              });
              setOpen(true)
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
        rowHeight={50}
        pageSize={10}
        page={data?.current_page || 0}
        onPageChange={handleChangePage}
        response={data}
      />
      <AddCustomerTypeModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingCate(null);
          setId('null')
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
    </div>
  );
}
