import { RouteGuard } from "@/components/guards/RouteGuard";
import CMSFeaturePage from "@/features/cms/views/cms-page";

export default function CMSPage() {
    return (
        <RouteGuard>
            <CMSFeaturePage />
        </RouteGuard>
    );
}




