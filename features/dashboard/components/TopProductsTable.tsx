"use client";

import React from "react";
import { Card, Table, Skeleton, Empty, Tag, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { TopProduct } from "@/types/analytics";

interface TopProductsTableProps {
  data?: TopProduct[];
  isLoading: boolean;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useTranslation();

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      "Mercari Japan": "magenta",
      "Yahoo Auctions Japan": "orange",
      Rakuten: "red",
      Amazon: "gold",
    };
    return colors[source] || "blue";
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_: any, __: any, index: number) => {
        if (index === 0)
          return (
            <span className="text-lg" role="img" aria-label="first">
              🥇
            </span>
          );
        if (index === 1)
          return (
            <span className="text-lg" role="img" aria-label="second">
              🥈
            </span>
          );
        if (index === 2)
          return (
            <span className="text-lg" role="img" aria-label="third">
              🥉
            </span>
          );
        return (
          <span className="text-gray-500 font-medium">{index + 1}</span>
        );
      },
    },
    {
      title: t("dashboard.product", "Sản phẩm"),
      dataIndex: "product_name",
      key: "product_name",
      render: (name: string, record: TopProduct) => (
        <div className="max-w-xs">
          <Tooltip title={name}>
            <div className="font-medium text-gray-900 truncate">{name}</div>
          </Tooltip>
          <div className="flex items-center gap-2 mt-1">
            <Tag color={getSourceColor(record.source_website)} className="text-xs">
              {record.source_website}
            </Tag>
            {record.product_url && (
              <a
                href={record.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-xs"
              >
                <FontAwesomeIcon icon={faExternalLink} className="mr-1" />
                Link
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t("dashboard.order_count", "Số đơn"),
      dataIndex: "order_count",
      key: "order_count",
      render: (value: number) => (
        <span className="font-semibold text-blue-600">
          {value.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: t("dashboard.quantity", "Số lượng"),
      dataIndex: "total_quantity",
      key: "total_quantity",
      render: (value: number) => (
        <Tag color="cyan">{value.toLocaleString("vi-VN")}</Tag>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <FontAwesomeIcon icon={faBoxOpen} className="text-orange-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 m-0">
          {t("dashboard.top_products", "Sản phẩm bán chạy")}
        </h3>
      </div>
      <Skeleton loading={isLoading} active>
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <Empty description={t("dashboard.no_data", "Không có dữ liệu")} />
          </div>
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="product_url"
            scroll={{ x: 600 }}
          />
        )}
      </Skeleton>
    </div>
  );
};

export default TopProductsTable;
