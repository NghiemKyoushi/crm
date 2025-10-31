"use client";

import React, { useState } from "react";
import CMSTabs from "../components/tabs/cms-tabs";
import { Button, Popconfirm, Table, message } from "antd";
import { useCmsPages } from "../hooks/useCmsPages";
import CreatePageModal from "../components/CreatePageModal";
import { deleteCmsPage } from "../apis/pages";
import { useCmsCategories, useCmsCategoryDetail, useInvalidateCategories } from "../hooks/useCmsCategories";
import CategoryDetailDrawer from "../components/CategoryDetailDrawer";
import { useCmsContents, useInvalidateContents } from "../hooks/useCmsContents";
import { deleteCmsContent } from "../apis/contents";
import CreateContentModal from "../components/CreateContentModal";
import { useCmsBanners, useInvalidateBanners } from "../hooks/useCmsBanners";
import { deleteCmsBanner } from "../apis/banners";
import CreateBannerModal from "../components/CreateBannerModal";
import { useCmsSettings, useInvalidateSettings } from "../hooks/useCmsSettings";
import { deleteCmsSetting } from "../apis/settings";
import CreateSettingModal from "../components/CreateSettingModal";
import { linkCategoryContent, linkCategoryRelation, linkPageCategory, linkPageContent, unlinkCategoryContent, unlinkCategoryRelation, unlinkPageCategory, unlinkPageContent } from "../apis/aggregate";
import CreateCategoryModal from "../components/CreateCategoryModal";

