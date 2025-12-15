import { RouteGuard } from "@/components/guards/RouteGuard";
import AuctionPage from "@/features/aution-manage/views/aution-pages";

export default function AuctionRoute() {
  return (
    <RouteGuard>
      <AuctionPage />
    </RouteGuard>
  );
}