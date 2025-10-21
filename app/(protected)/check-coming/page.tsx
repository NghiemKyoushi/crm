import CheckComingView from "@/features/check-coming/views/CheckComingView";
import { RouteGuard } from "@/components/guards/RouteGuard";

export default function CheckComing() {
  return (
    <RouteGuard>
      <CheckComingView />
    </RouteGuard>
  );
}
