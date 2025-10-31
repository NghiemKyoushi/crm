"use client";

import React, { useMemo, useState } from "react";
import { Form, Input, InputNumber, Modal, Select, Upload, message } from "antd";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { VIEW_IMAGE } from "@/constants/api-type";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
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
    const [uploading, setUploading] = useState(false);
    const imageId = Form.useWatch("image_id", form);
    const pageIdWatch = Form.useWatch("page_id", form);
    const thumbUrl = useMemo(() => {
        if (!imageId) return undefined;
        const base = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";
        return `${base}/${VIEW_IMAGE}${imageId}`;
    }, [imageId]);

    const { mutateAsync, isLoading } = useMutation({
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
        const payload = { status: "active", ...values } as CreateCmsBannerBody;
        await mutateAsync(payload);
    };

    return (
        <Modal
            title={banner ? "Update Banner" : "Create Banner"}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isLoading}
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
                    image_id: banner?.image_id,
                }}
            >
                <Form.Item name="page_id" label="Page" rules={[{ required: true, message: "Please choose page" }]}>
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter Page ID" />
                </Form.Item>
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
                <Form.Item name="link" label="Link" rules={[{ required: true }]}>
                    <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item name="section" label="Section" rules={[{ required: true }]}>
                    <Select options={[{ value: "carousel", label: "carousel" }, { value: "sidebar", label: "sidebar" }]} />
                </Form.Item>
                <Form.Item name="order_index" label="Order" rules={[{ required: true }]}>
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


