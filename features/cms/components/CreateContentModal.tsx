"use client";

import React, { useMemo, useState } from "react";
import { Form, Input, InputNumber, Modal, Select, Upload, message } from "antd";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { VIEW_IMAGE } from "@/constants/api-type";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
import { CmsContent, CreateCmsContentBody, UpdateCmsContentBody, createCmsContent, updateCmsContent } from "../apis/contents";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    content?: CmsContent;
};

const { TextArea } = Input;

export default function CreateContentModal({ open, onClose, onSuccess, content }: Props) {
    const [form] = Form.useForm<CreateCmsContentBody>();
    const [uploading, setUploading] = useState(false);
    const imageId = Form.useWatch("image_id", form);
    const thumbUrl = useMemo(() => {
        if (!imageId) return undefined;
        const base = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";
        return `${base}/${VIEW_IMAGE}${imageId}`;
    }, [imageId]);

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
        const values = await form.validateFields();
        const payload = { status: "active", ...values } as CreateCmsContentBody;
        await mutateAsync(payload);
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
                    position: (content as any)?.position ?? "main",
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
                    <Select options={[{ value: "html", label: "html" }, { value: "markdown", label: "markdown" }]} />
                </Form.Item>
                <Form.Item name="position" label="Position" rules={[{ required: true }]}>
                    <Select options={[{ value: "main", label: "main" }, { value: "sidebar", label: "sidebar" }]} />
                </Form.Item>
                <Form.Item name="order_index" label="Order" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="body" label="Body" rules={[{ required: true }]}>
                    <TextArea rows={6} placeholder="<p>...</p>" />
                </Form.Item>
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


