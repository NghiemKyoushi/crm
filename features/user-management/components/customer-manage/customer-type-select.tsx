import { useTranslation } from "react-i18next";

interface Props {
  value: string;
}

export default function CustomerTypeBadge({ value }: Props) {
  const { t } = useTranslation();

  const mapStyle: Record<string, string> = {
    VIP: "bg-red-100 text-red-500 font-medium",
    Bạc: "bg-gray-100 text-gray-500",
    Vàng: "bg-yellow-100 text-yellow-600 font-medium",
  };

  const mapLabel: Record<string, string> = {
    VIP: t("customerTable.customerType.vip"),
    Bạc: t("customerTable.customerType.silver"),
    Vàng: t("customerTable.customerType.gold"),
  };

  return (
    <div
      className={`inline-block px-2 py-1 rounded-md text-sm ${mapStyle[value]}`}
    >
      {mapLabel[value] || value}
    </div>
  );
}
