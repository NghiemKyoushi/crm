import TableComponent from "@/components/TableComponent";
import { Tabs, Card, Typography, InputNumber, Button, Tag } from "antd";
import UserMultiSelect from "./select-multi";
import { ColumnsType } from "antd/es/table";
import { CustomerModel } from "@/types/customer-type";
import { useCustomerForSale, useListCustomer } from "../../hooks/staff-manage";
import { useState } from "react";
import CustomerTypeSelect from "../customer-manage/customer-type-select";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAssignCustomerForSale } from "../../apis/staff-manage";
import PopupUnassignConfirm from "./modal-remove-assign";

const { Text } = Typography;

interface SalesDetailProps {
  salesId?: number;
  name: string;
  refetchSales: () => void;
}

export default function SalesDetail({
  salesId,
  name,
  refetchSales,
}: SalesDetailProps) {
  const [page, setPage] = useState(0);
  const customerForSaleMutation = useCustomerForSale();
  const queryClient = useQueryClient();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirmUnassign = () => {
    if (!selectedId) return;
    removeAssignMutation.mutate(selectedId);
    setOpenConfirm(false);
  };

  const removeAssignMutation = useMutation({
    mutationFn: (id: string) => removeAssignCustomerForSale(id),
    onSuccess: () => {
      toast.success("Huỷ gán khách hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
      refetchSales();
    },
    onError: () => toast.error("Huỷ gán khách hàng thất bại"),
  });

  const { data } = useListCustomer({
    page,
    page_size: 10,
    category_id: undefined,
    sale_id: salesId,
  });
  const handleUnassign = (id: string) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };
  const columns: ColumnsType<CustomerModel> = [
    {
      title: "Khách hàng",
      dataIndex: "full_name",
      key: "name",
    },
    {
      title: "Phân loại",
      dataIndex: "category_name",
      key: "category_name",
      render: (_, record) => (
        <Tag
          style={{
            backgroundColor: record.color ? record.color : '#000000',
            color: "#fff",
          }}
          className="font-semibold text-[13px] px-3 py-1"
        >
          {record.category_name}
        </Tag>
      ),
    },
    {
      title: "Nhóm Zalo CSKH",
      dataIndex: "zaloGroup",
      key: "zaloGroup",
      render: (t) => (
        <a href="#" className="text-blue-600">
          link to ZALO{" "}
        </a>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: CustomerModel) => (
        <Button
          type="primary"
          danger
          onClick={() => handleUnassign(record.user_id.toString())}
        >
          Hủy gán
        </Button>
      ),
    },
  ];

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddCustomerForSale = (ids: any[]) => {
    if (ids.length === 0) return;
    const getIds = ids.map((item) => item?.key);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    salesId &&
      customerForSaleMutation.mutate(
        { customer_id: getIds[0], sale_id: salesId },
        {
          onSuccess: () => {
            toast.success("Gán khách hàng thành công!");
            queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
            refetchSales();
          },
          onError: () => {
            toast.error("Gán khách hàng thất bại");
          },
        }
      );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">
        Chi tiết: <span className="text-blue-600">{name}</span>
      </h3>

      <Tabs
        defaultActiveKey="overview"
        items={[
          // {
          //   key: 'overview',
          //   label: 'Tổng quan & Hoa hồng',
          //   children: (
          //     <div className="space-y-4">
          //       <div className="grid grid-cols-2 gap-4">
          //         <Card>
          //           <div>Doanh thu (tháng)</div>
          //           <Text strong className="text-lg">
          //             {salesInfo.revenue.toLocaleString('vi-VN')} đ
          //           </Text>
          //         </Card>
          //         <Card>
          //           <div>Hoa hồng (tạm tính)</div>
          //           <Text strong className="text-lg text-green-600">
          //             {salesInfo.commission.toLocaleString('vi-VN')} đ
          //           </Text>
          //         </Card>
          //       </div>

          //       <div>
          //         <div className="font-medium mb-1">Cài đặt Hoa hồng</div>
          //         <div className="flex items-center gap-2">
          //           <span>Tỷ lệ:</span>
          //           <InputNumber value={salesInfo.rate} min={0} max={100} />
          //           <span>%</span>
          //         </div>
          //       </div>

          //       <div>
          //         <div className="font-medium mb-1">Hành động</div>
          //         <div className="flex gap-2">
          //           <Button type="primary">Chốt kỳ lương</Button>
          //           <Button>Reset Mật khẩu</Button>
          //           <Button danger>Khóa tài khoản</Button>
          //         </div>
          //       </div>
          //     </div>
          //   ),
          // },
          {
            key: "customers",
            label: "Khách hàng Phụ trách",
            children: (
              <div className="space-y-4">
                <Text strong className="mb-2 block">
                  Gán khách hàng mới
                </Text>
                <div className="flex gap-2 mb-2">
                  <UserMultiSelect onAssign={handleAddCustomerForSale} />
                </div>
                <div>
                  <Text strong className="mb-2 block">
                    Danh sách khách hàng đã gán ({data?.data.length})
                  </Text>
                  <TableComponent
                    columns={columns}
                    dataSource={data?.data || []}
                    rowHeight={48}
                    pageSize={5}
                    page={data?.current_page || 0}
                    onPageChange={handleChangePage}
                    response={data}
                    fontSize={14}
                    headerHeight={44}
                  />
                </div>
                <PopupUnassignConfirm
                  open={openConfirm}
                  onConfirm={handleConfirmUnassign}
                  onCancel={() => setOpenConfirm(false)}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
