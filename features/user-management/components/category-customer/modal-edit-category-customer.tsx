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
    watch,
  } = useForm<CategoryRequest>({
    defaultValues: {
      group_name: "",
      description: "",
      color: "#000000",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        color: initialData.color || "#000000", 
      });
    } else {
      reset({ group_name: "", description: "", color: "#000000" });
    }
  }, [initialData, reset, open]);

  const submitHandler = (data: CategoryRequest) => {
    onSubmit(data, !!initialData); 
    reset();
    onClose();
  };

  const isEdit = !!initialData;
  const pickedColor = watch("color"); 

  return (
    <Modal
      title={
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-semibold text-lg">
            {isEdit ? t('categoryCustomer.editCategory') : t('categoryCustomer.addNewCategory')}
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
            name="group_name"
            control={control}
            rules={{ required: t('categoryCustomer.nameRequired') }}
            render={({ field }) => <Input placeholder={t('categoryCustomer.namePlaceholder')} {...field} />}
          />
          {errors.group_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.group_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">{t('categoryCustomer.description')}</label>
          <Controller
            name="description"
            control={control}
            rules={{ required: t('categoryCustomer.descriptionRequired') }}
            render={({ field }) => (
              <Input placeholder={t('categoryCustomer.descriptionPlaceholder')} {...field} />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Pick color */}
        <div>
          <label className="block mb-1 font-medium">{t('categoryCustomer.selectColor')}</label>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Input
                type="color"
                {...field}
                style={{ width: "60px", height: "40px", padding: 0, border:'none' }}
              />
            )}
          />
          <p className="mt-2 text-sm">{t('categoryCustomer.colorCode')} <span className="font-mono">{pickedColor}</span></p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>{t('categoryCustomer.cancel')}</Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? t('categoryCustomer.update') : t('categoryCustomer.addCategory')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
