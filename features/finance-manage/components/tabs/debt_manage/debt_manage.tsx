import React, { useState } from "react";
import { Table, Tag, Button, Modal, List, Avatar } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faDollarSign,
  faQrcode,
  faChevronLeft,
  faBalanceScale,
} from "@fortawesome/free-solid-svg-icons";
import { DebtDetailModal } from "./debt_history_table";
import { ConfirmReturnModal } from "./conrfirm_return_modal";

const banks = [
  {
    code: "VCB",
    name: "Vietcombank",
    accountName: "Công ty TNHH ABC",
    accountNumber: "0123456789",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Logo_Vietcombank.png",
    qr: "https://api.qrserver.com/v1/create-qr-code/?data=VCB0123456789&type=VCB",
  },
  {
    code: "TCB",
    name: "Techcombank",
    accountName: "Công ty TNHH ABC",
    accountNumber: "9876543210",
    logo: "https://techcombank.com.vn/themes/custom/techcombank/favicon.ico",
    qr: "https://api.qrserver.com/v1/create-qr-code/?data=TCB9876543210&type=TCB",
  },
  {
    code: "VTB",
    name: "Vietinbank",
    accountName: "Công ty TNHH ABC",
    accountNumber: "5566778899",
    logo: "https://seeklogo.com/images/V/vietinbank-logo-64A22AE435-seeklogo.com.png",
    qr: "https://api.qrserver.com/v1/create-qr-code/?data=VTB5566778899&type=VTB",
  },
];

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
const SettlementBankModal = ({
  visible,
  onClose,
  selectedDebt,
}: {
  visible: boolean;
  onClose: () => void;
  selectedDebt: any;
}) => {
  const [selectedBank, setSelectedBank] = useState<any>(null);

  const handleBankClick = (bank: any) => {
    setSelectedBank(bank);
  };

  const handleBackToBanks = () => {
    setSelectedBank(null);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        !selectedBank ? (
          <div className="font-semibold text-base">Chọn ngân hàng để tất toán</div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              icon={<FontAwesomeIcon icon={faChevronLeft} />}
              size="small"
              onClick={handleBackToBanks}
            />
            <span>Thanh toán qua {selectedBank.name}</span>
          </div>
        )
      }
      width={600}
      destroyOnClose
      centered
      bodyStyle={{
        padding: "5px",
        maxHeight: "70vh",
        overflowY: "auto"
      }}
    >
      {!selectedBank ? (
        <div className="max-h-[60vh] overflow-y-auto">
          <List
            itemLayout="horizontal"
            dataSource={banks}
            renderItem={bank => (
              <List.Item
                className="hover:bg-gray-50 rounded-lg cursor-pointer transition !p-3" 
                onClick={() => handleBankClick(bank)}
              >
                <List.Item.Meta
                  avatar={<Avatar src={bank.logo} size="large" />}
                  title={<span className="font-medium">{bank.name}</span>}
                  description={
                    <span>
                      <span className="text-xs text-gray-500">Số tài khoản: </span>
                      <span className="font-medium">{bank.accountNumber}</span>
                    </span>
                  }
                />
                <FontAwesomeIcon icon={faQrcode} className="text-2xl text-green-500" />
              </List.Item>
            )}
          />
        </div>
      ) : (
        <div className="flex flex-row gap-6 pt-2 min-h-[270px]">
          <div className="flex flex-col justify-center flex-1 text-sm gap-2">
            <span>
              <b>Ngân hàng:</b> {selectedBank.name}
            </span>
            <span>
              <b>Chủ TK:</b> {selectedBank.accountName}
            </span>
            <span>
              <b>Số tài khoản:</b> {selectedBank.accountNumber}
            </span>
            <span>
              <b>Số tiền tất toán:</b>{" "}
              <span className="text-red-600 font-semibold">
                {selectedDebt?.debt?.toLocaleString()} ₫
              </span>
            </span>
            <span>
              <b>Nội dung:</b> TT-{selectedDebt?.key}
            </span>
            <div className="flex gap-3 mt-5 md:mt-7">
              <Button type="primary" onClick={() => {/* TODO: xác nhận logic */}}>
                Xác nhận đã chuyển
              </Button>
              <Button onClick={onClose}>
                Huỷ
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <img
              src={selectedBank.qr}
              alt="QR"
              className="w-56 h-56 object-contain bg-white border p-3 rounded-2xl shadow-lg"
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

const PartnerDebtTable = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any>(null);

  const [confirmReturnVisible, setConfirmReturnVisible] = useState(false);
  const [selectedReturnRecord, setSelectedReturnRecord] = useState<any>(null);

  const handleReturnConfirm = () => {
    setConfirmReturnVisible(false);
    setTimeout(() => setSelectedReturnRecord(null), 300);
  };
  const columns = [
    {
      key: "card",
      render: (record: any) => {
        const isNo = record.status === "minhno";
        return (
          <div
            className={`flex items-center min-h-[100px] text-[13px] rounded-[8px] px-[14px] py-[10px] 
              ${isNo ? "bg-[#fff5f5] border border-[#ffccc7]" : "bg-[#f6ffed] border border-[#b7eb8f]"}
            `}
          >
            {/* Bên trái (Thông tin chính) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-[2px] gap-2">
                <span className="font-semibold text-[14px] truncate max-w-[200px]">{record.name}</span>
                <Tag
                  color={isNo ? "red" : "green"}
                  className="!text-[11px] !py-[1px] !px-[7px] !h-[22px] !leading-[20px]"
                >
                  {isNo ? "Mình nợ" : "Đối tác giữ thừa"}
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
                ) : (
                  <span>
                    Thừa:{" "}
                    <b className="text-green-600">{record.surplus.toLocaleString()} ₫</b>
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
              {isNo ? (
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
          {dataDashboard.map((item, index) => (
            <div
              key={index}
              className={`${item.bg} rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center min-h-[70px]`}
              style={{ minHeight: 56 }}
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
          ))}
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        showHeader={false}
        pagination={{ pageSize: 6 }}
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
    </div>
  );
};

export default PartnerDebtTable;
