import { useForm, Controller } from "react-hook-form";
import { Modal, Button, Input } from "antd";
import { CategoryRequest } from "@/types/category-customer";

interface AddCustomerTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryRequest) => void;
}

export default function AddCustomerTypeModal({
  open,
  onClose,
  onSubmit,
}: AddCustomerTypeModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryRequest>();

  const submitHandler = (data: CategoryRequest) => {
    console.log("data", data);
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-semibold text-lg">Thêm Loại khách hàng mới</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Tên Loại</label>
          <Controller
            name="category_name"
            control={control}
            rules={{ required: "Vui lòng nhập Tên loại" }}
            render={({ field }) => <Input placeholder="VD: Vàng" {...field} />}
          />
          {errors.category_name && (
            <p className="text-red-500 text-sm mt-1">{errors.category_name.message}</p>
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

        {/* % Đặt cọc */}
        {/* <div>
          <label className="block mb-1 font-medium">% Đặt cọc (AIR)</label>
          <Controller
            name="deposit_percentage"
            control={control}
            rules={{
              required: "Vui lòng nhập % đặt cọc",
              min: { value: 1, message: "Phải lớn hơn 0" },
              max: { value: 100, message: "Không được quá 100" },
            }}
            render={({ field }) => (
              <Input type="number" placeholder="VD: 80" {...field} />
            )}
          />
          {errors.deposit_percentage && (
            <p className="text-red-500 text-sm mt-1">
              {errors.deposit_percentage.message}
            </p>
          )}
        </div> */}

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Thêm Loại
          </Button>
        </div>
      </form>
    </Modal>
  );
}
