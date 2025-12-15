"use client";

import React, { useState } from "react";
import { Tabs, Row, Col, Card } from "antd";
import {
  LinkOutlined,
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckOutlined, // Icon check nhỏ hơn cho "Đã thanh toán"
} from "@ant-design/icons";

// Import các component giả định
import { TabLink } from "../components/tab-link";
import { TabCustomer } from "../components/tab-customer";
import { TabResult } from "../components/tab-result";
import { TabSettings } from "../components/tab-setting";
import { CustomerViolationTable } from "../components/customer-violation-table";
import { TabCustomerManagementTable } from "../components/tab-customer-mng-vip";

// --- DỮ LIỆU ĐÃ CẬP NHẬT ĐỂ KHỚP VỚI MÀU SẮC VÀ ICON TRONG ẢNH ---
const statsData = [
  {
    title: "Chờ duyệt",
    value: 12,
    // Màu vàng cam (amber)
    IconTopRight: <ClockCircleOutlined className="text-base text-amber-500" />,
    IconBottomRight: <ClockCircleOutlined className="text-3xl" />,
    valueColor: "text-amber-600",
    bgColor: "bg-amber-50",
    topIconColor: "text-amber-500",
  },
  {
    title: "Đã đặt",
    value: 28,
    // Màu xanh dương
    IconTopRight: <CheckOutlined className="text-base text-blue-500" />,
    IconBottomRight: <CheckCircleOutlined className="text-3xl" />,
    valueColor: "text-blue-600",
    bgColor: "bg-blue-50",
    topIconColor: "text-blue-500",
  },
  {
    title: "Thắng",
    value: 8,
    // Màu xanh lá cây/lục (green)
    IconTopRight: <TrophyOutlined className="text-base text-green-600" />,
    IconBottomRight: <TrophyOutlined className="text-3xl" />,
    valueColor: "text-green-600",
    bgColor: "bg-green-50",
    topIconColor: "text-green-600",
  },
  {
    title: "Thua",
    value: 15,
    // Màu xám (black/gray) - dùng icon EyeOutlined/ClockCircleOutlined trong ảnh gốc
    IconTopRight: <EyeOutlined className="text-base text-gray-500" />,
    IconBottomRight: <EyeOutlined className="text-3xl" />,
    valueColor: "text-black",
    bgColor: "bg-gray-100",
    topIconColor: "text-gray-500",
  },
  {
    title: "Đã lên đơn",
    value: 5,
    // Màu tím (purple)
    IconTopRight: <FileTextOutlined className="text-base text-purple-600" />,
    IconBottomRight: <FileTextOutlined className="text-3xl" />,
    valueColor: "text-purple-600",
    bgColor: "bg-purple-50",
    topIconColor: "text-purple-600",
  },
  {
    title: "Đã thanh toán",
    value: 3,
    // Màu xanh rêu/đậm (emerald)
    IconTopRight: <CheckOutlined className="text-base text-emerald-600" />,
    IconBottomRight: <CheckCircleOutlined className="text-3xl" />,
    valueColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    topIconColor: "text-emerald-600",
  },
];
// --- Custom Label Component để hiển thị Icon và Text ---
const TabLabel = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span className="font-semibold">{text}</span>
  </div>
);

const TAB_KEYS = [
  "1", "2", "3", "4", "5", "6"
];

export const AuctionPage = () => {
  const [activeKey, setActiveKey] = useState<string>("1");
  const [tabRenders, setTabRenders] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  // Mỗi lần tab thay đổi thì làm mới bằng cách tăng chỉ số render cho tab đó (force remount)
  const handleTabChange = (key: string) => {
    const idx = TAB_KEYS.findIndex(k => k === key);
    setTabRenders(rs => {
      const newRenders = [...rs];
      newRenders[idx] = (newRenders[idx] || 0) + 1;
      return newRenders;
    });
    setActiveKey(key);
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* KHU VỰC STATS CARDS ĐÃ ĐIỀU CHỈNH ICON VÀ MÀU SẮC */}
      <div className="p-4 bg-gray-50 rounded-lg mb-5">
        <Row gutter={[16, 16]} justify="start">
          {statsData.map((stat, index) => (
            <Col
              key={index}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={4}
              className="flex-grow"
            >
              <Card
                bordered={false}
                // Thêm viền nhẹ xung quanh card (tương tự ảnh gốc)
                className={`shadow-none border border-gray-100 transition-all duration-300 hover:shadow-md hover:${stat.bgColor} cursor-pointer min-w-[150px] h-full`}
              >
                <div className="flex flex-col justify-between h-full">
                  {/* TIÊU ĐỀ và ICON NHỎ GÓC TRÊN BÊN PHẢI */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <div className={stat.topIconColor}>
                      {stat.IconTopRight} {/* Icon nhỏ ở góc phải */}
                    </div>
                  </div>

                  {/* GIÁ TRỊ và ICON LỚN GÓC DƯỚI BÊN PHẢI */}
                  <div className="flex items-center justify-between mt-auto">
                    <h2 className={`text-4xl font-semibold ${stat.valueColor}`}>
                      {stat.value}
                    </h2>
                    {/* Icon lớn, cùng màu với số */}
                    <div className={`p-2 ${stat.valueColor}`}>
                      {stat.IconBottomRight}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      {/* KẾT THÚC KHU VỰC STATS CARDS */}

      {/* KHU VỰC TABS */}
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={[
          {
            key: "1",
            label: <TabLabel icon={<LinkOutlined />} text="Theo link" />,
            children: <TabLink key={tabRenders[0]} />,
          },
          {
            key: "2",
            label: <TabLabel icon={<UserOutlined />} text="Theo khách" />,
            children: <TabCustomer key={tabRenders[1]} />,
          },
          {
            key: "3",
            label: <TabLabel icon={<TrophyOutlined />} text="Thắng thua" />,
            children: <TabResult key={tabRenders[2]} />,
          },
          {
            key: "4",
            label: <TabLabel icon={<UserOutlined />} text="Khách hàng VIP" />,
            children: <TabCustomerManagementTable key={tabRenders[3]} />,
          },
          {
            key: "5",
            label: <TabLabel icon={<TrophyOutlined />} text="Vi phạm" />,
            children: (
              <div key={tabRenders[4]}>
                <CustomerViolationTable />
              </div>
            ),
          },
          {
            key: "6",
            label: <TabLabel icon={<LinkOutlined />} text="Cài đặt" />,
            children: <TabSettings key={tabRenders[5]} />,
          },
        ]}
        className="custom-tabs-auction [&_.ant-tabs-content-holder]:!p-0"
      />
    </div>
  );
};

export default AuctionPage;
