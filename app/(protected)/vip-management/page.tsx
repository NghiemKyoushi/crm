import { RouteGuard } from "@/components/guards/RouteGuard";
import VipManagementPage from "@/features/vip-management/views/vip-management";

export default function VipManagementRoute() {
  return (
    <RouteGuard>
      <VipManagementPage />
    </RouteGuard>
  );
}

