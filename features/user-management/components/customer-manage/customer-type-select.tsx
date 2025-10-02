import { Dropdown, Button, Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useListCateGoryCus } from "../../hooks/staff-manage";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      <div
        style={{
          color: getContrastColor(opt.color),
          backgroundColor: opt.color ?? "#1677ff",
          padding: "4px 12px",
          borderRadius: 6,
          display: "inline-block",
          width: "100%",
          textAlign: "center",
          fontSize: "12px",
          transition: "all 0.2s",
        }}
        className="hover:opacity-80"
      >
        {opt.label}
      </div>
    ),
  }));

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: menuItems,
        onClick: ({ key }) => onChange?.(Number(key)),
      }}
      overlayStyle={{ minWidth: 150 }}
    >
      <Button
        size="small"
        style={{
          height: 30,
          minWidth: 120,
          maxWidth: 160,
          color: getContrastColor(selected?.color),
          backgroundColor: selected?.color ?? "#1677ff",
          border: "none",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: 400,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          transition: "all 0.2s",
        }}
        className="hover:opacity-90"
      >
        <span className="truncate flex-1 text-left">
          {selected ? selected.label : t('customerTable.selectCategory')}
        </span>
        {isLoading ? <Spin size="small" className="ml-2" /> : <DownOutlined className="ml-2" style={{ fontSize: 10 }} />}
      </Button>
    </Dropdown>
  );
}
