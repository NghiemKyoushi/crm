import TableComponent from "@/components/TableComponent";
import { Tabs, Card, Typography, InputNumber, Button, Tag } from "antd";
import UserMultiSelect from "./select-multi";
import { ColumnsType } from "antd/es/table";
import { CustomerModel } from "@/types/customer-type";
import { useCustomerForSale, useListCustomer } from "../../hooks/staff-manage";
import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAssignCustomerForSale } from "../../apis/staff-manage";
import PopupUnassignConfirm from "./modal-remove-assign";
import { getContrastColor } from "../customer-manage/customer-type-select";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      toast.success(t('customerManage.unassignSuccess'));
      queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
      refetchSales();
    },
    onError: () => toast.error(t('customerManage.unassignFailed')),
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
      title: t('customerManage.customer'),
      dataIndex: "full_name",
      key: "name",
      width: 200,
      render: (text: string, record: CustomerModel) => (
        <div>
          <div className="text-sm text-gray-800">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: t('customerManage.classification'),
      dataIndex: "group_name",
      key: "group_name",
      width: 150,
      render: (_, record) => (
        <Tag
          style={{
            backgroundColor: record.color ? record.color : '#000000',
            color: record.color ? getContrastColor(record.color): "#ffffff",
          }}
          className="text-xs"
        >
          {record.group_name}
        </Tag>
      ),
    },
    {
      title: t('customerManage.zaloGroup'),
      dataIndex: "zaloGroup",
      key: "zaloGroup",
      width: 120,
      render: () => (
        <a href="#" className="text-blue-600 text-xs hover:underline">
          Link Zalo
        </a>
      ),
    },
    {
      title: t('customerManage.actions'),
      key: "action",
      width: 120,
      fixed: "right",
      render: (_: any, record: CustomerModel) => (
        <Button
          type="link"
          danger
          size="small"
          className="!p-0 !h-auto !text-xs"
          onClick={() => handleUnassign(record.user_id.toString())}
        >
          Bỏ phân công
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
    const getIds = ids.map((item) => item?.key).filter(Boolean);
    if (getIds.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    salesId &&
      customerForSaleMutation.mutate(
        { customer_id: getIds[0], sale_id: salesId },
        {
          onSuccess: () => {
            toast.success(t('customerManage.assignSuccess'));
            queryClient.invalidateQueries({ queryKey: ["listCustomer"] });
            refetchSales();
          },
          onError: () => {
            toast.error(t('customerManage.assignFailed'));
          },
        }
      );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">
        {t('customerManage.detailsTitle')} <span className="text-blue-600">{name}</span>
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
            label: t('customerManage.assignedCustomers'),
            children: (
              <div className="space-y-4">
                <Text strong className="mb-2 block">
                  {t('customerManage.assignNewCustomer')}
                </Text>
                <div className="flex gap-2 mb-2">
                  <UserMultiSelect onAssign={handleAddCustomerForSale} />
                </div>
                <div>
                  <Text strong className="mb-2 block">
                    {t('customerManage.assignedCustomersList')} ({data?.data.length})
                  </Text>
                  <div className="overflow-x-auto">
                    <TableComponent
                      columns={columns}
                      dataSource={data?.data || []}
                      rowHeight={55}
                      pageSize={10}
                      page={data?.current_page || 0}
                      onPageChange={handleChangePage}
                      response={data}
                      fontSize={13}
                      headerHeight={46}
                    />
                  </div>
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
