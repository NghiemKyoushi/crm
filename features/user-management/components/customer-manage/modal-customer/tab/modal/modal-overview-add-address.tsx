import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { addressModel } from "@/types/customer-type";
import { useTranslation } from "react-i18next";

interface Province {
  code: string;
  name: string;
}

interface Ward {
    code: string;                 
    name: string;                 
    englishName?: string;         
    administrativeLevel?: string; 
    provinceCode: string;         
    provinceName: string;         
    districtCode: string;         
    districtName: string;         
    decree?: string;
  }

interface Props {
  open: boolean;
  onClose: () => void;
  handleSubmitDataAddress: (data:addressModel) => void;
}

const AddressModal: React.FC<Props> = ({ open, onClose, handleSubmitDataAddress }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    fetch("/api/address-kit/provinces")
      .then((res) => res.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => {
        setProvinces(data?.provinces)
      })
      .catch((err) => console.error("Fetch provinces error:", err));
  }, [open]);

  const handleProvinceChange = async (provinceCode: string) => {
    setWards([]);
    form.setFieldsValue({ ward: undefined });

    const res = await fetch(`/api/address-kit/communes?provinceID=${provinceCode}`);
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allWards: Ward[] = (data.communes || []).map((w: any) => ({
        code: w.code,
        name: w.name,
        district_code: w.districtCode || "", 
        district_name: w.districtName || "", 
        province_code: w.provinceCode,
        province_name: w.provinceName,
      }))
    
    setWards(allWards || []);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (values: any) => {
    const provinceObj = provinces.find((p) => p.code === values.province);
    const wardObj = wards.find((w) => w.code === values.ward);
    handleSubmitDataAddress({
        address: wardObj && provinceObj ? wardObj.name + " "+ provinceObj.name : '',
        phone_number: values.phone,
        receive_name:  wardObj ? wardObj.name : ''
    })
    onClose();
  };

  return (
    <Modal footer={null} title={t('customerManage.customerOverview.addAddress')} open={open} onCancel={onClose} >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-2">
        <Form.Item label={t('staffManage.fullName')} name="fullName" rules={[{ required: true, message: t('staffManage.fullNameRequired') }]}>
          <Input placeholder={t('placeholder.enterName')} />
        </Form.Item>

        <Form.Item label={t('staffManage.phoneNumber')} name="phone" rules={[{ required: true, message: t('staffManage.phoneNumberRequired') }]}>
          <Input placeholder="0123456789" />
        </Form.Item>

        <Form.Item label={t('validation.address.required')} name="address">
          <Input placeholder={t('placeholder.enterAddress')} />
        </Form.Item>

        <Form.Item label={t('address.province')} name="province" rules={[{ required: true, message: t('address.selectProvince') }]}>
          <Select placeholder={t('address.selectProvince')} onChange={handleProvinceChange} allowClear>
            {provinces.map((p) => (
              <Select.Option key={p.code} value={p.code}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={t('address.ward')} name="ward" rules={[{ required: true, message: t('address.selectWard') }]}>
          <Select placeholder={t('address.selectWard')} disabled={!wards.length} allowClear showSearch>
            {wards.map((w) => (
              <Select.Option key={w.code} value={w.code}>
                {w.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <p className="text-red-500 text-sm">
          {t('address.addressNote')}
        </p>

        <div className="flex justify-end gap-2 pt-3">
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="primary">
            {t('address.saveAddress')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddressModal;
