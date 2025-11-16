import { RouteGuard } from "@/components/guards/RouteGuard";
import SalesSalaryManagementView from "@/features/sales-salary-management/views/SalesSalaryManagementView";

export default function SalesSalaryManagementRoute() {
  return (
    <RouteGuard>
      <SalesSalaryManagementView />
    </RouteGuard>
  );
}

