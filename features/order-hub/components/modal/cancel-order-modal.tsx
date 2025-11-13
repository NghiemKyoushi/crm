import { Modal, InputNumber, Input, Form, Checkbox } from "antd";
import React, { useEffect, useRef } from "react";

/**
 * Modal to handle order cancellation with refund.
 * - amount: refund amount
 * - note: reason for cancellation
 * - isFullBack: true to refund all, false to refund partial (amount)
 */

export const CancelOrderModal = ({
  visible,
  onCancel,
  onConfirm,
  order,
  loading,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (payload: {
    amount: number;
    note: string;
    isFullBack: boolean;
  }) => void;
  order: any; // expects at least { id, max_refund_amount }
  loading?: boolean;
}) => {
  const [form] = Form.useForm();
  const [isFullBack, setIsFullBack] = React.useState(true);

  // --- REMOVE redundant state, amount is now form-driven only ---
  // This tracks if we should reset form fields after close.
  const shouldResetRef = useRef(false);

  // This effect only initializes fields when modal is first opened, not every close
  useEffect(() => {
    if (visible) {
      setIsFullBack(true);
      // Only setFieldsValue on open, don't reset when closing
      form.setFieldsValue({
        amount: order?.max_refund_amount ?? 0,
        note: "",
      });
      shouldResetRef.current = true;
    }
    // no resetFields here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, order]);

  // Reset fields only when modal fully closes
  useEffect(() => {
    if (!visible && shouldResetRef.current) {
      form.resetFields();
      shouldResetRef.current = false;
    }
  }, [visible]);

  const handleCheck = (e: any) => {
    const checked = e.target.checked;
    setIsFullBack(checked);
    if (checked) {
      form.setFieldValue("amount", order?.max_refund_amount ?? 0);
    } else {
      // Do not clear user's input, just let it as is (UX: keep value)
      // form.setFieldValue("amount", undefined); // removed
    }
  };

  const handleOk = async () => {
    try {
      let values: any = {};
      if (isFullBack) {
        values = await form.validateFields(["note"]);
        values.amount = order?.max_refund_amount ?? 0;
      } else {
        values = await form.validateFields();
      }
      onConfirm({
        amount: Number(values.amount),
        note: values.note,
        isFullBack,
      });
    } catch (e) {
      // validation handled
    }
  };

  return (
    <Modal
      open={visible}
      title="Xác nhận huỷ đơn và hoàn tiền"
      onCancel={onCancel}
      onOk={handleOk}
      okText="Xác nhận huỷ"
      cancelText="Không huỷ"
      confirmLoading={loading}
      centered
      destroyOnClose={false}
    >
      <div>
        <div className="mb-3">
          <Checkbox checked={isFullBack} onChange={handleCheck}>
            Hoàn tiền toàn bộ ({order?.max_refund_amount?.toLocaleString() ?? 0}{" "}
            ₫)
          </Checkbox>
        </div>
        <Form form={form} layout="vertical">
          {!isFullBack && (
            <Form.Item
            label="Số tiền hoàn (₫)"
            name="amount"
            rules={[
              {
                required: true,
                message: "Nhập số tiền hoàn!",
              },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập số tiền hoàn"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: any) =>
                value.replace(/\$\s?|(,*)/g, "")
              }
            />
          </Form.Item>
          
          )}
          <Form.Item
            label="Lý do huỷ đơn"
            name="note"
            rules={[
              { required: true, message: "Nhập lý do huỷ!" },
              { min: 10, message: "Lý do phải có ít nhất 10 ký tự!" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do hủy đơn..." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
