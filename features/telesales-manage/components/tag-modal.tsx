import { Modal, Tag, Button } from "antd";
import { useState } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import TagEditModal from "./tag-edit-modal";

interface TagType {
  id: string;
  name: string;
  color: string;
}

interface TagManagerModalProps {
  open: boolean;
  onClose: () => void;
  tags: TagType[];
  onChange: (newTags: TagType[]) => void;
  customer: any;
  onAssignTag: (customerId: string, tagId: string) => void;
}

const TagManagerModal: React.FC<TagManagerModalProps> = ({
  open,
  onClose,
  tags,
  onChange,
  customer,
  onAssignTag,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | undefined>(undefined);

  const handleSaveTag = (tag: { id?: string; name: string; color: string }) => {
    if (tag.id) {
      // sửa
      onChange(tags.map((t) => (t.id === tag.id ? { ...t, ...tag } : t)));
    } else {
      // thêm mới
      const newTag = { ...tag, id: Date.now().toString() };
      onChange([...tags, newTag]);
    }
    setIsEditOpen(false);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title="Quản lý thẻ phân loại"
        centered
      >
        {/* Header */}

        {/* Body */}
        <div className="py-2 space-y-2">
          {tags.map((tag, i) => (
            <div
              key={i}
              className="group flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <span className="cursor-move text-gray-400 mr-3">☰</span>
                <span
                  className="inline-block w-4 h-4 rounded mr-3"
                  style={{ backgroundColor: tag.color }}
                ></span>
                <span className="text-sm text-gray-800">{tag.name}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditOutlined
                  className="text-gray-500 hover:text-blue-500 cursor-pointer"
                  onClick={() => {
                    setEditingTag(tag);
                    setIsEditOpen(true);
                  }}
                />
                <DeleteOutlined
                  className="text-gray-500 hover:text-red-500 cursor-pointer"
                  onClick={() => onChange(tags.filter((t) => t.id !== tag.id))}
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
            type="primary"
            onClick={() => setIsEditOpen(true)}
            className="text-blue-500 text-sm hover:underline mt-2"
          >
            Thêm phân loại
          </Button>
          </div>
        </div>
      </Modal>

      <TagEditModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveTag}
        initialTag={editingTag}
      />
    </>
  );
};

export default TagManagerModal;
