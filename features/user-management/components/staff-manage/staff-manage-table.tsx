import type { ColumnsType } from "antd/es/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faKey,
  faLock,
  faTrash,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Tag, Button, Dropdown, Menu } from "antd";
import TableComponent from "@/components/TableComponent";
import ModalStaffAdd from "./modal-staff-add";
import { useState } from "react";

interface Employee {
  key: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive";
}

const columns: ColumnsType<Employee> = [
  {
    title: "Họ và tên",
    dataIndex: "fullName",
    key: "fullName",
    render: (text: string) => <span className="font-medium">{text}</span>,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "Vai trò",
    dataIndex: "role",
    key: "role",
    render: (role: string) => (
      <Dropdown
        menu={{
          items: [
            { key: "sales", label: "Sales" },
            { key: "accounting", label: "Kế toán" },
            { key: "warehouse", label: "Nhân viên kho" },
            { key: "admin", label: "Admin" },
          ],
        }}
      >
        <span className="cursor-pointer">{role} ⌄</span>
      </Dropdown>
    ),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: Employee["status"]) =>
      status === "active" ? (
        <Tag color="green">Hoạt động</Tag>
      ) : (
        <Tag color="red">Đã khóa</Tag>
      ),
  },
  {
    title: "Hành động",
    key: "actions",
    render: () => (
      <div className="flex gap-3 text-[16px]">
        <FontAwesomeIcon
          icon={faEdit}
          className="cursor-pointer text-blue-500 hover:text-blue-700"
        />
        <FontAwesomeIcon
          icon={faKey}
          className="cursor-pointer text-gray-600 hover:text-gray-800"
        />
        <FontAwesomeIcon
          icon={faLock}
          className="cursor-pointer text-amber-500 hover:text-amber-700"
        />
        <FontAwesomeIcon
          icon={faTrash}
          className="cursor-pointer text-red-500 hover:text-red-700"
        />
      </div>
    ),
  },
];

const data: Employee[] = [
  {
    key: "1",
    fullName: "Hoàng An Nhiên",
    email: "nhien.ha@company.com",
    phone: "0901234567",
    role: "Sales",
    status: "active",
  },
  {
    key: "2",
    fullName: "Lê Minh Tuấn",
    email: "tuan.lm@company.com",
    phone: "0912345678",
    role: "Kế toán",
    status: "active",
  },
  {
    key: "3",
    fullName: "Phạm Thị Mai",
    email: "mai.pt@company.com",
    phone: "0987654321",
    role: "Nhân viên kho",
    status: "inactive",
  },
  {
    key: "4",
    fullName: "Trần Văn Hùng",
    email: "hung.tv@company.com",
    phone: "0934567890",
    role: "Admin",
    status: "active",
  },
];

export default function StaffManageTable() {
      const [open, setOpen] = useState(false);
    
  return (
    <div className="p-4 bg-white shadow-md rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Danh sách Nhân viên</h2>
        <Button
          type="primary"
          onClick={() => setOpen(true)}
          icon={<FontAwesomeIcon icon={faUserPlus} />}
          className="!bg-green-500 !hover:bg-green-600 !font-medium"
        >
          Thêm nhân viên
        </Button>
      </div>
      <TableComponent
        columns={columns}
        dataSource={data}
        pagination={false}
        rowHeight={50}
      />
      <ModalStaffAdd  open={open} onClose={()=> setOpen(false)}/>
    </div>
  );
}
