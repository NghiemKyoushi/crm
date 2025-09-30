/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Select, Spin } from "antd";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { bankAccountModel } from "@/types/customer-type";
import api from "@/api/axiosClient";
import { useTranslation } from "react-i18next";

export interface BankAccountForm {
  bankId: number;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
}

export interface BankInfo {
  id: number;
  name: string;
  logo: string;
  code: string;
  short_name?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: bankAccountModel) => void;
}

const BankAccountModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const { t } = useTranslation();
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
        .get("features/v1/admin/bank-informations") // actual BANK_INFO URL
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
      bank_id: +values.bankId,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      title={t("customerManage.addBankModal.title")}
      open={open}
      onCancel={onClose}
      footer={null}
      className="rounded-2xl"
    >
      <form onSubmit={handleSubmit(handleFinish)} className="space-y-3">
        <div className="w-full">
          <label className="block font-medium mb-1 w-full">{t("customerManage.addBankModal.bankName")}</label>
          <Controller
            name="bankId"
            control={control}
            rules={{ required: t("customerManage.addBankModal.selectBankRequired") }}
            render={({ field }) =>
              loading ? (
                <Spin />
              ) : (
                <Select
                  {...field}
                  placeholder={t("customerManage.addBankModal.selectBank")}
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

        <div>
          <label className="block font-medium mb-1">{t("customerManage.addBankModal.accountNumber")}</label>
          <Controller
            name="accountNumber"
            control={control}
            rules={{ required: t("customerManage.addBankModal.accountNumberRequired") }}
            render={({ field }) => <Input {...field} placeholder={t("customerManage.addBankModal.accountNumberPlaceholder")} />}
          />
          {errors.accountNumber && (
            <p className="text-red-500 text-sm">{errors.accountNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">{t("customerManage.addBankModal.accountHolder")}</label>
          <Controller
            name="accountHolder"
            control={control}
            rules={{ required: t("customerManage.addBankModal.accountHolderRequired") }}
            render={({ field }) => <Input {...field} placeholder={t("customerManage.addBankModal.accountHolderPlaceholder")} />}
          />
          {errors.accountHolder && (
            <p className="text-red-500 text-sm">{errors.accountHolder.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">{t("customerManage.addBankModal.branch")}</label>
          <Controller
            name="branch"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder={t("customerManage.addBankModal.branchPlaceholder")} />
            )}
          />
        </div>

        <div className="bg-blue-50 text-blue-600 text-sm p-2 rounded-md">
          <b>{t("customerManage.addBankModal.noteLabel")}</b> {t("customerManage.addBankModal.note")}
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>{t("customerManage.addBankModal.cancel")}</Button>
          <Button type="primary" htmlType="submit">
            {t("customerManage.addBankModal.saveAccount")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BankAccountModal;
