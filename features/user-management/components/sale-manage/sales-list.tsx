import { Button, List } from "antd";
import { useState } from "react";
import AddSalesModal from "./modal-sales-add";

interface SalesListProps {
  selected: string;
  onSelect: (id: string) => void;
}

const salesData = [
  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },
  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },
  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },
  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },
  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },
  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },
  { id: "tran-thi-bich", name: "Trần Thị Bích", customers: 15 },
  { id: "nguyen-van-an", name: "Nguyễn Văn An", customers: 8 },
  // ... các item khác
];

const employees = [
  { id: "1", name: "Lê Minh Tuấn", email: "tuan.lm@company.com" },
  { id: "2", name: "Phạm Thị Mai", email: "mai.pt@company.com" },
];

export default function SalesList({ selected, onSelect }: SalesListProps) {
  const [open, setOpen] = useState(false);

  const handleAddSales = (selectedEmployees: typeof employees) => {
    console.log("✅ Nhân viên được chọn:", selectedEmployees);
    setOpen(false);
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Nhân viên Sales</h3>
        <Button type="primary" onClick={() => setOpen(true)}>+ Thêm</Button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        <List
          itemLayout="vertical"
          dataSource={salesData}
          renderItem={(item) => (
            <List.Item
              onClick={() => onSelect(item.id)}
              className={`cursor-pointer rounded !p-4 border-l-4 ${
                selected === item.id
                  ? "bg-blue-100 border-blue-500"
                  : "border-transparent"
              }`}
            >
              <div
                className={`${
                  selected === item.id ? "text-blue-700" : ""
                } font-bold`}
              >
                {item.name}
              </div>
              <div className="text-gray-500 text-sm">
                Đang quản lý: {item.customers} Khách hàng
              </div>
            </List.Item>
          )}
        />
      </div>
       <AddSalesModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleAddSales}
        employees={employees}
      />
    </div>
  );
}
