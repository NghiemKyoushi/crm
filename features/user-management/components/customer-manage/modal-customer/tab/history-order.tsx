import OrderFilter from "@/components/FilterComponent";
import TableComponent from "@/components/TableComponent";
import { Select, Tag } from "antd";
import { ColumnsType } from "antd/es/table";

interface OrderData {
    key: string;
    orderCode: string;
    createdAt: string;
    total: number;
    status: string;
  }
export default function HistoryOrderTab() {
  const onFilter = (values: {
    orderCode?: string;
    status?: string;
    date?: string;
  }) => {};

  const columns: ColumnsType<OrderData> = [
    {
      title: "Mã Đơn",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text: string) => (
        <a className="text-blue-500 font-medium">#{text}</a>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (value: number) => value.toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => {
        let color = "";
        let label = "";
        switch (status) {
          case "pending":
            color = "orange";
            label = "Chờ thanh toán đủ";
            break;
          case "paid":
            color = "green";
            label = "Đã thanh toán";
            break;
          case "cancel":
            color = "red";
            label = "Đã hủy";
            break;
        }
        return (
          <Tag color={color} className="px-3 py-1 rounded-full text-sm">
            {label}
          </Tag>
        );
      },
    },
  ];

  const data = [
    {
      key: "1",
      orderCode: "DH-0805-1",
      createdAt: "05/08/2025",
      total: 15250000,
      status: "pending",
    },
    {
      key: "2",
      orderCode: "DH-0805-2",
      createdAt: "06/08/2025",
      total: 8500000,
      status: "paid",
    },
    {
      key: "3",
      orderCode: "DH-0805-3",
      createdAt: "07/08/2025",
      total: 1200000,
      status: "cancel",
    },
  ];

  return (
    <>
      <OrderFilter onFilter={onFilter} />
      <TableComponent
        headerHeight={44}
        rowHeight={48}
        columns={columns}
        dataSource={data}
        pagination={false} response={undefined} page={0} onPageChange={function (page: number): void {
          throw new Error("Function not implemented.");
        } }      />
    </>
  );
}
