"use client";

import { Select, Button } from "antd";
import { useState, useEffect } from "react";
import {  useListCustomerWithSearch } from "../../hooks/staff-manage"; // hook query khách hàng
import { CustomerModel } from "@/types/customer-type";

interface UserOption {
  label: string;
  value: string;
}

interface UserMultiSelectProps {
  onAssign?: (userIds: string[]) => void;
}

export default function UserMultiSelect({ onAssign }: UserMultiSelectProps) {
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  // 👉 gọi hook fetch khách hàng theo searchValue
  const { data } = useListCustomerWithSearch({
    page: 0,
    page_size: 10,
    category_id: undefined,
    search: searchValue,
  });

  // 👉 map data thành options mỗi khi data thay đổi
  useEffect(() => {
    if (data) {
      const mapped = data.data.map((u: CustomerModel) => ({
        label: u.full_name + " - " + u.email,
        value: u.user_id.toString(),
      }));
      setOptions(mapped);
    }
  }, [data]);

  const handleSearch = (value: string) => {
    setSearchValue(value); // đổi searchValue → hook fetch lại
  };

  const handleChange = (values: string[]) => {
    setSelected(values);
  };

  const handleAssign = () => {
    if (onAssign) onAssign(selected);
    setSelected([]);
  };

  return (
    <div className="flex gap-2 mb-2 w-full">
      <Select
        mode="multiple"
        showSearch
        allowClear
        placeholder="Tìm khách hàng chưa có sales..."
        className="flex-1"
        filterOption={false} // disable filter mặc định, dùng handleSearch
        onSearch={handleSearch}
        onChange={handleChange}
        labelInValue
        value={selected}
        options={options}
      />
      <Button
        type="primary"
        onClick={handleAssign}
        disabled={selected.length === 0}
      >
        +
      </Button>
    </div>
  );
}
