"use client";
import React from "react";
import { Modal, Button, Divider, Checkbox } from "antd";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
}

const OrderDetailModal = ({ open, onClose }: OrderDetailModalProps) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      title={<span className="font-bold text-lg">Chi tiết Đơn hàng</span>}
      styles={{
        body: {
          maxHeight: "80vh",
          overflowY: "auto",
          paddingRight: "8px",
          overflowX: "hidden",
        },
      }}
    >
      {/* Grid 2 cột chính */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cột trái */}
        <div className="space-y-4">
          {/* Thông tin Đơn hàng */}
          <div className="rounded-lg shadow-sm">
            <div className="px-3 py-2 border-b-gray-50 bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold">Thông tin Đơn hàng</h3>
            </div>
            <div className="p-3 text-sm space-y-1">
              <p className="flex justify-between">
                <b>Mã đơn:</b>{" "}
                <p className="text-blue-600 cursor-pointer">#DH-0804-1</p>
              </p>
              <p className="flex justify-between">
                <b>Ngày tạo:</b> 17/9/2025
              </p>
              <p className="flex justify-between">
                <b>Khách hàng:</b> Trần Văn G (SC247)
              </p>
              <p className="flex justify-between">
                <b>Trạng thái:</b>{" "}
                <span className="text-red-500 font-medium">Đợi thanh toán</span>
              </p>
            </div>
          </div>

          {/* Thông tin Sản phẩm */}
          <div className="rounded-lg shadow-sm">
            <div className="px-3 py-2 border-b-gray-50 bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold">Thông tin Sản phẩm</h3>
            </div>
            <div className="p-3 text-sm space-y-1">
              <p>
                <b>Tên sản phẩm:</b> iPhone 15 Pro Max
              </p>
              <p>
                <b>Link sản phẩm:</b>{" "}
                <a
                  href="https://amazon.co.jp/"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  https://amazon.co.jp/
                </a>
              </p>
              <p className="flex justify-between">
                <b>Loại sản phẩm:</b> Điện tử
              </p>
              <p className="flex justify-between">
                <b>Nguồn:</b> Amazon JP ・ Mua thẳng
              </p>
            </div>
          </div>

          {/* Bảo hiểm */}
          <div className="rounded-lg shadow-sm">
            <div className="px-3 py-2 border-b-gray-50 bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold">Bảo hiểm Đơn hàng</h3>
            </div>
            <div className="p-3 text-sm">
              <Checkbox checked> Có bảo hiểm</Checkbox>
              <p className="text-gray-500 text-xs mt-1">
                Bảo hiểm toàn bộ giá trị đơn hàng trong quá trình vận chuyển
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-4">
          {/* Thông tin Tài chính */}
          <div className="rounded-lg shadow-sm">
            <div className="px-3 py-2 border-b-gray-50 bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold">Thông tin Tài chính</h3>
            </div>
            <div className="p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Giá sản phẩm (¥):</span>
                <span>¥150,000</span>
              </div>
              <div className="flex justify-between">
                <span>Giá sản phẩm (VND):</span>
                <span>2,250,000 đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí dịch vụ:</span>
                <span>600,000 đ</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Tổng cộng:</span>
                <span>2,850,000 đ</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="  flex justify-between text-blue-600">
              <span>Tiền cọc:</span>
              <span>1,425,000 đ</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Còn phải trả:</span>
              <span>1,425,000 đ</span>
            </div>
          </div>

          {/* Phí COD */}
          <div className="rounded-lg shadow-sm">
            <div className="px-3 py-2 border-b-gray-50 bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold">Phí COD</h3>
            </div>
            <div className="p-3 text-sm space-y-1">
              <p>
                <b>Loại phí:</b> Tính phí sau
              </p>
              <p>
                <b>Phí COD:</b> Chưa tính
              </p>
            </div>
          </div>

          {/* Vận chuyển */}
          <div className="rounded-lg shadow-sm">
            <div className="px-3 py-2 border-b-gray-50 bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold">Vận chuyển</h3>
            </div>
            <div className="p-3 text-sm space-y-1">
              <p>
                <b>Mã tracking:</b> Chưa có
              </p>
              <p>
                <b>Cân nặng:</b> Chưa cân
              </p>
              <p>
                <b>Phí cân nặng:</b> Chưa tính
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lịch sử đơn hàng */}
      <div className="rounded-lg shadow-sm mt-4">
        <div className="px-3 py-2 border-b-gray-50 bg-gray-50 rounded-t-lg">
          <h3 className="font-semibold">Lịch sử Đơn hàng</h3>
        </div>
        <div className="p-3 text-sm space-y-2">
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>
            <div className="flex flex-row justify-between w-full">
              <div>
                <p className="font-medium">Đơn hàng được tạo</p>
                <p className="text-gray-500 text-xs">
                  Khách hàng đặt đơn hàng iPhone 15 Pro Max
                </p>
              </div>
              <p className="text-xs text-gray-400">10/08/2025 14:30</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1"></span>
            <div className="flex flex-row justify-between w-full">
              <div>
                <p className="font-medium">Đơn hàng được tạo</p>
                <p className="text-gray-500 text-xs">
                  Khách hàng đặt đơn hàng iPhone 15 Pro Max
                </p>
              </div>
              <p className="text-xs text-gray-400">10/08/2025 14:30</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ghi chú */}
      <div className="rounded-lg shadow-sm mt-4 p-3">
        <h3 className="font-semibold mb-2">Ghi chú</h3>
        <textarea
          placeholder="Nhập ghi chú..."
          className="w-full border border-blue-400 rounded-md p-2 text-sm"
        />
        <div className="flex justify-end">
          <Button type="primary" className="mt-2">
            Lưu
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
