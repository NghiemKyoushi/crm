import { Select } from "antd";
import { useTranslation } from "react-i18next";

interface Props {
  value: string;
}

export default function CustomerTypeSelect({ value }: Props) {
  const { t } = useTranslation();

  return (
    <Select
      value={value}
      className="min-w-[100px]"
      options={[
        { label: t("customerTable.customerType.vip"), value: "VIP" },
        { label: t("customerTable.customerType.silver"), value: "Bạc" },
        { label: t("customerTable.customerType.gold"), value: "Vàng" },
      ]}
    />
  );
}
