import OrderhubPage from "@/features/order-hub/views/order-hub-page";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function Orderhub() {
  return (
    <RouteGuard>
      <OrderhubPage />
    </RouteGuard>
  );
}
