"use client";

import React, { useMemo, useState } from "react";
import { Form, Input, InputNumber, Select, message, Button, Spin } from "antd";
import { useRouter, useParams } from "next/navigation";
import { VIEW_IMAGE } from "@/constants/api-type";
import { CreateCmsContentBody, UpdateCmsContentBody, updateCmsContent, getCmsContentDetail } from "@/features/cms/apis/contents";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";
import CmsTiptapEditor from "@/features/cms/components/CmsTiptapEditor";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function UpdateContentPage() {
    const router = useRouter();
    const params = useParams();
    const contentId = params?.id ? Number(params.id) : null;
    const queryClient = useQueryClient();
    const [form] = Form.useForm<CreateCmsContentBody>();
    const [bodyValue, setBodyValue] = useState<string>("");
    const [saving, setSaving] = useState(false);

    const imageUrl = Form.useWatch("image_url", form);
    const contentType = Form.useWatch("type", form);
    const staticBaseUrl = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";

    // Fetch content detail
    const { data: content, isLoading: loadingContent } = useQuery({
        queryKey: ['cms-content-detail', contentId],
        queryFn: () => getCmsContentDetail(contentId!),
        enabled: !!contentId,
    });

    const fallbackImageUrl = useMemo(() => {
        if (content?.image_url) {
            return content.image_url;
        }
        if (content?.image_id) {
            return `${staticBaseUrl}/${VIEW_IMAGE}${content.image_id}`;
        }
        return undefined;
    }, [content?.image_url, content?.image_id, staticBaseUrl]);

    const thumbUrl = imageUrl || fallbackImageUrl;

    // Sync form and bodyValue when content loads
    React.useEffect(() => {
        if (content) {
            const initialBody = content.body || "";
            const initialType = content.type || "html";

            const resolvedImageUrl = content.image_url ?? (content.image_id ? `${staticBaseUrl}/${VIEW_IMAGE}${content.image_id}` : null);

            form.setFieldsValue({
                title: content.title,
                short_desc: content.short_desc,
                type: initialType,
                image_url: resolvedImageUrl,
                position: content.position ?? "hero",
                order_index: content.order_index ?? 1,
                status: content.status ?? "active",
            });

            // For html/text types, use rich text editor (bodyValue)
            if (initialType === "html" || initialType === "text") {
                setBodyValue(initialBody);
                form.setFieldValue("body", initialBody);
            } else {
                // For other types, use form field
                setBodyValue("");
                form.setFieldValue("body", initialBody);
            }
        }
    }, [content, form]);

    // Sync body when type changes
    React.useEffect(() => {
        if (!contentType || !content) return;

        const currentBody = form.getFieldValue("body") || "";

        if (contentType === "html" || contentType === "text") {
            // Switching to html/text - move from form field to bodyValue if needed
            if (!bodyValue && currentBody) {
                setBodyValue(currentBody);
            }
        } else {
            // Switching to other types - move from bodyValue to form field if needed
            if (bodyValue && !currentBody) {
                form.setFieldValue("body", bodyValue);
            }
        }
    }, [contentType, content, form, bodyValue]);

    const { mutateAsync } = useMutation({
        mutationFn: async (payload: UpdateCmsContentBody) => {
            return await updateCmsContent(contentId!, payload);
        },
        onSuccess: () => {
            message.success("Content updated successfully");
            queryClient.invalidateQueries({ queryKey: ['cms-contents'] });
            queryClient.invalidateQueries({ queryKey: ['cms-content-detail', contentId] });
            router.push('/cms');
        },
        onError: (err: any) => {
            message.error(getResponseMessage(err.response) || "Failed to update content");
        },
    });

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Get body value based on type
            let finalBody = "";
            if (contentType === "html" || contentType === "text" || !contentType) {
                finalBody = bodyValue;
                // Validate rich text editor body
                if (!finalBody || finalBody.trim() === "" || finalBody === "<p></p>") {
                    message.error("Please enter content body");
                    return;
                }
            } else {
                // For other types, body comes from form field
                finalBody = values.body || "";
                if (!finalBody || finalBody.trim() === "") {
                    message.error("Please enter content body");
                    return;
                }
            }

            const payload: UpdateCmsContentBody = {
                ...values,
                body: finalBody,
                status: "active",
                image_id: values.image_id ?? null,
            };

            setSaving(true);
            await mutateAsync(payload);
        } catch (error) {
            console.error("Validation error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loadingContent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="p-6">
                <div className="mb-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/cms')}>
                        Back
                    </Button>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-500">Content not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/cms')}>
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Update Content</h1>
                </div>
                <Button
                    type="primary"
                    size="large"
                    onClick={handleSave}
                    loading={saving}
                >
                    Save Changes
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: content?.status ?? "active",
                        title: content?.title,
                        short_desc: content?.short_desc,
                        body: content?.body,
                        type: content?.type ?? "html",
                        image_id: content?.image_id ?? null,
                        image_url: content?.image_url ?? (content?.image_id ? `${staticBaseUrl}/${VIEW_IMAGE}${content.image_id}` : null),
                        position: content?.position ?? "hero",
                        order_index: content?.order_index ?? 1,
                    }}
                >
                    <Form.Item
                        name="image_url"
                        label="Image URL"
                        rules={[{ type: "url", message: "Please enter a valid URL" }]}
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>
                    {thumbUrl && (
                        <div className="mb-4 flex flex-col items-center gap-2">
                            <img
                                src={thumbUrl}
                                alt="preview"
                                className="max-h-32 rounded object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                            <div className="text-xs text-gray-500 break-all text-center">
                                {thumbUrl}
                            </div>
                        </div>
                    )}

                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="short_desc" label="Short Description" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: "text", label: "Text" },
                                { value: "html", label: "HTML" },
                                { value: "image", label: "Image" },
                                { value: "video", label: "Video" },
                                { value: "link", label: "Link" },
                                { value: "embed", label: "Embed" },
                                { value: "custom", label: "Custom" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="position" label="Position" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: "hero", label: "Banner đầu trang" },
                                { value: "section_1", label: "Vùng giới thiệu" },
                                { value: "section_2", label: "Vùng dịch vụ" },
                                { value: "footer", label: "Dưới chân trang" },
                                { value: "sidebar", label: "Thanh bên" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="order_index" label="Order" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="body"
                        label="Body"
                        rules={[{ required: true, message: "Please enter content body" }]}
                        hidden
                    >
                        <Input />
                    </Form.Item>
                    {(contentType === "html" || contentType === "text" || !contentType) && (
                        <Form.Item label="Body" required>
                            <CmsTiptapEditor
                                value={bodyValue}
                                onChange={(html) => {
                                    setBodyValue(html);
                                    form.setFieldValue("body", html);
                                }}
                                placeholder="Enter your content here..."
                            />
                        </Form.Item>
                    )}
                    {contentType && contentType !== "html" && contentType !== "text" && (
                        <Form.Item name="body" label="Body" rules={[{ required: true, message: "Please enter content body" }]}>
                            <Input.TextArea rows={4} placeholder="Enter your content here..." />
                        </Form.Item>
                    )}
                    <Form.Item name="image_id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" hidden>
                        <Input />
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}
