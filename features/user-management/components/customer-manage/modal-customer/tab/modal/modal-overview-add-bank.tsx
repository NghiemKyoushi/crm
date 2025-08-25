/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Select, Spin } from "antd";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { bankAccountModel } from "@/types/customer-type";
import api from "@/api/axiosClient";

interface BankAccountForm {
  bankId: number;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
}

interface BankInfo {
  id: number;
  name: string;
  logo: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: bankAccountModel) => void;
}

const BankAccountModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [bankList, setBankList] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountForm>();

  useEffect(() => {
    if (open) {
      setLoading(true);
      api
        .get("features/v1/admin/bank-informations") // hoặc URL thực tế của BANK_INFO
        .then((res) => {
          setBankList(res.data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleFinish = (values: BankAccountForm) => {
    onSubmit({
      account_holder_name: values.accountHolder,
      account_number: values.accountNumber,
      active: true,
      bank_id: values.bankId,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      title="Thêm tài khoản ngân hàng"
      open={open}
      onCancel={onClose}
      footer={null}
      className="rounded-2xl"
    >
      <form onSubmit={handleSubmit(handleFinish)} className="space-y-3">
        {/* Chọn ngân hàng */}
        <div className="w-full">
          <label className="block font-medium mb-1 w-full">Tên ngân hàng</label>
          <Controller
            name="bankId"
            control={control}
            rules={{ required: "Vui lòng chọn ngân hàng" }}
            render={({ field }) =>
              loading ? (
                <Spin />
              ) : (
                <Select
                  {...field}
                  placeholder="Chọn ngân hàng"
                  optionLabelProp="label"
                  showSearch
                  className="w-full"
                  filterOption={(input, option) =>
                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {bankList.map((bank) => (
                    <Select.Option
                      key={bank.id}
                      value={bank.id}
                      label={
                        <div className="flex items-center gap-2">
                          <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                          <span>{bank.name}</span>
                        </div>
                      }
                    >
                      <div className="flex items-center gap-2">
                        <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                        <span>{bank.name}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              )
            }
          />
          {errors.bankId && (
            <p className="text-red-500 text-sm">{errors.bankId.message}</p>
          )}
        </div>

        {/* Số tài khoản */}
        <div>
          <label className="block font-medium mb-1">Số tài khoản</label>
          <Controller
            name="accountNumber"
            control={control}
            rules={{ required: "Vui lòng nhập số tài khoản" }}
            render={({ field }) => <Input {...field} placeholder="Nhập số tài khoản" />}
          />
          {errors.accountNumber && (
            <p className="text-red-500 text-sm">{errors.accountNumber.message}</p>
          )}
        </div>

        {/* Chủ tài khoản */}
        <div>
          <label className="block font-medium mb-1">Chủ tài khoản</label>
          <Controller
            name="accountHolder"
            control={control}
            rules={{ required: "Vui lòng nhập tên chủ tài khoản" }}
            render={({ field }) => <Input {...field} placeholder="Tên chủ tài khoản" />}
          />
          {errors.accountHolder && (
            <p className="text-red-500 text-sm">{errors.accountHolder.message}</p>
          )}
        </div>

        {/* Chi nhánh */}
        <div>
          <label className="block font-medium mb-1">Chi nhánh</label>
          <Controller
            name="branch"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Tên chi nhánh (không bắt buộc)" />
            )}
          />
        </div>

        {/* Ghi chú */}
        <div className="bg-blue-50 text-blue-600 text-sm p-2 rounded-md">
          <b>Lưu ý:</b> Thông tin tài khoản ngân hàng sẽ được bảo mật và chỉ sử dụng để rút tiền.
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu tài khoản
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BankAccountModal;
