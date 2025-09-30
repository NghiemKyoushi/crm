import OrderFilter from "@/components/FilterComponent";
import TableComponent from "@/components/TableComponent";
// import { Select, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

export interface Transaction {
  key: string;
  code: string; // Transaction Code
  type: string; // Type
  amount: number; // Amount
  note: string; // Note
  date: string; // Date
}
export default function HistoryPaymentTab() {
  const { t } = useTranslation();

  const onFilter = (values: {
    orderCode?: string;
    status?: string;
    date?: string;
  }) => {};

  const columns: ColumnsType<Transaction> = [
    {
      title: t("customerManage.paymentHistory.transactionCode"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("customerManage.paymentHistory.type"),
      dataIndex: "type",
      key: "type",
      render: (text) => <span style={{ color: "green" }}>{text}</span>,
    },
    {
      title: t("customerManage.paymentHistory.amount"),
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value: number) => (
        <span style={{ color: value > 0 ? "green" : "red" }}>
          {value > 0 ? "+" : ""}
          {value.toLocaleString("vi-VN")} {t("common.currency")}
        </span>
      ),
    },
    {
      title: t("customerManage.paymentHistory.note"),
      dataIndex: "note",
      key: "note",
    },
    {
      title: t("customerManage.paymentHistory.date"),
      dataIndex: "date",
      key: "date",
    },
  ];

  const data: Transaction[] = [
    {
      key: "1",
      code: "N-0805-1",
      type: t("customerManage.paymentHistory.topUp"),
      amount: 5000000,
      note: t("customerManage.paymentHistory.bankTransfer"),
      date: "05/08/2025",
    },
    {
      key: "2",
      code: "R-0806-1",
      type: t("customerManage.paymentHistory.withdraw"),
      amount: -2000000,
      note: t("customerManage.paymentHistory.serviceFeePayment"),
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
