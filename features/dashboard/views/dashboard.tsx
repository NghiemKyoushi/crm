"use client";

import React from "react";
import { Card, Progress, List, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faDollarSign,
  faUsers,
  faExclamationCircle,
  faCheckCircle,
  faTruck,
  faMoneyBill,
  faTimesCircle,
  faGavel,
} from "@fortawesome/free-solid-svg-icons";

const { Text, Title } = Typography;

const DashboardPage: React.FC = () => {
  const stats = [
    {
      title: "Total Orders",
      value: "1,254",
      sub: "↑ 12% from last month",
      icon: faCartShopping,
      color: "text-blue-500",
    },
    {
      title: "Revenue",
      value: "$42.5K",
      sub: "↑ 8% from last month",
      icon: faDollarSign,
      color: "text-green-500",
    },
    {
      title: "Active Customers",
      value: "864",
      sub: "↑ 5% from last month",
      icon: faUsers,
      color: "text-orange-500",
    },
    {
      title: "Pending Actions",
      value: "24",
      sub: "↓ 3 urgent",
      icon: faExclamationCircle,
      color: "text-red-500",
    },
  ];

  const activities = [
    {
      icon: faCheckCircle,
      color: "text-green-500",
      title: "Order #2245 completed",
      desc: "Customer: Nguyen Van A • 10 mins ago",
    },
    {
      icon: faTruck,
      color: "text-blue-500",
      title: "Shipment arrived in Vietnam",
      desc: "Tracking #SHP-98712 • 42 mins ago",
    },
    {
      icon: faMoneyBill,
      color: "text-yellow-500",
      title: "Deposit request received",
      desc: "Customer: Tran Thi B • 1 hour ago",
    },
    {
      icon: faTimesCircle,
      color: "text-red-500",
      title: "Order #2249 failed",
      desc: "Item out of stock • 2 hours ago",
    },
    {
      icon: faGavel,
      color: "text-purple-500",
      title: "Auction won - #YA-45879",
      desc: "Customer: Le Van C • 3 hours ago",
    },
  ];

  return (
    <div className="p-3 mt-6 ">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <Card key={i} className="shadow rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-500">{item.title}</Text>
                <Title level={3} className="m-0">
                  {item.value}
                </Title>
                <Text className={item.color}>{item.sub}</Text>
              </div>
              <FontAwesomeIcon
                icon={item.icon}
                className={`text-3xl ${item.color}`}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Order Status */}
        <Card
          title="Order Status"
          extra={<a href="#">View All</a>}
          className="shadow rounded-2xl"
        >
          <div className="space-y-4">
            <div>
              <Text>Pending Purchase</Text>
              <Progress percent={18} strokeColor="#facc15" showInfo={false} />
            </div>
            <div>
              <Text>In Progress</Text>
              <Progress percent={42} strokeColor="#3b82f6" showInfo={false} />
            </div>
            <div>
              <Text>In Transit</Text>
              <Progress percent={35} strokeColor="#a855f7" showInfo={false} />
            </div>
            <div>
              <Text>Delivered</Text>
              <Progress percent={80} strokeColor="#22c55e" showInfo={false} />
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card
          title="Recent Activities"
          extra={<a href="#">View All</a>}
          className="shadow rounded-2xl"
        >
          <List
            itemLayout="horizontal"
            dataSource={activities}
            renderItem={(item) => (
              <List.Item>
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`text-xl ${item.color}`}
                  />
                  <div>
                    <Text strong>{item.title}</Text>
                    <div className="text-gray-500 text-sm">{item.desc}</div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
