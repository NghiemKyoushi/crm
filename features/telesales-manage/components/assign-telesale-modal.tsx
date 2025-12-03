"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Select, Input, Button, Spin } from "antd";
import type { SelectProps } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { getTelesaleAccounts } from "../apis/telesale-mng";

const { TextArea } = Input;

type TelesaleAccount = {
  phonenumber: string;
  createdat: string;
  isactive: boolean;
  id: number;
  fullname: string;
  email: string;
};

type AssignCustomerModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    note: string;
    prospect_ids: number[];
    sale_id: number;
  }) => void;
};

const PAGE_SIZE = 10;

const AssignTelesaleModal: React.FC<AssignCustomerModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [telesale, setTelesale] = useState<number | undefined>(undefined);
  const [note, setNote] = useState<string>("");
  const [noteError, setNoteError] = useState<string>("");

  const [data, setData] = useState<TelesaleAccount[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false); // load list (initial/search)
  const [loadingMore, setLoadingMore] = useState<boolean>(false); // load next page
  const [search, setSearch] = useState<string>("");

  // Tránh double call khi cuộn nhanh
  const fetchingRef = useRef(false);
  // Debounce cho tìm kiếm
  const searchTimerRef = useRef<number | null>(null);

  const telesaleOptions: SelectProps["options"] = useMemo(
    () =>
      data.map((account) => ({
        label: `${account.fullname} (${account.phonenumber}) - ${account.email}`,
        value: account.id,
      })),
    [data]
  );

  // Reset form khi modal đóng
  useEffect(() => {
    if (!open) {
      setTelesale(undefined);
      setNote("");
      setNoteError("");

      // Reset list state để lần mở sau là mới
      setData([]);
      setPage(1);
      setHasMore(true);
      setSearch("");
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;

      // Clear debounce timer
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    }
  }, [open]);

  // Load page đầu khi mở modal
  useEffect(() => {
    if (!open) return;

    const fetchFirstPage = async () => {
      setLoading(true);
      fetchingRef.current = true;
      try {
        // Giả sử API: getTelesaleAccounts(pageIndex, pageSize, search?)
        const res = await getTelesaleAccounts(0, PAGE_SIZE);
        const list: TelesaleAccount[] = res?.data ?? [];
        setData(list);
        // Chú ý: nếu API trả thêm total thì nên dùng total để tính hasMore
        setHasMore(list.length >= PAGE_SIZE);
        setPage(1); // đang ở page index 0 => page 1 (UI)
      } catch {
        setData([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchFirstPage();
  }, [open, search]);

  // Handler cuộn để load thêm
  const handlePopupScroll: React.UIEventHandler<HTMLDivElement> = async (e) => {
    if (loading || loadingMore || !hasMore || fetchingRef.current) return;

    const target = e.target as HTMLDivElement;
    const threshold = 48; // px còn lại gần cuối dropdown
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;

    if (!isNearBottom) return;

    setLoadingMore(true);
    fetchingRef.current = true;
    try {
      // page hiện tại đang là 1 cho index 0, 2 cho index 1 ...
      const nextIndex = page; // vì index API = page - 1, nên index tiếp theo = page (0-based)
      const res = await getTelesaleAccounts(nextIndex, PAGE_SIZE);
      const list: TelesaleAccount[] = res?.data ?? [];
      setData((prev) => [...prev, ...list]);
      setHasMore(list.length >= PAGE_SIZE);
      setPage((p) => p + 1);
    } catch {
      // Nếu lỗi, giữ nguyên hasMore (có thể retry bằng cuộn lại)
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  };

  // Tìm kiếm server-side với debounce
  const handleSearch = (value: string) => {
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    searchTimerRef.current = window.setTimeout(() => {
      setPage(1);
      setHasMore(true);
      setSearch(value);
    }, 300); // debounce 300ms
  };

  const handleOk = () => {
    if (typeof telesale !== "number") return;
    if (!note.trim()) {
      setNoteError("Vui lòng nhập ghi chú!");
      return;
    }
    setNoteError("");

    const submitData = {
      note: note,
      prospect_ids: [], // TODO: truyền prospect id thực tế
      sale_id: telesale,
    };
    onSubmit(submitData);

    // Clear sau submit
    setTelesale(undefined);
    setNote("");
  };

  const handleCancel = () => {
    onCancel();
    setTelesale(undefined);
    setNote("");
    setNoteError("");
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width={480}
      closable={true}
      closeIcon={
        <span className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      }
      title={
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <UserAddOutlined className="text-white text-lg" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-base m-0">
              Gán khách hàng
            </h3>
            <p className="text-xs text-gray-500 m-0 mt-0.5">
              Chọn nhân viên telesale để gán
            </p>
          </div>
        </div>
      }
    >
      <div>
        {/* Chọn telesale */}
        <div className="mb-4">
          <label className="block mb-1.5 font-medium text-gray-700 text-sm">
            Telesale <span className="text-red-500">*</span>
          </label>

          <Select
            value={telesale}
            onChange={(val) => setTelesale(val as number)}
            placeholder="Chọn nhân viên telesale"
            className="!w-full"
            size="large"
            showSearch
            filterOption={false} // dùng tìm kiếm server-side
            onSearch={handleSearch}
            options={telesaleOptions}
            onPopupScroll={handlePopupScroll} // infinite scroll
            notFoundContent={
              loading ? <Spin size="small" /> : "Không có dữ liệu"
            }
            dropdownRender={(menu) => (
              <div>
                {menu}
                {/* Thanh trạng thái ở đáy dropdown */}
                <div className="px-3 py-2 flex items-center justify-center">
                  {loadingMore ? (
                    <Spin size="small" />
                  ) : hasMore ? (
                    <span className="text-xs text-gray-500">
                      Cuộn xuống để tải thêm…
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Đã hết dữ liệu
                    </span>
                  )}
                </div>
              </div>
            )}
          />
        </div>

        {/* Ghi chú */}
        <div className="mb-5">
          <label className="block mb-1.5 font-medium text-gray-700 text-sm">
            Ghi chú <span className="text-red-500">*</span>
          </label>
          <TextArea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (e.target.value.trim()) setNoteError("");
            }}
            placeholder="Nhập ghi chú..."
            rows={3}
            status={noteError ? "error" : undefined}
            className="!resize-none"
          />
          {noteError && (
            <p className="text-red-500 text-xs mt-1.5 m-0">{noteError}</p>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button onClick={handleCancel} className="!h-9 !px-4 !text-sm">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            disabled={typeof telesale !== "number" || loading || loadingMore}
            className="!h-9 !px-4 !text-sm !bg-blue-500 hover:!bg-blue-600 !border-blue-500 hover:!border-blue-600 !text-white"
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignTelesaleModal;
