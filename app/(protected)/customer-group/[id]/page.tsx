"use client";

import CategorySettingsPage from "@/features/user-management/components/customer-group/customer-group-setting/customer-group-setting";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="pt-4   ">
      <CategorySettingsPage />
    </div>
  );
}
