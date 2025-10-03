"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Select, InputNumber, message } from "antd";
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
import {
  useListMaterial,
  useListMaterialByGroup,
  useUpdateShipping,
} from "../hooks/fee-setting";
import { MaterialItem, ShippingConditionAdd } from "@/types/fee-setting";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface ShippingSurchangeTableProps {
  isCategory?: boolean;
  idCategory?: number;
}
export default function ShippingSurchangeTable(
  props: ShippingSurchangeTableProps
) {
  const { idCategory, isCategory } = props;
  const { t } = useTranslation();

  const [data, setData] = useState<Record<number, MaterialItem[]>>({});
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const [routeNames, setRouteNames] = useState<Record<number, string>>({});

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
  const { data: listFollowGroup } = useListMaterialByGroup(
    idCategory as number
  );
  useEffect(() => {
    if (materialData && !isCategory) {
      const normalized: Record<number, MaterialItem[]> = {};
      const routeNames: Record<number, string> = {};

      materialData.forEach((item) => {
        normalized[item.route.id] = item.data ?? [];
        routeNames[item.route.id] = item.route.name;
      });
      setData(normalized);
      setRouteNames(routeNames);
    } else if (listFollowGroup) {
      const normalized: Record<number, MaterialItem[]> = {};
      const routeNames: Record<number, string> = {};

      listFollowGroup.forEach((item) => {
        normalized[item.route.id] = item.data ?? [];
        routeNames[item.route.id] = item.route.name;
      });
      setData(normalized);
      setRouteNames(routeNames);
    }
  }, [materialData, listFollowGroup]);

  const handleAddRow = (routeId: number) => {
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
      type: 1,
    };
    setData((prev) => ({
      ...prev,
      [routeId]: [...(prev[routeId] || []), newRow],
    }));
    setNewKeys((prev) => new Set([...prev, newKey]));
  };

  const handleDelete = (routeId: number, key: string) => {
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
    routeId: number,
    key: string,
    field: string,
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
    const allData = Object.values(data).flat();
    // const filteredData = allData.filter((item) => item.route_id === 1);

    const mappedData = allData.map((item) => {
      let mappedId: number | null;

      // Nếu id là timestamp (>= 1e12) hoặc null thì gửi null
      if (!item.id || Number(item.id) >= 1e12) {
        mappedId = null;
      } else {
        mappedId = Number(item.id);
      }
      return {
        id: mappedId,
        route_id: item.route_id,
        product_category_id: item.product_category_id,
        condition_type: item.condition_type,
        price_from: item.price_from || 0,
        price_to: item.price_to || 0,
        value_data: item.value_data ? item.value_data.toString() : "0",
        value_shipping_data: item.value_shipping_data?.toString() ?? "",
        status: item.status,
        customer_group_id: isCategory ? idCategory : undefined, 
        type: item.type ?? 1,
      };
    });
    updateShippingMutation.mutate(
      { list: mappedData as ShippingConditionAdd[] },
      {
        onSuccess: () => {
          toast.success(t("shippingSettings.updateFeeSuccess"));
          if (isCategory) {
            queryClient.invalidateQueries({
              queryKey: ["listMaterialCate"],
            });
            return;
          }
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
    message.success(t("shippingSettings.saveAllSuccess"));
  };

  const getColumns = (route: string, routeName: string): ColumnsType<MaterialItem> => {
    const isUSRoute = routeName === "US -> VN";

    return [
      {
        title: t("table.index"),
        dataIndex: "id",
        width: 40,
        render: (_val, _record, index) => index + 1,
      },
      {
        title: t("table.productType"),
        dataIndex: "product_category_id",
        width: 160,
        render: (val, record) => (
          <Select
            showSearch
            className="!w-[180px] !h-9 !bg-gray-100"
            value={val}
            loading={isLoadingCategories}
            onChange={(value) =>
              handleChange(
                +route,
                record.id.toString(),
                "product_category_id",
                value
              )
            }
            options={categoryOptions}
            placeholder={t("placeholder.selectProductType")}
          />
        ),
      },
      {
        title: t("table.orderType"),
        dataIndex: "order_type",
        width: 180,
        render: (val, record) => (
          <Select
            className="!w-full !h-9 !bg-gray-100"
            value={val ?? 1}
            onChange={(value) =>
              handleChange(+route, record.id.toString(), "order_type", value)
            }
            options={[
              { value: 1, label: "Tính trên giá sản phẩm" },
              { value: 2, label: "Tính trên chiếc" },
            ]}
          />
        ),
      },
      {
        title: t("table.conditionType"),
        dataIndex: "condition_type",
        width: 100,
        render: (val, record) => (
          <Select
            className="!w-full !h-9 !bg-gray-100"
            value={val}
            onChange={(value) =>
              handleChange(+route, record.id.toString(), "condition_type", value)
            }
            options={[
              { value: "GTE", label: ">=" },
              { value: "LTE", label: "<=" },
              { value: "EQ", label: "==" },
              { value: "GT", label: ">" },
              { value: "LT", label: "<" },
              { value: "RANGE", label: "Range" },
            ]}
          />
        ),
      },
      {
        title: isUSRoute ? "Giá trị (USD)" : "Giá trị (JPY)",
        dataIndex: "price_to",
        width: 200,
        render: (val, record: MaterialItem) => {
        const placeholder = isUSRoute ? "$" : "¥";

        if (record.condition_type === "RANGE") {
          return (
            <div className="flex items-center gap-1">
              <InputNumber<string>
                className="!bg-gray-100 flex-1 [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!py-0 !text-center"
                value={record.price_from.toString()}
                step={0.01}
                stringMode
                placeholder={placeholder}
                formatter={(value) =>
                  value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) => (value ? value.replace(/,/g, "") : "")}
                onChange={(value) =>
                  handleChange(
                    +route,
                    record.id.toString(),
                    "price_from",
                    value ?? 0
                  )
                }
              />
              <span className="px-1">~</span>
              <InputNumber<string>
                className="!bg-gray-100 flex-1 [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!py-0 !text-center"
                value={record.price_to.toString()}
                step={0.01}
                stringMode
                placeholder={placeholder}
                formatter={(value) =>
                  value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) => (value ? value.replace(/,/g, "") : "")}
                onChange={(value) =>
                  handleChange(
                    +route,
                    record.id.toString(),
                    "price_to",
                    value ?? 0
                  )
                }
              />
            </div>
          );
        }

        return (
          <InputNumber<string>
            className="!bg-gray-100 !w-full [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!py-0 !text-center"
            value={
              record.condition_type === "GT" || record.condition_type === "GTE"
                ? record.price_from?.toString()
                : record.condition_type === "LT" ||
                  record.condition_type === "LTE"
                ? record.price_to?.toString()
                : ""
            }
            step={0.01}
            stringMode
            placeholder={placeholder}
            formatter={(value) =>
              value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(value) => (value ? value.replace(/,/g, "") : "")}
            onChange={(value) => {
              let fieldCheck = "";
              if (
                record.condition_type === "GT" ||
                record.condition_type === "GTE"
              ) {
                fieldCheck = "price_from";
              } else if (
                record.condition_type === "LT" ||
                record.condition_type === "LTE"
              ) {
                fieldCheck = "price_to";
              }
              handleChange(
                +route,
                record.id.toString(),
                fieldCheck,
                value ?? 0
              );
            }}
          />
        );
      },
    },
    {
      title: t("table.priceKgHN"),
      dataIndex: "value_data",
      width: 200,
      render: (val, record) => {
        // Bắt cả USD, JPY, VND, %
        const match = (val ?? "")
          .toString()
          .match(/^([\d.,]+)\s*(USD|JPY|VND|%)?$/i);

        const numberPart =
          match && match[1]
            ? match[1].replace(/,/g, "")
            : val?.toString() ?? "";

        // US route: USD, VND, %
        // JP route: JPY, VND
        const defaultUnit = isUSRoute ? "USD": "JPY";
        const unitPart = match && match[2] ? match[2].toUpperCase() : defaultUnit;

        const currencyOptions = isUSRoute
          ? [
              { label: "USD", value: "USD" },
              { label: "VND", value: "VND" },
              { label: "%", value: "%" },
            ]: [
              { label: "JPY", value: "JPY" },
              { label: "VND", value: "VND" },
            ];

        return (
          <div className="flex items-center gap-1">
            <InputNumber<string>
              className="!bg-gray-100 flex-1 [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!py-0 !text-center"
              value={numberPart}
              step={0.01}
              stringMode
              formatter={(value) => {
                if (!value) return "";
                return value.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // format số
              }}
              parser={(value) => {
                if (!value) return "";
                return value.replace(/,/g, "").trim(); // parse số
              }}
              onChange={(value) =>
                handleChange(
                  +route,
                  record.id.toString(),
                  "value_data",
                  (value ?? "0") + unitPart // nối với đơn vị
                )
              }
            />

            <Select
              className="!h-9 !w-6/12"
              value={unitPart}
              onChange={(cur) => {
                const cleanNumber = numberPart || "0";
                handleChange(
                  +route,
                  record.id.toString(),
                  "value_data",
                  cleanNumber + cur // đổi đơn vị => lưu số + đơn vị
                );
              }}
              options={currencyOptions}
            />
          </div>
        );
      },
    },
    {
      title: t("table.surcharge"),
      dataIndex: "value_shipping_data",
      width: 140,
      render: (val, record) => {
        // Bắt cả USD, JPY, VND, %
        const match = (val ?? "")
          .toString()
          .match(/^([\d.,]+)\s*(USD|JPY|VND|%)?$/i);

        const numberPart =
          match && match[1]
            ? match[1].replace(/,/g, "")
            : val?.toString() ?? "";

        // US route: USD, VND, %
        // JP route: JPY, VND
        const defaultUnit = isUSRoute ? "USD" : "JPY" ;
        const unitPart = match && match[2] ? match[2].toUpperCase() : defaultUnit;

        const optionList = isUSRoute
          ? [
              { label: "USD", value: "USD" },
              { label: "VND", value: "VND" },
              { label: "%", value: "%" },
            ] : [
              { label: "JPY", value: "JPY" },
              { label: "VND", value: "VND" },
            ];

        return (
          <div className="flex items-center gap-1">
            <InputNumber<string>
              className="!bg-gray-100 flex-1 [&_.ant-input-number-input]:!h-9 [&_.ant-input-number-input]:!py-0 !text-center"
              value={numberPart}
              step={0.01}
              stringMode
              formatter={(value) => {
                if (!value) return "";
                return value.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // format số
              }}
              parser={(value) => {
                if (!value) return "";
                return value.replace(/,/g, "").trim(); // parse số
              }}
              onChange={(value) =>
                handleChange(
                  +route,
                  record.id.toString(),
                  "value_shipping_data",
                  (value ?? "0") + unitPart // nối với đơn vị
                )
              }
            />

            <Select
              className="!h-9 !w-6/12"
              value={unitPart}
              onChange={(cur) => {
                const cleanNumber = numberPart || "0";
                handleChange(
                  +route,
                  record.id.toString(),
                  "value_shipping_data",
                  cleanNumber + cur // đổi đơn vị => lưu số + đơn vị
                );
              }}
              options={optionList}
            />
          </div>
        );
      },
    },
    {
      title: t("table.actions"),
      dataIndex: "action",
      width: 40,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center h-full">
          <div
            onClick={() => handleDelete(+route, record.id.toString())}
            className="w-8 h-6 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded cursor-pointer flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </div>
        </div>
      ),
    },
  ];
};

  return (
    <div>
      {Object.entries(data).map(([routeId, rows]) => (
        <div key={routeId} className="mb-6">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-medium text-gray-800">
                <FontAwesomeIcon
                  icon={
                    routeNames[Number(routeId)] === "US -> VN"
                      ? faFlagUsa
                      : faFlag
                  }
                  className={`mr-2 w-4 h-4 ${
                    routeNames[Number(routeId)] === "US -> VN"
                      ? "!text-red-600"
                      : "!text-blue-600"
                  }`}
                />
                {t("shippingSettings.routePriceTable", { route: routeNames[Number(routeId)] })}
              </h2>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => handleAddRow(+routeId)}
                className="!bg-green-600 hover:!bg-green-700"
              >
                {t("button.addNew")}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table<MaterialItem>
                bordered
                dataSource={rows}
                rowKey="id"
                columns={getColumns(routeId, routeNames[Number(routeId)])}
                pagination={false}
                rowClassName={() => "custom-row"}
                scroll={{ x: "max-content" }}
                size="small"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="text-right border-t border-gray-200 pt-6 mt-8">
        <Button
          type="primary"
          size="large"
          onClick={() => handleSaveAll()}
          icon={<FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />}
          className="!bg-blue-600 hover:!bg-blue-700 !px-8"
        >
          {t("button.saveAllChanges")}
        </Button>
      </div>
    </div>
  );
}
