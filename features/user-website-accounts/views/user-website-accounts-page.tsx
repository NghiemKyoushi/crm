"use client";
import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Modal, Space, Table, Tag, Typography, message, Popconfirm } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { useListWebsite } from "@/features/web-management/hooks/web-manage";
import { useAssignUserWebsiteAccounts, useUserWebsiteAccounts } from "../hooks";
import { PlusOutlined, ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { getWebsiteAccounts, WebsiteAccountResponse } from "@/features/web-account-management/apis/website-account";
import type { UserWebsiteAccountItem } from "../apis/index";

const { Title, Text } = Typography;

export default function UserWebsiteAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const userId = userIdParam ? Number(userIdParam) : NaN;

  const { data: assignedAccountsRaw } = useUserWebsiteAccounts(userId);

  // Chuẩn hoá dữ liệu assignedAccounts về dạng mảng, tránh lỗi khi API trả về object khác cấu trúc
  const assignedAccounts: UserWebsiteAccountItem[] = useMemo(() => {
    const data: any = assignedAccountsRaw;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
  }, [assignedAccountsRaw]);
  const assignMutation = useAssignUserWebsiteAccounts(userId);

  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [accountsByWebsite, setAccountsByWebsite] = useState<WebsiteAccountResponse[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [currentWebsiteName, setCurrentWebsiteName] = useState<string>("");
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);

  // Lấy danh sách IDs đã được assign cho user
  const alreadyAssignedIds = useMemo(() => {
    return assignedAccounts.map((acc) => acc.id);
  }, [assignedAccounts]);

  const { data: websiteList } = useListWebsite({ page: 0, size: 1000 });

  const websiteRows = useMemo(() => websiteList?.data || [], [websiteList]);

  // Hàm xóa account: loại bỏ các IDs đã chọn khỏi danh sách và gọi API
  const handleDeleteAccounts = (idsToDelete: number[]) => {
    if (idsToDelete.length === 0) {
      message.warning("Vui lòng chọn ít nhất một tài khoản để xóa");
      return;
    }

    // Loại bỏ các IDs cần xóa khỏi danh sách hiện tại
    const remainingIds = alreadyAssignedIds.filter((id) => !idsToDelete.includes(id));

    assignMutation.mutate(remainingIds, {
      onSuccess: () => {
        message.success(`Đã xóa ${idsToDelete.length} tài khoản thành công`);
        setSelectedDeleteIds([]);
      },
      onError: (err: any) => {
        message.error(err?.response?.data?.localizedMessage || "Có lỗi xảy ra khi xóa");
      },
    });
  };

  if (!userId || Number.isNaN(userId)) {
    return (
      <div className="p-6">
        <Alert type="error" message="Missing userId" showIcon />
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
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
            >
              <ArrowLeftOutlined />
              Back
            </button>
            <div>
              <Title level={3} className="!mb-0">Manage User Website Accounts</Title>
              <Text type="secondary">User ID: {userId}</Text>
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setSelectedAccountIds([...alreadyAssignedIds]);
            setSelectModalOpen(true);
          }}>
            Add account
          </Button>
        </div>

        <Card
          title="Assigned Accounts"
          extra={
            selectedDeleteIds.length > 0 && (
              <Popconfirm
                title={`Xóa ${selectedDeleteIds.length} tài khoản?`}
                description="Bạn có chắc chắn muốn xóa các tài khoản đã chọn?"
                onConfirm={() => handleDeleteAccounts(selectedDeleteIds)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={assignMutation.isPending}
                >
                  Xóa đã chọn ({selectedDeleteIds.length})
                </Button>
              </Popconfirm>
            )
          }
        >
          <div className="overflow-x-auto">
            <Table
              dataSource={assignedAccounts}
              rowKey={(r) => r.id}
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedDeleteIds,
                onChange: (keys) => setSelectedDeleteIds(keys as number[]),
              }}
              columns={[
                { title: "Website", dataIndex: "website_name", key: "website_name", width: 220 },
                { title: "Username", dataIndex: "user_name", key: "user_name", width: 220 },
                { title: "Type", dataIndex: "account_type", key: "account_type", render: (t: string) => <Tag>{t}</Tag> },
                { title: "Note", dataIndex: "note", key: "note", width: 240, ellipsis: true },
                { title: "Created At", dataIndex: "created_at", key: "created_at", width: 200, render: (d: string) => d ? new Date(d).toLocaleString() : "-" },
                {
                  title: "Actions",
                  key: "actions",
                  width: 100,
                  fixed: "right",
                  render: (_: any, record: any) => (
                    <Popconfirm
                      title="Xóa tài khoản này?"
                      description="Bạn có chắc chắn muốn xóa tài khoản này?"
                      onConfirm={() => handleDeleteAccounts([record.id])}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button
                        danger
                        type="link"
                        icon={<DeleteOutlined />}
                        size="small"
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  ),
                },
              ]}
              scroll={{ x: "max-content" }}
            />
          </div>
        </Card>

        <Modal
          title="Select accounts to assign"
          open={selectModalOpen}
          onCancel={() => {
            setSelectModalOpen(false);
            setSelectedAccountIds([]);
          }}
          footer={null}
          width={1200}
        >
          <div className="overflow-x-auto">
            <Table
              dataSource={websiteRows}
              rowKey={(r) => r.id}
              pagination={false}
              columns={[
                { title: "Tên Website", dataIndex: "name", key: "name", width: 220 },
                { title: "URL", dataIndex: "domain", key: "domain", width: 260 },
                {
                  title: "Actions",
                  key: "actions",
                  width: 220,
                  render: (_: any, record: any) => (
                    <Space>
                      <Button
                        type="primary"
                        onClick={async () => {
                          try {
                            setLoadingAccounts(true);
                            const list = await getWebsiteAccounts(record.id);
                            setAccountsByWebsite(list || []);
                            setCurrentWebsiteName(record.name);

                            // Lấy các account IDs đã được assign của website hiện tại
                            const accountsForThisWebsite = assignedAccounts.filter(
                              (acc) => acc.website_name === record.name
                            );
                            const accountIdsForThisWebsite = accountsForThisWebsite.map((acc) => acc.id);

                            // Lưu state hiện tại vào temp để có thể restore nếu cancel
                            setTempSelectedIds([...selectedAccountIds]);

                            // Merge với selectedAccountIds hiện tại (để giữ lại các lựa chọn từ website khác)
                            const mergedIds = Array.from(
                              new Set([...selectedAccountIds, ...accountIdsForThisWebsite])
                            );
                            setSelectedAccountIds(mergedIds);

                            setAccountPickerOpen(true);
                          } catch (e) {
                            message.error("Không tải được danh sách account của website");
                          } finally {
                            setLoadingAccounts(false);
                          }
                        }}
                      >
                        Add account
                      </Button>
                    </Space>
                  ),
                },
              ]}
              scroll={{ x: "max-content" }}
            />
          </div>
        </Modal>

        <Modal
          title="Pick website accounts"
          open={accountPickerOpen}
          onCancel={() => {
            // Restore lại state cũ nếu cancel
            setSelectedAccountIds([...tempSelectedIds]);
            setAccountPickerOpen(false);
          }}
          onOk={() => {
            assignMutation.mutate(selectedAccountIds, {
              onSuccess: () => {
                message.success("Đã cập nhật danh sách tài khoản thành công");
                setAccountPickerOpen(false);
                setSelectModalOpen(false);
                setSelectedAccountIds([]);
              },
              onError: (err: any) => {
                message.error(
                  err?.response?.data?.localizedMessage || "Có lỗi xảy ra khi cập nhật"
                );
              },
            });
          }}
          okButtonProps={{ loading: assignMutation.isPending }}
          width={900}
        >
          <div className="overflow-x-auto">
            <Table
              loading={loadingAccounts}
              dataSource={accountsByWebsite}
              rowKey={(r) => r.id}
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedAccountIds.filter((id) =>
                  accountsByWebsite.some((acc) => acc.id === id)
                ),
                onChange: (keys) => {
                  // Lấy các IDs từ website khác (không có trong accountsByWebsite hiện tại)
                  const idsFromOtherWebsites = selectedAccountIds.filter(
                    (id) => !accountsByWebsite.some((acc) => acc.id === id)
                  );
                  // Merge với các IDs mới được chọn từ website hiện tại
                  const newSelectedIds = Array.from(
                    new Set([...idsFromOtherWebsites, ...(keys as number[])])
                  );
                  setSelectedAccountIds(newSelectedIds);
                },
              }}
              columns={[
                { title: "ID", dataIndex: "id", key: "id", width: 80 },
                { title: "Username", dataIndex: "user_name", key: "user_name", width: 220 },
                { title: "Type", dataIndex: "account_type", key: "account_type", width: 140, render: (t: string) => <Tag>{t}</Tag> },
                { title: "Note", dataIndex: "note", key: "note", ellipsis: true, width: 300 },
              ]}
              scroll={{ x: "max-content" }}
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Selected: {selectedAccountIds.length} account(s)
          </div>
        </Modal>
      </div>
    </div>
  );
}


