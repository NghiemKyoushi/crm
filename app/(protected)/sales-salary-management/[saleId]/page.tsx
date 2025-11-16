import { RouteGuard } from "@/components/guards/RouteGuard";
import SalesDetailView from "@/features/sales-salary-management/views/SalesDetailView";

export default function SalesDetailRoute() {
  return (
    <RouteGuard>
      <SalesDetailView />
    </RouteGuard>
  );
}

