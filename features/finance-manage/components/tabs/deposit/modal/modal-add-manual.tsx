"use client";
import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Button, Form, message } from "antd";
import type { SelectProps } from "antd";
import axios from "axios";
import {
  BankAccount,
  BankAccountListResponse,
  BankDepositRequest,
  DepositRequest,
} from "@/types/deposit-type";
import { useListCustomer } from "@/features/user-management/hooks/staff-manage";
import { getListBankCreateAccount } from "@/features/finance-manage/apis";

interface User {
  id: string;
  name: string;
  email: string;
}

interface ManualDepositModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: DepositRequest) => void;
}

const ManualDepositModal: React.FC<ManualDepositModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SelectProps["options"]>([]);
  const [search, setSearch] = useState("");
  const [banks, setBanks] = useState<any[]>([]);

  const [page, setPage] = useState(0);

  const { data } = useListCustomer({
    page,
    page_size: 10,
    category_id: undefined,
    search: search || undefined,
  });

  useEffect(() => {
    if (data?.data) {
      setOptions(
        data.data.map((user: any) => ({
          value: user.user_id,
          label: `${user.full_name}`,
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const params: BankDepositRequest = {
          page: 0,
          size: 10,
        };
        const data: BankAccountListResponse = await getListBankCreateAccount(
          params
        );
        console.log("data");

        const opts = data.content.map((acc: BankAccount) => ({
          label: `${acc.bank_name} - ${acc.account_number}`,
          value: acc.id, // value unique
        }));
        setBanks(opts || []);
      } catch (err) {
        console.error("Failed to fetch bank list:", err);
      }
    };

    fetchBanks();
  }, []);

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      onConfirm({
        amoun_vnd: +values.amount,
        bank_transaction_id: values.transactionCode,
        company_bank_account_id: values.companyAccount,
        note: values.reason,
        user_id: +values.userId,
        reason: values.reason,
      });
      setLoading(false);
      form.resetFields();
    } catch (err) {
      message.error("Vui lòng nhập đủ thông tin!");
    }
  };

  return (
    <Modal
      open={open}
      title="Nạp tiền Thủ công cho User"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" className="space-y-1">
        {/* Tìm kiếm khách hàng */}
        <Form.Item
          className="!mb-1.5"
          label="Tìm kiếm Khách hàng"
          name="userId"
          rules={[{ required: true, message: "Chọn khách hàng!" }]}
        >
          <Select
            showSearch
            placeholder="Nhập UserID, Tên, hoặc Email..."
            filterOption={false}
            onSearch={(e) => setSearch(e)}
            options={options}
          />
        </Form.Item>

        <Form.Item
          className="!mb-1.5"
          label="Số tiền nạp (VND)"
          name="amount"
          rules={[{ required: true, message: "Nhập số tiền!" }]}
        >
          <Input type="number" placeholder="VD: 5000000" />
        </Form.Item>

        <Form.Item
          className="!mb-1.5"
          label="Tài khoản công ty đã nhận"
          name="companyAccount"
          rules={[{ required: true, message: "Chọn tài khoản!" }]}
        >
          <Select options={banks} />
        </Form.Item>

        {/* Mã giao dịch */}
        <Form.Item
          className="!mb-1.5"
          label="Mã giao dịch (từ sao kê)"
          name="transactionCode"
        >
          <Input
            placeholder="VD: FT240814..."
            addonAfter={
              <Button
                type="dashed"
                size="small"
                onClick={() => {
                  const code = `FT${Date.now()}`;
                  form.setFieldValue("transactionCode", code);
                }}
              >
                Tạo mã
              </Button>
            }
          />
        </Form.Item>

        {/* Lý do nạp tiền */}
        <Form.Item
          className="!mb-1.5"
          label="Lý do nạp tiền"
          name="reason"
          rules={[{ required: true, message: "Nhập lý do!" }]}
        >
          <Input.TextArea
            placeholder="VD: Khách chuyển khoản sai cú pháp, đã đối soát và nạp tay."
            rows={3}
          />
        </Form.Item>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Hủy bỏ</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            Xác nhận Nạp tiền
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ManualDepositModal;
