import FeeSettingPage from "@/features/fee-settting/views/fee-setting-page";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function FeeSetting() {
  return (
    <RouteGuard>
      <FeeSettingPage />
    </RouteGuard>
  );
}
