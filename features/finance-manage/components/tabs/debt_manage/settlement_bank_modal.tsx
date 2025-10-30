import { faChevronLeft, faQrcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, List, Modal } from "antd";
import React, { useState } from "react";


const banks = [
    {
      code: "VCB",
      name: "Vietcombank",
      accountName: "Công ty TNHH ABC",
      accountNumber: "0123456789",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Logo_Vietcombank.png",
      qr: "https://api.qrserver.com/v1/create-qr-code/?data=VCB0123456789&type=VCB",
    },
    {
      code: "TCB",
      name: "Techcombank",
      accountName: "Công ty TNHH ABC",
      accountNumber: "9876543210",
      logo: "https://techcombank.com.vn/themes/custom/techcombank/favicon.ico",
      qr: "https://api.qrserver.com/v1/create-qr-code/?data=TCB9876543210&type=TCB",
    },
    {
      code: "VTB",
      name: "Vietinbank",
      accountName: "Công ty TNHH ABC",
      accountNumber: "5566778899",
      logo: "https://seeklogo.com/images/V/vietinbank-logo-64A22AE435-seeklogo.com.png",
      qr: "https://api.qrserver.com/v1/create-qr-code/?data=VTB5566778899&type=VTB",
    },
  ];

export const SettlementBankModal = ({
    visible,
    onClose,
    selectedDebt,
  }: {
    visible: boolean;
    onClose: () => void;
    selectedDebt: any;
  }) => {
    const [selectedBank, setSelectedBank] = useState<any>(null);
  
    const handleBankClick = (bank: any) => {
      setSelectedBank(bank);
    };
  
    const handleBackToBanks = () => {
      setSelectedBank(null);
    };
  
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        title={
          !selectedBank ? (
            <div className="font-semibold text-base">Chọn ngân hàng để tất toán</div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                icon={<FontAwesomeIcon icon={faChevronLeft} />}
                size="small"
                onClick={handleBackToBanks}
              />
              <span>Thanh toán qua {selectedBank.name}</span>
            </div>
          )
        }
        width={600}
        destroyOnClose
        centered
        bodyStyle={{
          padding: "5px",
          maxHeight: "70vh",
          overflowY: "auto"
        }}
      >
        {!selectedBank ? (
          <div className="max-h-[60vh] overflow-y-auto">
            <List
              itemLayout="horizontal"
              dataSource={banks}
              renderItem={bank => (
                <List.Item
                  className="hover:bg-gray-50 rounded-lg cursor-pointer transition !p-3" 
                  onClick={() => handleBankClick(bank)}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={bank.logo} size="large" />}
                    title={<span className="font-medium">{bank.name}</span>}
                    description={
                      <span>
                        <span className="text-xs text-gray-500">Số tài khoản: </span>
                        <span className="font-medium">{bank.accountNumber}</span>
                      </span>
                    }
                  />
                  <FontAwesomeIcon icon={faQrcode} className="text-2xl text-green-500" />
                </List.Item>
              )}
            />
          </div>
        ) : (
          <div className="flex flex-row gap-6 pt-2 min-h-[270px]">
            <div className="flex flex-col justify-center flex-1 text-sm gap-2">
              <span>
                <b>Ngân hàng:</b> {selectedBank.name}
              </span>
              <span>
                <b>Chủ TK:</b> {selectedBank.accountName}
              </span>
              <span>
                <b>Số tài khoản:</b> {selectedBank.accountNumber}
              </span>
              <span>
                <b>Số tiền tất toán:</b>{" "}
                <span className="text-red-600 font-semibold">
                  {selectedDebt?.debt?.toLocaleString()} ₫
                </span>
              </span>
              <span>
                <b>Nội dung:</b> TT-{selectedDebt?.key}
              </span>
              <div className="flex gap-3 mt-5 md:mt-7">
                <Button type="primary" onClick={() => {/* TODO: xác nhận logic */}}>
                  Xác nhận đã chuyển
                </Button>
                <Button onClick={onClose}>
                  Huỷ
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <img
                src={selectedBank.qr}
                alt="QR"
                className="w-56 h-56 object-contain bg-white border p-3 rounded-2xl shadow-lg"
              />
            </div>
          </div>
        )}
      </Modal>
    );
  };
  