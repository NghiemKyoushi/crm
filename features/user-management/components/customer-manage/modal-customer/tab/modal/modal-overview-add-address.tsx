import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { addressModel } from "@/types/customer-type";

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
    <Modal footer={null} title="Thêm địa chỉ mới" open={open} onCancel={onClose} >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-2">
        <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
          <Input placeholder="0123456789" />
        </Form.Item>

        <Form.Item label="Số nhà" name="address">
          <Input placeholder="VD: 263 Đặng Văn Bi" />
        </Form.Item>

        <Form.Item label="Tỉnh/TP" name="province" rules={[{ required: true, message: "Chọn Tỉnh/TP" }]}>
          <Select placeholder="Chọn Tỉnh/TP" onChange={handleProvinceChange} allowClear>
            {provinces.map((p) => (
              <Select.Option key={p.code} value={p.code}>
                {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Phường/Xã" name="ward" rules={[{ required: true, message: "Chọn Phường/Xã" }]}>
          <Select placeholder="Chọn Phường/Xã" disabled={!wards.length} allowClear showSearch>
            {wards.map((w) => (
              <Select.Option key={w.code} value={w.code}>
                {w.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <p className="text-red-500 text-sm">
          Vui lòng nhập địa chỉ theo đơn vị hành chính mới sau khi sáp nhập 34 tỉnh thành (01/07/2025).
        </p>

        <div className="flex justify-end gap-2 pt-3">
          <Button  onClick={onClose}>Hủy</Button>
          <Button type="primary">
            Lưu địa chỉ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddressModal;
