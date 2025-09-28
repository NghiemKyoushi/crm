import { Dropdown, Button, Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useListCateGoryCus } from "../../hooks/staff-manage";

export function getContrastColor(hex: string): string {
  if (!hex) return "#000";
  const c = hex.startsWith("#") ? hex.substring(1) : hex;
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}

interface CategoryDropdownProps {
  value?: number;
  onChange?: (value: number) => void;
}

export default function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  const [page] = useState(0);

  const { data, isLoading } = useListCateGoryCus({
    page,
    page_size: 10,
  });

  const categoryOptions =
    data?.data.map((opt: any) => ({
      key: String(opt.id),
      value: opt.id,
      label: opt.group_name,
      color: opt.color,
      textColor: opt.text_color ?? "#000",
    })) ?? [];

  const selected = categoryOptions.find((o: any) => o.value === value);

  const menuItems = categoryOptions.map((opt: any) => ({
    key: opt.key,
    label: (
      <span
        style={{
          color: getContrastColor(opt.color),
          backgroundColor: opt.color ?? "blue",
          padding: "2px 8px",
          borderRadius: 6,
          display: "inline-block",
          minWidth: 80,
          textAlign: "center",
          fontSize: "12px",
        }}
      >
        {opt.label}
      </span>
    ),
  }));

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: menuItems,
        onClick: ({ key }) => onChange?.(Number(key)),
      }}
    >
      <Button
        style={{
          height: 28,
          width: 130,
          color: getContrastColor(selected?.color),
          backgroundColor: selected?.color ?? "rgb(22, 119, 255)",
          border: "none",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "center",
          fontSize: "12px",
        }}
      >
        {selected ? selected.label : "Chọn phân loại "}
        {isLoading ? <Spin size="small" /> : <DownOutlined />}
      </Button>
    </Dropdown>
  );
}
