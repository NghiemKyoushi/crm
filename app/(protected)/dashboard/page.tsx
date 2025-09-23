import DashboardPage from "@/features/dashboard/views/dashboard";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function Dashboard() {
  return (
    <RouteGuard>
      <DashboardPage />
    </RouteGuard>
  );
}
