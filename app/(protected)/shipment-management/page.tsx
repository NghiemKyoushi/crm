import { RouteGuard } from "@/components/guards/RouteGuard";
import ShipmentPage from "@/features/shipment-management/views/shipment-page";

export default function ShipmentManagement() {
  return (
    <RouteGuard>
        <ShipmentPage/>
    </RouteGuard>
  );
}
