"use client";

import CategorySettingsPage from "@/features/user-management/components/category-customer/category-customer-setting/category-customer-setting";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="pt-4 pl-[212px] ">
      <CategorySettingsPage />
    </div>
  );
}
