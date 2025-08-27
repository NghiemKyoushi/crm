import { useForm, Controller } from "react-hook-form";
import { Modal, Button, Input } from "antd";
import { CategoryRequest } from "@/types/category-customer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface AddCustomerTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryRequest, isEdit: boolean) => void;
  initialData?: CategoryRequest | null;
}

export default function AddCustomerTypeModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: AddCustomerTypeModalProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryRequest>({
    defaultValues: {
      category_name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData); 
    } else {
      reset({ category_name: "", description: "" });
    }
  }, [initialData, reset, open]);

  const submitHandler = (data: CategoryRequest) => {
    onSubmit(data, !!initialData); // 👈 truyền flag edit/create
    reset();
    onClose();
  };

  const isEdit = !!initialData;

  return (
    <Modal
      title={
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-semibold text-lg">
            {isEdit ? "Chỉnh sửa Loại khách hàng" : "Thêm Loại khách hàng mới"}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">{t("customerCate.name")}</label>
          <Controller
            name="category_name"
            control={control}
            rules={{ required: "Vui lòng nhập Tên loại" }}
            render={({ field }) => <Input placeholder="VD: Vàng" {...field} />}
          />
          {errors.category_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Mô tả</label>
          <Controller
            name="description"
            control={control}
            rules={{ required: "Vui lòng nhập Mô tả" }}
            render={({ field }) => (
              <Input placeholder="VD: Khách hàng tiềm năng" {...field} />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "Cập nhật" : "Thêm Loại"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
