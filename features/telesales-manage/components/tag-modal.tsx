import { Modal, Tag, Button, message, Tooltip } from "antd";
import { useState, useEffect } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import TagEditModal from "./tag-edit-modal";
import { getTelesaleTagList, addTelesaleTag, deleteTelesaleTag, updateTelesaleTag } from "../apis/telesale-mng";
import { toast } from "react-toastify";
import { t } from "i18next";
import { fetchTagsByType } from "./modal/filter-telesale-modal";

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
      const data = await fetchTagsByType("STATUS");
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
        await updateTelesaleTag(String(tag.id), { name: tag.name, color: tag.color, });
        toast.success("Cập nhật thẻ thành công!");
      } else {
        // Else, add new with add API
        await addTelesaleTag({ name: tag.name, color: tag.color, tag_type: 'STATUS' });
        toast.success("Thêm thẻ thành công!");
      }
      await fetchTags();
    } catch (err: any) {
      if (tag.id) {
        toast.error(err.response?.data?.localizedMessage || t("common.error"));
      } else {
        toast.error(err.response?.data?.localizedMessage || t("common.error"));
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
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-800">Quản lý thẻ phân loại</span>
          </div>
        }
        centered
        width={600}
        styles={{ body: { minHeight: 300, maxHeight: "70vh", overflowY: "auto" } }}
        className="tag-manager-modal"
      >
        {/* Body */}
        <div className="py-3 space-y-2.5">
          {loading && (
            <div className="text-center text-gray-400 py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm">Đang tải...</p>
            </div>
          )}
          {!loading &&
            tags.map((tag, i) => (
              <div
                key={tag.id}
                className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                onMouseEnter={() => setHoveredTagId(tag.id)}
                onMouseLeave={() => setHoveredTagId(null)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="cursor-move text-gray-400 hover:text-gray-600 transition-colors text-lg">☰</span>
                  <div
                    className="w-5 h-5 rounded-lg shadow-sm border-2 border-white"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-800">{tag.name}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Tooltip title="Chọn thẻ này">
                    <Button
                      type="text"
                      icon={<CheckCircleTwoTone twoToneColor="#52c41a" className="text-xl" />}
                      className="!flex !items-center !justify-center !w-8 !h-8 hover:!bg-green-50 !rounded-lg !transition-all"
                      onClick={() => {
                        if (tag.id) onAssignTag(customer?.id, tag.id.toString());
                        setHoveredTagId(null);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Sửa thẻ">
                    <Button
                      type="text"
                      icon={<EditOutlined className="text-lg text-blue-600" />}
                      className="!flex !items-center !justify-center !w-8 !h-8 hover:!bg-blue-50 !rounded-lg !transition-all"
                      onClick={() => {
                        setEditingTag(tag);
                        setIsEditOpen(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Xóa thẻ">
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined className="text-lg text-red-600" />}
                      className="!flex !items-center !justify-center !w-8 !h-8 hover:!bg-red-50 !rounded-lg !transition-all"
                      onClick={() => setDeleteTagInfo({ id: tag.id, name: tag.name })}
                    />
                  </Tooltip>
                </div>
              </div>
            ))}

          {!loading && tags.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Chưa có thẻ phân loại nào</p>
              <p className="text-xs mt-1">Nhấn nút bên dưới để thêm mới</p>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              type="primary"
              onClick={() => {
                setEditingTag(undefined);
                setIsEditOpen(true);
              }}
              className="!bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-blue-700 !h-10 !px-6 !rounded-lg !font-medium !shadow-md hover:!shadow-lg !transition-all"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Thêm phân loại mới
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
