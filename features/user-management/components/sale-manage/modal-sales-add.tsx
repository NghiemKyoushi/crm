"use client";

import React, { useState } from "react";
import { Modal, Input, Checkbox, Button } from "antd";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface AddSalesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedEmployees: Employee[]) => void;
  employees: Employee[];
}

export default function AddSalesModal({
  open,
  onClose,
  onSubmit,
  employees,
}: AddSalesModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      title={<span className="font-semibold text-lg">Thêm Nhân viên Sales mới</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Tìm kiếm và chọn Nhân viên
          </label>
          <Input
            placeholder="Nhập tên hoặc email để tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-52 overflow-y-auto rounded-md p-3 space-y-2 border border-gray-300 bg-gray-50">
          {filteredEmployees.map((emp) => (
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
          ))}

          {filteredEmployees.length === 0 && (
            <div className="text-center text-gray-400 text-sm">
              Không tìm thấy nhân viên
            </div>
          )}
        </div>

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
