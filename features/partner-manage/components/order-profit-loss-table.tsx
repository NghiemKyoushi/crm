"use client";

import React, { useEffect, useState } from "react";
import { Card, Table, Select, Tag, Space } from "antd";
import { useTranslation } from "react-i18next";
import { useOrderProfitLoss } from "../hooks/partner-manage-hook";
import type { ColumnsType } from "antd/es/table";
import { profitLossCurrencyCodes } from "./profit-loss-chart";

const { Option } = Select;

interface OrderProfitLossTableData {
  orderId: number;
  invoiceNo: string;
  currencyCode: string;
  totalConsumed: number;
  profitLossVnd: number;
  sellRate: number;
  costRate: number;
}

export const OrderProfitLossTable: React.FC<{ code?: string; dateRange?: [any, any] }> = ({ code, dateRange }) => {
  const { t } = useTranslation();
  const [currencyCode, setCurrencyCode] = useState<string | undefined>("JPY");
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);

  // Build query params with date range
  const queryParams: any = {
    currency_code: currencyCode,
    page,
    size: pageSize,
  };

  if (dateRange && dateRange[0] && dateRange[1]) {
    queryParams.from_date = dateRange[0].format("YYYY-MM-DD");
    queryParams.to_date = dateRange[1].format("YYYY-MM-DD");
  }

  const { data, isLoading } = useOrderProfitLoss(queryParams);

  useEffect(()=>{
    if(code){
      setCurrencyCode(code)
    }
  },[code])
  
  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(num));
  };

  const calculateProfitMargin = (
    sellRate: number,
    costRate: number
  ): number => {
    if (costRate === 0) return 0;
    return ((sellRate - costRate) / costRate) * 100;
  };

  // Transform API data to table format
  const tableData: OrderProfitLossTableData[] =
    data?.data.data.map((item) => ({
      orderId: item[0],
      invoiceNo: item[1],
      currencyCode: item[2],
      totalConsumed: item[3],
      profitLossVnd: item[4],
      sellRate: item[5],
      costRate: item[6],
    })) || [];

  const columns: ColumnsType<OrderProfitLossTableData> = [
    {
      title: t("partnerManage.orderId"),
      dataIndex: "orderId",
      key: "orderId",
      width: 80,
      fixed: "left",
      render: (id: number) => (
        <span className="font-mono text-sm text-gray-600">#{id}</span>
      ),
    },
    {
      title: t("partnerManage.invoiceNo"),
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      width: 150,
      fixed: "left",
      render: (invoiceNo: string, record) => (
        <span className="text-sm text-blue-600">{invoiceNo}</span>
      ),
    },
    {
      title: t("partnerManage.currencyCode"),
      dataIndex: "currencyCode",
      key: "currencyCode",
      width: 80,
      align: "center",
      render: (code: string) => (
        <Tag color="blue">
          {code}
        </Tag>
      ),
    },
    {
      title: t("partnerManage.consumed"),
      dataIndex: "totalConsumed",
      key: "totalConsumed",
      width: 150,
      align: "right",
      render: (value: number, record) => (
        <span className="text-sm text-gray-700">
          {formatNumber(value)} {record.currencyCode}
        </span>
      ),
    },
    {
      title: t("partnerManage.profitLoss"),
      dataIndex: "profitLossVnd",
      key: "profitLossVnd",
      width: 150,
      align: "right",
      sorter: (a, b) => a.profitLossVnd - b.profitLossVnd,
      render: (value: number) => {
        const isProfit = value > 0;
        return (
          <span
            className="text-sm"
            style={{ color: isProfit ? "#52c41a" : "#ff4d4f" }}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(value)} {t("partnerManage.currencySymbol")}
          </span>
        );
      },
    },
    {
      title: t("partnerManage.costRate"),
      dataIndex: "costRate",
      key: "costRate",
      width: 120,
      align: "right",
      render: (value: number) => (
        <span className="text-sm text-gray-700">{formatNumber(value)}</span>
      ),
    },
    {
      title: t("partnerManage.sellRate"),
      dataIndex: "sellRate",
      key: "sellRate",
      width: 120,
      align: "right",
      render: (value: number) => (
        <span className="text-sm text-gray-700">{formatNumber(value)}</span>
      ),
    },
    {
      title: t("partnerManage.profitMargin"),
      key: "profitMargin",
      width: 100,
      align: "right",
      render: (_, record) => {
        const margin = calculateProfitMargin(record.sellRate, record.costRate);
        const isProfit = margin > 0;
        return (
          <Tag color={isProfit ? "success" : "error"}>
            {margin > 0 ? "+" : ""}
            {margin.toFixed(2)}%
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="mb-3 w-full border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-800 m-0">
          {t("partnerManage.orderProfitLossTitle")}
        </h3>
        <Select
          value={currencyCode}
          onChange={(value) => {
            setCurrencyCode(value);
            setPage(0);
          }}
          style={{ width: 150 }}
          allowClear
          placeholder={t("partnerManage.selectCurrency")}
        >
          {profitLossCurrencyCodes.map((cod) => {
            return (
              <Option value={cod} key={cod}>
                {cod}
              </Option>
            );
          })}
        </Select>
      </div>

      <div className="mt-4">
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          rowKey="orderId"
          size="small"
          pagination={{
            current: page + 1,
            pageSize: pageSize,
            total: data?.data.total || 0,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t("partnerManage.of")} ${total} ${
                t("partnerManage.itemsPerPage").split("/")[0]
              }`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage - 1);
              if (newPageSize) setPageSize(newPageSize);
            },
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1000 }}
          summary={(pageData) => {
            if (pageData.length === 0) return null;

            const totalProfit = pageData.reduce(
              (sum, record) => sum + record.profitLossVnd,
              0
            );
            const totalConsumed = pageData.reduce(
              (sum, record) => sum + record.totalConsumed,
              0
            );

            return (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-gray-50">
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <span className="text-sm text-gray-700">
                      {t("partnerManage.page")}{" "}
                      {t("partnerManage.totalConsumed")}:
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <span className="text-sm text-gray-800">
                      {formatNumber(totalConsumed)} {currencyCode || ""}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <span
                      className="text-sm"
                      style={{
                        color: totalProfit >= 0 ? "#52c41a" : "#ff4d4f",
                      }}
                    >
                      {totalProfit >= 0 ? "+" : ""}
                      {formatCurrency(totalProfit)}{" "}
                      {t("partnerManage.currencySymbol")}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} colSpan={3} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
    </div>
  );
};
