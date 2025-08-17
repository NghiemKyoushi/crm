import TableComponent from '@/components/TableComponent';
import { Tabs, Card, Typography, InputNumber, Button } from 'antd';

const { Text } = Typography;

interface Customer {
  key: string;
  name: string;
  zaloGroup: string;
}

interface SalesDetailProps {
  salesId: string;
}

export default function SalesDetail({ salesId }: SalesDetailProps) {
  const salesInfo = {
    name: salesId === 'tran-thi-bich' ? 'Trần Thị Bích' : 'Nguyễn Văn An',
    revenue: 150_000_000,
    commission: 7_500_000,
    rate: 5,
  };

  const customerData: Customer[] = [
    { key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },
    { key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },{ key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },{ key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },{ key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },{ key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },{ key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },{ key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },{ key: "1", name: "Nguyễn Văn A", zaloGroup: "Link nhóm Zalo" },
    { key: "2", name: "Lê Thị D", zaloGroup: "Link nhóm Zalo" },
  ];

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Nhóm Zalo CSKH",
      dataIndex: "zaloGroup",
      key: "zaloGroup",
      render: (text: string) => (
        <a href="#" className="text-blue-600">
          {text}
        </a>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record :Customer  ) => (
        <Button type="link" danger>
          Hủy gán
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">
        Chi tiết: <span className="text-blue-600">{salesInfo.name}</span>
      </h3>

      <Tabs
        defaultActiveKey="overview"
        items={[
          // {
          //   key: 'overview',
          //   label: 'Tổng quan & Hoa hồng',
          //   children: (
          //     <div className="space-y-4">
          //       <div className="grid grid-cols-2 gap-4">
          //         <Card>
          //           <div>Doanh thu (tháng)</div>
          //           <Text strong className="text-lg">
          //             {salesInfo.revenue.toLocaleString('vi-VN')} đ
          //           </Text>
          //         </Card>
          //         <Card>
          //           <div>Hoa hồng (tạm tính)</div>
          //           <Text strong className="text-lg text-green-600">
          //             {salesInfo.commission.toLocaleString('vi-VN')} đ
          //           </Text>
          //         </Card>
          //       </div>

          //       <div>
          //         <div className="font-medium mb-1">Cài đặt Hoa hồng</div>
          //         <div className="flex items-center gap-2">
          //           <span>Tỷ lệ:</span>
          //           <InputNumber value={salesInfo.rate} min={0} max={100} />
          //           <span>%</span>
          //         </div>
          //       </div>

          //       <div>
          //         <div className="font-medium mb-1">Hành động</div>
          //         <div className="flex gap-2">
          //           <Button type="primary">Chốt kỳ lương</Button>
          //           <Button>Reset Mật khẩu</Button>
          //           <Button danger>Khóa tài khoản</Button>
          //         </div>
          //       </div>
          //     </div>
          //   ),
          // },
          {
            key: "customers",
            label: "Khách hàng Phụ trách",
            children: (
              <div className="space-y-4">
                 <Text strong className="mb-2 block">
                  Gán khách hàng mới
                  </Text>
                {/* Input tìm kiếm khách hàng */}
                <div className="flex gap-2 mb-2">
                  <input
                    className="border rounded p-2 flex-1"
                    placeholder="Tìm khách hàng chưa có sales..."
                  />
                  <Button type="primary">+</Button>
                </div>

                {/* Bảng khách hàng đã gán */}
                <div>
                  <Text strong className="mb-2 block">
                    Danh sách khách hàng đã gán ({customerData.length})
                  </Text>
                  <TableComponent
                    columns={columns}
                    dataSource={customerData}
                    pagination={false}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
