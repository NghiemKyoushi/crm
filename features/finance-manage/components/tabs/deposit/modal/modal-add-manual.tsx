"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
import axios from "axios";
import {
  BankAccount,
  BankAccountListResponse,
  BankDepositRequest,
  DepositRequest,
} from "@/types/deposit-type";
import { useListCustomer } from "@/features/user-management/hooks/staff-manage";
import {
  getCodeGeneration,
  getListBankCreateAccount,
} from "@/features/finance-manage/apis";

interface User {
  id: string;
  name: string;
  email: string;
}

interface ManualDepositModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: DepositRequest) => void;
  type: "PLUS" | "MINUS";
}

const PAGE_SIZE = 10;

const ManualDepositModal: React.FC<ManualDepositModalProps> = ({
  open,
  onClose,
  onConfirm,
  type,
}) => {
  const [loading, setLoading] = useState(false);

  // Banks state
  const [banks, setBanks] = useState<any[]>([]);
  const [bankPage, setBankPage] = useState(0);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankHasMore, setBankHasMore] = useState(true);
  const banksLoadedRef = useRef<Set<number>>(new Set());

  // Customers (users) state
  const [customerOptions, setCustomerOptions] = useState<SelectProps["options"]>([]);
  const [customerPage, setCustomerPage] = useState(0);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const customersLoadedRef = useRef<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const searchRef = useRef<string>("");

  const [form] = Form.useForm();

  // BANKS API - paginated
  const fetchBanks = async (page: number) => {
    if (bankLoading || banksLoadedRef.current.has(page)) return;
    setBankLoading(true);
    try {
      const params: BankDepositRequest = {
        page: page,
        size: PAGE_SIZE,
      };
      const data: BankAccountListResponse = await getListBankCreateAccount(params);
      const opts = data.content.map((acc: BankAccount) => ({
        label:
          `${acc.account_holder}-${acc.account_number}-${acc.bank_code}` +
          (acc.partner_id_name ? `-${acc.partner_id_name}` : ""),
        value: acc.id,
      }));
      if (page === 0) {
        setBanks(opts || []);
        // Nếu có ít nhất 1 bank, set mặc định bank đầu tiên vào form
        if ((opts || []).length > 0) {
          form.setFieldValue("company_bank_account_id", opts[0].value);
        }
      } else {
        setBanks(prev => [...prev, ...(opts || [])]);
      }
      setBankHasMore((opts || []).length === PAGE_SIZE);
      banksLoadedRef.current.add(page);
    } catch (err) {
      console.error("Failed to fetch bank list:", err);
    } finally {
      setBankLoading(false);
    }
  };

  // CUSTOMERS API - paginated, with search
  // This uses useListCustomer hook for automatic fetching
  const { data: customerData, isFetching: customerBackendLoading } = useListCustomer({
    page: customerPage,
    page_size: PAGE_SIZE,
    category_id: undefined,
    search: searchRef.current || undefined,
  });

  // Load first page for banks when modal opens
  useEffect(() => {
    if (open) {
      setBanks([]);
      setBankPage(0);
      setBankHasMore(true);
      banksLoadedRef.current = new Set();
      fetchBanks(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  // Handling customer search and reload when search changes
  useEffect(() => {
    if (!open) return;
    setCustomerOptions([]);
    setCustomerPage(0);
    setCustomerHasMore(true);
    customersLoadedRef.current = new Set();
    // will trigger customerData useEffect for page 0
  }, [search, open]);

  // Handle update customer option when page or data changes
  useEffect(() => {
    if (!customerData || !open) return;
    const list = (customerData?.data || []).map((user: any) => ({
      value: user.user_id,
      label: `${user.email}`,
    }));
    setCustomerOptions(prev =>
      customerPage === 0 ? list : [...(prev || []), ...list]
    );
    setCustomerHasMore(list.length === PAGE_SIZE);
    customersLoadedRef.current.add(customerPage);
    // eslint-disable-next-line
  }, [customerData, customerPage, open]);

  // Handler for load more customer list on scroll
  const handleCustomerScroll: React.ComponentProps<typeof Select>["onPopupScroll"] = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        !customerBackendLoading &&
        !customerLoading &&
        customerHasMore &&
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 24 // threshold
      ) {
        const nextPage = customerPage + 1;
        setCustomerLoading(true);
        setCustomerPage(nextPage);
        setTimeout(() => setCustomerLoading(false), 100); // prevent double-triggering
      }
    },
    [customerBackendLoading, customerLoading, customerHasMore, customerPage]
  );

  // Handler for searching users
  const handleCustomerSearch = useCallback(
    (searchVal: string) => {
      setSearch(searchVal);
      searchRef.current = searchVal;
      setCustomerOptions([]);
      setCustomerPage(0);
      setCustomerHasMore(true);
    },
    []
  );

  // Handler for scroll on Select dropdown for banks
  const handleBankScroll: React.ComponentProps<typeof Select>["onPopupScroll"] =
    e => {
      const target = e.target as HTMLElement;
      if (
        !bankLoading &&
        bankHasMore &&
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 24 // threshold
      ) {
        const nextPage = bankPage + 1;
        setBankPage(nextPage);
        fetchBanks(nextPage);
      }
    };

  // Also allow manual trigger in case setBankPage runs after popup scroll (ensure fetches new page)
  useEffect(() => {
    if (bankPage === 0) return;
    fetchBanks(bankPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankPage]);

  useEffect(() => {
    const fetchCode = async () => {
      if (open) {
        try {
          const code = await getCodeGeneration();
          form.setFieldValue("transactionCode", code);
        } catch (error) {
          console.error("Lỗi khi tạo mã:", error);
        }
      }
    };

    fetchCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      onConfirm({
        amount_vnd: +values.amount,
        bank_transaction_id: values.transactionCode,
        company_bank_account_id: values.company_bank_account_id,
        note: values.reason,
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
      title={
        type === "PLUS"
          ? "Nạp tiền Thủ công cho User"
          : "Trừ tiền Thủ công cho User"
      }
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" className="space-y-1">
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
            onSearch={handleCustomerSearch}
            options={customerOptions}
            loading={customerBackendLoading || customerLoading}
            onPopupScroll={handleCustomerScroll}
            notFoundContent={
              customerBackendLoading || customerLoading ? (
                <Spin size="small" />
              ) : null
            }
            dropdownRender={menu => (
              <>
                {menu}
                {customerHasMore && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 8,
                    }}
                  >
                    {(customerBackendLoading || customerLoading) ? <Spin size="small" /> : ""}
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
            formatter={value =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            placeholder="VD: 5000000"
            className="!w-full "
          />
        </Form.Item>

        <Form.Item
          className="!mb-1.5"
          label="Tài khoản ngân hàng"
          name="company_bank_account_id"
          rules={[{ required: true, message: "Chọn tài khoản!" }]}
        >
          <Select
            options={banks}
            loading={bankLoading}
            onPopupScroll={handleBankScroll}
            notFoundContent={bankLoading ? <Spin size="small" /> : null}
            onChange={async () => {
              if (type === "PLUS") {
                try {
                  const code = await getCodeGeneration();
                  form.setFieldValue("transactionCode", code);
                } catch (error) {
                  console.error("Lỗi khi tạo mã:", error);
                }
              }
            }}
            dropdownRender={menu => (
              <>
                {menu}
                {bankHasMore && (
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

        {/* Mã giao dịch */}
        <Form.Item
          className="!mb-1.5"
          label="Mã giao dịch (từ sao kê)"
          name="transactionCode"
        >
          <Input disabled placeholder="" />
        </Form.Item>
        <Form.Item
          className="!mb-1.5"
          label={type === "PLUS" ? "Lý do nạp tiền" : "Lý do trừ tiền"}
          name="reason"
          rules={[
            { required: true, message: "Nhập lý do hủy!" },
            { min: 10, message: "Lý do phải có ít nhất 10 ký tự!" },
          ]}
        >
          <Input.TextArea
            placeholder="VD: Khách chuyển khoản sai cú pháp, đã đối soát và nạp tay."
            rows={3}
          />
        </Form.Item>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Hủy bỏ</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {type === "PLUS" ? "Xác nhận nạp tiền" : "Xác nhận trừ tiền"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ManualDepositModal;
