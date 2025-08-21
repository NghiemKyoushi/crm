"use client";

import { Select, Button } from "antd";
import { useState } from "react";

interface UserOption {
  label: string;
  value: string;
}

export default function UserMultiSelect() {
  const [options, setOptions] = useState<UserOption[]>([
    { label: "Nguyễn Văn A", value: "1" },
    { label: "Trần Thị B", value: "2" },
    { label: "Lê Văn C", value: "3" },
  ]);

  const handleSearch = (value: string) => {
    // 🔎 Gọi API để tìm user
    // Ví dụ filter giả lập
    const allUsers = [
      { label: "Nguyễn Văn A", value: "1" },
      { label: "Trần Thị B", value: "2" },
      { label: "Lê Văn C", value: "3" },
      { label: "Phạm Thị D", value: "4" },
    ];
    setOptions(
      allUsers.filter((u) =>
        u.label.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleChange = (values: string[]) => {
    console.log("Selected users:", values);
  };

  return (
    <div className="flex gap-2 mb-2 w-full">
      <Select
        mode="multiple"
        showSearch
        allowClear
        placeholder="Tìm khách hàng chưa có sales..."
        className="flex-1"
        filterOption={false} // disable default filter để dùng handleSearch
        onSearch={handleSearch}
        onChange={handleChange}
        options={options}
      />
      <Button type="primary">+</Button>
    </div>
  );
}
