"use client";

import React, { useMemo, useState } from "react";
import { Form, Input, InputNumber, Modal, Upload, message } from "antd";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { VIEW_IMAGE } from "@/constants/api-type";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
import { CreateCmsCategoryBody, createCmsCategory } from "../apis/categories";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

export default function CreateCategoryModal({ open, onClose, onSuccess }: Props) {
    const [form] = Form.useForm<CreateCmsCategoryBody>();
    const [uploading, setUploading] = useState(false);
    const imageId = Form.useWatch("image_id", form);
    const thumbUrl = useMemo(() => {
        if (!imageId) return undefined;
        const base = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";
        return `${base}/${VIEW_IMAGE}${imageId}`;
    }, [imageId]);

    const { mutateAsync, isLoading } = useMutation({
        mutationFn: createCmsCategory,
        onSuccess: () => {
            message.success("Category created");
            onSuccess?.();
            form.resetFields();
            onClose();
        },
        onError: (err: any) => message.error(getResponseMessage(err.response)),
    });

    const handleOk = async () => {
        const values = await form.validateFields();
        const payload: CreateCmsCategoryBody = { status: "active", ...values } as CreateCmsCategoryBody;
        await mutateAsync(payload);
    };

    return (
        <Modal
            title="Create CMS Category"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isLoading}
            okText="Create"
        >
            <Form form={form} layout="vertical" initialValues={{ status: "active", order_index: 1 }}>
                <Form.Item label="Cover Image">
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
                                <p className="ant-upload-hint text-xs">PNG, JPG...</p>
                            </div>
                        )}
                    </Upload.Dragger>
                </Form.Item>

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
                <Form.Item name="image_id" rules={[{ required: true, message: "Please upload image" }]} hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="status" hidden>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}


