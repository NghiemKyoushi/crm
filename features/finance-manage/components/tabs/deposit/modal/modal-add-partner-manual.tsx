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
  // User state
  const [search, setSearch] = useState<string>("");
  const [userOptions, setUserOptions] = useState<SelectProps["options"]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [userHasMore, setUserHasMore] = useState(true);
  const userPagesLoaded = useRef<Set<number>>(new Set());
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  // Bank state
  const [banks, setBanks] = useState<any[]>([]);
  const [bankPage, setBankPage] = useState(0);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankHasMore, setBankHasMore] = useState(true);
  const banksFetchedPages = useRef<Set<number>>(new Set());
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Sử dụng ref để kiểm soát việc đã fetch users khi mở modal
  const hasFetchedInitialUsers = useRef<boolean>(false);
  // Khi đóng modal thì reset biến kiểm soát này
  useEffect(() => {
    if (!open) {
      hasFetchedInitialUsers.current = false;
    }
  }, [open]);

  // Fetch users, with paging
  const fetchUsers = useCallback(
    async (page: number, searchValue = "") => {
      if (loadingUser || userPagesLoaded.current.has(page)) return;
      setLoadingUser(true);
      try {
        const resp = await getPartnerList({
          page,
          size: PAGE_SIZE,
        });
        const dataArr = Array.isArray(resp.data) ? resp.data : resp.items || [];
        const options = dataArr.map((user: any) => ({
          value: user.id,
          label: `${user.email} - ${user.full_name ? user.full_name : ''}`,
        }));
        setUserOptions((prev) =>
          page === 0 ? options : [...(prev || []), ...options]
        );
        setUserHasMore(options.length === PAGE_SIZE);
        userPagesLoaded.current.add(page);
      } catch (err) {
        setUserOptions([]);
        setUserHasMore(false);
      } finally {
        setLoadingUser(false);
      }
    },
    [loadingUser]
  );

  // Handle user select dropdown scroll for load more
  const handleUserScroll: React.ComponentProps<typeof Select>["onPopupScroll"] = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        !loadingUser &&
        userHasMore &&
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 24
      ) {
        const nextPage = userPage + 1;
        setUserPage(nextPage);
        fetchUsers(nextPage, search);
      }
    },
    [loadingUser, userHasMore, userPage, fetchUsers, search]
  );

  // Handle user search in select
  const handleUserSearch = useCallback(
    (searchVal: string) => {
      setSearch(searchVal);
      setUserOptions([]);
      setUserPage(0);
      setUserHasMore(true);
      userPagesLoaded.current = new Set();
      fetchUsers(0, searchVal);
    },
    [fetchUsers]
  );

  // Chỉ gọi fetchUsers(0, search) 1 lần khi open modal, không gọi liên tục khi search đổi
  useEffect(() => {
    if (!open || hasFetchedInitialUsers.current) return;
    setUserOptions([]);
    setUserPage(0);
    setUserHasMore(true);
    userPagesLoaded.current = new Set();
    fetchUsers(0, search);
    hasFetchedInitialUsers.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetchUsers]); // bỏ "search" khỏi deps để không bị gọi khi search đổi

  // Reset on open
  useEffect(() => {
    if (open) {
      setBanks([]);
      setBankPage(0);
      setBankHasMore(true);
      banksFetchedPages.current = new Set();
      setSelectedUserId(undefined);
      form.resetFields();
    }
  }, [open, form]);

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
      if (page === 0) {
        setBanks(opts || []);
        if ((opts || []).length > 0) {
          form.setFieldValue("company_bank_account_id", opts[0].value);
        } else {
          form.setFieldValue("company_bank_account_id", null);
        }
      } else {
        setBanks((prev) => [...prev, ...(opts || [])]);
      }
      setBankHasMore((opts || []).length === PAGE_SIZE);
      banksFetchedPages.current.add(page);
    } finally {
      setBankLoading(false);
    }
  };

  // Banks load more scroll handler
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
    if (!selectedUserId || bankPage === 0) return;
    fetchBanks(bankPage, selectedUserId);
    // eslint-disable-next-line
  }, [bankPage, selectedUserId]);

  const handleUserChange = (val: number) => {
    setSelectedUserId(val);
    setBanks([]);
    setBankPage(0);
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
            showSearch
            options={userOptions}
            notFoundContent={loadingUser ? <Spin size="small" /> : null}
            allowClear
            onChange={handleUserChange}
            onPopupScroll={handleUserScroll}
            onSearch={handleUserSearch}
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