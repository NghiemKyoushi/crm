import React, { useEffect, useState } from "react";
import { Card, Input, Button, List, Typography, InputNumber } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUniversity,
  faGlobe,
  faTags,
  faUsers,
  faLayerGroup,
  faCog,
  faClock,
  faBan,
  faPhone,
  faMapMarked,
  faTeletype,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { getListExchangRate, updateListExchangRate } from "../apis/setting";
import { CurrencyRate } from "@/types/setting";
import { toast } from "react-toastify";

const { Text } = Typography;

const SettingsDetail = () => {
  const router = useRouter();
  const [rateList, setRateList] = useState<CurrencyRate[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>(rateList);

  const handleGetListRate = async () => {
    const listRateExchange = await getListExchangRate();
    setRateList(listRateExchange);
    setRates(listRateExchange);
  };

  useEffect(() => {
    handleGetListRate();
  }, []);

  const handleChangeRate = (value: number | null, index: number) => {
    setRates((prev) => {
      const newRates = [...prev];
      newRates[index] = {
        ...newRates[index],
        rate_to_vnd: value ?? 0,
      };
      return newRates;
    });
  };

  const handleSave = async () => {
    try {
      await updateListExchangRate({
        data: rates.map((r) => ({
          id: r.id, // cần id
          rate_to_vnd: r.rate_to_vnd,
          currency_code: r.currency_code
        })),
      });
      toast.success("Cập nhật tỉ giá thành công!");
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card
        title={<div className="text-[18px]">Cài đặt tài chỉnh</div>}
        className="rounded-2xl shadow-md"
      >
        <Text strong>Tỷ giá ngoại tệ thống nhất</Text>
        <div className="bg-blue-50  border-l-4 border-blue-400  p-3 rounded-md my-3 text-sm">
          <strong className=" text-blue-800">Lưu ý quan trọng:</strong> <br />
          <span className=" text-blue-700">
            Tỷ giá này sẽ được áp dụng thống nhất cho tất cả khách hàng và mọi
            giao dịch trong hệ thống. Không có cài đặt tỷ giá riêng cho từng
            khách hàng.{" "}
          </span>
          <br />
          <span className=" text-blue-700">
            Tỷ giá áp dụng theo ngày mua hàng và được cập nhật trên trang chủ
            Dreamcargo.vn
          </span>
        </div>

        <div className="flex gap-4 mb-3 w-full">
          {rates &&
            rates.map((item: CurrencyRate, index) => {
              return (
                <>
                  <div
                    key={item.currency_code}
                    className="flex items-start flex-col gap-0 flex-1"
                  >
                    <p className="!mb-1">1 {item.currency_code} = (VND)</p>
                    <InputNumber
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      value={item.rate_to_vnd}
                      onChange={(value) => handleChangeRate(value, index)}
                      className="!w-full"
                    />
                  </div>
                </>
              );
            })}
        </div>

        <div className="text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2 text-gray-700">
            <FontAwesomeIcon className="w-4 h-4" icon={faClock} />
            <span>Cập nhật lần cuối: 08/08/2025 14:30 bởi Admin</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FontAwesomeIcon className="w-4 h-4" icon={faUsers} />
            <span>Áp dụng cho: Tất cả khách hàng</span>
          </div>
        </div>

        <div className="w-full mt-4 mb-4">
          <Button
            size="large"
            className="!w-full !border-0 !bg-gray-50 !hover:bg-gray-100 !font-medium !p-3 !flex items-center gap-2"
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faUniversity} />}
          >
            <span className="text-left w-full">
              Quản lý Tài khoản Ngân hàng
            </span>
          </Button>
        </div>
        <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-3">
          <p className="font-semibold text-green-700 !mb-1">
            <FontAwesomeIcon icon={faPhone} /> Thông tin Liên hệ
          </p>
          <p className="flex items-center gap-2 text-green-700 text-sm !mb-1">
            <FontAwesomeIcon icon={faMapMarked} /> N02-T3 Khu Ngoại Giao Đoàn,
            Xuân Tảo, Bắc Từ Liêm, Hà Nội
          </p>
          <p className="flex items-center gap-2 text-green-700 text-sm !mb-1">
            <FontAwesomeIcon icon={faPhone} /> Hotline:{" "}
            <span className="font-bold">096.55.44444</span>
          </p>
          <p className="flex items-center gap-2 text-green-700 text-sm !mb-1">
            <FontAwesomeIcon icon={faTeletype} /> Zalo:{" "}
            <span className="font-bold">097.11.68686</span>
          </p>
        </div>
        <div className="w-full flex justify-end mt-2 ">
          <Button
            type="primary"
            className="!font-medium"
            onClick={() => handleSave()}
          >
            Lưu Tỷ giá
          </Button>
        </div>
      </Card>
      <Card
        title={<div className="text-[18px]">Cài đặt Phí Dịch vụ</div>}
        className="relative rounded-2xl shadow-md h-full"
      >
        <div className="pb-16">
          <div className="text-gray-600 mb-3">
            Thiết lập các loại phí mặc định của hệ thống. Các chính sách phí
            riêng cho từng loại khách hàng sẽ ghi đè lên các cài đặt này.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="list-disc pl-5 text-gray-700">
              <li>Phí mua hộ Mỹ: 4%</li>
              <li>Phí mua hộ Nhật: từ 3%</li>
              <li>Phí vận chuyển quốc tế</li>
              <li>Phụ phí theo loại sản phẩm</li>
            </ul>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Phí gia cố: 5.000 VNĐ/Kg</li>
              <li>Phí bảo hiểm: 3%</li>
              <li>Phí giao hàng Hà Nội</li>
              <li>Phí lưu kho: 1.000 VNĐ/kg/ngày</li>
            </ul>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            size="large"
            className="!w-full !justify-center !border-0 !bg-blue-50 !text-blue-600 hover:!bg-blue-100 !font-medium"
            type="dashed"
            onClick={() => router.push("/fee-setting")}
            icon={<FontAwesomeIcon className="w-4 h-4" icon={faCog} />}
          >
            Đi đến trang Quản lý Phí
          </Button>
        </div>
      </Card>

      <Card title="Cài đặt Vận hành Đơn hàng" className="rounded-2xl shadow-md">
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              icon: faGlobe,
              text: "Quản lý Website được hỗ trợ",
              url: "/website-manage",
            },
            {
              icon: faTags,
              text: "Quản lý Loại sản phẩm & Phí",
              url: "/website-manage",
            },
          ]}
          className="!flex !flex-col !gap-1"
          renderItem={(item) => (
            <List.Item className="!cursor-pointer  !w-full !rounded-md !border-0  !bg-gray-50 !hover:bg-gray-100 !font-medium !mb-2 !h-12 !pl-2 ">
              <List.Item.Meta
                avatar={
                  <FontAwesomeIcon
                    className="w-4 h-4 mt-1 ml-2"
                    icon={item.icon}
                  />
                }
                title={
                  <div
                    onClick={() => router.push(item.url)}
                    className="text-[16px]"
                  >
                    {item.text}
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
          <p className="font-semibold text-red-700 !mb-1">
            <FontAwesomeIcon icon={faBan} /> Hàng hóa Không nhận vận chuyển
          </p>
          <p className="text-sm text-red-700 leading-relaxed">
            Hàng dạng xịt, hàng dễ cháy nổ, vũ khí, văn hóa phẩm đồi trụy, thiết
            bị y tế, ô tô, xe máy, thuốc lá điện tử, vape, ma túy, ngoại tệ,
            vàng, kim cương.
          </p>
        </div>
      </Card>

      <Card
        title="Cài đặt Quản trị Người dùng"
        className="rounded-2xl shadow-md"
      >
        <List
          itemLayout="horizontal"
          dataSource={[
            { icon: faLayerGroup, text: "Phân loại Khách hàng & Chính sách" },
            { icon: faUsers, text: "Nhân viên & Phân quyền" },
          ]}
          className="!flex !flex-col !gap-1 "
          renderItem={(item) => (
            <List.Item className="!cursor-pointer !w-full !rounded-md !border-0  !bg-gray-50 !hover:bg-gray-100 !font-medium !mb-2 !h-12 !pl-2 !text-base">
              <List.Item.Meta
                avatar={
                  <FontAwesomeIcon
                    className="w-4 h-4  mt-1 ml-2"
                    icon={item.icon}
                  />
                }
                title={<div className="text-[16px]">{item.text}</div>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default SettingsDetail;
