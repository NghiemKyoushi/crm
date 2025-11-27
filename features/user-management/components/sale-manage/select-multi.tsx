"use client";

import { Select, Button, Spin } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import { useListCustomerWithSearch } from "../../hooks/staff-manage";
import { CustomerModel } from "@/types/customer-type";

interface UserOption {
  label: string;
  value: string;
}

interface UserMultiSelectProps {
  onAssign?: (userIds: string[]) => void;
}

export default function UserMultiSelect({ onAssign }: UserMultiSelectProps) {
  const PAGE_SIZE = 10;
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // When "page" or "searchValue" change, fetch data
  const { data, isPending, refetch, isFetching } = useListCustomerWithSearch({
    page: page,
    page_size: PAGE_SIZE,
    category_id: undefined,
    search: searchValue,
  });

  // On new search, reset options and load first page
  useEffect(() => {
    setOptions([]);
    setPage(0);
    setHasMore(true);
  }, [searchValue]);

  // When data changes, update options and check if there is more data
  useEffect(() => {
    if (data && Array.isArray(data.data)) {
      const newOptions = data.data.map((u: CustomerModel) => ({
        label: u.full_name + " - " + u.email,
        value: u.user_id.toString(),
      }));
      setOptions(prevOptions => {
        // Prevent duplicates
        const prevSet = new Set(prevOptions.map(o => o.value));
        return [
          ...prevOptions,
          ...newOptions.filter(opt => !prevSet.has(opt.value)),
        ];
      });
      setHasMore(newOptions.length === PAGE_SIZE);
      setLoadingMore(false);
    }
  }, [data]);

  // Handle dropdown scroll to load more options
  const handlePopupScroll = useCallback((event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (loadingMore || isPending || !hasMore) return;
    const target = event.target as HTMLDivElement;
    if (
      target.scrollTop + target.clientHeight + 30 >= target.scrollHeight // small buffer
    ) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [loadingMore, isPending, hasMore]);

  // If page increases (not due to search), fetch more data
  useEffect(() => {
    if (page === 0) return; // page 0 is initial (already handled by hook automatically)
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // If user triggers new search (via type), reset also page to 0
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPage(0);
    setHasMore(true);
    setOptions([]);
  };

  // Select change
  const handleChange = (values: any[]) => {
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

  // For showing selected values in the Select tag
  const valueForSelect = selected.map(selValue => {
    const found = options.find(opt => opt.value === selValue);
    return found ? { label: found.label, value: found.value } : { label: selValue, value: selValue };
  });

  // Render loading spinner in dropdown
  const dropdownRender = (originNode: React.ReactNode) => (
    <div>
      {originNode}
      {(loadingMore || isFetching) && hasMore && (
        <div style={{ textAlign: "center", padding: 8 }}>
          <Spin size="small" />
        </div>
      )}
    </div>
  );

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
        dropdownRender={dropdownRender}
        onPopupScroll={handlePopupScroll}
        notFoundContent={isFetching ? <Spin size="small" /> : null}
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
