"use client";
import React, { useState } from "react";
import { Modal, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFileExcel, faUpload } from "@fortawesome/free-solid-svg-icons";

interface ImportCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void; // callback khi import thành công
}

const ImportCustomerModal = ({
  open,
  onClose,
  onImport,
}: ImportCustomerModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file: File) => {
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (!isExcel) {
      message.error("Chỉ hỗ trợ file Excel (.xlsx, .xls)!");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 10) {
      message.error("File phải nhỏ hơn 10MB!");
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    return false; // không auto upload
  };

  const handleImport = async () => {
    if (!file) {
      message.warning("Vui lòng chọn file Excel để import!");
      return;
    }
    setLoading(true);
    try {
      // call API import
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onImport(file);
      message.success("Import khách hàng thành công!");
      setFile(null);
      onClose();
    } catch (err) {
      message.error("Import thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="font-bold">Import danh sách khách hàng</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
    >
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
        <FontAwesomeIcon className="text-4xl text-green-500 mb-4" icon={faFileExcel}/>
        <p className="mb-2 font-medium">Chọn file Excel để import</p>
        <p className="text-gray-500 text-sm mb-3">
          Hỗ trợ định dạng <b>.xlsx, .xls</b> (Tối đa 10MB)
        </p>

        <Upload beforeUpload={beforeUpload} maxCount={1} fileList={file ? [file as any] : []} onRemove={() => setFile(null)}>
          <Button type="primary" >
          <FontAwesomeIcon icon={faUpload}/> Chọn file
          </Button>
        </Upload>
      </div>

      {/* Hướng dẫn định dạng file */}
      <div className="bg-blue-50 rounded-md p-4 text-sm mb-4">
        <p className="font-semibold mb-2">Định dạng file Excel yêu cầu:</p>
        <ul className="space-y-1 text-blue-600">
          <li>• Cột A: Họ tên</li>
          <li>• Cột B: Giới tính (Nam/Nữ)</li>
          <li>• Cột C: Ngày sinh (DD/MM/YYYY)</li>
          <li>• Cột D: Địa chỉ</li>
          <li>• Cột E: Số điện thoại</li>
          <li>• Cột F: Email (tùy chọn)</li>
          <li>• Cột G: Nguồn khách hàng (tùy chọn)</li>
          <li>• Cột H: Ghi chú (tùy chọn)</li>
        </ul>
       
      </div>
      <a href="/sample.xlsx" download className="text-blue-600 text-sm underline mt-2 inline-block">
           <FontAwesomeIcon icon={faDownload}/> Tải file mẫu
        </a>

      {/* Footer buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Hủy</Button>
        <Button type="primary" loading={loading} onClick={handleImport}>
          Import
        </Button>
      </div>
    </Modal>
  );
};

export default ImportCustomerModal;
