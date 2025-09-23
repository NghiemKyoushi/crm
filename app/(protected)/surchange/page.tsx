import SurchargePage from "@/features/surcharge/views/surchange-page";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function Surcharge() {
  return (
    <RouteGuard>
      <SurchargePage />
    </RouteGuard>
  );
}
