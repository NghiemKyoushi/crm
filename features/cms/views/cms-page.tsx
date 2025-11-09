"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CMSTabs from "../components/tabs/cms-tabs";
import { Button, Popconfirm, Table, message, Select } from "antd";
import { useCmsPages } from "../hooks/useCmsPages";
import CreatePageModal from "../components/CreatePageModal";
import { deleteCmsPage } from "../apis/pages";
import { useCmsCategories, useCmsCategoryDetail, useInvalidateCategories } from "../hooks/useCmsCategories";
import CategoryDetailDrawer from "../components/CategoryDetailDrawer";
import { deleteCmsCategory } from "../apis/categories";
import { useCmsContents, useInvalidateContents } from "../hooks/useCmsContents";
import { deleteCmsContent } from "../apis/contents";
import { useCmsBanners, useInvalidateBanners } from "../hooks/useCmsBanners";
import { deleteCmsBanner } from "../apis/banners";
import CreateBannerModal from "../components/CreateBannerModal";
import { useCmsSettings, useInvalidateSettings } from "../hooks/useCmsSettings";
import { deleteCmsSetting } from "../apis/settings";
import CreateSettingModal from "../components/CreateSettingModal";
import { linkCategoryContent, linkCategoryRelation, linkPageCategory, linkPageContent, unlinkCategoryContent, unlinkCategoryRelation, unlinkPageCategory, unlinkPageContent } from "../apis/aggregate";
import CreateCategoryModal from "../components/CreateCategoryModal";

