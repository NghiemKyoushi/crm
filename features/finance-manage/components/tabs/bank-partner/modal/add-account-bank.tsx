/* eslint-disable @next/next/no-img-element */
import api from "@/api/axiosClient";
import { getDetailBankCreateAccount, getListBankPermission, getListPartner } from "@/features/finance-manage/apis";
import { BankInfo } from "@/features/user-management/components/customer-manage/modal-customer/tab/modal/modal-overview-add-bank";
import { BankSettingAccountModel } from "@/types/deposit-type";
import { Modal, Form, Input, Select, Button, Spin, InputNumber } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const { Option } = Select;

// Dùng tạm cấu trúc partner: id, name (real API hoặc fake/mock tuỳ hệ thống)
export interface Partner {
  email: string;
  id: string
}

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
        status: values.status,
        description: values.description,
        partner_name: values.partner_name,
        telegram_channel_id: values.telegram_channel_id,
        per_transaction_limit_vnd: +values.per_transaction_limit_vnd, // Thêm field Giới hạn trên lần
        partner_id: values.partner_id, // Thêm partner_id vào request nếu backend dùng field này.
      };
      onOk?.(request);
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  const [bankList, setBankList] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // State cho danh sách đối tác
  const [partnerList, setPartnerList] = useState<Partner[]>([]);
  const [loadingPartner, setLoadingPartner] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      api
        .get("features/v1/admin/bank-informations")
        .then((res) => {
          setBankList(res.data.data);
        })
        .finally(() => setLoading(false));

      // Fake API/hoặc gọi API, ví dụ: features/v1/admin/partners - tuỳ spec.
      setLoadingPartner(true);
      getListPartner({page: 0,page_size: 10})
        .then((res) => {
          console.log('res',res);
          
          setPartnerList(res.data || []);
        })
        .catch(() => setPartnerList([]))
        .finally(() => setLoadingPartner(false));
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
            per_transaction_limit_vnd: data.per_transaction_limit_vnd,
            status: data.status,
            description: data.description,
            partner_name: data.partner_name,
            telegram_channel_id: data.telegram_channel_id,
            partner_id: data.partner_id, // prefill partner nếu available
          });
        })
        .finally(() => setDetailLoading(false));
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({ status: "ACTIVE" });
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
      style={{ maxHeight: '98vh', overflowY: 'auto' }} // Sử dụng dạng style và 80vh
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
        }}
        style={{ marginBottom: 12 }}
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
          label="Tên gợi nhớ"
          name="partner_name"
          rules={[{ required: true, message: "Vui lòng nhập tên gợi nhớ" }]}
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          style={{ marginBottom: 12 }}
        >
          <TextArea placeholder="" rows={2} minLength={500} />
        </Form.Item>

        <Form.Item
          label={t('table.dailyLimit')}
          name="limit"
          style={{ marginBottom: 12 }}
        >
          <InputNumber
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            placeholder="VD: 500,000,000"
            className="!w-full"
          />
        </Form.Item>

        {/* Thêm field Giới hạn trên lần (VND) */}
        <Form.Item
          label="Giới hạn trên lần (VND)"
          name="per_transaction_limit_vnd"
          style={{ marginBottom: 12 }}
        >
          <InputNumber
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            placeholder="VD: 100,000,000"
            className="!w-full"
          />
        </Form.Item>

        <Form.Item
          label="GroupID Telegram"
          name="telegram_channel_id"
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="" />
        </Form.Item>

        <Form.Item
          label={t('table.status')}
          name="status"
          style={{ marginBottom: 12 }}
        >
          <Select>
            <Option value="ACTIVE">{t('status.active')}</Option>
            <Option value="INACTIVE">{t('status.inactive')}</Option>
            <Option value="INTERNAL">Internal</Option>
          </Select>
        </Form.Item>

        {/* Select "Chọn đối tác" - partner_id */}
        <Form.Item
          label="Chọn đối tác"
          name="partner_id"
          rules={[{ required: true, message: "Vui lòng chọn đối tác" }]}
          style={{ marginBottom: 12 }}
        >
          {loadingPartner ? (
            <Spin />
          ) : (
            <Select placeholder="Chọn đối tác">
              {partnerList.map((partner) => (
                <Select.Option key={partner.id} value={partner.id}>
                  {partner.email}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>

      </Form>
    </Modal>
  );
}
