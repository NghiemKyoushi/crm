import { Modal, Tag, Button, message } from "antd";
import { useState, useEffect } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import TagEditModal from "./tag-edit-modal";
import { getTelesaleTagList, addTelesaleTag, deleteTelesaleTag, updateTelesaleTag } from "../apis/telesale-mng";

interface TagType {
  id: string | number;
  name: string;
  color: string;
}
interface TagManagerModalProps {
  open: boolean;
  onClose: () => void;
  customer: any;
  onAssignTag: (customerId: string, tagId: string) => void;
}

const TagManagerModal: React.FC<TagManagerModalProps> = ({
  open,
  onClose,
  customer,
  onAssignTag,
}) => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | undefined>(undefined);
  const [deleteTagInfo, setDeleteTagInfo] = useState<{ id: string | number; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Track which tag is hovered for tick display
  const [hoveredTagId, setHoveredTagId] = useState<string | number | null>(null);

  // Fetch tag list from API
  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await getTelesaleTagList();
      // Ensure data is array and items are TagType
      setTags(
        Array.isArray(data)
          ? data.map((tag) => ({
              id: tag.id,
              name: tag.name,
              color: tag.color,
            }))
          : []
      );
    } catch (err) {
      setTags([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open]);

  // Thêm hoặc sửa tag sử dụng API
  const handleSaveTag = async (tag: { id?: string | number; name: string; color: string }) => {
    try {
      setLoading(true);
      if (tag.id) {
        // If editing, use update API
        await updateTelesaleTag(String(tag.id), { name: tag.name, color: tag.color });
        message.success("Cập nhật thẻ thành công!");
      } else {
        // Else, add new with add API
        await addTelesaleTag({ name: tag.name, color: tag.color });
        message.success("Thêm thẻ thành công!");
      }
      await fetchTags();
    } catch (err) {
      if (tag.id) {
        message.error("Cập nhật thẻ thất bại!");
      } else {
        message.error("Thêm thẻ thất bại!");
      }
    }
    setIsEditOpen(false);
    setLoading(false);
  };

  // Xác nhận xóa tag thực sự và gọi API
  const confirmDeleteTag = async () => {
    if (!deleteTagInfo) return;
    setDeleteLoading(true);
    try {
      await deleteTelesaleTag(String(deleteTagInfo.id));
      await fetchTags();
      message.success("Xóa thẻ thành công!");
      setDeleteTagInfo(null);
    } catch (e) {
      message.error("Xóa thẻ thất bại. Vui lòng thử lại!");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title="Quản lý thẻ phân loại"
        centered
        bodyStyle={{ minHeight: 300 }}
      >
        {/* Header */}

        {/* Body */}
        <div className="py-2 space-y-2">
          {loading && <div className="text-center text-gray-400 py-4">Đang tải...</div>}
          {!loading &&
            tags.map((tag, i) => (
              <div
                key={tag.id}
                className="group flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                onMouseEnter={() => setHoveredTagId(tag.id)}
                onMouseLeave={() => setHoveredTagId(null)}
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
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="text"
                    icon={
                      <CheckCircleTwoTone
                        className="text-lg"
                      />
                    }
                    title="Chọn thẻ này"
                    className="!flex !items-center !justify-center !px-1 !py-0.5"
                    onClick={() => {
                      if (tag.id) onAssignTag(customer?.id, tag.id.toString());
                      setHoveredTagId(null);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined className="text-lg" />}
                    className="!flex !items-center !justify-center !px-1 !py-0.5"
                    title="Sửa thẻ"
                    onClick={() => {
                      setEditingTag(tag);
                      setIsEditOpen(true);
                    }}
                  />
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined className="text-lg" />}
                    className="!flex !items-center !justify-center !px-1 !py-0.5"
                    title="Xóa thẻ"
                    onClick={() => setDeleteTagInfo({ id: tag.id, name: tag.name })}
                  />
                </div>
              </div>
            ))}

          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={() => {
                setEditingTag(undefined); // Reset editing tag when adding new
                setIsEditOpen(true);
              }}
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

      {/* Confirm delete modal */}
      <Modal
        open={!!deleteTagInfo}
        onCancel={() => setDeleteTagInfo(null)}
        onOk={confirmDeleteTag}
        okText={deleteLoading ? "Đang xóa..." : "Xóa"}
        cancelText="Hủy"
        title="Xác nhận xóa thẻ"
        confirmLoading={deleteLoading}
        centered
        maskClosable={false}
        closable={!deleteLoading}
      >
        {deleteTagInfo && (
          <span>
            Bạn có chắc chắn muốn xoá thẻ <b>{deleteTagInfo.name}</b> không?
          </span>
        )}
      </Modal>
    </>
  );
};

export default TagManagerModal;
