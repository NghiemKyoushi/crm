"use client";

import React from "react";
import { Form, Input, InputNumber, Modal, Select, message } from "antd";
import { CmsBanner, CreateCmsBannerBody, UpdateCmsBannerBody, createCmsBanner, updateCmsBanner } from "../apis/banners";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    defaultPageId?: number | null;
    banner?: CmsBanner;
};

export default function CreateBannerModal({ open, onClose, onSuccess, defaultPageId, banner }: Props) {
    const [form] = Form.useForm<CreateCmsBannerBody>();
    const imageUrl = Form.useWatch("image_url", form);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: CreateCmsBannerBody | UpdateCmsBannerBody) => {
            if (banner) {
                await updateCmsBanner(banner.id, payload as UpdateCmsBannerBody);
            } else {
                await createCmsBanner(payload as CreateCmsBannerBody);
            }
        },
        onSuccess: () => {
            message.success(banner ? "Updated" : "Created");
            onSuccess?.();
            form.resetFields();
            onClose();
        },
        onError: (err: any) => message.error(getResponseMessage(err.response)),
    });

    const handleOk = async () => {
        const values = await form.validateFields();
        const payload: CreateCmsBannerBody = {
            ...values,
            image_url: values.image_url?.trim() || null,
            status: "active",
        };
        await mutateAsync(payload);
    };

    return (
        <Modal
            title={banner ? "Update Banner" : "Create Banner"}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isPending}
            okText={banner ? "Update" : "Create"}
            width={640}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: banner?.status ?? "active",
                    page_id: banner?.page_id ?? defaultPageId ?? undefined,
                    title: banner?.title,
                    link: banner?.link,
                    section: banner?.section ?? "carousel",
                    order_index: banner?.order_index ?? 1,
                    image_url: banner?.image_url
                        ?? (banner?.image_id
                            ? `${process.env.NEXT_PUBLIC_ROOT_STATIC_URL || ""}/features/v1/admin/view-image/${banner.image_id}`
                            : undefined),
                }}
            >
                <Form.Item name="page_id" label="Page" rules={[{ required: true, message: "Please choose page" }]}>
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter Page ID" />
                </Form.Item>
                <Form.Item 
                    name="image_url" 
                    label="Image URL"
                    rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                    <Input placeholder="https://example.com/image.jpg" />
                </Form.Item>
                {imageUrl && (
                    <div className="mb-4 flex flex-col items-center gap-2">
                        <img src={imageUrl} alt="preview" className="max-h-32 rounded" onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                        }} />
                    </div>
                )}
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="link" label="Link" rules={[{ required: true }]}>
                    <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item name="section" label="Section" rules={[{ required: true }]}>
                    <Select options={[{ value: "hero", label: "hero" }, { value: "carousel", label: "carousel" }, { value: "sidebar", label: "sidebar" }]} />
                </Form.Item>
                <Form.Item name="order_index" label="Order" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="status" hidden>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}


