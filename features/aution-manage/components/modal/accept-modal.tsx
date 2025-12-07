// src/components/BidDecisionModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Checkbox } from "antd";
import { BidItem } from "../tab-link";
export type BidStatus = "Chờ duyệt" | "Đã đặt";

export type DecisionMode =
  | "accept"
  | "reject"
  | "finish"
  | "cancel"
  | "excute-pending";

type BidDecisionModalProps = {
  mode: DecisionMode;
  open: boolean;
  bid: BidItem | null;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  onCancel: () => void;
  onConfirm: (payload: {
    reason?: string;
    activateIfScheduled?: boolean;
  }) => Promise<void> | void;
};

export const BidDecisionModal: React.FC<BidDecisionModalProps> = ({
  mode,
  open,
  bid,
  okText,
  cancelText = "Hủy",
  confirmLoading = false,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm();
  const [activateIfScheduled, setActivateIfScheduled] = useState(false);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setActivateIfScheduled(false); // reset checkbox when modal closed
    }
  }, [open, form]);

  const isReject = mode === "reject";
  const isExcute = (mode = "excute-pending");
  const defaultOkText = isReject ? "Xác nhận từ chối" : "Chấp nhận";

  const handleOk = async () => {
    if (isReject) {
      try {
        const values = await form.validateFields();
        await onConfirm({ reason: values.reason });
      } catch {}
    } else {
      await onConfirm({ activateIfScheduled }); // truyền giá trị xử lý phiên đấu giá
    }
  };

  return (
    <Modal
      title={
        <div className="font-semibold">
          {isReject
            ? `Từ chối bid${bid ? ` - ${bid.full_name}` : ""}`
            : `Xác nhận đặt bid${bid ? ` - ${bid.full_name}` : ""}`}
        </div>
      }
      open={open}
      onCancel={onCancel}
      okText={okText ?? defaultOkText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      destroyOnClose
    >
      {isReject ? (
        <Form form={form} layout="vertical" initialValues={{ reason: "" }}>
          {/* <Form.Item
            label="Lý do từ chối"
            name="reason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do từ chối." },
              { min: 5, message: "Lý do nên có ít nhất 5 ký tự." },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do từ chối (ví dụ: không đáp ứng yêu cầu, giá chưa phù hợp...)"
              maxLength={500}
              showCount
            />
          </Form.Item> */}
          <div>
            Bạn có chắc muốn <b>từ chối</b> bid của{" "}
            <b>{bid?.full_name ?? "khách hàng"}</b> với số tiền{" "}
            <b>
              {bid?.bid_amount?.toLocaleString("ja-JP", {
                style: "currency",
                currency: "JPY",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </b>
            ?
          </div>
        </Form>
      ) : isExcute ? (
        <div className="text-sm text-gray-700">
          <div>
            Bạn có chắc muốn <b>thực hiện xử</b> bid của{" "}
            <b>{bid?.full_name ?? "khách hàng"}</b> với số tiền{" "}
            <b>
              {bid?.bid_amount?.toLocaleString("ja-JP", {
                style: "currency",
                currency: "JPY",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </b>
            ?
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-700">
          <div>
            Bạn có chắc muốn <b>chấp nhận</b> bid của{" "}
            <b>{bid?.full_name ?? "khách hàng"}</b> với số tiền{" "}
            <b>
              {bid?.bid_amount?.toLocaleString("ja-JP", {
                style: "currency",
                currency: "JPY",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </b>
            ?
          </div>
          {bid?.auction_type === "SNIPER" && (
            <div className="mt-4">
              <Checkbox
                checked={activateIfScheduled}
                onChange={(e) => setActivateIfScheduled(e.target.checked)}
              >
                Xử lý phiên đấu giá luôn (bỏ chọn để giữ trạng thái lịch)
              </Checkbox>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
