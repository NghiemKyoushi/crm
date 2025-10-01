import { RouteGuard } from "@/components/guards/RouteGuard";
import DashboardPage from "@/features/dashboard/views/dashboard";

export default function Dashboard() {
  return (
    <RouteGuard>
      <DashboardPage />
    </RouteGuard>
  );
}
