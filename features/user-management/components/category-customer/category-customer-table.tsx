import { useState } from "react";
import { Button, Form, Tag } from "antd";
import AddCustomerTypeModal from "./modal-edit-category-customer";
import TableComponent from "@/components/TableComponent";
import {
  useCreateNewCateGoryCus,
  useListCateGoryCus,
} from "../../hooks/staff-manage";
import { ColumnsType } from "antd/es/table";
import { Category, CategoryRequest } from "@/types/category-customer";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";


export default function CategoryCustomerTable() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useListCateGoryCus({
    page,
    page_size: 10,
    search: undefined,
  });

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
          queryClient.invalidateQueries({ queryKey: ["listCate"] });
          setOpen(false);
        },
        onError: () => {
          toast.error("Tạo loại khách hàng mới thất bại");
        },
      }
    );
  };

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber);
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
      render: () => (
        <Button type="link" className="text-indigo-600 font-medium">
          Sửa Chính sách
        </Button>
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
        onClose={() => setOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
}
