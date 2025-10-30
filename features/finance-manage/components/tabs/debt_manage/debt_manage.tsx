import React, { useState } from "react";
import { Table, Tag, Button, Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faDollarSign,
  faBalanceScale,
} from "@fortawesome/free-solid-svg-icons";
import { DebtDetailModal } from "./debt_history_table";
import { ConfirmReturnModal } from "./conrfirm_return_modal";
import { RejectActionModal } from "./cancel_modal";
import { SettlementBankModal } from "./settlement_bank_modal";

const ConfirmActionModal = ({ visible, onOk, onCancel, record }: any) => (
  <Modal
    open={visible}
    title="Xác nhận giao dịch"
    onOk={onOk}
    onCancel={onCancel}
    okText="Xác nhận"
    cancelText="Huỷ"
    destroyOnClose
    centered
  >
    <div>
      Bạn chắc chắn muốn <b>xác nhận</b> giao dịch cho đối tác <b>{record?.name}</b>?
    </div>
  </Modal>
);

// Giả lập lịch sử giao dịch của công nợ - thực tế lấy từ backend

const data = [
  {
    key: "1",
    name: "Tokyo ABC Supply - VCB",
    status: "minhno",
    note: "Khách hàng chưa nạp đủ tiền nhưng đã mua hàng. Đối tác cần tiền để thanh toán cho nhà cung cấp.",
    total: 65000000,
    debt: 45000000,
    paid: 20000000,
    date: "15/09/2025",
  },
  {
    key: "2",
    name: "Osaka Steel Corp - TCB",
    status: "minhno",
    note: "Đối tác đã ứng tiền mua hàng, chờ khách hàng nạp tiền vào tài khoản.",
    total: 28500000,
    debt: 28500000,
    paid: 0,
    date: "18/09/2025",
  },
  {
    key: "3",
    name: "Kyoto Electronics - VTB",
    status: "giu-thua",
    note: "Khách hàng nạp tiền nhiều hơn cần thiết, có thể yêu cầu hoàn trả số dư thừa.",
    total: 35000000,
    surplus: 15000000,
    paid: 50000000,
    date: "17/09/2025",
  },
  {
    key: "4",
    name: "Osaka Steel Corp - TCB",
    status: "minhno",
    note: "Đối tác đã ứng tiền mua hàng, chờ khách hàng nạp tiền vào tài khoản.",
    total: 28500000,
    debt: 28500000,
    paid: 0,
    date: "18/09/2025",
  },
  {
    key: "5",
    name: "Kyoto Electronics - VTB",
    status: "giu-thua",
    note: "Khách hàng nạp tiền nhiều hơn cần thiết, có thể yêu cầu hoàn trả số dư thừa.",
    total: 35000000,
    surplus: 15000000,
    paid: 50000000,
    date: "17/09/2025",
  },
  {
    key: "6",
    name: "Osaka Steel Corp - TCB",
    status: "minhno",
    note: "Đối tác đã ứng tiền mua hàng, chờ khách hàng nạp tiền vào tài khoản.",
    total: 28500000,
    debt: 28500000,
    paid: 0,
    date: "18/09/2025",
  },
  {
    key: "7",
    name: "Kyoto Electronics - VTB",
    status: "giu-thua",
    note: "Khách hàng nạp tiền nhiều hơn cần thiết, có thể yêu cầu hoàn trả số dư thừa.",
    total: 35000000,
    surplus: 15000000,
    paid: 50000000,
    date: "17/09/2025",
  },
  // Demo trạng thái mới: PENDING
  {
    key: "8",
    name: "Fukuoka Foods - VCB",
    status: "PENDING",
    note: "Yêu cầu rút tiền của đối tác đang chờ xác nhận.",
    total: 20000000,
    debt: 0,
    surplus: 20000000,
    paid: 20000000,
    date: "22/09/2025",
  },
];

