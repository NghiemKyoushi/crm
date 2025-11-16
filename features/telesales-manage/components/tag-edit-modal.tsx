import { Modal, Input, Button, Select } from "antd";
import { useState, useEffect } from "react";

const { Option } = Select;

// Chuẩn hóa type - dùng giống với TagType ở tag-modal.tsx
export interface TagType {
  id: string | number;
  name: string;
  color: string;
  tag_type: "SERVICE" | "SOURCE" | "STATUS";
}

interface TagEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tag: TagType) => void;
  initialTag?: Partial<TagType>;
}

const colors: TagType["color"][] = [
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

const TAG_TYPES: Array<{ label: string; value: TagType["tag_type"] }> = [
  { label: "Dịch vụ", value: "SERVICE" },
  { label: "Nguồn", value: "SOURCE" },
  { label: "Tình trạng", value: "STATUS" },
];

const TagEditModal: React.FC<TagEditModalProps> = ({
  open,
  onClose,
  onSave,
  initialTag,
}) => {
  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<TagType["color"]>("red");
  const [tagType, setTagType] = useState<TagType["tag_type"]>("SERVICE");

  useEffect(() => {
    if (initialTag) {
      setName(initialTag.name ?? "");
      setColor(initialTag.color ?? "red");
      setTagType(initialTag.tag_type ?? "SERVICE");
    } else {
      setName("");
      setColor("red");
      setTagType("SERVICE");
    }
  }, [initialTag, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    const tag: TagType = {
      id: initialTag?.id ?? "",
      name: name.trim(),
      color,
      tag_type: tagType,
    };
    onSave(tag);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-800">
            {initialTag ? "Sửa thẻ phân loại" : "Thêm mới thẻ phân loại"}
          </span>
        </div>
      }
      centered
      width={500}
    >
      <div className="space-y-5 pt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại thẻ</label>
          <Select
            className="!h-10 !rounded-lg w-full"
            value={tagType}
            onChange={(val: TagType["tag_type"]) => setTagType(val)}
          >
            {TAG_TYPES.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên thẻ phân loại</label>
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Nhập tên thẻ phân loại"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="!h-10 !rounded-lg"
              autoFocus
            />
            <div
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Chọn màu sắc</p>
          <div className="flex gap-3 flex-wrap">
            {colors.map((c) => (
              <div
                key={c}
                className={`w-9 h-9 rounded-lg cursor-pointer border-3 shadow-sm hover:shadow-md transition-all transform hover:scale-110 ${
                  color === c ? "border-gray-800 ring-2 ring-gray-400 ring-offset-2" : "border-gray-200"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            onClick={onClose}
            className="!h-10 !px-5 !rounded-lg"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!name.trim()}
            className="!bg-gradient-to-r !from-purple-500 !to-purple-600 hover:!from-purple-600 hover:!to-purple-700 !h-10 !px-5 !rounded-lg !font-medium !shadow-md hover:!shadow-lg !transition-all"
          >
            {initialTag ? "Lưu thay đổi" : "Thêm phân loại"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TagEditModal;
