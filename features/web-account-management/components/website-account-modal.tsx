"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Space } from "antd";
import {
  useCreateWebsiteAccount,
  useDeleteWebsiteAccount,
  useUpdateWebsiteAccount,
} from "../hooks/website-account";
import { WebsiteAccountResponse, WebsiteAccountPayload } from "../apis/website-account";
import { ACCOUNT_TYPE_OPTIONS } from "../constants/account-types";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  websiteId: number;
  account?: WebsiteAccountResponse | null;
  onSuccess: () => void;
}

const ACCOUNT_TYPES = ACCOUNT_TYPE_OPTIONS;

const WebsiteAccountModal: React.FC<Props> = ({
  open,
  onClose,
  websiteId,
  account,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const createMutation = useCreateWebsiteAccount(websiteId);
  const updateMutation = useUpdateWebsiteAccount(websiteId);
  const deleteMutation = useDeleteWebsiteAccount(websiteId);

  useEffect(() => {
    if (account && open) {
      form.setFieldsValue({
        username: account.username,
        password: "",
        note: account.note || "",
        account_type: account.account_type,
      });
    } else {
      form.resetFields();
    }
  }, [account, open, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: WebsiteAccountPayload = {
        website_id: websiteId,
        username: values.username,
        password: values.password,
        note: values.note,
        account_type: values.account_type,
      };

      if (account?.id) {
        updateMutation.mutate(
          { id: account.id, payload },
          {
            onSuccess: () => {
              toast.success("Updated account successfully");
              onSuccess();
              onClose();
            },
            onError: (err: any) =>
              toast.error(
                err?.response?.data?.localizedMessage || "Failed to update account"
              ),
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            toast.success("Created account successfully");
            onSuccess();
            onClose();
          },
          onError: (err: any) =>
            toast.error(
              err?.response?.data?.localizedMessage || "Failed to create account"
            ),
        });
      }
    });
  };

  const handleDelete = () => {
    if (!account?.id) return;
    deleteMutation.mutate(account.id, {
      onSuccess: () => {
        toast.success("Deleted account successfully");
        onSuccess();
        onClose();
      },
      onError: (err: any) =>
        toast.error(
          err?.response?.data?.localizedMessage || "Failed to delete account"
        ),
    });
  };

  return (
    <Modal
      title={account ? "Edit Account" : "Add New Account"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: !account?.id,
              message: "Password is required for new accounts",
            },
          ]}
          tooltip={
            account?.id
              ? "Leave empty to keep current password"
              : "Password is required"
          }
        >
          <Input.Password
            placeholder={
              account?.id ? "Leave blank to keep current" : "Enter password"
            }
          />
        </Form.Item>

        <Form.Item label="Note" name="note">
          <Input.TextArea rows={3} placeholder="Notes..." />
        </Form.Item>

        <Form.Item
          label="Account Type"
          name="account_type"
          rules={[{ required: true, message: "Required" }]}
        >
          <Select placeholder="Select type" options={ACCOUNT_TYPES} />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {account ? "Update" : "Create"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
            {/* {account && (
              <Button
                danger
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            )} */}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WebsiteAccountModal;

