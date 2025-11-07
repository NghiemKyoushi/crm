"use client";

import React from "react";
import { Drawer, List, Typography } from "antd";
import { CmsCategoryDetail } from "../apis/categories";

type Props = {
    open: boolean;
    onClose: () => void;
    data?: CmsCategoryDetail;
};

export default function CategoryDetailDrawer({ open, onClose, data }: Props) {
    return (
        <Drawer title={data ? `Category: ${data.title}` : "Category detail"} open={open} onClose={onClose} width={640}>
            {data ? (
                <div className="space-y-6">
                    <div>
                        <Typography.Title level={5}>Info</Typography.Title>
                        <div className="text-sm text-gray-600">Slug: {data.slug}</div>
                        <div className="text-sm text-gray-600">Short desc: {data.short_desc}</div>
                        <div className="text-sm text-gray-600">Status: {data.status}</div>
                        <div className="text-sm text-gray-600">Order index: {data.order_index}</div>
                    </div>
                    <div>
                        <Typography.Title level={5}>Contents</Typography.Title>
                        <List
                            bordered
                            dataSource={data.contents || []}
                            renderItem={(c) => (
                                <List.Item>
                                    <div className="w-full">
                                        <div className="font-medium">{c.title}</div>
                                        <div className="text-xs text-gray-500">{c.type} • {c.status}</div>
                                        <div className="text-xs text-gray-600">{c.short_desc}</div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                    <div>
                        <Typography.Title level={5}>Children</Typography.Title>
                        <List
                            bordered
                            dataSource={data.children || []}
                            renderItem={(ch) => (
                                <List.Item>
                                    <div className="w-full flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{ch.title}</div>
                                            <div className="text-xs text-gray-500">{ch.slug}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">{ch.status}</div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            ) : null}
        </Drawer>
    );
}


