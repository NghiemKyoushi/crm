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
import dayjs from "dayjs";
import { usePermission } from "@/components/layout/PermissionContext";

const ConfirmActionModal = ({ visible, onOk, onCancel, record }: any) => {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      await onOk?.(note);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Xác nhận giao dịch"
      onOk={handleOk}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Huỷ"
      destroyOnClose
      centered
      okButtonProps={{ loading, disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
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
          disabled={loading}
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

  // Track loading for Pending Confirm and Pending Reject
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

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
    setConfirmLoading(true);
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
    } finally {
      setConfirmLoading(false);
    }
  };

  // Xử lý từ chối công nợ
  const handlePendingReject = async () => {
    if (!selectedDebt?.id) return;
    setRejectLoading(true);
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
    } finally {
      setRejectLoading(false);
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
        let statusColor: "default" | "orange" | "red" | "green" | undefined =
          "default";

        // Set status text and color
        switch (status) {
          case "NEW":
            if (isNo) {
              statusText = "Mình nợ";
              statusColor = "red";
            } else if (isBalanced) {
              statusText = "Đã cân bằng";
              statusColor = "default";
            } else {
              statusText = "Đối tác giữ thừa";
              statusColor = "green";
            }
            break;
          case "PENDING":
            statusText = "Chờ xác nhận";
            statusColor = "orange";
            break;
          case "COMPLETED":
            statusText = "Hoàn thành";
            statusColor = "green";
            break;
          case "CANCELED":
            statusText = "Đã từ chối";
            statusColor = "default";
            break;
          default:
            statusText = "Đã cân bằng";
            statusColor = "default";
        }

        return (
          <div
            className={`flex items-center min-h-[100px] text-[15px] rounded-[8px] px-[16px] py-[12px] 
              ${
                status === "PENDING"
                  ? "bg-yellow-50 border border-yellow-300"
                  : status === "NEW"
                  ? isNo
                    ? "bg-red-50 border border-[#ffccc7]"
                    : isBalanced
                    ? "bg-[#f0f0f0] border border-[#d9d9d9]"
                    : "bg-green-50 border border-[#b7eb8f]"
                  : status === "COMPLETED"
                  ? "bg-green-50 border border-[#b7eb8f]"
                  : status === "CANCELED"
                  ? "bg-[#f0f0f0] border border-[#d9d9d9]"
                  : "bg-[#f0f0f0] border border-[#d9d9d9]"
              }
            `}
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center mb-2 gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[17px] truncate max-w-[250px] text-[#262626]">
                    {record.full_name}
                  </span>
                  <span className="text-[#5b5a5a] text-sm truncate max-w-[250px]">
                    {record.email}
                  </span>
                </div>
                <Tag
                  className={`
                    !text-[13px] !py-[1px] !px-[10px] !h-[24px] !leading-[22px] 
                    !rounded-[16px] 
                    ${
                      status === "NEW"
                        ? isNo
                          ? "!bg-red-100 !text-red-800 "
                          : isBalanced
                          ? "!bg-grey-100 !text-grey-800"
                          : " !bg-green-100 !text-green-800"
                        : status === "PENDING"
                        ? "!bg-[#fffbe6] !border-[#ffe58f] !text-[#d48806]"
                        : status === "COMPLETED"
                        ? "!bg-[#f6ffed] !border-[#81d83e] !text-[#237804]"
                        : status === "CANCELED"
                        ? "!bg-[#fafafa] !border-[#d9d9d9] !text-[#8c8c8c]"
                        : "!bg-[#fafafa] !border-[#d9d9d9] !text-[#595959]"
                    }
                  `}
                  bordered={false}
                >
                  {statusText}
                </Tag>
              </div>

              <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[14px] leading-[1.4]">
                <div>
                  <span className="text-[#5a5959] mr-1 text-[14px]">Tổng nợ phát sinh:</span>
                  <b className="text-[#222] text-[14px]">
                    {(typeof record.total_debts === "number"
                      ? record.total_debts.toLocaleString()
                      : record.total_debts) || 0}{" "}
                    ₫
                  </b>
                </div>
                <div>
                  <span className="text-[#5a5959] mr-1 text-[14px]">Điều chỉnh:</span>
                  <b className={`text-[14px] ${record.total_adjustments < 0 ? 'text-red-600' : record.total_adjustments > 0 ? 'text-green-600' : 'text-[#262626]'}`}>
                    {(typeof record.total_adjustments === "number"
                      ? record.total_adjustments.toLocaleString()
                      : record.total_adjustments) || 0}{" "}
                    ₫
                  </b>
                </div>
                <div>
                  <span className="text-[#5a5959] mr-1 text-[14px]">Đã thanh toán:</span>
                  <b className="text-[#262626] text-[14px]">
                    {(typeof record.total_paid_debts === "number"
                      ? record.total_paid_debts.toLocaleString()
                      : record.total_paid_debts) || 0}{" "}
                    ₫
                  </b>
                </div>
                <div>
                  {isNo ? (
                    <>
                      <span className="text-[#5a5959] mr-1 text-[14px]">Số dư thực tế:</span>
                      <b className="text-[#ff4d4f] font-semibold text-[14px]">
                        {(typeof record.total_remaining_debts === "number"
                          ? record.total_remaining_debts.toLocaleString()
                          : record.total_remaining_debts) || 0}{" "}
                        ₫
                      </b>
                    </>
                  ) : isBalanced ? (
                    <>
                      <span className="text-[#5a5959] mr-1 text-[14px]">Số dư thực tế:</span>
                      <b className="text-[#595959] font-medium text-[14px]">0 ₫</b>
                    </>
                  ) : (
                    <>
                      <span className="text-[#5a5959] mr-1 text-[14px]">Số dư thực tế:</span>
                      <b
                        className={
                          status === "PENDING"
                            ? "text-[#d48806] font-semibold text-[14px]"
                            : "text-[#389e0d] font-semibold text-[14px]"
                        }
                      >Thừa{" "}
                        {(typeof record.total_remaining_debts === "number"
                          ? Math.abs(record.total_remaining_debts).toLocaleString()
                          : Math.abs(Number(record.total_remaining_debts)) || 0) || 0} ₫

                      </b>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end ml-4">
              {status === "NEW" && (
                <>
                  {isNo && isAdmin ? (
                    <Button
                      type="primary"
                      size="small"
                      className="!bg-red-600 !h-[28px] !w-[124px] !text-[14px] !px-[12px]"
                      onClick={() => {
                        setSelectedDebt(record);
                        setModalVisible(true);
                      }}
                    >
                      Tạo tất toán
                    </Button>
                  ) : !isBalanced && isAdmin ? (
                    <Button
                      type="primary"
                      size="small"
                      className="!h-[28px] !w-[124px] !text-[14px] !px-[12px] !bg-green-600 hover:!bg-[#46bd18] !border-none"
                      onClick={() => {
                        setSelectedDebt(record);
                        setConfirmReturnVisible(true);
                      }}
                    >
                      Yêu cầu hoàn trả
                    </Button>
                  ) : null}
                </>
              )}
              {status === "PENDING" && (
                <>
                  <Button
                    type="primary"
                    size="small"
                    className="!h-[28px] !w-[124px] !text-[14px] !px-[12px]"
                    onClick={() => {
                      setSelectedDebt(record);
                      setPendingConfirmVisible(true);
                    }}
                    loading={confirmLoading}
                    disabled={confirmLoading || rejectLoading}
                  >
                    Xác nhận
                  </Button>
                  <Button
                    danger
                    size="small"
                    className="!h-[28px] !w-[124px] !text-[14px] !px-[12px]"
                    onClick={() => {
                      setSelectedDebt(record);
                      setPendingRejectVisible(true);
                    }}
                    loading={rejectLoading}
                    disabled={confirmLoading || rejectLoading}
                  >
                    Từ chối
                  </Button>
                </>
              )}
              {status === "COMPLETED" && (
                <Button
                  size="small"
                  className="!h-[28px] !w-[124px] !text-[14px] !px-[12px] !bg-[#e6fffb] !border-none !text-[#52c41a]"
                  disabled
                >
                  Hoàn thành
                </Button>
              )}
              {status === "CANCELED" && (
                <Button
                  size="small"
                  className="!h-[28px] !w-[124px] !text-[14px] !px-[12px] !bg-[#f5f5f5] !border-none !text-gray-400"
                  disabled
                >
                  Đã từ chối
                </Button>
              )}
              <Button
                size="small"
                className="!h-[28px] !w-[124px] !text-[14px] !px-[12px]"
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
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            <div
              className={`bg-red-50 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center min-h-[70px]`}
              style={{
                minHeight: 56,
                border: `1px solid #f87171`,
              }}
            >
              <div>
                <p className={`text-sm font-semibold text-red-600 mb-0.5`}>
                  Mình đang nợ
                </p>
                <p className={`text-2xl font-bold text-red-600`}>
                  {(data.items?.Debts?.total_amount ?? 0).toLocaleString()} ₫
                </p>
                <p className="text-xs text-gray-500">
                  {data.items?.Debts?.total_account ?? 0} đối tác
                </p>
              </div>
              <div className="text-2xl text-red-500">
                <FontAwesomeIcon icon={faExclamationCircle} />
              </div>
            </div>
            <div
              className={`bg-green-50 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center min-h-[70px]`}
              style={{
                minHeight: 56,
                border: `1px solid #22c55e`,
              }}
            >
              <div>
                <p className={`text-sm font-semibold text-green-600 mb-0.5`}>
                  Đối tác giữ thừa
                </p>
                <p className={`text-2xl font-bold text-green-600`}>
                  {(data.items?.DebtsPaid?.total_amount ?? 0).toLocaleString()}{" "}
                  ₫
                </p>
                <p className="text-xs text-gray-500">
                  {data.items?.DebtsPaid?.total_account ?? 0} đối tác
                </p>
              </div>
              <div className="text-2xl text-green-500">
                <FontAwesomeIcon icon={faDollarSign} />
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
        loading={rejectLoading}
      />
    </div>
  );
};

export default PartnerDebtTable;
