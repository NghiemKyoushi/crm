import UserManagementPage from "@/features/user-management/views/user-management";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function UserManagement() {
  return (
    <RouteGuard>
      <UserManagementPage />
    </RouteGuard>
  );
}
