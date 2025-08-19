import { useState } from "react";
import { Button, Form, Tag } from "antd";
import AddCustomerTypeModal from "./modal-edit-category-customer";
import TableComponent from "@/components/TableComponent";

interface CustomerType {
  key: string;
  name: string;
  description: string;
  count: number;
  color: string;
}

const initialData: CustomerType[] = [
  {
    key: "1",
    name: "VIP",
    description: "Khách hàng thân thiết, chi tiêu cao",
    count: 15,
    color: "gold",
  },
  {
    key: "2",
    name: "Bạc",
    description: "Khách hàng thường xuyên",
    count: 52,
    color: "geekblue",
  },
  {
    key: "3",
    name: "Đồng",
    description: "Khách hàng mới",
    count: 120,
    color: "volcano",
  },
];

export default function CategoryCustomerTable() {
  const [data, setData] = useState<CustomerType[]>(initialData);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newItem: CustomerType = {
        key: Date.now().toString(),
        name: values.name,
        description: values.description,
        count: 0,
        color: "blue", // mặc định, có thể tùy logic sau
      };
      setData([...data, newItem]);
      form.resetFields();
      setOpen(false);
    });
  };

  const columns = [
    {
      title: "Tên Loại",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: CustomerType) => (
        <Tag color={record.color} className="font-semibold text-[13px] px-3 py-1">
          {text}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số lượng KH",
      dataIndex: "count",
      key: "count",
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
        dataSource={data}
        pagination={false}
        rowKey="key"
        rowHeight={50}

      />
     <AddCustomerTypeModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleAdd}
      />
     
    </div>
  );
}
