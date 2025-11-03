"use client";

import React, { useMemo, useState } from "react";
import { Form, Input, InputNumber, Modal, Select, Upload, message } from "antd";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { VIEW_IMAGE } from "@/constants/api-type";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
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
    const [uploading, setUploading] = useState(false);
    const [bodyValue, setBodyValue] = useState<string>("");
    const imageId = Form.useWatch("image_id", form);
    const contentType = Form.useWatch("type", form);
    const thumbUrl = useMemo(() => {
        if (!imageId) return undefined;
        const base = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";
        return `${base}/${VIEW_IMAGE}${imageId}`;
    }, [imageId]);

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

    const { mutateAsync, isLoading } = useMutation({
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
            
            const payload = { 
                status: "active", 
                ...values,
                body: finalBody 
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
            confirmLoading={isLoading}
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
                    position: content?.position ?? "hero",
                    order_index: content?.order_index ?? 1,
                }}
            >
                <Form.Item label="Image">
                    <Upload.Dragger
                        accept="image/*"
                        multiple={false}
                        showUploadList={false}
                        customRequest={async (options: RcCustomRequestOptions) => {
                            const { file, onSuccess, onError } = options;
                            try {
                                setUploading(true);
                                const id = await uploadImage(file as File);
                                form.setFieldValue("image_id", id);
                                message.success("Image uploaded");
                                onSuccess && onSuccess({ id } as any);
                            } catch (e) {
                                message.error("Upload failed");
                                onError && onError(e as any);
                            } finally {
                                setUploading(false);
                            }
                        }}
                        disabled={uploading}
                    >
                        {thumbUrl ? (
                            <div className="flex flex-col items-center gap-2 py-3">
                                <img src={thumbUrl} alt="preview" className="max-h-32 rounded" />
                                <div className="text-xs text-gray-500">Image ID: {imageId}</div>
                                <div className="text-xs text-gray-400">Drag & drop to replace</div>
                            </div>
                        ) : (
                            <div className="py-6">
                                <p className="ant-upload-drag-icon">📷</p>
                                <p className="ant-upload-text">Click or drag image to upload</p>
                            </div>
                        )}
                    </Upload.Dragger>
                </Form.Item>

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
        </Modal>
    );
}