export default function CMSFeaturePage() {
    const router = useRouter();
    const [activeKey, setActiveKey] = useState<string>("pages");
    // Pagination states
    const [pagesPage, setPagesPage] = useState<number>(0);
    const [pagesSize, setPagesSize] = useState<number>(20);
    const { data: pagesData, isLoading, refetch } = useCmsPages(pagesPage, pagesSize);
    const pages = Array.isArray(pagesData?.items) ? pagesData?.items : [];

    // Debug logging for pages
    React.useEffect(() => {
        console.log("🔍 Pages raw data:", pagesData);
        console.log("🔍 Pages processed:", pages);
        console.log("🔍 Pages is array:", Array.isArray(pages));
        console.log("🔍 Pages length:", pages?.length);
    }, [pagesData, pages]);
    const [openCreate, setOpenCreate] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [categoriesPage, setCategoriesPage] = useState<number>(0);
    const [categoriesSize, setCategoriesSize] = useState<number>(20);
    const { data: categoriesData, isLoading: loadingCategories } = useCmsCategories(categoriesPage, categoriesSize);
    const categories = Array.isArray(categoriesData?.items) ? categoriesData?.items : [];

    // Debug logging for categories
    React.useEffect(() => {
        console.log("🔍 Categories raw data:", categoriesData);
        console.log("🔍 Categories processed:", categories);
        console.log("🔍 Categories is array:", Array.isArray(categories));
        console.log("🔍 Categories length:", categories?.length);
    }, [categoriesData, categories]);
    const [viewCategoryId, setViewCategoryId] = useState<number | null>(null);
    const { data: categoryDetail } = useCmsCategoryDetail(viewCategoryId);
    const [openCreateCategory, setOpenCreateCategory] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const invalidateCategories = useInvalidateCategories();
    const [contentsPage, setContentsPage] = useState<number>(1); // contents API is 1-based
    const [contentsSize, setContentsSize] = useState<number>(20);
    const { data: contentsData, isLoading: loadingContents } = useCmsContents(contentsPage - 1, contentsSize);
    const contents = Array.isArray(contentsData?.items) ? contentsData?.items : [];
    const invalidateContents = useInvalidateContents();

    // Debug logging for contents
    React.useEffect(() => {
        console.log("🔍 Contents raw data:", contentsData);
        console.log("🔍 Contents processed:", contents);
        console.log("🔍 Contents is array:", Array.isArray(contents));
        console.log("🔍 Contents length:", contents?.length);
        console.log("🔍 Loading contents:", loadingContents);
    }, [contentsData, contents, loadingContents]);
    const [bannerPageId, setBannerPageId] = useState<number | null>(null);
    const { data: bannersData, isLoading: loadingBanners } = useCmsBanners(bannerPageId);
    const banners = Array.isArray(bannersData) ? bannersData : [];
    const invalidateBanners = useInvalidateBanners();

    // Set default bannerPageId to first page when pages are loaded
    React.useEffect(() => {
        if (pages && pages.length > 0 && !bannerPageId) {
            setBannerPageId(pages[0].id);
        }
    }, [pages, bannerPageId]);

    // Debug logging for banners
    React.useEffect(() => {
        console.log("🔍 Banners in component:", banners);
        console.log("🔍 Banners length:", banners?.length);
        console.log("🔍 Loading banners:", loadingBanners);
        console.log("🔍 Banner Page ID:", bannerPageId);
    }, [banners, loadingBanners, bannerPageId]);
    const [openCreateBanner, setOpenCreateBanner] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
    const [settingsPage, setSettingsPage] = useState<number>(0);
    const [settingsSize, setSettingsSize] = useState<number>(20);
    const { data: settingsData, isLoading: loadingSettings } = useCmsSettings(settingsPage, settingsSize);
    // Aggregate selectors – independent paginated sources for dropdowns
    const [aggPagesPage, setAggPagesPage] = useState<number>(0);
    const [aggPagesSize, setAggPagesSize] = useState<number>(20);
    const aggPagesData = useCmsPages(aggPagesPage, aggPagesSize).data;
    const aggPages = Array.isArray(aggPagesData?.items) ? aggPagesData?.items : [];

    const [aggCategoriesPage, setAggCategoriesPage] = useState<number>(0);
    const [aggCategoriesSize, setAggCategoriesSize] = useState<number>(20);
    const aggCategoriesData = useCmsCategories(aggCategoriesPage, aggCategoriesSize).data;
    const aggCategories = Array.isArray(aggCategoriesData?.items) ? aggCategoriesData?.items : [];

    const [aggContentsPage, setAggContentsPage] = useState<number>(1);
    const [aggContentsSize, setAggContentsSize] = useState<number>(20);
    const aggContentsData = useCmsContents(aggContentsPage - 1, aggContentsSize).data;
    const aggContents = Array.isArray(aggContentsData?.items) ? aggContentsData?.items : [];

    // Aggregate selections state
    const [aggSelectedCategoryForContent, setAggSelectedCategoryForContent] = useState<number | null>(null);
    const [aggSelectedContent, setAggSelectedContent] = useState<number | null>(null);
    const [aggSelectedCategoryForPage, setAggSelectedCategoryForPage] = useState<number | null>(null);
    const [aggSelectedContentForPage, setAggSelectedContentForPage] = useState<number | null>(null);
    const [aggParentCategoryId, setAggParentCategoryId] = useState<number | null>(null);
    const [aggChildCategoryId, setAggChildCategoryId] = useState<number | null>(null);
    const settings = Array.isArray(settingsData?.items) ? settingsData?.items : [];
    const invalidateSettings = useInvalidateSettings();

    // Debug logging for settings
    React.useEffect(() => {
        console.log("🔍 Settings raw data:", settingsData);
        console.log("🔍 Settings processed:", settings);
        console.log("🔍 Settings is array:", Array.isArray(settings));
        console.log("🔍 Settings length:", settings?.length);
        console.log("🔍 Loading settings:", loadingSettings);
    }, [settingsData, settings, loadingSettings]);
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
                                pagination={{
                                    current: pagesPage + 1,
                                    pageSize: pagesSize,
                                    total: pagesData?.totalElements,
                                    onChange: (p, s) => {
                                        setPagesPage(p - 1);
                                        setPagesSize(s);
                                    },
                                }}
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
                                pagination={{
                                    current: categoriesPage + 1,
                                    pageSize: categoriesSize,
                                    total: categoriesData?.totalElements,
                                    onChange: (p, s) => {
                                        setCategoriesPage(p - 1);
                                        setCategoriesSize(s);
                                    },
                                }}
                                columns={[
                                    { title: "ID", dataIndex: "id", width: 80 },
                                    { title: "Slug", dataIndex: "slug" },
                                    { title: "Title", dataIndex: "title" },
                                    { title: "Short Desc", dataIndex: "short_desc" },
                                    { title: "Status", dataIndex: "status", width: 120 },
                                    { title: "Order", dataIndex: "order_index", width: 80 },
                                    {
                                        title: "Actions",
                                        width: 220,
                                        render: (_: any, record: any) => (
                                            <div className="flex gap-2">
                                                <Button size="small" onClick={() => setViewCategoryId(record.id)}>View</Button>
                                                <Button size="small" onClick={() => setEditingCategoryId(record.id)}>Edit</Button>
                                                <Popconfirm
                                                    title="Delete category?"
                                                    okButtonProps={{ danger: true }}
                                                    onConfirm={async () => {
                                                        await deleteCmsCategory(record.id);
                                                        message.success("Deleted");
                                                        invalidateCategories();
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
                                pagination={{
                                    current: contentsPage,
                                    pageSize: contentsSize,
                                    total: contentsData?.totalElements,
                                    onChange: (p, s) => {
                                        setContentsPage(p);
                                        setContentsSize(s);
                                    },
                                }}
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
                                                <Button size="small" onClick={() => router.push(`/cms/content/${record.id}`)}>Edit</Button>
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
                                        <Button type="primary" onClick={() => router.push('/cms/content/new')}>Add Content</Button>
                                    </div>
                                )}
                            />
                        )}
                        {activeKey === "banners" && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Page:</span>
                                    <Select
                                        style={{ width: 280 }}
                                        showSearch
                                        placeholder="Select Page"
                                        value={bannerPageId ?? undefined}
                                        onChange={(v) => setBannerPageId(v || null)}
                                        allowClear
                                        options={(aggPages || []).map((p: any) => ({ value: p.id, label: `${p.title} (#${p.id})` }))}
                                        dropdownRender={(menu) => (
                                            <div>
                                                {menu}
                                                <div className="px-2 py-2 border-t border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <Button size="small" disabled={aggPagesPage === 0} onClick={() => setAggPagesPage(Math.max(0, aggPagesPage - 1))}>Prev</Button>
                                                        <span className="text-xs">Page {aggPagesPage + 1} / {Math.max(1, aggPagesData?.totalPages || 1)}</span>
                                                        <Button size="small" disabled={(aggPagesData?.totalPages || 1) <= (aggPagesPage + 1)} onClick={() => setAggPagesPage(aggPagesPage + 1)}>Next</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    />
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
                                pagination={{
                                    current: settingsPage + 1,
                                    pageSize: settingsSize,
                                    total: settingsData?.totalElements,
                                    onChange: (p, s) => {
                                        setSettingsPage(p - 1);
                                        setSettingsSize(s);
                                    },
                                }}
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
                                        <Select
                                            style={{ width: 280 }}
                                            showSearch
                                            placeholder="Select Category"
                                            id="agg-page-category-category"
                                            value={aggSelectedCategoryForPage ?? undefined}
                                            onChange={(v) => setAggSelectedCategoryForPage(v ?? null)}
                                            options={(aggCategories || []).map((c: any) => ({ value: c.id, label: `${c.title} (#${c.id})` }))}
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <Button size="small" disabled={aggCategoriesPage === 0} onClick={() => setAggCategoriesPage(Math.max(0, aggCategoriesPage - 1))}>Prev</Button>
                                                            <span className="text-xs">Page {aggCategoriesPage + 1} / {Math.max(1, aggCategoriesData?.totalPages || 1)}</span>
                                                            <Button size="small" disabled={(aggCategoriesData?.totalPages || 1) <= (aggCategoriesPage + 1)} onClick={() => setAggCategoriesPage(aggCategoriesPage + 1)}>Next</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="primary"
                                            disabled={!bannerPageId}
                                            onClick={async () => {
                                                const cat = aggSelectedCategoryForPage;
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
                                                const cat = aggSelectedCategoryForPage;
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
                                        <Select
                                            style={{ width: 280 }}
                                            showSearch
                                            placeholder="Select Category"
                                            id="agg-category-content-category"
                                            value={aggSelectedCategoryForContent ?? undefined}
                                            onChange={(v) => setAggSelectedCategoryForContent(v ?? null)}
                                            options={(aggCategories || []).map((c: any) => ({ value: c.id, label: `${c.title} (#${c.id})` }))}
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <Button size="small" disabled={aggCategoriesPage === 0} onClick={() => setAggCategoriesPage(Math.max(0, aggCategoriesPage - 1))}>Prev</Button>
                                                            <span className="text-xs">Page {aggCategoriesPage + 1} / {Math.max(1, aggCategoriesData?.totalPages || 1)}</span>
                                                            <Button size="small" disabled={(aggCategoriesData?.totalPages || 1) <= (aggCategoriesPage + 1)} onClick={() => setAggCategoriesPage(aggCategoriesPage + 1)}>Next</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Select
                                            style={{ width: 280 }}
                                            showSearch
                                            placeholder="Select Content"
                                            id="agg-category-content-content"
                                            value={aggSelectedContent ?? undefined}
                                            onChange={(v) => setAggSelectedContent(v ?? null)}
                                            options={(aggContents || []).map((c: any) => ({ value: c.id, label: `${c.title} (#${c.id})` }))}
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <Button size="small" disabled={aggContentsPage === 1} onClick={() => setAggContentsPage(Math.max(1, aggContentsPage - 1))}>Prev</Button>
                                                            <span className="text-xs">Page {aggContentsPage} / {Math.max(1, aggContentsData?.totalPages || 1)}</span>
                                                            <Button size="small" disabled={(aggContentsData?.totalPages || 1) <= aggContentsPage} onClick={() => setAggContentsPage(aggContentsPage + 1)}>Next</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                const cid = aggSelectedCategoryForContent;
                                                const tid = aggSelectedContent;
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
                                                const cid = aggSelectedCategoryForContent;
                                                const tid = aggSelectedContent;
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
                                        <Select
                                            style={{ width: 280 }}
                                            showSearch
                                            placeholder="Select Page"
                                            id="agg-page-content-page"
                                            value={bannerPageId ?? undefined}
                                            onChange={(v) => setBannerPageId(v || null)}
                                            allowClear
                                            options={(aggPages || []).map((p: any) => ({ value: p.id, label: `${p.title} (#${p.id})` }))}
        
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <Button size="small" disabled={aggPagesPage === 0} onClick={() => setAggPagesPage(Math.max(0, aggPagesPage - 1))}>Prev</Button>
                                                            <span className="text-xs">Page {aggPagesPage + 1} / {Math.max(1, aggPagesData?.totalPages || 1)}</span>
                                                            <Button size="small" disabled={(aggPagesData?.totalPages || 1) <= (aggPagesPage + 1)} onClick={() => setAggPagesPage(aggPagesPage + 1)}>Next</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Select
                                            style={{ width: 280 }}
                                            showSearch
                                            placeholder="Select Content"
                                            id="agg-page-content-content"
                                            value={aggSelectedContentForPage ?? undefined}
                                            onChange={(v) => setAggSelectedContentForPage(v ?? null)}
                                            options={(aggContents || []).map((c: any) => ({ value: c.id, label: `${c.title} (#${c.id})` }))}
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <Button size="small" disabled={aggContentsPage === 1} onClick={() => setAggContentsPage(Math.max(1, aggContentsPage - 1))}>Prev</Button>
                                                            <span className="text-xs">Page {aggContentsPage} / {Math.max(1, aggContentsData?.totalPages || 1)}</span>
                                                            <Button size="small" disabled={(aggContentsData?.totalPages || 1) <= aggContentsPage} onClick={() => setAggContentsPage(aggContentsPage + 1)}>Next</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="primary"
                                            disabled={!bannerPageId}
                                            onClick={async () => {
                                                const tid = aggSelectedContentForPage;
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
                                                const tid = aggSelectedContentForPage;
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
                                        <Select
                                            style={{ width: 280 }}
                                            showSearch
                                            placeholder="Select Parent"
                                            id="agg-category-relation-parent"
                                            value={aggParentCategoryId ?? undefined}
                                            onChange={(v) => setAggParentCategoryId(v ?? null)}
                                            options={(aggCategories || []).map((c: any) => ({ value: c.id, label: `${c.title} (#${c.id})` }))}
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <Button size="small" disabled={aggCategoriesPage === 0} onClick={() => setAggCategoriesPage(Math.max(0, aggCategoriesPage - 1))}>Prev</Button>
                                                            <span className="text-xs">Page {aggCategoriesPage + 1} / {Math.max(1, aggCategoriesData?.totalPages || 1)}</span>
                                                            <Button size="small" disabled={(aggCategoriesData?.totalPages || 1) <= (aggCategoriesPage + 1)} onClick={() => setAggCategoriesPage(aggCategoriesPage + 1)}>Next</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Select
                                            style={{ width: 280 }}
                                            showSearch
                                            placeholder="Select Child"
                                            id="agg-category-relation-child"
                                            value={aggChildCategoryId ?? undefined}
                                            onChange={(v) => setAggChildCategoryId(v ?? null)}
                                            options={(aggCategories || []).map((c: any) => ({ value: c.id, label: `${c.title} (#${c.id})` }))}
                                            dropdownRender={(menu) => (
                                                <div>
                                                    {menu}
                                                    <div className="px-2 py-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <Button size="small" disabled={aggCategoriesPage === 0} onClick={() => setAggCategoriesPage(Math.max(0, aggCategoriesPage - 1))}>Prev</Button>
                                                            <span className="text-xs">Page {aggCategoriesPage + 1} / {Math.max(1, aggCategoriesData?.totalPages || 1)}</span>
                                                            <Button size="small" disabled={(aggCategoriesData?.totalPages || 1) <= (aggCategoriesPage + 1)} onClick={() => setAggCategoriesPage(aggCategoriesPage + 1)}>Next</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                const pid = aggParentCategoryId;
                                                const cid = aggChildCategoryId;
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
                                                const pid = aggParentCategoryId;
                                                const cid = aggChildCategoryId;
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
            <CreateCategoryModal
                open={editingCategoryId !== null}
                category={(categories || []).find((c: any) => c.id === editingCategoryId)}
                onClose={() => setEditingCategoryId(null)}
                onSuccess={() => {
                    setEditingCategoryId(null);
                    invalidateCategories();
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


