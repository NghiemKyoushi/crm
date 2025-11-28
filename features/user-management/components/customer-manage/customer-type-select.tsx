import { Dropdown, Button, Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { type UIEvent, useEffect, useState } from "react";
import { useListCateGoryCus } from "../../hooks/staff-manage";
import { useTranslation } from "react-i18next";
import type { Category } from "@/types/customer-group";

export function getContrastColor(hex: string): string {
  if (!hex) return "#000";
  const c = hex.startsWith("#") ? hex.substring(1) : hex;
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}

export interface CategoryOption {
  key: string;
  value: number;
  label: string;
  color?: string;
  textColor?: string;
}

interface CategoryDropdownProps {
  value?: number;
  onChange?: (value: number, option?: CategoryOption) => void;
  fallbackLabel?: string | null;
  fallbackColor?: string | null;
}

export default function CategoryDropdown({ value, onChange, fallbackLabel, fallbackColor }: CategoryDropdownProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data, isLoading, isFetching } = useListCateGoryCus({
    page,
    page_size: 10,
  });

  useEffect(() => {
    if (!data) return;

    const { data: pageData = [], total_pages, current_page } = data;
    setHasMore(current_page < total_pages);

    setCategories((prev) => {
      if (page === 0) return pageData;
      const existingIds = new Set(prev.map((item) => item.id));
      const merged = [...prev];
      pageData.forEach((item) => {
        if (!existingIds.has(item.id)) {
          merged.push(item);
        }
      });
      return merged;
    });
  }, [data, page]);

  const categoryOptions: CategoryOption[] =
    categories.map((opt) => ({
      key: String(opt.id),
      value: opt.id,
      label: opt.group_name,
      color: opt.color,
      textColor: opt.text_color ?? "#000",
    })) ?? [];

  const selected = categoryOptions.find((o: any) => o.value === value);
  const displayLabel = selected?.label ?? fallbackLabel ?? t('customerTable.selectCategory');
  const displayColor = selected?.color ?? fallbackColor ?? "#1677ff";

  const handleMenuScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!hasMore || isFetching) return;
    const target = e.currentTarget;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 5) {
      setPage((prev) => prev + 1);
    }
  };

  const menuItems = categoryOptions.map((opt: any) => ({
    key: opt.key,
    label: (
      <div
        style={{
          color: getContrastColor(opt.color ?? "#1677ff"),
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 5) {
      // cuộn đến cuối -> load thêm
      setPage((prev) => prev + 1);
    }
  };

  return (
    <Dropdown
      trigger={["click"]}
      open={isDropdownOpen}
      onOpenChange={(open) => {
        setIsDropdownOpen(open);
        if (open && categories.length === 0 && !isLoading) {
          setPage(0);
        }
      }}
      menu={{
        items: menuItems,
        onClick: ({ key }) => {
          const selectedOption = categoryOptions.find((opt) => opt.key === key);
          onChange?.(Number(key), selectedOption);
          setIsDropdownOpen(false);
        },
      }}
      overlayStyle={{ minWidth: 150 }}
      dropdownRender={(menu) => (
        <div
          style={{ maxHeight: 200, overflowY: "auto" }}
          onScroll={handleMenuScroll}
        >
          {menu}
          {isFetching && (
            <div className="flex items-center justify-center py-2 text-xs text-gray-400">
              <Spin size="small" className="mr-1" /> {t("common.loading")}
            </div>
          )}

        </div>
      )}
    >
      <Button
        size="small"
        style={{
          height: 30,
          minWidth: 120,
          maxWidth: 160,
          color: getContrastColor(displayColor),
          backgroundColor: displayColor,
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
          {displayLabel}
        </span>
        {isLoading ? <Spin size="small" className="ml-2" /> : <DownOutlined className="ml-2" style={{ fontSize: 10 }} />}
      </Button>
    </Dropdown>
  );
}
