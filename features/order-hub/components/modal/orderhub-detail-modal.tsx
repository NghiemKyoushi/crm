import React from "react";
import { Modal, Button, Divider } from "antd";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
}

const OrderDetailModal = (props: OrderDetailModalProps) => {
  const { onClose, open } = props;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={<span className="font-bold text-lg">Chi tiết Đơn hàng</span>}
    >
      <div className="grid grid-cols-3 gap-4">
        {/* Bảng chiết tính tài chính */}
        <div className="col-span-2  rounded-lg  shadow-sm">
          <div className="border-b border-b-gray-100 bg-gray-50 px-3 py-2 rounded-t-lg ">
            <h3 className="font-semibold">Bảng chiết tính tài chính</h3>
          </div>
          <div className="p-2">
            <div className="flex justify-between mb-1">
              <span>Tiền hàng:</span>
              <span>15,000,000 đ</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Phí mua hộ:</span>
              <span>150,000 đ</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Phí vận chuyển QT:</span>
              <span>100,000 đ</span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between font-bold text-blue-600">
              <span>Tổng tiền:</span>
              <span>15,250,000 đ</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Đã cọc:</span>
              <span>9,150,000 đ</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Còn lại phải trả:</span>
              <span>6,100,000 đ</span>
            </div>
          </div>
        </div>

        {/* Thông tin chung */}
        <div className="col-span-1  rounded-lg  shadow-sm">
          <div className="bg-gray-50 px-3 py-2 rounded-t-lg border-b border-b-gray-100">
            <h3 className="font-semibold mb-3">Thông tin chung</h3>
          </div>
          <div className="p-2">
            <div className="text-sm space-y-1">
              <p>
                <b>Khách hàng:</b> Nguyễn Văn A
              </p>
              <p>
                <b>Nguồn:</b> Amazon (Mỹ)
              </p>
              <p>
                <b>Vận chuyển:</b> SEA
              </p>
              <p>
                <b>Ngày tạo:</b> 05/08/2025
              </p>
              <p>
                <b>Sales:</b> Nguyễn Văn An
              </p>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between text-blue-600 font-bold">
              <span>Tổng tiền:</span>
              <span>15,250,000 đ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4 mt-3">
        <div className="rounded-lg  shadow-sm mb-4 flex-[1] h-24">
          <div className="bg-gray-50 px-3 py-2 rounded-t-lg border-b border-b-gray-100">
            <h3 className="font-semibold mb-2">Danh sách sản phẩm</h3>
          </div>
          <p className="p-2">Sản phẩm A, Sản phẩm B...</p>
        </div>
        <div className="rounded-lg  shadow-sm flex-[1] h-24">
          <div className="bg-gray-50 px-3 py-2 rounded-t-lg border-b border-b-gray-100">
            <h3 className="font-semibold mb-2">Thông tin kiện hàng</h3>
          </div>
          <p className="p-2">
            Mã kiện: <b>MK12345</b>, Cân nặng: <b>2.5 Kg</b>
          </p>
        </div>
      </div>
      <div className=" h-full">
        <div className="rounded-lg  pb-2 shadow-sm">
          <div className="bg-gray-50 px-3 py-2 rounded-t-lg border-b border-b-gray-100 mb-3">
            <h3 className="font-semibold mb-6">Timeline trạng thái</h3>
          </div>
          <ol className="relative flex items-center w-full">
            {/* Thanh line */}
            <div className="absolute top-2 left-0 w-full h-0.5 bg-gray-300"></div>

            <li className="relative flex-1 text-center">
              <div className="relative flex flex-col items-center">
                <div className="z-10 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                <time className="mt-2 text-xs text-gray-500">05/08/2025</time>
                <p className="text-sm font-medium">Đã đặt cọc</p>
              </div>
            </li>

            <li className="relative flex-1 text-center">
              <div className="relative flex flex-col items-center">
                <div className="z-10 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                <time className="mt-2 text-xs text-gray-500">06/08/2025</time>
                <p className="text-sm font-medium">Đã mua hàng</p>
              </div>
            </li>

            <li className="relative flex-1 text-center">
              <div className="relative flex flex-col items-center">
                <div className="z-10 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                <time className="mt-2 text-xs text-gray-500">Chờ cập nhật</time>
                <p className="text-sm font-medium">Hàng về kho</p>
              </div>
            </li>
            <li className="relative flex-1 text-center">
              <div className="relative flex flex-col items-center">
                <div className="z-10 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                <time className="mt-2 text-xs text-gray-500">Chờ cập nhật</time>
                <p className="text-sm font-medium">Đang giao</p>
              </div>
            </li>
            <li className="relative flex-1 text-center">
              <div className="relative flex flex-col items-center">
                <div className="z-10 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                <time className="mt-2 text-xs text-gray-500">Chờ cập nhật</time>
                <p className="text-sm font-medium">Đang giao</p>
              </div>
            </li>
            <li className="relative flex-1 text-center">
              <div className="relative flex flex-col items-center">
                <div className="z-10 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                <time className="mt-2 text-xs text-gray-500">Chờ cập nhật</time>
                <p className="text-sm font-medium">Đang giao</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
      <div className=" rounded-lg  shadow-sm">
        <h3 className="font-semibold mb-2">Ghi chú nội bộ</h3>
        <textarea
          placeholder="Nhập ghi chú..."
          className="w-full border border-blue-200 rounded-md p-2 text-sm"
        />
        <div className="w-full">
            <Button type="primary" className="mt-2">
          Lưu
        </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
