import { Form, Input, Modal } from "antd";
import React, { useState } from "react";

export const NoteModal: React.FC<{
    open: boolean;
    note: string;
    onOk: (newNote: string) => void;
    onCancel: () => void;
  }> = ({ open, note, onOk, onCancel }) => {
    const [value, setValue] = useState(note);
  
    React.useEffect(() => {
      setValue(note);
    }, [note, open]);
  
    return (
      <Modal
        title="Ghi chú khách hàng"
        open={open}
        onCancel={onCancel}
        onOk={() => onOk(value)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Ghi chú">
            <Input.TextArea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={5}
              placeholder="Nhập ghi chú cho khách hàng..."
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  };