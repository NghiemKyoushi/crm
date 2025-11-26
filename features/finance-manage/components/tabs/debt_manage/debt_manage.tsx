import React, { useMemo, useState } from "react";
import { Tag, Button, Modal, Tooltip } from "antd";
import { ReloadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { DebtDetailModal } from "./debt_history_table";
import { ConfirmReturnModal } from "./conrfirm_return_modal";
import { RejectActionModal } from "./cancel_modal";
import { SettlementBankModal } from "./settlement_bank_modal";
import { useDebtList } from "@/features/finance-manage/hooks";
import { BankDepositRequest, DebtItem } from "@/types/deposit-type";
import TableComponent from "@/components/TableComponent";
import { ColumnsType } from "antd/es/table";
import {
  approveDebt,
  cancelDebt,
  createDebt,
} from "@/features/finance-manage/apis";
import { toast } from "react-toastify";
import { usePermission } from "@/components/layout/PermissionContext";
import { DebtHistoryScreen } from "./debt_history_screen";

const ConfirmActionModal = ({ visible, onOk, onCancel, record }: any) => {
  const [note, setNote] = useState<string>("");

  return (
    <Modal
      open={visible}
      title="Xác nhận giao dịch"
      onOk={() => onOk?.(note)}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Huỷ"
      destroyOnClose
      centered
    >
      <div>
        Bạn chắc chắn muốn <b>xác nhận</b> giao dịch cho đối tác{" "}
        <b>{record?.name || record?.full_name}</b>?
      </div>
      <div style={{ marginTop: 16 }}>
        <label htmlFor="confirm-note" className="block mb-1 font-medium">
          Ghi chú (tuỳ chọn):
        </label>
        <textarea
          id="confirm-note"
          className="w-full border border-gray-300 rounded px-2 py-1"
          value={note}
          rows={3}
          onChange={e => setNote(e.target.value)}
          placeholder="Nhập ghi chú cho xác nhận (nếu có)..."
        />
      </div>
    </Modal>
  );
};

const PartnerDebtTable = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtItem>();

  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [confirmReturnVisible, setConfirmReturnVisible] = useState(false);

  const [pendingConfirmVisible, setPendingConfirmVisible] = useState(false);
  const [pendingRejectVisible, setPendingRejectVisible] = useState(false);
  const { hasPermission } = usePermission();

  const [params, setParams] = useState<BankDepositRequest>({
    page: 0,
    size: 10,
  });
  const { data, isPending, refetch } = useDebtList(params);

  const handleReturnConfirm = async () => {
    if (!selectedDebt?.user_id) return;
    try {
      await createDebt(selectedDebt.id, { bank_account_id: null });
      toast.success("Tạo hoàn trả thành công!");
      setConfirmReturnVisible(false);
      setTimeout(() => setSelectedDebt(undefined), 300);
      refetch?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi tạo hoàn trả."
      );
    }
  };

  const isAdmin = useMemo(() => {
    const isAdmin = hasPermission("system.admin");
    return isAdmin;
  }, [hasPermission]);

  // Xử lý xác nhận công nợ
  const handlePendingConfirm = async (note: string) => {
    if (!selectedDebt?.id) return;
    try {
      if (selectedDebt && selectedDebt.user_id) {
        await approveDebt(selectedDebt.user_id, { note: note });
        toast.success("Xác nhận giao dịch thành công!");
        setPendingConfirmVisible(false);
        setTimeout(() => setSelectedDebt(undefined), 300);
        refetch?.();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi xác nhận giao dịch."
      );
    }
  };

  // Xử lý từ chối công nợ
  const handlePendingReject = async () => {
    if (!selectedDebt?.id) return;
    try {
      if (selectedDebt && selectedDebt.user_id) {
        await cancelDebt(selectedDebt.user_id);
        toast.success("Đã từ chối giao dịch!");
        setPendingRejectVisible(false);
        setTimeout(() => setSelectedDebt(undefined), 300);
        refetch?.();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi từ chối giao dịch."
      );
    }
  };

  const handlePageChange = (p: number) => {
    setParams((prev) => ({
      ...prev,
      page: p - 1,
    }));
  };

  const handleConfirmDebt = async (id: string) => {
    if (!selectedDebt?.user_id) return;
    try {
      await createDebt(selectedDebt.id, { bank_account_id: id });
      toast.success("Tạo tất toán thành công!");
      setModalVisible(false);
      setTimeout(() => setSelectedDebt(undefined), 300);
      refetch?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi tạo tất toán."
      );
    }
  };

  const columns: ColumnsType<DebtItem> = [
    {
      key: "card",
      render: (record: DebtItem) => {
        const status = record.status;
        const isNo = +record.total_remaining_debts > 0;
        const isBalanced =
          +record.total_remaining_debts === 0 && status !== "PENDING";
        let statusText = "";

        // Set status text
        switch (status) {
          case "NEW":
            if (isNo) {
              statusText = "Mình nợ";
            } else if (isBalanced) {
              statusText = "Đã cân bằng";
            } else {
              statusText = "Đối tác giữ thừa";
            }
            break;
          case "PENDING":
            statusText = "Chờ xác nhận";
            break;
          case "COMPLETED":
            statusText = "Hoàn thành";
            break;
          case "CANCELED":
            statusText = "Đã từ chối";
            break;
          default:
            statusText = "Đã cân bằng";
        }

        // Determine background and border styles
        const getCardStyles = () => {
          if (status === "PENDING") {
            return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
          }
          if (status === "NEW") {
            if (isNo) return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200";
            if (isBalanced) return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
            return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200";
          }
          if (status === "COMPLETED") {
            return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200";
          }
          return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
        };

        // Format balance display
        const formatBalance = () => {
          const amount = typeof record.total_remaining_debts === "number"
            ? record.total_remaining_debts
            : Number(record.total_remaining_debts) || 0;

          if (isNo) {
            return {
              label: "Số dư thực tế",
              value: `${Math.abs(amount).toLocaleString()} ₫`,
              colorClass: "text-red-600",
            };
          }
          if (isBalanced) {
            return {
              label: "Số dư thực tế",
              value: "0 ₫",
              colorClass: "text-gray-600",
            };
          }
          return {
            label: "Số dư thực tế",
            value: `Thừa ${Math.abs(amount).toLocaleString()} ₫`,
            colorClass: status === "PENDING" ? "text-amber-600" : "text-green-600",
          };
        };

        const balance = formatBalance();

        return (
          <div
            className={`flex items-center h-[88px] rounded-xl px-5 py-4 border transition-all duration-200 hover:shadow-md ${getCardStyles()}`}
          >
            {/* Left: Partner Info */}
            <div className="flex-1 min-w-0 flex items-center gap-4">
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg
                ${status === "PENDING" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                  status === "NEW" ? (isNo ? "bg-gradient-to-br from-red-400 to-rose-500" :
                    isBalanced ? "bg-gradient-to-br from-gray-400 to-slate-500" :
                    "bg-gradient-to-br from-green-400 to-emerald-500") :
                  status === "COMPLETED" ? "bg-gradient-to-br from-green-400 to-emerald-500" :
                  "bg-gradient-to-br from-gray-400 to-slate-500"
                }`}
              >
                {record.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              {/* Name & Email */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-base text-gray-900 truncate max-w-[200px]">
                    {record.full_name}
                  </span>
                  <Tag
                    className={`!text-xs !py-0 !px-2 !h-5 !leading-5 !rounded-full !border-0 !font-medium
                      ${status === "NEW" ? (isNo ? "!bg-red-100 !text-red-700" :
                          isBalanced ? "!bg-gray-100 !text-gray-600" :
                          "!bg-green-100 !text-green-700") :
                        status === "PENDING" ? "!bg-amber-100 !text-amber-700" :
                        status === "COMPLETED" ? "!bg-green-100 !text-green-700" :
                        "!bg-gray-100 !text-gray-600"
                      }`}
                  >
                    {statusText}
                  </Tag>
                </div>
                <span className="text-gray-500 text-sm truncate block max-w-[250px]">
                  {record.email}
                </span>
              </div>
            </div>

            {/* Center: Balance */}
            <div className="px-6 text-center min-w-[180px]">
              <p className="text-xs text-gray-500 mb-0.5">{balance.label}</p>
              <p className={`text-lg font-bold ${balance.colorClass}`}>
                {balance.value}
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {status === "NEW" && isNo && isAdmin && (
                <Button
                  type="primary"
                  size="small"
                  danger
                  className="!h-8 !px-4 !text-sm !font-medium"
                  onClick={() => {
                    setSelectedDebt(record);
                    setModalVisible(true);
                  }}
                >
                  Tạo tất toán
                </Button>
              )}
              {status === "NEW" && !isNo && !isBalanced && isAdmin && (
                <Button
                  type="primary"
                  size="small"
                  className="!h-8 !px-4 !text-sm !font-medium !bg-green-600 hover:!bg-green-500 !border-green-600"
                  onClick={() => {
                    setSelectedDebt(record);
                    setConfirmReturnVisible(true);
                  }}
                >
                  Yêu cầu hoàn trả
                </Button>
              )}
              {status === "COMPLETED" && (
                <Tag color="success" className="!text-sm !py-1 !px-3 !rounded-full">
                  Hoàn thành
                </Tag>
              )}
              {status === "CANCELED" && (
                <Tag color="default" className="!text-sm !py-1 !px-3 !rounded-full">
                  Đã từ chối
                </Tag>
              )}
              <Button
                size="small"
                className="!h-8 !px-4 !text-sm"
                onClick={() => {
                  setDetailModalVisible(true);
                  setSelectedDebt(record);
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

  // Decision: If admin, show as-is, else show DebtHistoryTable with first data item
  if (!isAdmin) {
    // data?.contents.data is an array, pick first element (if any)
    const firstItem = data?.contents?.data?.[0];
    return (
      <DebtHistoryScreen
        record={firstItem}
        onRefresh={() => refetch?.()}
      />
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Tình trạng Công nợ với Đối tác
            </h3>
            <Tooltip
              title={
                <div className="text-xs">
                  <div className="font-semibold mb-2">CÔNG THỨC TÍNH:</div>
                  <div className="mb-2">
                    <span className="font-medium">Số dư thực tế</span> = Tổng nợ phát sinh + Điều chỉnh - Đã thanh toán
                  </div>
                  <div className="text-gray-300">
                    <div>• Số dương (+): Đối tác đang nợ công ty</div>
                    <div>• Số âm (-): Công ty đang nợ đối tác (Thừa)</div>
                    <div>• Số 0: Đã cân bằng</div>
                  </div>
                </div>
              }
              overlayStyle={{ maxWidth: 400 }}
            >
              <InfoCircleOutlined className="text-gray-400 cursor-help text-base" />
            </Tooltip>
          </div>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={() => refetch?.()}
            loading={isPending}
          >
            Làm mới
          </Button>
        </div>
        {data?.items && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between h-full">
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Mình đang nợ
                  </p>
                  <p className="text-2xl font-bold text-red-600 leading-tight">
                    {(data.items?.Debts?.total_amount ?? 0).toLocaleString()} ₫
                  </p>
                  <p className="text-xs text-red-500/70 mt-1">
                    {data.items?.Debts?.total_account ?? 0} đối tác
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-200/50 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationCircle} className="text-xl text-red-500" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between h-full">
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Đối tác giữ thừa
                  </p>
                  <p className="text-2xl font-bold text-green-600 leading-tight">
                    {(data.items?.DebtsPaid?.total_amount ?? 0).toLocaleString()} ₫
                  </p>
                  <p className="text-xs text-green-500/70 mt-1">
                    {data.items?.DebtsPaid?.total_account ?? 0} đối tác
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-200/50 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faDollarSign} className="text-xl text-green-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <TableComponent
        columns={columns}
        dataSource={data?.contents.data || []}
        response={data?.contents}
        page={params.page ? params.page + 1 : 0}
        rowHeight={60}
        onPageChange={handlePageChange}
        fontSize={13}
        headerHeight={0}
        loading={isPending}
      />
      {selectedDebt?.user_id && (
        <SettlementBankModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setTimeout(() => setSelectedDebt(undefined), 300);
          }}
          selectedDebt={selectedDebt}
          partner_id={selectedDebt?.user_id}
          remainDebt={selectedDebt.total_remaining_debts}
          onConfirmDebt={handleConfirmDebt}
        />
      )}

      {selectedDebt?.id && (
        <DebtDetailModal
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false);
            setTimeout(() => setSelectedDebt(undefined), 300);
          }}
          record={selectedDebt}
        />
      )}

      <ConfirmReturnModal
        visible={confirmReturnVisible}
        onCancel={() => {
          setConfirmReturnVisible(false);
          setTimeout(() => setSelectedDebt(undefined), 300);
        }}
        onConfirm={handleReturnConfirm}
        record={selectedDebt}
      />
      <ConfirmActionModal
        visible={pendingConfirmVisible}
        record={selectedDebt}
        onOk={handlePendingConfirm}
        onCancel={() => {
          setPendingConfirmVisible(false);
          setTimeout(() => setSelectedDebt(undefined), 300);
        }}
      />
      <RejectActionModal
        visible={pendingRejectVisible}
        record={selectedDebt}
        onOk={handlePendingReject}
        onCancel={() => {
          setPendingRejectVisible(false);
          setTimeout(() => setSelectedDebt(undefined), 300);
        }}
      />
    </div>
  );
};

export default PartnerDebtTable;
