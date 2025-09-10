import React from "react";
import { Card, Input, Button, List, Typography, InputNumber } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUniversity,
  faGlobe,
  faTags,
  faUsers,
  faLayerGroup,
  faCog,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

const { Text } = Typography;

const SettingsDetail = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card
        title={<div className="text-[18px]">Cài đặt tài chỉnh</div>}
        className="rounded-2xl shadow-md"
      >
        <Text strong>Tỷ giá ngoại tệ thống nhất</Text>
        <div className="bg-blue-50 text-blue-600 p-3 rounded-md my-3 text-sm">
          <strong>Lưu ý quan trọng:</strong> Tỷ giá này sẽ được áp dụng thống
          nhất cho tất cả khách hàng và mọi giao dịch trong hệ thống. Không có
          cài đặt tỷ giá riêng cho từng khách hàng.
        </div>

        <div className="flex gap-4 mb-3 w-full">
          <div className="flex items-start flex-col gap-0 flex-1">
            <p className="!mb-1">1 USD = (VND)</p>
            <InputNumber defaultValue="25450" className="!w-full" />
          </div>
          <div className="flex items-start flex-col gap-0 flex-1">
            <p className="!mb-1">1 JPY = (VND)</p>
            <InputNumber defaultValue="162" className="!w-full" />
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2 text-gray-700">
            <FontAwesomeIcon className="w-4 h-4" icon={faClock} />
            <span>Cập nhật lần cuối: 08/08/2025 14:30 bởi Admin</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FontAwesomeIcon className="w-4 h-4" icon={faUsers} />
            <span>Áp dụng cho: Tất cả khách hàng</span>
          </div>
        </div>

        <div className="w-full mt-4 mb-4">
          <Button
            size="large"
            className="!w-full !border-0 !bg-gray-50 !hover:bg-gray-100 !font-medium !p-3 !flex items-center gap-2"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faUniversity} />}
          >
            <span className="text-left w-full">
              Quản lý Tài khoản Ngân hàng
            </span>
          </Button>
        </div>
        <div className="w-full flex justify-end mt-8 ">
          <Button type="primary" className="!font-medium">
            Lưu Tỷ giá
          </Button>
        </div>
      </Card>
      <Card
        title={<div className="text-[18px]">Cài đặt Phí Dịch vụ</div>}
        className="relative rounded-2xl shadow-md h-full"
      >
        <div className="pb-16">
          <div className="text-gray-600 mb-3">
            Thiết lập các loại phí mặc định của hệ thống. Các chính sách phí
            riêng cho từng loại khách hàng sẽ ghi đè lên các cài đặt này.
          </div>
          <ul className="list-disc list-inside text-gray-700 mb-4 text-sm">
            <li>Phí mua hộ</li>
            <li>Phí vận chuyển quốc tế</li>
            <li>Phụ phí theo loại sản phẩm</li>
            <li>Các loại phí khác…</li>
          </ul>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            size="large"
            className="!w-full !justify-center !border-0 !bg-blue-50 !text-blue-600 hover:!bg-blue-100 !font-medium"
            type="dashed"
            onClick={() => router.push("/fee-setting")}
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faCog} />}
          >
            Đi đến trang Quản lý Phí
          </Button>
        </div>
      </Card>

      <Card title="Cài đặt Vận hành Đơn hàng" className="rounded-2xl shadow-md">
        <List
          itemLayout="horizontal"
          dataSource={[
            { icon: faGlobe, text: "Quản lý Website được hỗ trợ" },
            { icon: faTags, text: "Quản lý Loại sản phẩm & Phí" },
          ]}
          className="!flex !flex-col !gap-1"
          renderItem={(item) => (
            <List.Item className="!w-full !rounded-md !border-0  !bg-gray-50 !hover:bg-gray-100 !font-medium !mb-2 !h-12 !pl-2 ">
              <List.Item.Meta
                avatar={
                  <FontAwesomeIcon className="w-4 h-4" icon={item.icon} />
                }
                title={<div className="text-[16px]">{item.text}</div>}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        title="Cài đặt Quản trị Người dùng"
        className="rounded-2xl shadow-md"
      >
        <List
          itemLayout="horizontal"
          dataSource={[
            { icon: faLayerGroup, text: "Phân loại Khách hàng & Chính sách" },
            { icon: faUsers, text: "Nhân viên & Phân quyền" },
          ]}
          className="!flex !flex-col !gap-1 "
          renderItem={(item) => (
            <List.Item className="!w-full !rounded-md !border-0  !bg-gray-50 !hover:bg-gray-100 !font-medium !mb-2 !h-12 !pl-2 !text-base">
              <List.Item.Meta
                avatar={
                  <FontAwesomeIcon className="w-4 h-4" icon={item.icon} />
                }
                title={<div className="text-[16px]">{item.text}</div>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default SettingsDetail;
