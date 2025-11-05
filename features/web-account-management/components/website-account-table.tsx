"use client";
import React, { useState } from "react";
import { Button, Table, Tag, Space, Popconfirm, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { WebsiteAccountResponse } from "../apis/website-account";
import { AccountType } from "../constants/account-types";
import { ColumnsType } from "antd/es/table";
import WebsiteAccountModal from "./website-account-modal";
import { useDeleteWebsiteAccount } from "../hooks/website-account";
import { toast } from "react-toastify";

interface Props {
  accounts: WebsiteAccountResponse[];
  websiteId: number;
  onRefresh: () => void;
}

const WebsiteAccountTable: React.FC<Props> = ({
  accounts,
  websiteId,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<WebsiteAccountResponse | null>(null);
  const deleteMutation = useDeleteWebsiteAccount(websiteId);

  const handleEdit = (record: WebsiteAccountResponse) => {
    setEditingAccount(record);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Deleted account successfully");
        onRefresh();
      },
      onError: (err: any) =>
        toast.error(
          err?.response?.data?.localizedMessage || "Failed to delete account"
        ),
    });
  };

  const columns: ColumnsType<WebsiteAccountResponse> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 220,
    },
    {
      title: "Account Type",
      dataIndex: "account_type",
      key: "account_type",
      render: (type: AccountType) => {
        const color = type === "AUCTION" ? "geekblue" : type === "NORMAL" ? "green" : "default";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      width: 180,
      ellipsis: true,
      render: (note: string) => {
        if (!note) return "-";
        return (
          <Tooltip title={note} placement="topLeft">
            <span style={{ cursor: "help" }}>{note}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : "-",
      width: 200,
    },
    {
      title: "Actions",
      key: "action",
      width: 180,
      render: (_: any, record: WebsiteAccountResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            className="!text-blue-500"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete account?"
            description="Are you sure you want to delete this account?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="primary" onClick={handleAdd}>
          + Add Account
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </div>
      <WebsiteAccountModal
        open={isModalOpen}
        onClose={handleCloseModal}
        websiteId={websiteId}
        account={editingAccount}
        onSuccess={onRefresh}
      />
    </>
  );
};

export default WebsiteAccountTable;

