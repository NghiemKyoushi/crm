import OrderFilter from "@/components/FilterComponent";
import TableComponent from "@/components/TableComponent";
// import { Select, Tag } from "antd";
import { ColumnsType } from "antd/es/table";

export interface Transaction {
  key: string;
  code: string; // Mã GD
  type: string; // Loại
  amount: number; // Số tiền
  note: string; // Ghi chú
  date: string; // Ngày
}
export default function HistoryPaymentTab() {
  const onFilter = (values: {
    orderCode?: string;
    status?: string;
    date?: string;
  }) => {};

  const columns: ColumnsType<Transaction> = [
    {
      title: "Mã GD",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (text) => <span style={{ color: "green" }}>{text}</span>,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value: number) => (
        <span style={{ color: value > 0 ? "green" : "red" }}>
          {value > 0 ? "+" : ""}
          {value.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
  ];

  const data: Transaction[] = [
    {
      key: "1",
      code: "N-0805-1",
      type: "Nạp tiền",
      amount: 5000000,
      note: "CK thanh toán",
      date: "05/08/2025",
    },
    {
      key: "2",
      code: "R-0806-1",
      type: "Rút tiền",
      amount: -2000000,
      note: "Thanh toán phí dịch vụ",
      date: "06/08/2025",
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
