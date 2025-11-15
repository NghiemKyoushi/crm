"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Input,
  Select,
  Button,
  Form,
  message,
  InputNumber,
  Spin,
} from "antd";
import type { SelectProps } from "antd";
import {
  BankAccount,
  BankDepositRequest,
  DepositRequest,
} from "@/types/deposit-type";
import {
  getListBankCreateAccount,
  getListBankPermission,
  getPartnerList,
} from "@/features/finance-manage/apis";

interface AdminUserCheck {
  email: string;
  is_checked: boolean;
  admin_user_id: number;
}

interface ManualPartnerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: DepositRequest) => void;
}

const PAGE_SIZE = 10;

const ManualPartnerModal: React.FC<ManualPartnerModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [search, setSearch] = useState<string>("");
  const [userOptions, setUserOptions] = useState<SelectProps["options"]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [banks, setBanks] = useState<any[]>([]);
  const [bankPage, setBankPage] = useState(0);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankHasMore, setBankHasMore] = useState(true);
  const banksFetchedPages = useRef<Set<number>>(new Set());
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const fetchUsers = async (searchValue = "") => {
    setLoadingUser(true);
    try {
      const resp = await getPartnerList({page: 0, size: 20});
      setUserOptions(
        (resp.data || []).map((user: any) => ({
          value: user.id,
          label: user.email,
        }))
      );
    } catch (err) {
      setUserOptions([]);
    } finally {
      setLoadingUser(false);
    }
  };
  useEffect(() => {
    if (!open) return;
    fetchUsers(search);
  }, [open, search]);
  useEffect(() => {
    if (open) {
      setBanks([]);
      setBankPage(0);
      setBankHasMore(true);
      banksFetchedPages.current = new Set();
      setSelectedUserId(undefined);
      form.resetFields();
    }
  }, [open]);

  const fetchBanks = async (page: number, partnerId: number) => {
    if (bankLoading || banksFetchedPages.current.has(page)) return;
    setBankLoading(true);
    try {
      const params: BankDepositRequest = {
        partner_id: partnerId,
        page: page,
        size: PAGE_SIZE,
        type: 2,
      };
      const data: any = await getListBankCreateAccount(params);
      const items = Array.isArray(data?.content)
        ? data.content
        : data?.items || data || [];
      const opts = (items || []).map((acc: BankAccount) => ({
        label:
          `${acc.account_holder}-${acc.account_number}-${acc.bank_code}` +
          (acc.partner_id_name ? `-${acc.partner_id_name}` : ""),
        value: acc.id,
      }));
      if (page === 1) {
        setBanks(opts || []);
        if ((opts || []).length > 0) {
          form.setFieldValue("company_bank_account_id", opts[0].value);
        } else {
          form.setFieldValue("company_bank_account_id", null);
        }
      } else {
        setBanks((prev) => [...prev, ...(opts || [])]);
      }
      if ((opts || []).length < PAGE_SIZE) {
        setBankHasMore(false);
      } else {
        setBankHasMore(true);
      }
      banksFetchedPages.current.add(page);
    } finally {
      setBankLoading(false);
    }
  };
  const handleBankScroll: React.ComponentProps<
    typeof Select
  >["onPopupScroll"] = (e) => {
    if (!selectedUserId) return;
    const target = e.target as HTMLElement;
    if (
      !bankLoading &&
      bankHasMore &&
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 24
    ) {
      const nextPage = bankPage + 1;
      setBankPage(nextPage);
      fetchBanks(nextPage, selectedUserId);
    }
  };
  useEffect(() => {
    if (!selectedUserId || bankPage === 1) return;
    fetchBanks(bankPage, selectedUserId);
  }, [bankPage, selectedUserId]);

  const handleUserChange = (val: number) => {
    setSelectedUserId(val);
    setBanks([]);
    setBankPage(1);
    setBankHasMore(true);
    banksFetchedPages.current = new Set();
    form.setFieldValue("company_bank_account_id", undefined);
    if (val) {
      fetchBanks(0, val);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      onConfirm({
        amount_vnd: +values.amount,
        company_bank_account_id: values.company_bank_account_id,
        // note: values.reason,
        user_id: +values.userId,
        reason: values.reason,
      });
      setLoading(false);
      form.resetFields();
    } catch (err) {
      setLoading(false);
      message.error("Vui lòng nhập đủ thông tin!");
    }
  };
  return (
    <Modal
      open={open}
      title="Nạp tiền Thủ công cho Partner"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" className="space-y-1">
        <Form.Item
          className="!mb-1.5"
          label="Tìm kiếm Partner"
          name="userId"
          rules={[{ required: true, message: "Chọn partner!" }]}
        >
          <Select
            placeholder="Chọn đối tác"
            filterOption={false}
            loading={loadingUser}
            options={userOptions}
            notFoundContent={loadingUser ? <Spin size="small" /> : null}
            allowClear
            onChange={handleUserChange}
          />
        </Form.Item>
        <Form.Item
          className="!mb-1.5"
          label="Tài khoản ngân hàng"
          name="company_bank_account_id"
          rules={[{ required: true, message: "Chọn tài khoản!" }]}
          shouldUpdate={false}
        >
          <Select
            options={banks}
            loading={bankLoading}
            disabled={!selectedUserId}
            onPopupScroll={handleBankScroll}
            notFoundContent={
              !selectedUserId ? "Chọn đối tác trước" : bankLoading ? <Spin size="small" /> : null
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                {bankHasMore && selectedUserId && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 8,
                    }}
                  >
                    {bankLoading ? <Spin size="small" /> : ""}
                  </div>
                )}
              </>
            )}
          />
        </Form.Item>
        <Form.Item
          className="!mb-1.5"
          label="Số tiền nạp (VND)"
          name="amount"
          rules={[{ required: true, message: "Nhập số tiền!" }]}
        >
          <InputNumber
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            placeholder="VD: 5000000"
            className="!w-full "
          />
        </Form.Item>

        {/* ĐÃ BỎ Form.Item "Mã giao dịch (từ sao kê)" */}

        <Form.Item
          className="!mb-1.5"
          label="Lý do nạp tiền"
          name="reason"
          rules={[
            { required: true, message: "Nhập lý do nạp tiền!" },
            { min: 10, message: "Lý do phải có ít nhất 10 ký tự!" },
          ]}
        >
          <Input.TextArea
            placeholder="VD: Partner chuyển khoản thiếu, đã kiểm tra và nạp tay."
            rows={3}
          />
        </Form.Item>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Hủy bỏ</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            Xác nhận nạp tiền
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ManualPartnerModal;
