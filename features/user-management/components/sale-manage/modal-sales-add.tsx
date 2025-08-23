"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, Checkbox, Button, Spin } from "antd";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getListStaff } from "../../apis/staff-manage";

export interface Employee {
  id: string;
  name: string;
  email: string;
}

interface AddSalesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedEmployees: Employee[]) => void;
}

export default function AddSalesModal({
  open,
  onClose,
  onSubmit,
}: AddSalesModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["listStaff", search],
    queryFn: ({ pageParam = 0 }) =>
      getListStaff({
        page: pageParam,
        page_size: 10,
        active: true,
        search: search || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    enabled: open,
  });

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const employees: Employee[] =
    data?.pages.flatMap((page) =>
      page.data.map((emp: any) => ({
        id: emp.user_id.toString(),
        name: emp.full_name,
        email: emp.email ?? "",
      }))
    ) ?? [];

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const selectedEmployees = employees.filter((emp) =>
      selectedIds.includes(emp.id)
    );
    onSubmit(selectedEmployees);
    setSelectedIds([]);
    setSearch("");
  };

  return (
    <Modal
      title={
        <span className="font-semibold text-lg">Thêm Nhân viên Sales mới</span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <div className="space-y-3">
        {/* Ô search */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tìm kiếm và chọn Nhân viên
          </label>
          <Input.Search
            placeholder="Nhập tên hoặc email để tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={() => refetch()} // enter -> refetch
            enterButton
            allowClear
          />
        </div>
        <div
          ref={listRef}
          className="max-h-52 overflow-y-auto rounded-md p-3 space-y-2 border border-gray-300 bg-gray-50"
        >
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spin />
            </div>
          ) : employees.length > 0 ? (
            employees.map((emp) => (
              <label
                key={emp.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedIds.includes(emp.id)}
                  onChange={() => handleCheckboxChange(emp.id)}
                />
                <div>
                  <div className="font-medium">{emp.name}</div>
                  <div className="text-gray-500 text-sm">{emp.email}</div>
                </div>
              </label>
            ))
          ) : (
            <div className="text-center text-gray-400 text-sm">
              Không tìm thấy nhân viên
            </div>
          )}

          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <Spin />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Hủy bỏ</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
          >
            Thêm làm Sales
          </Button>
        </div>
      </div>
    </Modal>
  );
}
