import { RouteGuard } from "@/components/guards/RouteGuard";
import OperationPage from "@/features/operation-management/views/operation-page";

export default function Orderhub() {
  return (
    <RouteGuard>
        <OperationPage/>
    </RouteGuard>
  );
}
