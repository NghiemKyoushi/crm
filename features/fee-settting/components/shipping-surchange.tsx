"use client";

import React, { useEffect, useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getListProductCategory } from "../apis/fee-setting";
import { useListMaterial, useUpdateShipping } from "../hooks/fee-setting";
import {
  MaterialItem,
  MaterialResponse,
  ShippingCondition,
  ShippingConditionAdd,
} from "@/types/fee-setting";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function ShippingSurchangeTable() {
    const { t } = useTranslation();
  
  const [data, setData] = useState<Record<string, MaterialItem[]>>({});
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["productCategories"],
    queryFn: getListProductCategory,
  });

  const updateShippingMutation = useUpdateShipping();

  const categoryOptions =
    categories?.map((cat: any) => ({
      value: cat.id,
      label: cat.name,
    })) || [];

  const { data: materialData } = useListMaterial();
  console.log("materialData", materialData);

  if (materialData) {
    Object.entries(materialData).forEach(([routeId, items]) => {
      console.log("routeId:", routeId, "items:", items);
    });
  }
  useEffect(() => {
    if (materialData) {
      setData(materialData);
    }
  }, [materialData]);

  const handleAddRow = (routeId: string) => {
    const newKey = Date.now().toString();
    const newRow: MaterialItem = {
      id: newKey,
      product_category_name: "",
      condition_type: "GT",
      price_from: 0,
      price_to: 0,
      route_id: Number(routeId),
      product_category_id: 0,
      value_data: 0,
      value_shipping_data: null,
    };
    setData((prev) => ({
      ...prev,
      [routeId]: [...(prev[routeId] || []), newRow],
    }));
    setNewKeys((prev) => new Set([...prev, newKey]));
  };

  const handleDelete = (routeId: string, key: string) => {
    setData((prev) => ({
      ...prev,
      [routeId]: prev[routeId].filter((row) => row.id.toString() !== key),
    }));
    setNewKeys((prev) => {
      const copy = new Set(prev);
      copy.delete(key);
      return copy;
    });
  };

  const handleChange = (
    routeId: string,
    key: string,
    field: keyof MaterialItem,
    value?: any
  ) => {
    setData((prev) => ({
      ...prev,
      [routeId]: prev[routeId].map((row) =>
        row.id.toString() === key ? { ...row, [field]: value } : row
      ),
    }));
  };
  const handleSaveAll = () => {
    // gộp tất cả route lại thành 1 mảng
    const allData = Object.values(data).flat();
    const filteredData = allData.filter((item) => item.route_id === 1);
     
    const mappedData = filteredData.map((item) => {      
      return ({
        id: Number(item.id),
        route_id: item.route_id,
        product_category_id: item.product_category_id,
        condition_type: item.condition_type,
        price_from: item.price_from,
        price_to: item.price_to,
        value_data: item.value_data ? item.value_data.toString() : "0", // number -> string
        value_shipping_data: item.value_shipping_data?.toString() ?? "", // hoặc logic khác bạn muốn
        status: item.status,
        customer_group_id: undefined, // nếu có thể map thêm field này
      })
    });

    console.log('mappedData');
    
    
    updateShippingMutation.mutate(
      { list: mappedData as ShippingConditionAdd[] },
      {
        onSuccess: () => {
          toast.success("Cập nhật phí thành công!");
          queryClient.invalidateQueries({
            queryKey: ["listMaterial"],
          });
        },
        onError: (err: any) =>
          toast.error(
            err.response?.data?.localizedMessage || t("common.error")
          ),
      }
    );
    setNewKeys(new Set());
    message.success("Đã lưu tất cả thay đổi!");
  };

  const getColumns = (route: string): ColumnsType<MaterialItem> => [
    {
      title: "STT",
      dataIndex: "id",
      width: 40,
      render: (_val, _record, index) => index + 1,
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_category_name",
      width: 240,
      render: (val, record: MaterialItem) => {
        const isNew =
          newKeys.has(record.id.toString()) || !val?.toString().trim();

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
              handleChange(
                route,
                record.id.toString(),
                "product_category_name",

                e.target.value
              )
            }
          />
        );
      },
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "product_category_id",
      width: 180,
      render: (val, record) => (
        <Select
          showSearch
          className="!w-[180px] !h-9 !bg-gray-100"
          value={val}
          loading={isLoadingCategories}
          onChange={(value) =>
            handleChange(
              route,
              record.id.toString(),
              "product_category_id",
              value
            )
          }
          options={categoryOptions}
          placeholder="Chọn loại sản phẩm"
        />
      ),
    },
    {
      title: "Loại điều kiện",
      dataIndex: "condition_type",
      width: 140,
      render: (val, record) => (
        <Select
          className="!w-full !h-9 !bg-gray-100"
          value={val}
          onChange={(value) =>
            handleChange(route, record.id.toString(), "condition_type", value)
          }
          options={[
            { value: "GTE", label: "Lớn hơn hoặc bằng" },
            { value: "RANGE", label: "Khoảng" },
            { value: "LT", label: "Lớn hơn" },
            { value: "GT", label: "Lớn hơn" },
            { value: "LTE", label: "Nhỏ hơn hoặc bằng" },
          ]}
        />
      ),
    },
    {
      title: "Giá trị (USD)",
      dataIndex: "value_data",
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
          onChange={(value) =>
            handleChange(
              route,
              record.id.toString(),
              "value_data",
              value ?? 0
            )
          }
        />
      ),
    },
    {
      title: "Giá Kg - HN (VND)",
      dataIndex: "price_to",
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
          onChange={(value) =>
            handleChange(route, record.id.toString(), "price_to", value ?? 0)
          }
        />
      ),
    },
    {
      title: "Phụ thu",
      dataIndex: "value_shipping_data",
      width: 140,
      render: (val, record) => (
        <Input
          className="w-full !text-red-600 font-bold !h-9 !bg-gray-100 !text-center"
          value={val}
          onChange={(e) => {
            const v = e.target.value.trim();
            const match = v.match(/^([\d]*\.?[\d]*)(%|\$|JPY)?$/);
            if (!match) return;
            handleChange(route, record.id.toString(), "value_data", v);
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

            handleChange(
              route,
              record.id.toString(),
              "value_shipping_data",
              num + suffix
            );
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
            onConfirm={() => handleDelete(route, record.id.toString())}
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
      {/* <div className="p-5 rounded-lg border border-gray-200 bg-gray-50">
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
      </div> */}

      {Object.entries(data).map(([routeId, rows]) => (
        <div key={routeId} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Route {routeId}</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddRow(routeId)}
              className="!bg-green-600 hover:!bg-green-700"
            >
              Thêm mới
            </Button>
          </div>
          <Table<MaterialItem>
            bordered
            dataSource={rows}
            rowKey="id"
            columns={getColumns(routeId)}
            pagination={false}
          />
        </div>
      ))}
      <div className="text-right border-t-gray-100 pt-6 mt-8">
        <button
          onClick={()=> handleSaveAll()}
          className="bg-blue-600 hover:bg-blue-700 !text-white !font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />
          Lưu Tất Cả Thay Đổi
        </button>
      </div>
    </div>
  );
}
