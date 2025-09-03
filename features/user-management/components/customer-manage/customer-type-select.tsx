import { Select, Spin } from "antd";
import { useState } from "react";
import { useListCateGoryCus } from "../../hooks/staff-manage";

export default function CategorySelect({ value, onChange }: any) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useListCateGoryCus({
    page,
    page_size: 10,
    // search: undefined,
  });

  const categoryOptions =
    data?.data.map((opt: any) => ({
      value: opt.id,
      label: (
        <span
          style={{
            fontWeight: 600,
            color: "#fff",
            backgroundColor: opt.color,
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          {opt.category_name}
        </span>
      ),
    })) ?? [];

  return (
    <Select
    className="no-border-select"

      style={{
        width: 150, 
        // width: "fit-content", 
      }}
      allowClear
      value={value}
      placeholder="Chọn loại khách hàng"
      onChange={onChange}
      loading={isLoading}
      options={categoryOptions}
      notFoundContent={isFetching ? <Spin size="small" /> : null}
      onPopupScroll={(e) => {
        const target = e.target as HTMLElement;
        if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
          setPage((prev) => prev + 1); // load thêm khi scroll xuống cuối
        }
      }}
    />
  );
}
