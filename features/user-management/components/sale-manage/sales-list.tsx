import { Button, List } from "antd";

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

export default function SalesList({ selected, onSelect }: SalesListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Nhân viên Sales</h3>
        <Button type="primary">+ Thêm</Button>
      </div>

      {/* Container list với chiều cao cố định và scroll */}
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
    </div>
  );
}
