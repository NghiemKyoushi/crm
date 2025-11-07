"use client";

import React, { useMemo, useState } from "react";
import { Form, Input, Modal, Select, Upload, message } from "antd";
import { CmsPage, CreateCmsPageBody, UpdateCmsPageBody, createCmsPage, updateCmsPage } from "../apis/pages";
import { useMutation } from "@tanstack/react-query";
import { getResponseMessage } from "@/api/axiosClient";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
import { VIEW_IMAGE } from "@/constants/api-type";

type CreatePageModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    page?: CmsPage; // if provided -> edit mode
};

const { TextArea } = Input;

export default function CreatePageModal({ open, onClose, onSuccess, page }: CreatePageModalProps) {
    const [form] = Form.useForm<CreateCmsPageBody>();
    const [uploading, setUploading] = useState(false);
    const imageId = Form.useWatch("image_id", form);
    const thumbUrl = useMemo(() => {
        if (!imageId) return undefined;
        const base = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";
        return `${base}/${VIEW_IMAGE}${imageId}`;
    }, [imageId]);

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
        const payload = { ...values, status: "active" } as CreateCmsPageBody;
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
                }}
            >
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


