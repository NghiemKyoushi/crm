"use client";
import { Table, Tag, Button, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import TableComponent from "@/components/TableComponent";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SaleRecord {
  key: string;
  name: string;
  id: string;
  sales: number;
  level: string;
  commission: number;
  salary: number;
  status: "success" | "warning" | "error";
}

const data: SaleRecord[] = [
  {
    key: "1",
    name: "Nguyễn Văn A",
    id: "SALE001",
    sales: 850,
    level: "Level 4",
    commission: 3162000,
    salary: 9862000,
    status: "success",
  },
  {
    key: "2",
    name: "Trần Thị B",
    id: "SALE002",
    sales: 420,
    level: "Level 3",
    commission: 1409760,
    salary: 8109760,
    status: "success",
  },
  {
    key: "3",
    name: "Lê Văn C",
    id: "SALE003",
    sales: 180,
    level: "Chưa đạt",
    commission: 0,
    salary: 6700000,
    status: "error",
  },
];

const SalePerformance = () => {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };
  const columns: ColumnsType<SaleRecord> = [
    {
      title: "Tên Sale",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        const getInitials = (fullName: string) => {
          if (!fullName) return "";
          const parts = fullName.trim().split(" ").filter(Boolean);
          if (parts.length === 1) {
            return parts[0][0].toUpperCase();
          }
          const first = parts[0][0].toUpperCase();
          const last = parts[parts.length - 1][0].toUpperCase();
          return first + last;
        };

        return (
          <div className="flex items-center gap-2">
            <Avatar style={{ backgroundColor: "#1890ff" }}>
              {getInitials(record.name)}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{record.name}</span>
              <span className="text-gray-400 text-xs">ID: {record.id}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Doanh số tháng (¥)",
      dataIndex: "sales",
      key: "sales",
      render: (val) => (
        <span className="text-green-600 font-semibold">{val}</span>
      ),
    },
    {
      title: "Cấp bậc",
      dataIndex: "level",
      key: "level",
      render: (val) => {
        let color = "default";
        if (val.includes("Level 4")) color = "orange";
        else if (val.includes("Level 3")) color = "purple";
        else if (val === "Chưa đạt") color = "red";
        return <Tag color={color}>{val}</Tag>;
      },
    },
    {
      title: "Hoa hồng ước tính",
      dataIndex: "commission",
      key: "commission",
      render: (val) =>
        val > 0 ? (
          <span className="text-green-600 font-semibold">
            {val.toLocaleString()} đ
          </span>
        ) : (
          <span className="text-red-500 font-semibold">0 đ</span>
        ),
    },
    {
      title: "Tổng lương",
      dataIndex: "salary",
      key: "salary",
      render: (val) => (
        <span className="text-blue-600 font-semibold">
          {val.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <button className="!text-blue-600">Chi tiết</button>
          {record.status === "success" && (
            <button
              onClick={() => router.push("sales-management/100")}
              className="!text-green-600"
            >
              Tính lương
            </button>
          )}
          {record.status === "error" && (
            <button className="!text-orange-500">Cảnh báo</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} /> Theo dõi Hiệu suất Sale
        </h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm Sale
        </Button>
      </div>

      <TableComponent
        columns={columns}
        dataSource={data || []}
        rowHeight={45}
        pageSize={10}
        page={0}
        onPageChange={handleChangePage}
        response={undefined}
        fontSize={14}
        headerHeight={44}
      />
    </div>
  );
};

export default SalePerformance;
