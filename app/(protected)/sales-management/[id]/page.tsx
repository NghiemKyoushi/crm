"use client";

import SaleDetail from "@/features/sale-record/components/sale-detail";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div className="pt-4   ">
      <SaleDetail selectId={id} />
    </div>
  );
}