const dataDashboard = [
  {
    title: "Mình đang nợ",
    amount: 85500000,
    partners: 3,
    color: "text-red-600",
    bg: "bg-red-50",
    iconColor: "text-red-500",
    icon: <FontAwesomeIcon icon={faExclamationCircle} />,
  },
  {
    title: "Đối tác giữ thừa",
    amount: 42300000,
    partners: 2,
    color: "text-green-600",
    bg: "bg-green-50",
    iconColor: "text-green-500",
    icon: <FontAwesomeIcon icon={faDollarSign} />,
  },
  {
    title: "Cân bằng",
    amount: 0,
    partners: 1,
    color: "text-gray-600",
    bg: "bg-gray-50",
    iconColor: "text-gray-500",
    icon: <FontAwesomeIcon icon={faBalanceScale} />,
  },
];

// Modal: ngân hàng tất toán giữ nguyên

const PartnerDebtTable = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any>(null);

  const [confirmReturnVisible, setConfirmReturnVisible] = useState(false);
  const [selectedReturnRecord, setSelectedReturnRecord] = useState<any>(null);

  // State cho PENDING: xác nhận/từ chối
  const [pendingConfirmVisible, setPendingConfirmVisible] = useState(false);
  const [pendingRejectVisible, setPendingRejectVisible] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<any>(null);

  const handleReturnConfirm = () => {
    setConfirmReturnVisible(false);
    setTimeout(() => setSelectedReturnRecord(null), 300);
  };

  // Xác nhận hoặc từ chối (fake handle)
  const handlePendingConfirm = () => {
    setPendingConfirmVisible(false);
    setTimeout(() => setPendingRecord(null), 300);
    // TODO: Logic gọi API xác nhận nếu cần
  };

  const handlePendingReject = () => {
    setPendingRejectVisible(false);
    setTimeout(() => setPendingRecord(null), 300);
    // TODO: Logic gọi API từ chối nếu cần
  };

  const columns = [
    {
      key: "card",
      render: (record: any) => {
        const isNo = record.status === "minhno";
        const isPending = record.status === "PENDING";
        return (
          <div
            className={`flex items-center min-h-[100px] text-[13px] rounded-[8px] px-[14px] py-[10px] 
              ${isNo ? "bg-[#fff5f5] border border-[#ffccc7]" : isPending ? "bg-yellow-50 border border-yellow-300" : "bg-[#f6ffed] border border-[#b7eb8f]"}
            `}
          >
            {/* Bên trái (Thông tin chính) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-[2px] gap-2">
                <span className="font-semibold text-[14px] truncate max-w-[200px]">{record.name}</span>
                <Tag
                  color={
                    isPending
                      ? "orange"
                      : isNo
                      ? "red"
                      : "green"
                  }
                  className="!text-[11px] !py-[1px] !px-[7px] !h-[22px] !leading-[20px]"
                >
                  {isPending
                    ? "Chờ xác nhận"
                    : isNo
                    ? "Mình nợ"
                    : "Đối tác giữ thừa"}
                </Tag>
              </div>
              <div className="text-[#595959] text-[12px] mb-[6px] leading-[1.3] whitespace-nowrap truncate max-w-[350px]">
                {record.note}
              </div>
              <div className="flex items-center gap-[18px] text-[12px] leading-[1.4]">
                <span>
                  Tổng: <b>{record.total.toLocaleString()} ₫</b>
                </span>
                {isNo ? (
                  <span>
                    Nợ:{" "}
                    <b className="text-red-600">{record.debt.toLocaleString()} ₫</b>
                  </span>
                ) : isPending ? (
                  <span>
                    Thừa:{" "}
                    <b className="text-yellow-600">{record.surplus?.toLocaleString()} ₫</b>
                  </span>
                ) : (
                  <span>
                    Thừa:{" "}
                    <b className="text-green-600">{record.surplus?.toLocaleString()} ₫</b>
                  </span>
                )}
                <span>
                  Đã nạp: <b>{record.paid.toLocaleString()} ₫</b>
                </span>
                <span className="text-[#888]">
                  <span className="text-[11px] text-[#aaa]">Ngày: </span>
                  <b>{record.date}</b>
                </span>
              </div>
            </div>
            {/* Bên phải (Nút hành động) */}
            <div className="flex flex-col gap-1 items-end ml-4">
              {isPending ? (
                <>
                  <Button
                    type="primary"
                    size="small"
                    className="!h-[26px] !w-[120px] !text-[12px] !px-[10px]"
                    onClick={() => {
                      setPendingRecord(record);
                      setPendingConfirmVisible(true);
                    }}
                  >
                    Xác nhận
                  </Button>
                  <Button
                    danger
                    size="small"
                    className="!h-[26px] !w-[120px] !text-[12px] !px-[10px]"
                    onClick={() => {
                      setPendingRecord(record);
                      setPendingRejectVisible(true);
                    }}
                  >
                    Từ chối
                  </Button>
                </>
              ) : isNo ? (
                <Button
                  type="primary"
                  danger
                  size="small"
                  className="!h-[26px] !w-[120px] !text-[12px] !px-[10px]"
                  onClick={() => {
                    setSelectedDebt(record);
                    setModalVisible(true);
                  }}
                >
                  Tạo tất toán
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  className="!h-[26px] !w-[120px] !text-[12px] !px-[10px] !bg-[#389e0d] hover:!bg-[#46bd18] !border-none"
                  onClick={() => {
                    setSelectedReturnRecord(record);
                    setConfirmReturnVisible(true);
                  }}
                >
                  Yêu cầu hoàn trả
                </Button>
              )}
              <Button
                size="small"
                className="!h-[26px] !w-[120px] !text-[12px] !px-[10px]"
                onClick={() => {
                  setDetailModalVisible(true);
                  setDetailRecord(record);
                }}
              >
                Chi tiết
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Tình trạng Công nợ với Đối tác
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {dataDashboard.map((item, index) => {
            let borderColor = "";
            if (item.color?.includes("red")) {
              borderColor = "#f87171"; 
            } else if (item.color?.includes("green")) {
              borderColor = "#22c55e"; 
            } else if (item.color?.includes("gray")) {
              borderColor = "#6b7280";
            }

            return (
              <div
                key={index}
                className={`${item.bg} rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center min-h-[70px]`}
                style={{
                  minHeight: 56,
                  borderLeft: `6px solid ${borderColor}`,
                }}
              >
                <div>
                  <p className={`text-sm font-semibold ${item.color} mb-0.5`}>
                    {item.title}
                  </p>
                  <p className={`text-2xl font-bold ${item.color}`}>
                    {item.amount.toLocaleString()} ₫
                  </p>
                  <p className="text-xs text-gray-500">{item.partners} đối tác</p>
                </div>
                <div className={`text-2xl ${item.iconColor}`}>{item.icon}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        showHeader={false}
        pagination={{ pageSize: 10 }}
        rowKey="key"
        size="small"
        style={{ marginTop: 0 }}
      />
      <SettlementBankModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setTimeout(() => setSelectedDebt(null), 300);
        }}
        selectedDebt={selectedDebt}
      />
      <DebtDetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setTimeout(() => setDetailRecord(null), 300);
        }}
        record={detailRecord}
      />
      <ConfirmReturnModal
        visible={confirmReturnVisible}
        onCancel={() => {
          setConfirmReturnVisible(false);
          setTimeout(() => setSelectedReturnRecord(null), 300);
        }}
        onConfirm={handleReturnConfirm}
        record={selectedReturnRecord}
      />
      {/* MODAL cho trạng thái PENDING */}
      <ConfirmActionModal
        visible={pendingConfirmVisible}
        record={pendingRecord}
        onOk={handlePendingConfirm}
        onCancel={() => {
          setPendingConfirmVisible(false);
          setTimeout(() => setPendingRecord(null), 300);
        }}
      />
      <RejectActionModal
        visible={pendingRejectVisible}
        record={pendingRecord}
        onOk={handlePendingReject}
        onCancel={() => {
          setPendingRejectVisible(false);
          setTimeout(() => setPendingRecord(null), 300);
        }}
      />
    </div>
  );
};

export default PartnerDebtTable;
