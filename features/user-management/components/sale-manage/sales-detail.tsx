import { Tabs, Card, Typography, InputNumber, Button } from 'antd';

const { Text } = Typography;

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

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">
        Chi tiết: <span className="text-blue-600">{salesInfo.name}</span>
      </h3>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: 'Tổng quan & Hoa hồng',
            children: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <div>Doanh thu (tháng)</div>
                    <Text strong className="text-lg">
                      {salesInfo.revenue.toLocaleString('vi-VN')} đ
                    </Text>
                  </Card>
                  <Card>
                    <div>Hoa hồng (tạm tính)</div>
                    <Text strong className="text-lg text-green-600">
                      {salesInfo.commission.toLocaleString('vi-VN')} đ
                    </Text>
                  </Card>
                </div>

                <div>
                  <div className="font-medium mb-1">Cài đặt Hoa hồng</div>
                  <div className="flex items-center gap-2">
                    <span>Tỷ lệ:</span>
                    <InputNumber value={salesInfo.rate} min={0} max={100} />
                    <span>%</span>
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-1">Hành động</div>
                  <div className="flex gap-2">
                    <Button type="primary">Chốt kỳ lương</Button>
                    <Button>Reset Mật khẩu</Button>
                    <Button danger>Khóa tài khoản</Button>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'customers',
            label: 'Khách hàng Phụ trách',
            children: <div>Danh sách khách hàng sẽ hiển thị ở đây</div>,
          },
        ]}
      />
    </div>
  );
}