export default function CMSFeaturePage() {
    const [activeKey, setActiveKey] = useState<string>("pages");
    const { data: pages = [], isLoading, refetch } = useCmsPages();
    const [openCreate, setOpenCreate] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data: categories = [], isLoading: loadingCategories } = useCmsCategories();
    const [viewCategoryId, setViewCategoryId] = useState<number | null>(null);
    const { data: categoryDetail } = useCmsCategoryDetail(viewCategoryId);
    const [openCreateCategory, setOpenCreateCategory] = useState(false);
    const invalidateCategories = useInvalidateCategories();
    const { data: contents = [], isLoading: loadingContents } = useCmsContents();
    const [openCreateContent, setOpenCreateContent] = useState(false);
    const [editingContentId, setEditingContentId] = useState<number | null>(null);
    const invalidateContents = useInvalidateContents();
    const [bannerPageId, setBannerPageId] = useState<number | null>(null);
    const { data: banners = [], isLoading: loadingBanners } = useCmsBanners(bannerPageId);
    const invalidateBanners = useInvalidateBanners();
    const [openCreateBanner, setOpenCreateBanner] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
    const { data: settings = [], isLoading: loadingSettings } = useCmsSettings();
    const invalidateSettings = useInvalidateSettings();
    const [openCreateSetting, setOpenCreateSetting] = useState(false);
    const [editingSettingId, setEditingSettingId] = useState<number | null>(null);

    return (
        <div className="pt-4 ">
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <CMSTabs activeKey={activeKey} onChange={setActiveKey} />
                    <div className="px-6 pb-6 pt-1">
                        {activeKey === "pages" && (
                            <Table
                                loading={isLoading}
                                rowKey="id"
                                dataSource={pages}
                                pagination={false}
                                columns={[
                                    { title: "ID", dataIndex: "id", width: 80 },
                                    { title: "Slug", dataIndex: "slug" },
                                    { title: "Title", dataIndex: "title" },
                                    { title: "Short Desc", dataIndex: "short_desc" },
                                    { title: "Status", dataIndex: "status", width: 120 },
                                    {
                                        title: "Actions",
                                        width: 120,
                                        render: (_: any, record: any) => (
                                            <div className="flex gap-2">
                                                <Button size="small" onClick={() => setEditingId(record.id)}>Edit</Button>
                                                <Popconfirm
                                                    title="Delete page?"
                                                    okButtonProps={{ danger: true }}
                                                    onConfirm={async () => {
                                                        await deleteCmsPage(record.id);
                                                        message.success("Deleted");
                                                        refetch();
                                                    }}
                                                >
                                                    <Button size="small" danger>Delete</Button>
                                                </Popconfirm>
                                            </div>
                                        ),
                                    },
                                ]}
                                title={() => (
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Pages</span>
                                        <Button type="primary" onClick={() => setOpenCreate(true)}>Add Page</Button>
                                    </div>
                                )}
                            />
                        )}
                        {activeKey === "categories" && (
                            <Table
                                loading={loadingCategories}
                                rowKey="id"
                                dataSource={categories}
                                pagination={false}
                                columns={[
                                    { title: "ID", dataIndex: "id", width: 80 },
                                    { title: "Slug", dataIndex: "slug" },
                                    { title: "Title", dataIndex: "title" },
                                    { title: "Short Desc", dataIndex: "short_desc" },
                                    { title: "Status", dataIndex: "status", width: 120 },
                                    { title: "Order", dataIndex: "order_index", width: 80 },
                                    {
                                        title: "Actions",
                                        width: 120,
                                        render: (_: any, record: any) => (
                                            <Button size="small" onClick={() => setViewCategoryId(record.id)}>View</Button>
                                        ),
                                    },
                                ]}
                                title={() => (
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Categories</span>
                                        <Button type="primary" onClick={() => setOpenCreateCategory(true)}>Add Category</Button>
                                    </div>
                                )}
                            />
                        )}
                        {activeKey === "contents" && (
                            <Table
                                loading={loadingContents}
                                rowKey="id"
                                dataSource={contents}
                                pagination={false}
                                columns={[
                                    { title: "ID", dataIndex: "id", width: 70 },
                                    { title: "Title", dataIndex: "title" },
                                    { title: "Type", dataIndex: "type", width: 100 },
                                    { title: "Position", dataIndex: "position", width: 120 },
                                    { title: "Order", dataIndex: "order_index", width: 80 },
                                    { title: "Status", dataIndex: "status", width: 100 },
                                    {
                                        title: "Actions",
                                        width: 160,
                                        render: (_: any, record: any) => (
                                            <div className="flex gap-2">
                                                <Button size="small" onClick={() => setEditingContentId(record.id)}>Edit</Button>
                                                <Popconfirm
                                                    title="Delete content?"
                                                    okButtonProps={{ danger: true }}
                                                    onConfirm={async () => {
                                                        await deleteCmsContent(record.id);
                                                        message.success("Deleted");
                                                        invalidateContents();
                                                    }}
                                                >
                                                    <Button size="small" danger>Delete</Button>
                                                </Popconfirm>
                                            </div>
                                        ),
                                    },
                                ]}
                                title={() => (
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Contents</span>
                                        <Button type="primary" onClick={() => setOpenCreateContent(true)}>Add Content</Button>
                                    </div>
                                )}
                            />
                        )}
                        {activeKey === "banners" && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Page ID:</span>
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={bannerPageId ?? ""}
                                        onChange={(e) => setBannerPageId(e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">-- Select Page --</option>
                                        {(pages || []).map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.title} (#{p.id})</option>
                                        ))}
                                    </select>
                                    <Button type="primary" disabled={!bannerPageId} onClick={() => setOpenCreateBanner(true)}>Add Banner</Button>
                                </div>

                                <Table
                                    loading={loadingBanners}
                                    rowKey="id"
                                    dataSource={banners}
                                    pagination={false}
                                    columns={[
                                        { title: "ID", dataIndex: "id", width: 70 },
                                        { title: "Title", dataIndex: "title" },
                                        { title: "Link", dataIndex: "link" },
                                        { title: "Section", dataIndex: "section", width: 120 },
                                        { title: "Order", dataIndex: "order_index", width: 80 },
                                        { title: "Status", dataIndex: "status", width: 100 },
                                        {
                                            title: "Actions",
                                            width: 160,
                                            render: (_: any, record: any) => (
                                                <div className="flex gap-2">
                                                    <Button size="small" onClick={() => setEditingBannerId(record.id)}>Edit</Button>
                                                    <Popconfirm
                                                        title="Delete banner?"
                                                        okButtonProps={{ danger: true }}
                                                        onConfirm={async () => {
                                                            await deleteCmsBanner(record.id);
                                                            message.success("Deleted");
                                                            if (bannerPageId) invalidateBanners(bannerPageId);
                                                        }}
                                                    >
                                                        <Button size="small" danger>Delete</Button>
                                                    </Popconfirm>
                                                </div>
                                            ),
                                        },
                                    ]}
                                />
                            </div>
                        )}
                        {activeKey === "settings" && (
                            <Table
                                loading={loadingSettings}
                                rowKey="id"
                                dataSource={settings}
                                pagination={false}
                                columns={[
                                    { title: "ID", dataIndex: "id", width: 70 },
                                    { title: "Key", dataIndex: "key" },
                                    { title: "Value", dataIndex: "value" },
                                    { title: "Description", dataIndex: "description" },
                                    { title: "Enabled", dataIndex: "is_enabled", width: 100, render: (v: boolean) => v ? "Yes" : "No" },
                                    {
                                        title: "Actions",
                                        width: 160,
                                        render: (_: any, record: any) => (
                                            <div className="flex gap-2">
                                                <Button size="small" onClick={() => setEditingSettingId(record.id)}>Edit</Button>
                                                <Popconfirm
                                                    title="Delete setting?"
                                                    okButtonProps={{ danger: true }}
                                                    onConfirm={async () => {
                                                        await deleteCmsSetting(record.id);
                                                        message.success("Deleted");
                                                        invalidateSettings();
                                                    }}
                                                >
                                                    <Button size="small" danger>Delete</Button>
                                                </Popconfirm>
                                            </div>
                                        ),
                                    },
                                ]}
                                title={() => (
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Settings</span>
                                        <Button type="primary" onClick={() => setOpenCreateSetting(true)}>Add Setting</Button>
                                    </div>
                                )}
                            />
                        )}
                        {activeKey === "aggregate" && (
                            <div className="grid grid-cols-1 gap-6 p-2">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                                    <div className="font-semibold">Page − Category</div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <select className="border rounded px-2 py-1" value={bannerPageId ?? ""} onChange={(e) => setBannerPageId(e.target.value ? Number(e.target.value) : null)}>
                                            <option value="">-- Select Page --</option>
                                            {(pages || []).map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.title} (#{p.id})</option>
                                            ))}
                                        </select>
                                        <select className="border rounded px-2 py-1" id="agg-page-category-category">
                                            <option value="">-- Select Category --</option>
                                            {(categories || []).map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                                            ))}
                                        </select>
                                        <Button
                                            type="primary"
                                            disabled={!bannerPageId}
                                            onClick={async () => {
                                                const cat = (document.getElementById("agg-page-category-category") as HTMLSelectElement)?.value;
                                                if (!bannerPageId || !cat) return;
                                                await linkPageCategory({ page_id: bannerPageId, category_id: Number(cat) });
                                                message.success("Linked page-category");
                                            }}
                                        >
                                            Link
                                        </Button>
                                        <Button
                                            danger
                                            onClick={async () => {
                                                const cat = (document.getElementById("agg-page-category-category") as HTMLSelectElement)?.value;
                                                if (!bannerPageId || !cat) return;
                                                await unlinkPageCategory({ page_id: bannerPageId, category_id: Number(cat) });
                                                message.success("Unlinked page-category");
                                            }}
                                        >
                                            Unlink
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                                    <div className="font-semibold">Category − Content</div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <select className="border rounded px-2 py-1" id="agg-category-content-category">
                                            <option value="">-- Select Category --</option>
                                            {(categories || []).map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                                            ))}
                                        </select>
                                        <select className="border rounded px-2 py-1" id="agg-category-content-content">
                                            <option value="">-- Select Content --</option>
                                            {(contents || []).map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                                            ))}
                                        </select>
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                const cid = (document.getElementById("agg-category-content-category") as HTMLSelectElement)?.value;
                                                const tid = (document.getElementById("agg-category-content-content") as HTMLSelectElement)?.value;
                                                if (!cid || !tid) return;
                                                await linkCategoryContent({ category_id: Number(cid), content_id: Number(tid) });
                                                message.success("Linked category-content");
                                            }}
                                        >
                                            Link
                                        </Button>
                                        <Button
                                            danger
                                            onClick={async () => {
                                                const cid = (document.getElementById("agg-category-content-category") as HTMLSelectElement)?.value;
                                                const tid = (document.getElementById("agg-category-content-content") as HTMLSelectElement)?.value;
                                                if (!cid || !tid) return;
                                                await unlinkCategoryContent({ category_id: Number(cid), content_id: Number(tid) });
                                                message.success("Unlinked category-content");
                                            }}
                                        >
                                            Unlink
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                                    <div className="font-semibold">Page − Content</div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <select className="border rounded px-2 py-1" id="agg-page-content-page" value={bannerPageId ?? ""} onChange={(e) => setBannerPageId(e.target.value ? Number(e.target.value) : null)}>
                                            <option value="">-- Select Page --</option>
                                            {(pages || []).map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.title} (#{p.id})</option>
                                            ))}
                                        </select>
                                        <select className="border rounded px-2 py-1" id="agg-page-content-content">
                                            <option value="">-- Select Content --</option>
                                            {(contents || []).map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                                            ))}
                                        </select>
                                        <Button
                                            type="primary"
                                            disabled={!bannerPageId}
                                            onClick={async () => {
                                                const tid = (document.getElementById("agg-page-content-content") as HTMLSelectElement)?.value;
                                                if (!bannerPageId || !tid) return;
                                                await linkPageContent({ page_id: bannerPageId, content_id: Number(tid) });
                                                message.success("Linked page-content");
                                            }}
                                        >
                                            Link
                                        </Button>
                                        <Button
                                            danger
                                            onClick={async () => {
                                                const tid = (document.getElementById("agg-page-content-content") as HTMLSelectElement)?.value;
                                                if (!bannerPageId || !tid) return;
                                                await unlinkPageContent({ page_id: bannerPageId, content_id: Number(tid) });
                                                message.success("Unlinked page-content");
                                            }}
                                        >
                                            Unlink
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                                    <div className="font-semibold">Category − Relation (Parent → Child)</div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <select className="border rounded px-2 py-1" id="agg-category-relation-parent">
                                            <option value="">-- Select Parent --</option>
                                            {(categories || []).map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                                            ))}
                                        </select>
                                        <select className="border rounded px-2 py-1" id="agg-category-relation-child">
                                            <option value="">-- Select Child --</option>
                                            {(categories || []).map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                                            ))}
                                        </select>
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                const pid = (document.getElementById("agg-category-relation-parent") as HTMLSelectElement)?.value;
                                                const cid = (document.getElementById("agg-category-relation-child") as HTMLSelectElement)?.value;
                                                if (!pid || !cid) return;
                                                await linkCategoryRelation({ parent_id: Number(pid), child_id: Number(cid) });
                                                message.success("Linked category-relation");
                                            }}
                                        >
                                            Link
                                        </Button>
                                        <Button
                                            danger
                                            onClick={async () => {
                                                const pid = (document.getElementById("agg-category-relation-parent") as HTMLSelectElement)?.value;
                                                const cid = (document.getElementById("agg-category-relation-child") as HTMLSelectElement)?.value;
                                                if (!pid || !cid) return;
                                                await unlinkCategoryRelation({ parent_id: Number(pid), child_id: Number(cid) });
                                                message.success("Unlinked category-relation");
                                            }}
                                        >
                                            Unlink
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeKey !== "pages" && activeKey !== "categories" && activeKey !== "contents" && activeKey !== "settings" && activeKey !== "banners" && activeKey !== "aggregate" && <div>Hello World</div>}
                    </div>
                </div>
            </div>
            <CreatePageModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSuccess={() => refetch()}
            />
            <CreatePageModal
                open={editingId !== null}
                page={(pages || []).find((p: any) => p.id === editingId)}
                onClose={() => setEditingId(null)}
                onSuccess={() => {
                    setEditingId(null);
                    refetch();
                }}
            />
            <CategoryDetailDrawer
                open={viewCategoryId !== null}
                onClose={() => setViewCategoryId(null)}
                data={categoryDetail}
            />
            <CreateCategoryModal
                open={openCreateCategory}
                onClose={() => setOpenCreateCategory(false)}
                onSuccess={() => {
                    setOpenCreateCategory(false);
                    invalidateCategories();
                }}
            />
            <CreateContentModal
                open={openCreateContent}
                onClose={() => setOpenCreateContent(false)}
                onSuccess={() => {
                    setOpenCreateContent(false);
                    invalidateContents();
                }}
            />
            <CreateContentModal
                open={editingContentId !== null}
                content={(contents || []).find((c: any) => c.id === editingContentId)}
                onClose={() => setEditingContentId(null)}
                onSuccess={() => {
                    setEditingContentId(null);
                    invalidateContents();
                }}
            />
            <CreateBannerModal
                open={openCreateBanner}
                defaultPageId={bannerPageId}
                onClose={() => setOpenCreateBanner(false)}
                onSuccess={() => {
                    setOpenCreateBanner(false);
                    if (bannerPageId) invalidateBanners(bannerPageId);
                }}
            />
            <CreateBannerModal
                open={editingBannerId !== null}
                defaultPageId={bannerPageId}
                banner={(banners || []).find((b: any) => b.id === editingBannerId)}
                onClose={() => setEditingBannerId(null)}
                onSuccess={() => {
                    setEditingBannerId(null);
                    if (bannerPageId) invalidateBanners(bannerPageId);
                }}
            />
            <CreateSettingModal
                open={openCreateSetting}
                onClose={() => setOpenCreateSetting(false)}
                onSuccess={() => {
                    setOpenCreateSetting(false);
                    invalidateSettings();
                }}
            />
            <CreateSettingModal
                open={editingSettingId !== null}
                setting={(settings || []).find((s: any) => s.id === editingSettingId)}
                onClose={() => setEditingSettingId(null)}
                onSuccess={() => {
                    setEditingSettingId(null);
                    invalidateSettings();
                }}
            />
        </div>
    );
}


