"use client";

import { Select, Button } from "antd";
import { useState, useEffect, useRef } from "react";
import { useListCustomerWithSearch } from "../../hooks/staff-manage"; // hook query khách hàng
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
  // Dùng state/flag để đảm bảo lần đầu tiên component mount sẽ fetch API (refresh lần đầu)
  const [firstLoaded, setFirstLoaded] = useState(false);

  // Khi searchValue thay đổi hoặc lần đầu tiên load, phải gọi lại API
  // Ta truyền search: searchValue, khi mount lần đầu searchValue là ""
  const { data, refetch } = useListCustomerWithSearch({
    page: 0,
    page_size: 10,
    category_id: undefined,
    search: searchValue,
  });

  // Lần đầu tiên component mount, đảm bảo fetch lại API (refresh init lần đầu)
  useEffect(() => {
    if (!firstLoaded) {
      refetch();
      setFirstLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi data thay đổi (do search hoặc lần đầu load lại), cập nhật options
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

  const handleChange = (values: any[]) => {
    // Khi Select ở chế độ labelInValue, value sẽ là mảng objects { label, value }
    if (Array.isArray(values)) {
      setSelected(values.map(item => item.value));
    } else {
      setSelected([]);
    }
  };

  const handleAssign = () => {
    if (onAssign) onAssign(selected);
    setSelected([]);
  };

  // Cần transform lại value/option đúng cho Select khi dùng labelInValue
  const valueForSelect = selected.map(selValue => {
    const found = options.find(opt => opt.value === selValue);
    return found ? { label: found.label, value: found.value } : { label: selValue, value: selValue };
  });

  return (
    <div className="flex gap-2 mb-2 w-full">
      <Select
        mode="multiple"
        showSearch
        allowClear
        placeholder="Tìm khách hàng chưa có sales..."
        className="flex-1"
        filterOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        labelInValue
        value={valueForSelect}
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
