import SaleRecordPage from "@/features/sale-record/views/sale-record-page";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function SalesManagement() {
  return (
    <RouteGuard>
      <SaleRecordPage />
    </RouteGuard>
  );
}
