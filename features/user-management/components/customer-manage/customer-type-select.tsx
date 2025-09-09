// import { Select, Spin } from "antd";
// import { useState } from "react";
// import { useListCateGoryCus } from "../../hooks/staff-manage";

// export default function CategorySelect({ value, onChange }: any) {
//   const [page, setPage] = useState(0);

//   const { data, isLoading, isFetching } = useListCateGoryCus({
//     page,
//     page_size: 10,
//     // search: undefined,
//   });

//   const categoryOptions =
//     data?.data.map((opt: any) => ({
//       value: opt.id,
//       label: (
//         <span
//           style={{
//             fontWeight: 600,
//             color: "#fff",
//             backgroundColor: opt.color,
//             padding: "2px 8px",
//             borderRadius: 6,
//           }}
//         >
//           {opt.group_name}
//         </span>
//       ),
//     })) ?? [];

//   return (
//     <Select
//     className="no-border-select"

//       style={{
//         width: 150, 
//         // width: "fit-content", 
//       }}
//       allowClear
//       value={value}
//       placeholder="Chọn loại khách hàng"
//       onChange={onChange}
//       loading={isLoading}
//       options={categoryOptions}
//       notFoundContent={isFetching ? <Spin size="small" /> : null}
//       onPopupScroll={(e) => {
//         const target = e.target as HTMLElement;
//         if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
//           setPage((prev) => prev + 1); // load thêm khi scroll xuống cuối
//         }
//       }}
//     />
//   );
// }
import { Dropdown, Menu, Button, Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useListCateGoryCus } from "../../hooks/staff-manage";

export default function CategoryDropdown({ value, onChange }: any) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useListCateGoryCus({
    page,
    page_size: 10,
  });

  const categoryOptions =
    data?.data.map((opt: any) => ({
      key: opt.id,
      label: opt.group_name,
      color: opt.color,
      textColor: opt.text_color ?? "#000",
    })) ?? [];

  const selected = categoryOptions.find((o: any) => o.key === value);

  const menu = (
    <Menu
      onClick={({ key }) => onChange?.(key)}
      items={categoryOptions.map((opt: any) => ({
        key: opt.key,
        label: (
          <span
            style={{
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: opt.color !== null ? opt.color : "blue",
              padding: "2px 8px",
              borderRadius: 6,
              display: "inline-block",
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {opt.label}
          </span>
        ),
      }))}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Button
        style={{
          height: 28,
          width: 150,
          fontWeight: 600,
          color:  "#ffffff",
          backgroundColor: selected?.color ?? "rgb(22, 119, 255)",
          border: "none",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {selected ? selected.label : "Chọn phân loại "}
        {isLoading ? <Spin size="small" /> : <DownOutlined />}
      </Button>
    </Dropdown>
  );
}
