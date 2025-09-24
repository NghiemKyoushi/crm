"use client";

import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  InputNumber,
  Popconfirm,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlag,
  faFlagUsa,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

type RowData = {
  key: string;
  product: string;
  condition: string;
  valueUSD: number | string;
  priceVND: number | string;
  surcharge: number | string;
};

const initialData: RowData[] = [
  {
    key: "1",
    product: "Hàng thông thường: Quần áo, giày dép...",
    condition: "Không",
    valueUSD: 0,
    priceVND: 220000,
    surcharge: 0,
  },
];

export default function ShippingSurchangeTable() {
  const [data, setData] = useState<RowData[]>(initialData);
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());

  const handleAddRow = () => {
    const newKey = Date.now().toString();
    const newRow: RowData = {
      key: newKey,
      product: "",
      condition: "Không",
      valueUSD: 0,
      priceVND: 0,
      surcharge: 0,
    };
    setData([...data, newRow]);
    setNewKeys((prev) => new Set([...prev, newKey])); // lưu key row mới
  };

  const handleDelete = (key: string) => {
    setData(data.filter((row) => row.key !== key));
    setNewKeys((prev) => {
      const copy = new Set(prev);
      copy.delete(key);
      return copy;
    });
  };

  const handleChange = (key: string, field: keyof RowData, value: any) => {
    setData(
      data.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  };

  const handleSaveAll = () => {
    // TODO: call API để lưu data
    console.log("Saving data: ", data);

    // Giả sử gọi API thành công:
    setNewKeys(new Set()); // clear newKeys -> các row mới chuyển thành text
    message.success("Đã lưu tất cả thay đổi!");
  };

  const columns: ColumnsType<RowData> = [
    {
      title: "STT",
      dataIndex: "key",
      width: 40,
      render: (_val, _record, index) => index + 1,
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
      width: 240,
      render: (val, record) => {
        const isNew = newKeys.has(record.key) || !val?.toString().trim();

        if (!isNew) {
          return (
            <span className="block whitespace-normal break-words w-full">
              {val}
            </span>
          );
        }

        return (
          <Input
            className="!w-full !h-9"
            value={val}
            onChange={(e) =>
              handleChange(record.key, "product", e.target.value)
            }
          />
        );
      },
    },
    {
      title: "Loại điều kiện",
      dataIndex: "condition",
      width: 140,
      render: (val, record) => (
        <Select
          className="!w-full !h-9 !bg-gray-100"
          value={val}
          onChange={(value) => handleChange(record.key, "condition", value)}
          options={[
            { value: "Không", label: "Không" },
            { value: "> Trên", label: "> Trên" },
            { value: "< Dưới", label: "< Dưới" },
            { value: "Khoảng", label: "Khoảng" },
          ]}
        />
      ),
    },
    {
      title: "Giá trị (USD)",
      dataIndex: "valueUSD",
      width: 140,
      render: (val, record) => (
        <InputNumber<string>
          className="!bg-gray-100 !w-full [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!py-0  !text-center"
          value={val}
          step={0.01}
          stringMode
          formatter={(value) =>
            value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
          }
          parser={(value) => (value ? value.replace(/,/g, "") : "")}
          onChange={(value) => handleChange(record.key, "valueUSD", value ?? 0)}
        />
      ),
    },
    {
      title: "Giá Kg - HN (VND)",
      dataIndex: "priceVND",
      width: 140,
      render: (val, record) => (
        <InputNumber<string>
          className="!bg-gray-100 !w-full [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!py-0  !text-center"
          value={val}
          step={0.01}
          stringMode
          formatter={(value) =>
            value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
          }
          parser={(value) => (value ? value.replace(/,/g, "") : "")}
          onChange={(value) => handleChange(record.key, "priceVND", value ?? 0)}
        />
      ),
    },
    {
      title: "Phụ thu",
      dataIndex: "surcharge",
      width: 140,
      render: (val, record) => (
        <Input
          className="w-full !text-red-600 font-bold !h-9 !bg-gray-100 !text-center"
          value={val}
          onChange={(e) => {
            const v = e.target.value.trim();
            const match = v.match(/^([\d]*\.?[\d]*)(%|\$|JPY)?$/);
            if (!match) return;
            handleChange(record.key, "surcharge", v);
          }}
          onBlur={(e) => {
            const v = e.target.value.trim();
            const match = v.match(/^([\d]*\.?[\d]*)(%|\$|JPY)?$/);
            let num = match?.[1] ?? "";
            const suffix = match?.[2] ?? "";

            if (num) {
              const [intPart, decimalPart] = num.split(".");
              num =
                intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                (decimalPart ? "." + decimalPart : "");
            }

            handleChange(record.key, "surcharge", num + suffix);
          }}
        />
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      width: 40,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center h-full">
          <Popconfirm
            title="Xóa dòng này?"
            onConfirm={() => handleDelete(record.key)}
          >
            <div className="w-8 h-6 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded cursor-pointer flex items-center justify-center">
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </div>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            <FontAwesomeIcon
              icon={faFlagUsa}
              className="!text-red-600  mr-2 w-4 h-4"
            />{" "}
            Bảng Giá Tuyến US → Hà Nội (Kho Oregon / New Hampshire)
          </h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
            className="!bg-green-600 hover:!bg-green-700"
          >
            Thêm mới
          </Button>
        </div>
        <Table
          bordered
          dataSource={data}
          columns={columns}
          pagination={false}
          rowKey="key"
        />
      </div>
      <div className="text-right border-t-gray-100 pt-6 mt-8">
        <button
          onClick={handleSaveAll}
          className="bg-blue-600 hover:bg-blue-700 !text-white !font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />
          Lưu Tất Cả Thay Đổi
        </button>
      </div>
    </div>
  );
}
