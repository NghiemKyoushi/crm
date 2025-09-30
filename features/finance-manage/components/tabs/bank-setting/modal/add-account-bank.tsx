/* eslint-disable @next/next/no-img-element */
import api from "@/api/axiosClient";
import { getDetailBankCreateAccount } from "@/features/finance-manage/apis";
import { BankInfo } from "@/features/user-management/components/customer-manage/modal-customer/tab/modal/modal-overview-add-bank";
import { BankSettingAccountModel } from "@/types/deposit-type";
import { Modal, Form, Input, Select, Button, Spin } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const { Option } = Select;

export default function AddBankAccountModal({
  open,
  onCancel,
  onOk,
  record,
}: any) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [detailLoading, setDetailLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const bank = bankList.find((b) => b.id === values.bank_id);
      const request: BankSettingAccountModel = {
        account_holder: values.account_holder,
        account_number: values.account_number,
        bank_code: bank?.code || "",
        bank_name: bank?.name || "",
        daily_limit_vnd: +values.limit,
        is_active: values.status === "active" ? true : false,
      };
      onOk?.(request);
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  const [bankList, setBankList] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      api
        .get("features/v1/admin/bank-informations")
        .then((res) => {
          setBankList(res.data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (open && record?.id) {
      setDetailLoading(true);

      getDetailBankCreateAccount(record.id)
        .then((data) => {
          const bank = bankList.find((b) => b.code === data.bank_code);
          form.setFieldsValue({
            bank_id: bank && bank.id,
            account_number: data.account_number,
            account_holder: data.account_holder,
            limit: data.daily_limit_vnd,
            status: data.is_active ? "active" : "inactive",
          });
        })
        .finally(() => setDetailLoading(false));
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({ status: "active" });
    }
  }, [open, record, form, bankList]);

  const handleClose = () => {
    onCancel();
    form.resetFields();
  };

  return (
    <Modal
      title={t('bankPartner.addNewBankAccount')}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Lưu
        </Button>,
      ]}
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
        }}
      >
        <Form.Item
          label="Tên ngân hàng"
          name="bank_id"
          rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
          style={{ marginBottom: 12 }}
        >
          {loading ? (
            <Spin />
          ) : (
            <Select
              placeholder="Chọn ngân hàng"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              optionLabelProp="label"
              onChange={(value) => {
                const bank = bankList.find((b) => b.id === value);
                if (bank) {
                  form.setFieldsValue({
                    bank_id: bank.id,
                    bank_name: bank.short_name,
                    bank_code: bank.code,
                  });
                }
              }}
            >
              {bankList.map((bank) => (
                <Select.Option key={bank.id} value={bank.id} label={bank.name}>
                  <div className="flex items-center gap-2">
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="w-6 h-6 object-contain"
                    />
                    <span>{bank.name}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          label="Số tài khoản"
          name="account_number"
          rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="VD: 0123456789" />
        </Form.Item>

        <Form.Item
          label="Tên chủ tài khoản"
          name="account_holder"
          rules={[
            { required: true, message: "Vui lòng nhập tên chủ tài khoản" },
          ]}
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="VD: CTY TNHH ORDER SYSTEM" />
        </Form.Item>

        <Form.Item
          label={t('table.dailyLimit')}
          name="limit"
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="VD: 500000000" />
        </Form.Item>

        <Form.Item
          label={t('table.status')}
          name="status"
          style={{ marginBottom: 12 }}
        >
          <Select>
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Ngừng hoạt động</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
