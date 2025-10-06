"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { toast } from "react-toastify";

export interface NoteModalProps {
  open: boolean;
  note: string | null;
  onCancel: () => void;
  onSave: (note: string) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({
  open,
  note,
  onCancel,
  onSave,
}) => {
  const [text, setText] = useState<string>(note ?? "");
  useEffect(() => {
    if (open) {
      setText(note ?? "");
    }
  }, [open, note]);

  const handleSave = () => {
    onSave(text);
  };

  const handleCancel = () => {
    setText(note ?? "");
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title="Cập nhật Ghi Chú"
      width={500}
      centered
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Lưu
        </Button>,
      ]}
    >
      <Form layout="vertical" className="py-4">
        <Form.Item label="Ghi Chú">
          <Input.TextArea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập ghi chú"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NoteModal;
