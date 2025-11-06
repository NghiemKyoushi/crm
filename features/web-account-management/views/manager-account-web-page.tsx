"use client";
import React, { useMemo } from "react";
import { Space, Typography, Alert, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import WebsiteAccountTable from "../components/website-account-table";
import { useListWebsite } from "@/features/web-management/hooks/web-manage";
import { useGetWebsiteAccounts } from "../hooks/website-account";

const { Title, Text } = Typography;

export default function ManagerAccountWebPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteIdParam = searchParams.get("id");
  const websiteId = websiteIdParam ? Number(websiteIdParam) : NaN;

  const { data: websiteList } = useListWebsite({ page: 0, size: 1000 });
  const { data: accounts = [], refetch } = useGetWebsiteAccounts(websiteId);

  const currentWebsite = useMemo(() => {
    if (!websiteList?.data) return undefined;
    return websiteList.data.find((w: any) => w.id === websiteId);
  }, [websiteList, websiteId]);

  if (!websiteId || Number.isNaN(websiteId)) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          message="Missing websiteId"
          description="Please navigate from Website Manage and ensure a valid website is selected."
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/website-manage")}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
            >
              <ArrowLeftOutlined />
              Back
            </button>
            <div>
              <Title level={3} className="!mb-0">
                Manager Account Web
              </Title>
              {currentWebsite && (
                <Text type="secondary">
                  {currentWebsite.name} — {currentWebsite.domain}
                </Text>
              )}
            </div>
          </div>
        </div>

        <Card>
          <WebsiteAccountTable
            accounts={accounts}
            websiteId={websiteId}
            onRefresh={() => refetch()}
          />
        </Card>
      </div>
    </div>
  );
}


