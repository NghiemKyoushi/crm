import { useForm, SubmitHandler } from "react-hook-form";
import { Modal, Button, Input } from "antd";

interface AddCustomerTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
}

interface FormValues {
  name: string;
  description: string;
  deposit: number;
}

export default function AddCustomerTypeModal({
  open,
  onClose,
  onSubmit,
}: AddCustomerTypeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const submitHandler: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
    reset(); // reset form sau khi submit
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
        {/* Tên loại */}
        <div>
          <label className="block mb-1 font-medium">Tên Loại</label>
          <Input
            placeholder="VD: Vàng"
            {...register("name", { required: "Vui lòng nhập Tên loại" })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-1 font-medium">Mô tả</label>
          <Input
            placeholder="VD: Khách hàng tiềm năng"
            {...register("description", { required: "Vui lòng nhập Mô tả" })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* % Đặt cọc */}
        <div>
          <label className="block mb-1 font-medium">% Đặt cọc (AIR)</label>
          <Input
            placeholder="VD: 80"
            type="number"
            {...register("deposit", {
              required: "Vui lòng nhập % đặt cọc",
              min: { value: 1, message: "Phải lớn hơn 0" },
              max: { value: 100, message: "Không được quá 100" },
            })}
          />
          {errors.deposit && (
            <p className="text-red-500 text-sm mt-1">
              {errors.deposit.message}
            </p>
          )}
        </div>

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
