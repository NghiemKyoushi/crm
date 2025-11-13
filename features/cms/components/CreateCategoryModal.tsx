"use client";

import React, { useEffect } from "react";
import { Form, Input, InputNumber, Modal, message } from "antd";
import { CmsCategory, CreateCmsCategoryBody, UpdateCmsCategoryBody, createCmsCategory, updateCmsCategory } from "../apis/categories";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    category?: CmsCategory; // if provided -> edit mode
};

export default function CreateCategoryModal({ open, onClose, onSuccess, category }: Props) {
    const [form] = Form.useForm<CreateCmsCategoryBody & { image_url?: string }>();
    const imageUrl = Form.useWatch("image_url", form);

    // Update form values when category or open changes
    useEffect(() => {
        if (open) {
            if (category) {
                const base = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";
                const categoryImageUrl = category.image_id 
                    ? `${base}/features/v1/admin/view-image/${category.image_id}`
                    : undefined;
                form.setFieldsValue({
                    status: category.status ?? "active",
                    title: category.title,
                    slug: category.slug,
                    short_desc: category.short_desc,
                    order_index: category.order_index ?? 1,
                    image_id: category.image_id,
                    image_url: categoryImageUrl,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    status: "active",
                    order_index: 1,
                });
            }
        }
    }, [open, category, form]);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: CreateCmsCategoryBody | UpdateCmsCategoryBody) => {
            if (category) {
                await updateCmsCategory(category.id, payload as UpdateCmsCategoryBody);
            } else {
                await createCmsCategory(payload as CreateCmsCategoryBody);
            }
        },
        onSuccess: () => {
            message.success(category ? "Category updated" : "Category created");
            onSuccess?.();
            form.resetFields();
            onClose();
        },
        onError: (err: any) => message.error(getResponseMessage(err.response)),
    });

    const handleOk = async () => {
        try {
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
                    // If it's an external URL, we can't extract image_id, so set to null
                    imageId = null;
                }
            }
            const payload: CreateCmsCategoryBody = {
                ...values,
                image_id: imageId ?? values.image_id ?? null,
                status: "active",
            } as CreateCmsCategoryBody;
            await mutateAsync(payload);
        } catch (error: any) {
            // Form validation failed
            if (error?.errorFields) {
                // Antd validation errors - they will be shown automatically
                return;
            }
            console.error("Error saving category:", error);
        }
    };

    return (
        <Modal
            title={category ? "Update CMS Category" : "Create CMS Category"}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isPending}
            okText={category ? "Update" : "Create"}
        >
            <Form 
                form={form} 
                layout="vertical" 
                initialValues={{ 
                    status: category?.status ?? "active", 
                    title: category?.title,
                    slug: category?.slug,
                    short_desc: category?.short_desc,
                    order_index: category?.order_index ?? 1,
                    image_id: category?.image_id,
                    image_url: category?.image_id 
                        ? `${process.env.NEXT_PUBLIC_ROOT_STATIC_URL || ""}/features/v1/admin/view-image/${category.image_id}`
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

                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input placeholder="Tin tức nổi bật" />
                </Form.Item>
                <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                    <Input placeholder="featured-news" />
                </Form.Item>
                <Form.Item name="short_desc" label="Short Description" rules={[{ required: true }]}>
                    <Input placeholder="Tin mới nhất về đấu giá Nhật" />
                </Form.Item>
                <Form.Item name="order_index" label="Order Index" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: "100%" }} />
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


