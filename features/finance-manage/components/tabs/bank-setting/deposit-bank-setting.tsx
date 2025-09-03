import { Table, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AddBankAccountModal from "./modal/add-account-bank";
import { useState } from "react";
import TableComponent from "@/components/TableComponent";
import AssignRoleModal from "./modal/modal-assign";

interface BankAccount {
  id: string;
  bank: string;
  accountNumber: string;
  owner: string;
  limit: number;
  status: "active" | "inactive";
}

const data: BankAccount[] = [
  {
    id: "1",
    bank: "Vietcombank",
    accountNumber: "0123456789",
    owner: "CTY TNHH ORDER SYSTEM",
    limit: 500000000,
    status: "active",
  },
  {
    id: "2",
    bank: "Techcombank",
    accountNumber: "9876543210",
    owner: "CTY TNHH ORDER SYSTEM",
    limit: 500000000,
    status: "inactive",
  },
];

const users = [
  { email: "admin@yourcompany.com", label: "Super Admin" },
  { email: "ketoan.1@yourcompany.com" },
  { email: "ketoan.2@yourcompany.com" },
  { email: "quanly.td@yourcompany.com" },
  // ... thêm nhiều để test scroll
];

export default function BankAccountSetting() {
  const [open, setOpen] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  const [page, setPage] = useState(0);

  const columns = [
    {
      title: "Ngân hàng",
      dataIndex: "bank",
      key: "bank",
    },
    {
      title: "Số tài khoản",
      dataIndex: "accountNumber",
      key: "accountNumber",
    },
    {
      title: "Chủ tài khoản",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Hạn mức/ngày (VND)",
      dataIndex: "limit",
      key: "limit",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { maximumFractionDigits: 0 }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: BankAccount["status"]) =>
        status === "active" ? (
          <Tag color="green" className="px-3 py-1 !rounded-3xl">
            Hoạt động
          </Tag>
        ) : (
          <Tag color="default" className="px-3 py-1 !rounded-3xl">
            Tạm dừng
          </Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: BankAccount) => (
        <div className="flex gap-2">
          <button className="!text-blue-600 hover:underline">Sửa</button>
          <span>|</span>
          <button className="!text-green-600 hover:underline" onClick={()=> setOpenAssign(true)}>Gán quyền</button>
          <span>|</span>
          <button className="!text-red-600 hover:underline">Xóa</button>
        </div>
      ),
    },
  ];

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Cài đặt Tài khoản Ngân hàng Công ty
        </h2>
        <Button
        onClick={()=> setOpen(true)}
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          Thêm tài khoản
        </Button>
      </div>
      <TableComponent
        columns={columns}
        dataSource={data || []}
        rowHeight={45}
        pageSize={10}
        page={data.length || 0}
        onPageChange={handleChangePage}
        // response={data}
        fontSize={14}
        headerHeight={44}
        response={undefined}
      />
      <AddBankAccountModal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={(values: any) => {
          console.log("Submit:", values);
          setOpen(false);
        }}
      />
      <AssignRoleModal
        open={openAssign}
        onCancel={() => setOpenAssign(false)}
        onSave={(selected) => console.log("Selected users:", selected)}
        accountName="Vietcombank"
        accountNumber="0123456789"
        users={users}
        defaultSelected={[
          "ketoan.1@yourcompany.com",
          "quanly.td@yourcompany.com",
        ]}
      />
    </div>
  );
}
