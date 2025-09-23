import SettingPage from "@/features/settings/views/setting-page";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function Setting() {
  return (
    <RouteGuard>
      <SettingPage />
    </RouteGuard>
  );
}
