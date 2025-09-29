"use client";

import CustomerDetailPages from "@/features/user-management/views/customer-detail";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="pt-4   ">
      <CustomerDetailPages selectedId={id} />
    </div>
  );
}
