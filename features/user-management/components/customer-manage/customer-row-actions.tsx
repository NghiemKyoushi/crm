import { useTranslation } from "react-i18next";

export default function CustomerRowActions() {
  const { t } = useTranslation();

  return (
    <div className="text-blue-600 hover:underline">
      {t("customerTable.view360")}
    </div>
  );
}
