import { Modal, Input, Button } from "antd";
import { useState, useEffect } from "react";

interface TagEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tag: { id?: string; name: string; color: string }) => void;
  initialTag?: { id?: string; name: string; color: string };
}

const colors = [
  "red",
  "green",
  "blue",
  "orange",
  "purple",
  "gold",
  "magenta",
  "cyan",
  "lime",
];

const TagEditModal: React.FC<TagEditModalProps> = ({
  open,
  onClose,
  onSave,
  initialTag,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("red");

  useEffect(() => {
    if (initialTag) {
      setName(initialTag.name);
      setColor(initialTag.color);
    } else {
      setName("");
      setColor("red");
    }
  }, [initialTag, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ ...initialTag, name: name.trim(), color });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={initialTag ? "Sửa thẻ phân loại" : "Thêm mới thẻ phân loại"}
      centered
    >
      <div className="space-y-4">
        <div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Nhập tên thẻ phân loại"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div
              className="w-8 h-8 rounded cursor-pointer border"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Chọn màu</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <div
                key={c}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  color === c ? "border-black" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {initialTag ? "Lưu" : "Thêm phân loại"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TagEditModal;
