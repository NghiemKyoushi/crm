"use client";

import React from "react";
import { Form, Input, Modal, message } from "antd";
import { CmsPage, CreateCmsPageBody, UpdateCmsPageBody, createCmsPage, updateCmsPage } from "../apis/pages";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";

type CreatePageModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    page?: CmsPage; // if provided -> edit mode
};

const { TextArea } = Input;

export default function CreatePageModal({ open, onClose, onSuccess, page }: CreatePageModalProps) {
    const [form] = Form.useForm<CreateCmsPageBody & { image_url?: string }>();
    const imageUrl = Form.useWatch("image_url", form);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: CreateCmsPageBody | UpdateCmsPageBody) => {
            if (page) {
                await updateCmsPage(page.id, payload as UpdateCmsPageBody);
            } else {
                await createCmsPage(payload as CreateCmsPageBody);
            }
        },
        onSuccess: () => {
            message.success(page ? "Updated successfully" : "Created successfully");
            onSuccess?.();
            form.resetFields();
            onClose();
        },
        onError: (err: any) => {
            message.error(getResponseMessage(err.response));
        },
    });

    const handleOk = async () => {
        const values = await form.validateFields();
        // Extract image_id from URL if it's a system URL, otherwise set to null
        let imageId: number | null = null;
        if (values.image_url) {
            // Try to extract image_id from URL patterns:
            // - /view-image/{id}
            // - /medias/v1/files/view/thumb/{id}
            const match1 = values.image_url.match(/\/view-image\/(\d+)/);
            const match2 = values.image_url.match(/\/view\/thumb\/(\d+)/);
            if (match1) {
                imageId = parseInt(match1[1], 10);
            } else if (match2) {
                imageId = parseInt(match2[1], 10);
            } else {
                imageId = null;
            }
        }
        const payload = { 
            ...values, 
            image_id: imageId ?? values.image_id ?? null,
            status: "active" 
        } as CreateCmsPageBody;
        await mutateAsync(payload);
    };

    return (
        <Modal
            title={page ? "Update CMS Page" : "Create CMS Page"}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isPending}
            okText={page ? "Update" : "Create"}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: page?.status ?? "active",
                    slug: page?.slug,
                    title: page?.title,
                    description: page?.description,
                    short_desc: page?.short_desc,
                    image_id: page?.image_id,
                    image_url: page?.image_id 
                        ? `${process.env.NEXT_PUBLIC_ROOT_STATIC_URL || ""}/features/v1/admin/view-image/${page.image_id}`
                        : undefined,
                }}
            >
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
                <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                    <Input placeholder="home" />
                </Form.Item>
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input placeholder="Trang chủ" />
                </Form.Item>
                <Form.Item name="short_desc" label="Short Description" rules={[{ required: true }]}>
                    <Input placeholder="Short intro" />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                    <TextArea rows={4} placeholder="Trang hiển thị nội dung chính của hệ thống" />
                </Form.Item>
                <Form.Item name="image_id" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="image_url" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="status" hidden>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}


