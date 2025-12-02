import React, { useEffect, useState } from "react";
import { Card, Input, Button, List, Typography, InputNumber } from "antd";
import { AppstoreOutlined, BankOutlined, ClockCircleOutlined, EnvironmentOutlined, GlobalOutlined, PhoneOutlined, SendOutlined, SettingOutlined, StopOutlined, TagsOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  getListExchangRate,
  updateListExchangRate,
  getTelegramSetting,
  setTelegramSetting,
} from "../apis/setting";
import { CurrencyRate } from "@/types/setting";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Text } = Typography;

const SettingsDetail = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [rateList, setRateList] = useState<CurrencyRate[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>(rateList);
  // Thêm state cho TelegramId
  const [telegramId, setTelegramId] = useState<string>("");
  const [telegramIdLoading, setTelegramIdLoading] = useState<boolean>(false);

  const handleGetListRate = async () => {
    const listRateExchange = await getListExchangRate();
    setRateList(listRateExchange);
    setRates(listRateExchange);
  };

  // Thêm hàm lấy TelegramId từ API
  const handleGetTelegramSetting = async () => {
    try {
      const data = await getTelegramSetting();
      if (data[0]?.key) {
        setTelegramId(data[0]?.value);
      } else {
        setTelegramId("");
      }
    } catch (e) {
      setTelegramId("");
    }
  };

  useEffect(() => {
    handleGetListRate();
    handleGetTelegramSetting();
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
          id: r.id,
          rate_to_vnd: r.rate_to_vnd,
          currency_code: r.currency_code,
        })),
      });
      toast.success(t("settings.exchangeRateUpdateSuccess"));
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  // Cập nhật lại lưu TelegramId dùng API setTelegramSetting
  const handleSaveTelegramId = async () => {
    setTelegramIdLoading(true);
    try {
      await setTelegramSetting(telegramId);
      toast.success("Lưu TelegramId thành công!");
    } catch (e) {
      toast.error("Lưu TelegramId thất bại!");
    }
    setTelegramIdLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card
        title={
          <div className="text-base font-medium text-gray-800">
            {t("settings.financialSettings")}
          </div>
        }
        className="rounded-lg shadow-sm"
      >
        {/* PHẦN 1: Cập nhật tỷ giá quy đổi */}
        <div className="mb-8">
          <div className="text-sm font-semibold text-gray-700 mb-4">
            {"Cập nhật tỷ giá quy đổi"}
          </div>
          <div className="flex gap-3 mb-6 w-full">
            {rates &&
              rates.map((item: CurrencyRate, index) => {
                return (
                  <div
                    key={item.currency_code}
                    className="flex items-start flex-col gap-1 flex-1"
                  >
                    <label className="text-xs text-gray-600 mb-1">
                      1 {item.currency_code} = (VND)
                    </label>
                    <InputNumber
                      size="large"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value?.replace(/,/g, "") as any}
                      value={item.rate_to_vnd}
                      onChange={(value) => handleChangeRate(value, index)}
                      className="!w-full"
                    />

                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      <p>
                        <ClockCircleOutlined className="w-4 h-4 text-gray-500" />
                        Cập nhật lần cuối:{" "}
                        {item.updated_at
                          ? dayjs(item.updated_at).format("DD/MM/YY")
                          : "-"}
                      </p>
                      <p>
                        <UserOutlined className="w-4 h-4 text-gray-500" />
                        Được cập nhật bởi:
                        <span className="font-semibold">{item.full_name}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="w-full flex justify-end">
            <Button type="primary" size="large" onClick={() => handleSave()}>
              {t("settings.saveExchangeRate")}
            </Button>
          </div>
        </div>

        {/* PHẦN 2: Cấu hình TelegramId nhận cảnh báo */}
        <div className="border-t border-dashed border-gray-200 pt-7">
          <div className="text-sm font-semibold text-gray-700 mb-4">
            {"Cấu hình TelegramId nhận thông báo"}
          </div>
          <div className="flex items-end gap-3 mb-6 w-full">
            <div className="flex flex-col flex-1">
              {/* <label className="text-xs text-gray-600 mb-1" htmlFor="telegramId">
                TelegramId
              </label> */}
              <Input
                id="telegramId"
                size="large"
                placeholder="Nhập TelegramId"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                className="!w-full"
                disabled={telegramIdLoading}
              />
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleSaveTelegramId}
              loading={telegramIdLoading}
              icon={<SendOutlined />}
            >
              Lưu
            </Button>
          </div>
        </div>
      </Card>
      <Card
        title={
          <div className="text-base font-medium text-gray-800">
            {t("settings.serviceFeesSettings")}
          </div>
        }
        className="relative rounded-lg shadow-sm h-full"
      >
        <div className="bottom-4 left-4 right-4 flex flex-col gap-3">
          <div className="w-full">
            <Button
              size="large"
              onClick={() => router.push("/finance-management")}
              className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
              icon={<BankOutlined style={{ fontSize: 16 }} />}
            >
              <span className="text-sm">
                {t("settings.bankAccountManagement")}
              </span>
            </Button>
          </div>
          <Button
            size="large"
            onClick={() => router.push("/website-manage")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<GlobalOutlined style={{ fontSize: 16 }} />}
          >
            <span className="text-sm">
              {t("settings.supportedWebsiteManagement")}
            </span>
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/fee-setting")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<TagsOutlined style={{ fontSize: 16 }} />}
          >
            <span className="text-sm">{t("settings.productTypesAndFees")}</span>
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/user-management")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<AppstoreOutlined style={{ fontSize: 16 }} />}
          >
            <span className="text-sm">
              {t("settings.customerCategoriesAndPolicies")}
            </span>
          </Button>
          <Button
            size="large"
            onClick={() => router.push("/user-management")}
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            icon={<TeamOutlined style={{ fontSize: 16 }} />}
          >
            <span className="text-sm">{t("settings.staffAndPermissions")}</span>
          </Button>
          <Button
            size="large"
            className="!w-full !justify-start !border-0 !bg-gray-50 !hover:bg-gray-100 !text-gray-800 !h-12"
            onClick={() => router.push("/fee-setting")}
            icon={<SettingOutlined style={{ fontSize: 16 }} />}
          >
            <span className="text-sm">{t("settings.goToFeeManagement")}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsDetail;
