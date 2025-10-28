import { Button, Modal, Table } from "antd";
import React from "react";

const debtHistories: Array<{
  debtKey: string;
  name: string;
  date: string;
  method: string;
  amount: number;
}> = [
  {
    debtKey: "1",
    name: "Tokyo ABC Supply",
    date: "05/09/2025",
    method: "Chuyển khoản Vietcombank",
    amount: 10000000
  },
  {
    debtKey: "1",
    name: "Tokyo ABC Supply",
    date: "10/09/2025",
    method: "Chuyển khoản Momo (Techcombank)",
    amount: 5000000
  },
  {
    debtKey: "1",
    name: "Tokyo ABC Supply",
    date: "15/09/2025",
    method: "Nạp tiền trực tiếp",
    amount: 5000000
  },
  // key 2
  {
    debtKey: "2",
    name: "Osaka Steel Corp",
    date: "18/09/2025",
    method: "Chuyển khoản Techcombank",
    amount: 0
  },
  // key 3
  {
    debtKey: "3",
    name: "Kyoto Electronics",
    date: "14/09/2025",
    method: "Chuyển khoản Vietinbank",
    amount: 30000000
  },
  {
    debtKey: "3",
    name: "Kyoto Electronics",
    date: "16/09/2025",
    method: "Chuyển khoản Vietinbank",
    amount: 20000000
  },
  // key 4
  {
    debtKey: "4",
    name: "Osaka Steel Corp",
    date: "18/09/2025",
    method: "Chuyển khoản Techcombank",
    amount: 0
  },
  // key 5
  {
    debtKey: "5",
    name: "Kyoto Electronics",
    date: "14/09/2025",
    method: "Chuyển khoản Vietinbank",
    amount: 30000000
  },
  {
    debtKey: "5",
    name: "Kyoto Electronics",
    date: "16/09/2025",
    method: "Chuyển khoản Vietinbank",
    amount: 20000000
  },
  // key 6
  {
    debtKey: "6",
    name: "Osaka Steel Corp",
    date: "18/09/2025",
    method: "Chuyển khoản Techcombank",
    amount: 0
  },
  // key 7
  {
    debtKey: "7",
    name: "Kyoto Electronics",
    date: "14/09/2025",
    method: "Chuyển khoản Vietinbank",
    amount: 30000000
  },
  {
    debtKey: "7",
    name: "Kyoto Electronics",
    date: "16/09/2025",
    method: "Chuyển khoản Vietinbank",
    amount: 20000000
  }
];

export const DebtDetailModal = ({
  visible,
  onClose,
  record,
}: {
  visible: boolean;
  onClose: () => void;
  record: any;
}) => {
  let histories: typeof debtHistories = [];
  if (Array.isArray(record)) {
    const keys = record.map((r: any) => String(r.key));
    histories = debtHistories.filter(item => keys.includes(item.debtKey));
  } else if (record) {
    histories = debtHistories.filter(item => item.debtKey === String(record.key));
  }

  const columns = [
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Khách nạp ngày nào",
      dataIndex: "date",
      key: "date",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Đã nạp như nào",
      dataIndex: "method",
      key: "method",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (value: number) =>
        <span className="font-semibold">{value ? value.toLocaleString() : 0} ₫</span>
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <span>
            Lịch sử giao dịch công nợ:{" "}
            <span className="text-base font-semibold">
              {Array.isArray(record)
                ? record.map(r => r?.name).join(", ")
                : record?.name}
            </span>
          </span>
          <div className="flex-1"></div>
        </div>
      }
      bodyStyle={{
        minHeight: 220,
        maxHeight: "60vh",
        overflowY: "auto",
        paddingTop: 10,
      }}
      centered
      destroyOnClose
    >
      <Table
        columns={columns}
        dataSource={histories}
        size="small"
        rowKey={(_, idx) => String(idx)}
        pagination={false}
        locale={{
          emptyText: <div className="text-gray-400">Không có giao dịch nào</div>
        }}
      />
    </Modal>
  );
};