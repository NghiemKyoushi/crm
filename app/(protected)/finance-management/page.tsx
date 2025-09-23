import FinnaceManagementPage from "@/features/finance-manage/views/finace-pages";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function FinanceManagement() {
  return (
    <RouteGuard>
      <FinnaceManagementPage />
    </RouteGuard>
  );
}
