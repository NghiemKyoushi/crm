import React from 'react';
import { Modal, Button, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

// Định nghĩa types cho props và customer
type CustomerStatus = 'Hoạt động' | 'Bị khóa' | string;

interface Customer {
  key: string;
  name: string;
  email: string;
  package: string;
  slot: string;
  violation: string;
  status: CustomerStatus;
}

interface UnlockCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

const UnlockCustomerModal: React.FC<UnlockCustomerModalProps> = ({ isOpen, onClose, customer }) => {
  if (!customer) return null;

  const handleConfirmUnlock = () => {
    // Logic xử lý mở khóa khách hàng
    console.log(`Đang mở khóa khách hàng: ${customer.name}`);
    // Sau khi xử lý:
    // API.unlock(customer.key).then(() => { ... })
    onClose();
    // Thêm thông báo thành công (ví dụ: message.success('Đã mở khóa thành công'))
  };

  return (
    <Modal
      title={
        <span className="text-lg font-bold flex items-center">
          <ExclamationCircleOutlined className="text-red-500 mr-2" />
          Xác nhận Mở khóa Khách hàng
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirmUnlock} danger>
          Mở khóa ngay
        </Button>,
      ]}
    >
      <div className="py-4">
        <Alert
          message="Cảnh báo quan trọng"
          description={`Bạn đang thực hiện mở khóa cho khách hàng ${customer.name} (${customer.email}). 
          Thao tác này sẽ đặt lại trạng thái vi phạm của khách hàng. Khách hàng này đã vi phạm ${customer.violation} lần.`}
          type="error"
          showIcon
          className="mb-4"
        />
        <p className="text-base text-gray-600">
          Vui lòng đảm bảo rằng bạn đã xem xét lý do khóa trước khi tiến hành.
        </p>
      </div>
    </Modal>
  );
};

export default UnlockCustomerModal;