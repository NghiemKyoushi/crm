"use client";

import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

export default function DashboardPage() {
  return (
    <div className="pt-20 pl-[256px]">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={1254}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={42500}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Customers"
              value={864}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Actions"
              value={24}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
