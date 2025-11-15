import React, { useEffect } from "react";
import { Modal, Button, Input, InputNumber, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { CreateVipPackageRequest } from "../apis/vip-api";

const { TextArea } = Input;

interface ModalCreateVipPackageProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSubmit: (data: CreateVipPackageRequest) => Promise<void>;
}

export default function ModalCreateVipPackage(props: ModalCreateVipPackageProps) {
    const { open, onClose, onSuccess, onSubmit } = props;

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<CreateVipPackageRequest>({
        defaultValues: {
            name: "",
            price: 0,
            max_auction_items: 0,
            cancel_fee: 0,
            duration_days: 0,
            description: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: "",
                price: 0,
                max_auction_items: 0,
                cancel_fee: 0,
                duration_days: 0,
                description: "",
            });
        }
    }, [open, reset]);

    const onFormSubmit = async (data: CreateVipPackageRequest) => {
        try {
            await onSubmit(data);
            message.success("Tạo gói VIP thành công");
            reset();
            onClose();
            onSuccess();
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                error?.response?.data?.localizedMessage ||
                "Có lỗi xảy ra khi tạo gói VIP"
            );
        }
    };

    return (
        <Modal
            title={
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-semibold text-lg">Tạo gói VIP mới</span>
                </div>
            }
            open={open}
            footer={null}
            width={700}
            onCancel={onClose}
        >
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-medium">
                            Tên gói <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "Vui lòng nhập tên gói" }}
                            render={({ field }) => <Input {...field} placeholder="VIP Basic" />}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">
                            Giá <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="price"
                            control={control}
                            rules={{
                                required: "Vui lòng nhập giá",
                                min: { value: 0, message: "Giá phải lớn hơn hoặc bằng 0" },
                            }}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    style={{ width: "100%" }}
                                    placeholder="300000"
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) || 0}
                                />
                            )}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm">{errors.price.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-medium">
                            Số lượng đấu giá tối đa <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="max_auction_items"
                            control={control}
                            rules={{
                                required: "Vui lòng nhập số lượng đấu giá tối đa",
                                min: { value: 0, message: "Số lượng phải lớn hơn hoặc bằng 0" },
                            }}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    style={{ width: "100%" }}
                                    placeholder="2"
                                    min={0}
                                />
                            )}
                        />
                        {errors.max_auction_items && (
                            <p className="text-red-500 text-sm">
                                {errors.max_auction_items.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">
                            Phí hủy <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="cancel_fee"
                            control={control}
                            rules={{
                                required: "Vui lòng nhập phí hủy",
                                min: { value: 0, message: "Phí hủy phải lớn hơn hoặc bằng 0" },
                            }}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    style={{ width: "100%" }}
                                    placeholder="1000"
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) || 0}
                                />
                            )}
                        />
                        {errors.cancel_fee && (
                            <p className="text-red-500 text-sm">{errors.cancel_fee.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Thời hạn (ngày) <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="duration_days"
                        control={control}
                        rules={{
                            required: "Vui lòng nhập thời hạn",
                            min: { value: 1, message: "Thời hạn phải lớn hơn 0" },
                        }}
                        render={({ field }) => (
                            <InputNumber
                                {...field}
                                style={{ width: "100%" }}
                                placeholder="30"
                                min={1}
                            />
                        )}
                    />
                    {errors.duration_days && (
                        <p className="text-red-500 text-sm">{errors.duration_days.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-medium">
                        Mô tả <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="description"
                        control={control}
                        rules={{ required: "Vui lòng nhập mô tả" }}
                        render={({ field }) => (
                            <TextArea
                                {...field}
                                rows={4}
                                placeholder="Gói VIP cơ bản"
                            />
                        )}
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm">{errors.description.message}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" htmlType="submit" className="bg-blue-500">
                        Tạo mới
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

