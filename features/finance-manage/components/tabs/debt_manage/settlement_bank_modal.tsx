import { faChevronLeft, faLeftLong, faQrcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, List, Modal, Spin, message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import {
  getListBankCreateAccount,
  createQrDebt,
} from "@/features/finance-manage/apis";
import { BankAccount } from "@/types/deposit-type";
import { toast } from "react-toastify";

export const SettlementBankModal = ({
  visible,
  onClose,
  selectedDebt,
  partner_id,
  remainDebt,
  onConfirmDebt
}: {
  visible: boolean;
  onClose: () => void;
  selectedDebt: any;
  partner_id: number;
  remainDebt: number;
  onConfirmDebt: () => void;
}) => {
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrInfo, setQrInfo] = useState<any>(null);
  const pageSize = 10;
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible && partner_id) {
      setBanks([]);
      setSelectedBank(null);
      setPage(0);
      setHasMore(true);
      setQrData(null);
      setQrInfo(null);
    }
  }, [visible, partner_id]);

  useEffect(() => {
    if (!visible || !partner_id || !hasMore) return;
    fetchBanks(page);
    // eslint-disable-next-line
  }, [page, visible, partner_id]);

  const fetchBanks = async (pg?: number) => {
    setLoading(true);
    try {
      const res = await getListBankCreateAccount({
        partner_id,
        page: pg ?? 1,
        size: pageSize,
        type: 2,
      });
      const items = Array.isArray(res?.content)
        ? res.content
        : res?.items || res || [];
      setBanks((prev) => (pg && pg > 1 ? [...prev, ...items] : items));
      if (items.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 120) {
      setPage((prev) => prev + 1);
    }
  };
  const handleBankClick = async (bank: BankAccount) => {
    if (!selectedDebt?.id || !bank?.id) {
      return;
    }
    setSelectedBank(bank);
    setQrData(null);
    setQrInfo(null);
    setQrLoading(true);
    try {
      const res = await createQrDebt(selectedDebt.id, {
        bank_account_id: bank.id,
      });
      setQrData(res?.qr_content || null);
      setQrInfo(res?.info || null);
    } catch (err: any) {
      toast.error("Không thể tạo mã QR cho ngân hàng đã chọn");
      setSelectedBank(null);
    } finally {
      setQrLoading(false);
    }
  };

  const handleBackToBanks = () => {
    setSelectedBank(null);
    setQrData(null);
    setQrInfo(null);
  };
  const getBankData = () => {
    return qrInfo || selectedBank || {};
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        !selectedBank ? (
          <div className="font-semibold text-base">
            Chọn ngân hàng để tất toán
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="mr-2 p-1 rounded hover:bg-gray-200"
              onClick={handleBackToBanks}
              style={{ border: "none", background: "transparent", cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span>Thanh toán qua: {getBankData().bank_name}</span>
          </div>
        )
      }
      width={600}
      destroyOnClose
      centered
      bodyStyle={{
        padding: "5px",
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      {!selectedBank ? (
        <div
          className="max-h-[60vh] overflow-y-auto"
          ref={listRef}
          onScroll={handleScroll}
        >
          <List
            itemLayout="horizontal"
            dataSource={banks}
            renderItem={(bank) => (
              <List.Item
                className="hover:bg-gray-50 rounded-lg cursor-pointer transition !p-3"
                onClick={() => handleBankClick(bank)}
                key={bank.id || bank.account_number}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar size="large">
                      {bank.bank_name?.charAt(0) ?? "B"}
                    </Avatar>
                  }
                  title={<span className="font-medium">{bank.bank_name}</span>}
                  description={
                    <span>
                      <span className="text-xs text-gray-500">
                        Số tài khoản:{" "}
                      </span>
                      <span className="font-medium">{bank.account_number}</span>
                    </span>
                  }
                />
                <FontAwesomeIcon
                  icon={faQrcode}
                  className="text-2xl text-green-500"
                />
              </List.Item>
            )}
          />
          {loading && (
            <div className="flex justify-center my-2">
              <Spin />
            </div>
          )}
          {!loading && !banks.length && (
            <div className="text-center p-3 text-gray-400">
              Không có tài khoản ngân hàng
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-row gap-6 pt-2 min-h-[270px]">
          <div className="flex flex-col justify-center flex-1 text-sm gap-2">
            {qrLoading ? (
              <div className="flex justify-center items-center h-full">
                <Spin tip="Đang lấy thông tin mã QR..." />
              </div>
            ) : (
              <>
                <span>
                  <b>Ngân hàng:</b> {getBankData().bank_name}
                </span>
                <span>
                  <b>Chủ TK:</b> {getBankData().account_holder}
                </span>
                <span>
                  <b>Số tài khoản:</b> {getBankData().account_number}
                </span>
                <span>
                  <b>Số tiền tất toán:</b>{" "}
                  <span className="text-red-600 font-semibold">
                    {remainDebt && remainDebt?.toLocaleString()} ₫
                  </span>
                </span>
                <span>
                  <b>Nội dung:</b> Tất toán công nợ
                </span>
                <div className="flex gap-3 mt-5 md:mt-7">
                  <Button
                    type="primary"
                    onClick={() => {
                      onClose();
                      onConfirmDebt();
                    }}
                  >
                    Xác nhận đã chuyển
                  </Button>
                  <Button onClick={onClose}>Huỷ</Button>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            {qrLoading ? (
              <Spin />
            ) : (
              qrData && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrData}
                  alt="QR"
                  className="w-56 h-56 object-contain bg-white border p-3 rounded-2xl shadow-lg"
                />
              )
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
