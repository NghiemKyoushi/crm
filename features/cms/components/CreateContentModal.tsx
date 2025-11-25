"use client";

import React, { useState } from "react";
import { Form, Input, InputNumber, Modal, Select, message } from "antd";
import { CmsContent, CreateCmsContentBody, UpdateCmsContentBody, createCmsContent, updateCmsContent } from "../apis/contents";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";
import CmsTiptapEditor from "./CmsTiptapEditor";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    content?: CmsContent;
};

export default function CreateContentModal({ open, onClose, onSuccess, content }: Props) {
    const [form] = Form.useForm<CreateCmsContentBody>();
    const [bodyValue, setBodyValue] = useState<string>("");
    const imageUrl = Form.useWatch("image_url", form);
    const contentType = Form.useWatch("type", form);

    // Sync bodyValue with form and initial content
    React.useEffect(() => {
        if (open) {
            const initialBody = content?.body || "";
            const initialType = content?.type || "html";
            
            // For html/text types, use rich text editor (bodyValue)
            if (initialType === "html" || initialType === "text") {
                setBodyValue(initialBody);
                form.setFieldValue("body", initialBody);
            } else {
                // For other types, use textarea (form field)
                setBodyValue("");
                form.setFieldValue("body", initialBody);
            }
        } else {
            setBodyValue("");
        }
    }, [open, content, form]);

    // Sync body when type changes
    React.useEffect(() => {
        if (!open || !contentType) return;
        
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
    }, [contentType, open, form, bodyValue]);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: CreateCmsContentBody | UpdateCmsContentBody) => {
            if (content) {
                await updateCmsContent(content.id, payload as UpdateCmsContentBody);
            } else {
                await createCmsContent(payload as CreateCmsContentBody);
            }
        },
        onSuccess: () => {
            message.success(content ? "Updated" : "Created");
            onSuccess?.();
            form.resetFields();
            onClose();
        },
        onError: (err: any) => message.error(getResponseMessage(err.response)),
    });

    const handleOk = async () => {
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
            
            // Extract image_id from URL if it's a system URL
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
                body: finalBody,
                status: "active",
                image_id: imageId ?? values.image_id ?? null,
            } as CreateCmsContentBody;
            await mutateAsync(payload);
        } catch (error) {
            // Form validation errors will be shown automatically
            console.error("Validation error:", error);
        }
    };

    return (
        <Modal
            title={content ? "Update Content" : "Create Content"}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isPending}
            okText={content ? "Update" : "Create"}
            width={720}
        >
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
                    image_url: content?.image_url ?? null,
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


