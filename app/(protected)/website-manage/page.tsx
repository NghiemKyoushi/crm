import WebsiteManagementPage from "@/features/web-management/views/web-manage-page";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function WebsiteManage() {
  return (
    <RouteGuard>
      <WebsiteManagementPage />
    </RouteGuard>
  );
}