import PartnerManagementPage from "@/features/partner-manage/views/partner-manage";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function PartnerManage() {
  return (
    <RouteGuard>
      <PartnerManagementPage />
    </RouteGuard>
  );
}
