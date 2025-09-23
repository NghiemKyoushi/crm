import TelesaleManagePage from "@/features/telesales-manage/views/telesales-manage-page";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function TelesalesManage() {
  return (
    <RouteGuard>
      <TelesaleManagePage />
    </RouteGuard>
  );
}