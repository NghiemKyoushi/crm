"use client";

import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, message, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { VipPackage, UpdateVipPackageRequest, CreateVipPackageRequest } from "../apis/vip-api";
import { useVipPackages, useDeleteVipPackage, useUpdateVipPackage, useEnableVipPackage, useCreateVipPackage } from "../hooks/useVipPackages";
import ModalEditVipPackage from "./modal-edit-vip-package";
import ModalCreateVipPackage from "./modal-create-vip-package";

export default function VipPackageTable() {
    const { data, isLoading } = useVipPackages();
    const [editingPackage, setEditingPackage] = useState<VipPackage | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const deleteMutation = useDeleteVipPackage();
    const updateMutation = useUpdateVipPackage();
    const enableMutation = useEnableVipPackage();
    const createMutation = useCreateVipPackage();

    const handleDelete = async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id);
            message.success("Xóa gói VIP thành công");
        } catch (error) {
            message.error("Có lỗi xảy ra khi xóa gói VIP");
        }
    };

    const handleEdit = (record: VipPackage) => {
        setEditingPackage(record);
        setIsEditModalOpen(true);
    };

    const handleUpdatePackage = async (id: number, data: UpdateVipPackageRequest) => {
        await updateMutation.mutateAsync({ id, data });
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setEditingPackage(null);
    };

    const handleCreatePackage = async (data: CreateVipPackageRequest) => {
        await createMutation.mutateAsync(data);
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
    };

    const handleToggleEnable = async (id: number, enabled: boolean) => {
        try {
            console.log("🔄 Toggle enable:", { id, enabled });
            await enableMutation.mutateAsync({ id, enabled });
            message.success(enabled ? "Kích hoạt gói VIP thành công" : "Vô hiệu hóa gói VIP thành công");
        } catch (error: any) {
            console.error("❌ Error toggling enable:", error);
            console.error("❌ Error response:", error?.response);
            message.error(
                error?.response?.data?.message ||
                error?.response?.data?.localizedMessage ||
                "Có lỗi xảy ra khi cập nhật trạng thái"
            );
        }
    };

    const columns: ColumnsType<VipPackage> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            fixed: "left",
        },
        {
            title: "Tên gói",
            dataIndex: "name",
            key: "name",
            width: 150,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: 200,
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            width: 120,
            align: "right",
            render: (price: number) => `${price?.toLocaleString("vi-VN")}đ`,
        },
        {
            title: "Số lượng đấu giá tối đa",
            dataIndex: "max_auction_items",
            key: "max_auction_items",
            width: 180,
            align: "center",
        },
        {
            title: "Phí hủy",
            dataIndex: "cancel_fee",
            key: "cancel_fee",
            width: 120,
            align: "right",
            render: (fee: number) => `${fee?.toLocaleString("vi-VN")}đ`,
        },
        {
            title: "Thời hạn (ngày)",
            dataIndex: "duration_days",
            key: "duration_days",
            width: 130,
            align: "center",
        },
        {
            title: "Trạng thái",
            dataIndex: "is_enabled",
            key: "is_enabled",
            width: 120,
            align: "center",
            render: (isEnabled: boolean) => (
                <span className={isEnabled ? "text-green-600" : "text-gray-500"}>
                    {isEnabled ? "Hoạt động" : "Không hoạt động"}
                </span>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 250,
            fixed: "right",
            render: (_: any, record: VipPackage) => (
                <Space>
                    <Switch
                        checked={record.is_enabled}
                        onChange={(checked) => handleToggleEnable(record.id, checked)}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                    />
                    <Button size="small" onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa gói VIP này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button size="small" danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Danh sách gói VIP</h2>
                <Button
                    type="primary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-500"
                >
                    Thêm mới
                </Button>
            </div>
            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={data || []}
                    loading={isLoading}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: "max-content" }}
                    size="small"
                />
            </div>
            <ModalEditVipPackage
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingPackage(null);
                }}
                onSuccess={handleEditSuccess}
                vipPackage={editingPackage}
                onSubmit={handleUpdatePackage}
            />
            <ModalCreateVipPackage
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                onSubmit={handleCreatePackage}
            />
        </div>
    );
}

