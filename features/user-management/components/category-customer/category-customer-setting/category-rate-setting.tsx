"use client";

import React, { useEffect, useState } from "react";
import { Form, InputNumber, Button, Card, Alert, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faDollarSign,
  faExchangeAlt,
  faSave,
  faUser,
  faYenSign,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CurrencyRate } from "@/types/setting";
import {
  getListExchangRateEachCategory,
  updateListExchangRate,
  updateListExchangRateCategory,
} from "@/features/settings/apis/setting";
import { toast } from "react-toastify";

interface ExchangeRateFormValues {
  usdToVnd: number;
  jpyToVnd: number;
}

const ExchangeRateSettings: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const { t } = useTranslation();
  const [form] = Form.useForm<ExchangeRateFormValues>();
  const [rateList, setRateList] = useState<CurrencyRate[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>(rateList);

  const handleGetListRate = async (idCate: number) => {
    const listRateExchange = await getListExchangRateEachCategory(+idCate);
    setRateList(listRateExchange);
    setRates(listRateExchange);
  };
  useEffect(() => {
    if (id) {
      handleGetListRate(+id);
    }
  }, [id]);

  const onFinish = (values: ExchangeRateFormValues) => {
    console.log("Exchange Rate Saved:", values);
    message.success(t('categoryCustomer.exchangeRateUpdateSuccess'));
  };

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
      if (id)
        await updateListExchangRateCategory(id.toString(), {
          data: rates.map((r) => ({
            id: r.id, // cần id
            rate_to_vnd: r.rate_to_vnd,
            currency_code: r.currency_code,
          })),
        });
      toast.success(t('categoryCustomer.exchangeRateUpdateSuccess'));
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="p-6">
      <Card
        className="!p-5 !rounded-lg !border !border-gray-200 !bg-blue-50"
        title={
          <div className="flex items-center gap-2 font-bold text-lg">
            <FontAwesomeIcon icon={faExchangeAlt} />
            {t('categoryCustomer.exchangeRateSettingsTitle')}
          </div>
        }
        extra={
          <Button
            type="primary"
            onClick={() => handleSave()}
            className="!bg-green-600 hover:!bg-green-700"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2 w-4 h-4" />
            {t('categoryCustomer.saveExchangeRate')}
          </Button>
        }
      >
        {/* Alert thông tin */}
        <div className="bg-blue-100 p-4 rounded-lg mb-6 text-sm border-l-4 border-blue-500">
          <div>
            <p className="font-medium text-blue-800 mb-2">
              {t('categoryCustomer.exchangeRateInfo')}
            </p>
            <p className="text-blue-700 mb-2">
              {t('categoryCustomer.exchangeRateDescription1')}
            </p>
            <p className="text-blue-700">
              {t('categoryCustomer.exchangeRateDescription2')}
            </p>
          </div>
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rates &&
              rates.map((item: CurrencyRate, index) => {
                return (
                  <>
                    <Card className="!bg-white !rounded-lg !border !shadow-sm">
                      <div className="font-semibold text-gray-800 mb-4 flex items-center text-base">
                        <FontAwesomeIcon
                          icon={
                            item.currency_code === "USD"
                              ? faDollarSign
                              : faYenSign
                          }
                          className="w-4 h-4 text-green-600"
                        />
                        Tỷ giá {item.currency_code} → VNĐ
                      </div>
                      <p className="block text-gray-600 text-sm font-medium">
                        1 {item.currency_code} = ? VNĐ
                      </p>

                      {/* <Form.Item
                name="usdToVnd"
                rules={[
                  { required: true, message: "Vui lòng nhập tỷ giá USD → VNĐ" },
                  { type: "number", min: 1, message: "Giá trị phải lớn hơn 0" },
                ]}
              > */}
                      <InputNumber
                        className="!w-full !h-[46px]"
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        value={item.rate_to_vnd}
                        placeholder="Nhập tỷ giá USD → VNĐ"
                        onChange={(value) => handleChangeRate(value, index)}
                      />
                      {/* </Form.Item> */}

                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <p>
                          <FontAwesomeIcon
                            icon={faClock}
                            className="w-4 h-4 text-gray-500"
                          />
                          Cập nhật lần cuối: 23/09/2025 14:30
                        </p>
                        <p>
                          <FontAwesomeIcon
                            icon={faUser}
                            className="w-4 h-4 text-gray-500"
                          />
                          Được cập nhật bởi:
                          <span className="font-semibold">Admin</span>
                        </p>
                      </div>
                    </Card>
                  </>
                );
              })}
            {/* <Card className="!bg-white !rounded-lg !border !shadow-sm">
              <div className="font-semibold text-gray-800 mb-4 flex items-center text-base">
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="w-4 h-4 text-green-600"
                />
                Tỷ giá USD → VNĐ
              </div>
              <p className="block text-gray-600 text-sm font-medium">
                1 USD = ? VNĐ
              </p>

              <Form.Item
                name="usdToVnd"
                rules={[
                  { required: true, message: "Vui lòng nhập tỷ giá USD → VNĐ" },
                  { type: "number", min: 1, message: "Giá trị phải lớn hơn 0" },
                ]}
              >
                <InputNumber
                  className="!w-full !h-[46px]"
                  min={0}
                  placeholder="Nhập tỷ giá USD → VNĐ"
                />
              </Form.Item>

              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>
                  <FontAwesomeIcon
                    icon={faClock}
                    className="w-4 h-4 text-gray-500"
                  />
                  Cập nhật lần cuối: 23/09/2025 14:30
                </p>
                <p>
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-4 h-4 text-gray-500"
                  />
                  Được cập nhật bởi:
                  <span className="font-semibold">Admin</span>
                </p>
              </div>
            </Card> */}

            {/* JPY -> VND */}
            {/* <Card>
              <div className="font-semibold text-gray-800 mb-4 flex items-center  text-base">
                <FontAwesomeIcon
                  icon={faYenSign}
                  className="w-4 h-4 text-red-500"
                />
                Tỷ giá JPY → VNĐ
              </div>
              <p className="block text-gray-600 text-sm font-medium">
                1 JPY = ? VNĐ
              </p>

              <Form.Item
                name="jpyToVnd"
                rules={[
                  { required: true, message: "Vui lòng nhập tỷ giá JPY → VNĐ" },
                  { type: "number", min: 1, message: "Giá trị phải lớn hơn 0" },
                ]}
              >
                <InputNumber
                  className="!w-full !h-[46px]"
                  min={0}
                  placeholder="Nhập tỷ giá JPY → VNĐ"
                />
              </Form.Item>

              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>
                  <FontAwesomeIcon
                    icon={faClock}
                    className="w-4 h-4 text-gray-500"
                  />{" "}
                  Cập nhật lần cuối: 23/09/2025 14:30
                </p>
                <p>
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-4 h-4 text-gray-500"
                  />{" "}
                  Được cập nhật bởi:{" "}
                  <span className="font-semibold">Admin</span>
                </p>
              </div>
            </Card> */}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ExchangeRateSettings;
