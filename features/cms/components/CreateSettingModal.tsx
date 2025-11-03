"use client";

import React from "react";
import { Form, Input, Modal, Switch, message } from "antd";
import { CmsSetting, CreateCmsSettingBody, UpdateCmsSettingBody, createCmsSetting, updateCmsSetting } from "../apis/settings";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    setting?: CmsSetting;
};

export default function CreateSettingModal({ open, onClose, onSuccess, setting }: Props) {
    const [form] = Form.useForm<CreateCmsSettingBody>();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: CreateCmsSettingBody | UpdateCmsSettingBody) => {
            if (setting) {
                await updateCmsSetting(setting.id, payload as UpdateCmsSettingBody);
            } else {
                await createCmsSetting(payload as CreateCmsSettingBody);
            }
        },
        onSuccess: () => {
            message.success(setting ? "Updated" : "Created");
            onSuccess?.();
            form.resetFields();
            onClose();
        },
        onError: (err: any) => message.error(getResponseMessage(err.response)),
    });

    const handleOk = async () => {
        const values = await form.validateFields();
        const payload: CreateCmsSettingBody | UpdateCmsSettingBody = setting
            ? { key: setting.key, value: values.value, description: values.description, is_enabled: values.is_enabled }
            : values;
        await mutateAsync(payload);
    };

    const toBoolean = (v: unknown): boolean => {
        if (typeof v === "boolean") return v;
        if (typeof v === "number") return v !== 0;
        if (typeof v === "string") {
            const s = v.trim().toLowerCase();
            return s === "true" || s === "1" || s === "yes" || s === "y";
        }
        return false;
    };

    React.useEffect(() => {
        if (!open) return;
        if (setting) {
            form.setFieldsValue({
                key: setting.key,
                value: setting.value,
                description: setting.description,
                is_enabled: toBoolean((setting as any).is_enabled ?? (setting as any).value),
            });
        }
    }, [open, setting, form]);

    return (
        <Modal
            title={setting ? "Update Setting" : "Create Setting"}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isPending}
            okText={setting ? "Update" : "Create"}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    key: setting?.key,
                    value: setting?.value,
                    description: setting?.description,
                    is_enabled: toBoolean((setting as any)?.is_enabled ?? (setting as any)?.value ?? true),
                }}
            >
                {!setting ? (
                    <Form.Item name="key" label="Key" rules={[{ required: true }]}>
                        <Input placeholder="login_enabled" />
                    </Form.Item>
                ) : (
                    <Form.Item label="Key">
                        <Input value={setting.key} disabled />
                    </Form.Item>
                )}
                <Form.Item name="value" label="Value" rules={[{ required: true }]}>
                    <Input placeholder="true/false or text" />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                    <Input placeholder="Description of setting" />
                </Form.Item>
                <Form.Item name="is_enabled" label="Enabled" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
}


