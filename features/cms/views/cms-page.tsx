"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CMSTabs from "../components/tabs/cms-tabs";
import { Button, Popconfirm, Table, message, Select, Tabs, Checkbox, Switch, Modal, ConfigProvider } from "antd";
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
import { linkCategoryContent, linkCategoryRelation, linkPageCategory, linkPageContent, unlinkCategoryContent, unlinkCategoryRelation, unlinkPageCategory, unlinkPageContent, getPageCategories, getPageContents, getCategoryContents, getCategoryRelations, AggregateItem } from "../apis/aggregate";
import CreateCategoryModal from "../components/CreateCategoryModal";
import CategoryTreeManager from "../components/CategoryTreeManager";
import CMSTreeManager from "../components/CMSTreeManager";
import CreateContentModal from "../components/CreateContentModal";

export default function CMSFeaturePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Get initial tab from URL or default to "pages"
    const getTabFromUrl = () => {
        const tab = searchParams.get("tab");
        const validTabs = ["pages", "categories", "contents", "banners", "settings", "aggregate"];
        return tab && validTabs.includes(tab) ? tab : "pages";
    };

    const [activeKey, setActiveKey] = useState<string>(getTabFromUrl());

    // Update URL when tab changes - use full page reload to avoid state conflicts
    const handleTabChange = (key: string) => {
        if (key === activeKey) return;
        // Use window.location to trigger full page reload, same as direct URL change
        // This ensures clean state initialization, avoiding crashes
        window.location.href = `${pathname}?tab=${key}`;
    };

    // Sync activeKey with URL when URL changes (e.g., browser back/forward)
    useEffect(() => {
        const tabFromUrl = getTabFromUrl();
        setActiveKey(prev => prev !== tabFromUrl ? tabFromUrl : prev);
    }, [searchParams]);
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

    // Pagination states for right tables (same as left tables)
    // For Page-Category tab: right table uses categories pagination
    // For Page-Content tab: right table uses contents pagination  
    // For Category-Content tab: right table uses contents pagination
    // For Category-Relation tab: right table uses categories pagination

    // Aggregate selections state
    const [aggSelectedCategoryForContent, setAggSelectedCategoryForContent] = useState<number | null>(null);
    const [aggSelectedContent, setAggSelectedContent] = useState<number | null>(null);
    const [aggSelectedCategoryForPage, setAggSelectedCategoryForPage] = useState<number | null>(null);
    const [aggSelectedContentForPage, setAggSelectedContentForPage] = useState<number | null>(null);
    const [aggParentCategoryId, setAggParentCategoryId] = useState<number | null>(null);
    const [aggChildCategoryId, setAggChildCategoryId] = useState<number | null>(null);

    // Aggregate tabs state
    const [aggActiveTab, setAggActiveTab] = useState<string>("page-category");

    // Selected items for each tab
    const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<number | null>(null);

    // Linked items (set of IDs) for each tab
    const [linkedPageCategories, setLinkedPageCategories] = useState<Set<number>>(new Set());
    const [linkedPageContents, setLinkedPageContents] = useState<Set<number>>(new Set());
    const [linkedCategoryContents, setLinkedCategoryContents] = useState<Set<number>>(new Set());
    const [linkedCategoryRelations, setLinkedCategoryRelations] = useState<Set<number>>(new Set());

    // Selected items data from API aggregate (for switch ON)
    const [selectedPageCategoriesData, setSelectedPageCategoriesData] = useState<AggregateItem[]>([]);
    const [selectedPageContentsData, setSelectedPageContentsData] = useState<AggregateItem[]>([]);
    const [selectedCategoryContentsData, setSelectedCategoryContentsData] = useState<AggregateItem[]>([]);
    const [selectedCategoryRelationsData, setSelectedCategoryRelationsData] = useState<AggregateItem[]>([]);

    // Loading states
    const [loadingPageCategories, setLoadingPageCategories] = useState(false);
    const [loadingPageContents, setLoadingPageContents] = useState(false);
    const [loadingCategoryContents, setLoadingCategoryContents] = useState(false);
    const [loadingCategoryRelations, setLoadingCategoryRelations] = useState(false);

    // Loading states for fetching selected items
    const [loadingSelectedPageCategories, setLoadingSelectedPageCategories] = useState(false);
    const [loadingSelectedPageContents, setLoadingSelectedPageContents] = useState(false);
    const [loadingSelectedCategoryContents, setLoadingSelectedCategoryContents] = useState(false);
    const [loadingSelectedCategoryRelations, setLoadingSelectedCategoryRelations] = useState(false);

    // Switch states for filtering right tables (show only selected items)
    const [showOnlySelectedPageCategories, setShowOnlySelectedPageCategories] = useState(false);
    const [showOnlySelectedPageContents, setShowOnlySelectedPageContents] = useState(false);
    const [showOnlySelectedCategoryContents, setShowOnlySelectedCategoryContents] = useState(false);
    const [showOnlySelectedCategoryRelations, setShowOnlySelectedCategoryRelations] = useState(false);

    // Reset selected items and linked sets when switching tabs
    React.useEffect(() => {
        setSelectedPageId(null);
        setSelectedCategoryId(null);
        setSelectedParentCategoryId(null);
        setLinkedPageCategories(new Set());
        setLinkedPageContents(new Set());
        setLinkedCategoryContents(new Set());
        setLinkedCategoryRelations(new Set());
        setSelectedPageCategoriesData([]);
        setSelectedPageContentsData([]);
        setSelectedCategoryContentsData([]);
        setSelectedCategoryRelationsData([]);
        setShowOnlySelectedPageCategories(false);
        setShowOnlySelectedPageContents(false);
        setShowOnlySelectedCategoryContents(false);
        setShowOnlySelectedCategoryRelations(false);
    }, [aggActiveTab]);

    // Fetch selected items when switch is turned ON
    React.useEffect(() => {
        if (showOnlySelectedPageCategories && selectedPageId) {
            setLoadingSelectedPageCategories(true);
            getPageCategories(selectedPageId)
                .then(data => {
                    setSelectedPageCategoriesData(data);
                })
                .catch(error => {
                    message.error("Failed to load selected categories");
                    setSelectedPageCategoriesData([]);
                })
                .finally(() => {
                    setLoadingSelectedPageCategories(false);
                });
        } else {
            setSelectedPageCategoriesData([]);
        }
    }, [showOnlySelectedPageCategories, selectedPageId]);

    React.useEffect(() => {
        if (showOnlySelectedPageContents && selectedPageId) {
            setLoadingSelectedPageContents(true);
            getPageContents(selectedPageId)
                .then(data => {
                    setSelectedPageContentsData(data);
                })
                .catch(error => {
                    message.error("Failed to load selected contents");
                    setSelectedPageContentsData([]);
                })
                .finally(() => {
                    setLoadingSelectedPageContents(false);
                });
        } else {
            setSelectedPageContentsData([]);
        }
    }, [showOnlySelectedPageContents, selectedPageId]);

    React.useEffect(() => {
        if (showOnlySelectedCategoryContents && selectedCategoryId) {
            setLoadingSelectedCategoryContents(true);
            getCategoryContents(selectedCategoryId)
                .then(data => {
                    setSelectedCategoryContentsData(data);
                })
                .catch(error => {
                    message.error("Failed to load selected contents");
                    setSelectedCategoryContentsData([]);
                })
                .finally(() => {
                    setLoadingSelectedCategoryContents(false);
                });
        } else {
            setSelectedCategoryContentsData([]);
        }
    }, [showOnlySelectedCategoryContents, selectedCategoryId]);

    React.useEffect(() => {
        if (showOnlySelectedCategoryRelations && selectedParentCategoryId) {
            setLoadingSelectedCategoryRelations(true);
            getCategoryRelations(selectedParentCategoryId)
                .then(data => {
                    setSelectedCategoryRelationsData(data);
                })
                .catch(error => {
                    message.error("Failed to load selected relations");
                    setSelectedCategoryRelationsData([]);
                })
                .finally(() => {
                    setLoadingSelectedCategoryRelations(false);
                });
        } else {
            setSelectedCategoryRelationsData([]);
        }
    }, [showOnlySelectedCategoryRelations, selectedParentCategoryId]);

    // Data for right tables based on switch state
    const filteredPageCategories = showOnlySelectedPageCategories
        ? selectedPageCategoriesData
        : categories;

    const filteredPageContents = showOnlySelectedPageContents
        ? selectedPageContentsData
        : contents;

    const filteredCategoryContents = showOnlySelectedCategoryContents
        ? selectedCategoryContentsData
        : contents;

    const filteredCategoryRelations = showOnlySelectedCategoryRelations
        ? selectedCategoryRelationsData
        : categories;

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
        <ConfigProvider wave={{ disabled: true }}>
            <div className="bg-white min-h-full">
                <div className="p-4">
                    <div className="border border-gray-200 rounded-lg">
                        <CMSTabs activeKey={activeKey} onChange={handleTabChange} />
                        <div className="p-4">
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
                                <CMSTreeManager
                                    onEditPage={(pageId) => setEditingId(pageId)}
                                    onEditCategory={(categoryId) => setEditingCategoryId(categoryId)}
                                    onEditContent={(contentId) => router.push(`/cms/content/${contentId}`)}
                                    onDeletePage={async (pageId) => {
                                        Modal.confirm({
                                            title: "Delete page?",
                                            content: "This will delete the page and all its relations. Are you sure?",
                                            okText: "Delete",
                                            okButtonProps: { danger: true },
                                            onOk: async () => {
                                                try {
                                                    await deleteCmsPage(pageId);
                                                    message.success("Deleted");
                                                    refetch();
                                                } catch (error) {
                                                    message.error("Failed to delete page");
                                                }
                                            },
                                        });
                                    }}
                                    onDeleteCategory={async (categoryId) => {
                                        Modal.confirm({
                                            title: "Delete category?",
                                            content: "This will delete the category and all its relations. Are you sure?",
                                            okText: "Delete",
                                            okButtonProps: { danger: true },
                                            onOk: async () => {
                                                try {
                                                    await deleteCmsCategory(categoryId);
                                                    message.success("Deleted");
                                                    invalidateCategories();
                                                } catch (error) {
                                                    message.error("Failed to delete category");
                                                }
                                            },
                                        });
                                    }}
                                    onDeleteContent={async (contentId) => {
                                        Modal.confirm({
                                            title: "Delete content?",
                                            content: "This will delete the content and all its relations. Are you sure?",
                                            okText: "Delete",
                                            okButtonProps: { danger: true },
                                            onOk: async () => {
                                                try {
                                                    await deleteCmsContent(contentId);
                                                    message.success("Deleted");
                                                    invalidateContents();
                                                } catch (error) {
                                                    message.error("Failed to delete content");
                                                }
                                            },
                                        });
                                    }}
                                    onCreateCategory={() => setOpenCreateCategory(true)}
                                    onCreateContent={() => router.push('/cms/content/new')}
                                />
                            )}
                            {activeKey === "aggregate-legacy" && (
                                <div className="p-2">
                                    <Tabs
                                        activeKey={aggActiveTab}
                                        onChange={setAggActiveTab}
                                        items={[
                                            {
                                                key: "page-category",
                                                label: "Page − Category",
                                                children: (
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
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
                                                                onRow={(record) => ({
                                                                    onClick: async () => {
                                                                        setSelectedPageId(record.id);
                                                                        setLoadingPageCategories(true);
                                                                        try {
                                                                            const linkedData = await getPageCategories(record.id);
                                                                            const linkedIds = new Set(linkedData.map(item => item.id));
                                                                            setLinkedPageCategories(linkedIds);
                                                                        } catch (error) {
                                                                            message.error("Failed to load page categories");
                                                                            setLinkedPageCategories(new Set());
                                                                        } finally {
                                                                            setLoadingPageCategories(false);
                                                                        }
                                                                    },
                                                                    style: { cursor: "pointer" },
                                                                })}
                                                                rowClassName={(record) => (selectedPageId === record.id ? "bg-blue-50" : "")}
                                                                columns={[
                                                                    { title: "ID", dataIndex: "id", width: 80 },
                                                                    { title: "Title", dataIndex: "title" },
                                                                    { title: "Slug", dataIndex: "slug" },
                                                                ]}
                                                                title={() => <span className="font-semibold">Pages</span>}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Table
                                                                loading={loadingPageCategories || loadingCategories || loadingSelectedPageCategories}
                                                                rowKey="id"
                                                                dataSource={filteredPageCategories}
                                                                pagination={showOnlySelectedPageCategories ? false : {
                                                                    current: categoriesPage + 1,
                                                                    pageSize: categoriesSize,
                                                                    total: categoriesData?.totalElements,
                                                                    onChange: (p, s) => {
                                                                        setCategoriesPage(p - 1);
                                                                        setCategoriesSize(s);
                                                                    },
                                                                }}
                                                                columns={[
                                                                    {
                                                                        title: "",
                                                                        width: 60,
                                                                        render: (_: any, record: any) => (
                                                                            <Checkbox
                                                                                checked={showOnlySelectedPageCategories
                                                                                    ? selectedPageCategoriesData.some(item => item.id === record.id)
                                                                                    : linkedPageCategories.has(record.id)}
                                                                                disabled={!selectedPageId}
                                                                                onChange={async (e) => {
                                                                                    if (!selectedPageId) return;
                                                                                    const isChecked = e.target.checked;
                                                                                    try {
                                                                                        if (isChecked) {
                                                                                            await linkPageCategory({ page_id: selectedPageId, category_id: record.id });
                                                                                            setLinkedPageCategories(prev => new Set([...prev, record.id]));
                                                                                            message.success("Linked successfully");
                                                                                        } else {
                                                                                            await unlinkPageCategory({ page_id: selectedPageId, category_id: record.id });
                                                                                            setLinkedPageCategories(prev => {
                                                                                                const newSet = new Set(prev);
                                                                                                newSet.delete(record.id);
                                                                                                return newSet;
                                                                                            });
                                                                                            message.success("Unlinked successfully");
                                                                                        }
                                                                                        // Refresh selected data if switch is ON
                                                                                        if (showOnlySelectedPageCategories) {
                                                                                            const data = await getPageCategories(selectedPageId);
                                                                                            setSelectedPageCategoriesData(data);
                                                                                        }
                                                                                    } catch (error) {
                                                                                        message.error(isChecked ? "Failed to link" : "Failed to unlink");
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ),
                                                                    },
                                                                    { title: "ID", dataIndex: "id", width: 80 },
                                                                    { title: "Title", dataIndex: "title" },
                                                                ]}
                                                                title={() => (
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-semibold">Categories</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm">Show selected only</span>
                                                                            <Switch
                                                                                checked={showOnlySelectedPageCategories}
                                                                                onChange={setShowOnlySelectedPageCategories}
                                                                                disabled={!selectedPageId}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                locale={{ emptyText: selectedPageId ? "No categories found" : "Select a page to view categories" }}
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                key: "page-content",
                                                label: "Page − Content",
                                                children: (
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
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
                                                                onRow={(record) => ({
                                                                    onClick: async () => {
                                                                        setSelectedPageId(record.id);
                                                                        setLoadingPageContents(true);
                                                                        try {
                                                                            const linkedData = await getPageContents(record.id);
                                                                            const linkedIds = new Set(linkedData.map(item => item.id));
                                                                            setLinkedPageContents(linkedIds);
                                                                        } catch (error) {
                                                                            message.error("Failed to load page contents");
                                                                            setLinkedPageContents(new Set());
                                                                        } finally {
                                                                            setLoadingPageContents(false);
                                                                        }
                                                                    },
                                                                    style: { cursor: "pointer" },
                                                                })}
                                                                rowClassName={(record) => (selectedPageId === record.id ? "bg-blue-50" : "")}
                                                                columns={[
                                                                    { title: "ID", dataIndex: "id", width: 80 },
                                                                    { title: "Title", dataIndex: "title" },
                                                                    { title: "Slug", dataIndex: "slug" },
                                                                ]}
                                                                title={() => <span className="font-semibold">Pages</span>}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Table
                                                                loading={loadingPageContents || loadingContents || loadingSelectedPageContents}
                                                                rowKey="id"
                                                                dataSource={filteredPageContents}
                                                                pagination={showOnlySelectedPageContents ? false : {
                                                                    current: contentsPage,
                                                                    pageSize: contentsSize,
                                                                    total: contentsData?.totalElements,
                                                                    onChange: (p, s) => {
                                                                        setContentsPage(p);
                                                                        setContentsSize(s);
                                                                    },
                                                                }}
                                                                columns={[
                                                                    {
                                                                        title: "",
                                                                        width: 60,
                                                                        render: (_: any, record: any) => (
                                                                            <Checkbox
                                                                                checked={showOnlySelectedPageContents
                                                                                    ? selectedPageContentsData.some(item => item.id === record.id)
                                                                                    : linkedPageContents.has(record.id)}
                                                                                disabled={!selectedPageId}
                                                                                onChange={async (e) => {
                                                                                    if (!selectedPageId) return;
                                                                                    const isChecked = e.target.checked;
                                                                                    try {
                                                                                        if (isChecked) {
                                                                                            await linkPageContent({ page_id: selectedPageId, content_id: record.id });
                                                                                            setLinkedPageContents(prev => new Set([...prev, record.id]));
                                                                                            message.success("Linked successfully");
                                                                                        } else {
                                                                                            await unlinkPageContent({ page_id: selectedPageId, content_id: record.id });
                                                                                            setLinkedPageContents(prev => {
                                                                                                const newSet = new Set(prev);
                                                                                                newSet.delete(record.id);
                                                                                                return newSet;
                                                                                            });
                                                                                            message.success("Unlinked successfully");
                                                                                        }
                                                                                        // Refresh selected data if switch is ON
                                                                                        if (showOnlySelectedPageContents) {
                                                                                            const data = await getPageContents(selectedPageId);
                                                                                            setSelectedPageContentsData(data);
                                                                                        }
                                                                                    } catch (error) {
                                                                                        message.error(isChecked ? "Failed to link" : "Failed to unlink");
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ),
                                                                    },
                                                                    { title: "ID", dataIndex: "id", width: 80 },
                                                                    { title: "Title", dataIndex: "title" },
                                                                ]}
                                                                title={() => (
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-semibold">Contents</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm">Show selected only</span>
                                                                            <Switch
                                                                                checked={showOnlySelectedPageContents}
                                                                                onChange={setShowOnlySelectedPageContents}
                                                                                disabled={!selectedPageId}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                locale={{ emptyText: selectedPageId ? "No contents found" : "Select a page to view contents" }}
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                key: "category-content",
                                                label: "Category − Content",
                                                children: (
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
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
                                                                onRow={(record) => ({
                                                                    onClick: async () => {
                                                                        setSelectedCategoryId(record.id);
                                                                        setLoadingCategoryContents(true);
                                                                        try {
                                                                            const linkedData = await getCategoryContents(record.id);
                                                                            const linkedIds = new Set(linkedData.map(item => item.id));
                                                                            setLinkedCategoryContents(linkedIds);
                                                                        } catch (error) {
                                                                            message.error("Failed to load category contents");
                                                                            setLinkedCategoryContents(new Set());
                                                                        } finally {
                                                                            setLoadingCategoryContents(false);
                                                                        }
                                                                    },
                                                                    style: { cursor: "pointer" },
                                                                })}
                                                                rowClassName={(record) => (selectedCategoryId === record.id ? "bg-blue-50" : "")}
                                                                columns={[
                                                                    { title: "ID", dataIndex: "id", width: 80 },
                                                                    { title: "Title", dataIndex: "title" },
                                                                    { title: "Slug", dataIndex: "slug" },
                                                                ]}
                                                                title={() => <span className="font-semibold">Categories</span>}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Table
                                                                loading={loadingCategoryContents || loadingContents || loadingSelectedCategoryContents}
                                                                rowKey="id"
                                                                dataSource={filteredCategoryContents}
                                                                pagination={showOnlySelectedCategoryContents ? false : {
                                                                    current: contentsPage,
                                                                    pageSize: contentsSize,
                                                                    total: contentsData?.totalElements,
                                                                    onChange: (p, s) => {
                                                                        setContentsPage(p);
                                                                        setContentsSize(s);
                                                                    },
                                                                }}
                                                                columns={[
                                                                    {
                                                                        title: "",
                                                                        width: 60,
                                                                        render: (_: any, record: any) => (
                                                                            <Checkbox
                                                                                checked={showOnlySelectedCategoryContents
                                                                                    ? selectedCategoryContentsData.some(item => item.id === record.id)
                                                                                    : linkedCategoryContents.has(record.id)}
                                                                                disabled={!selectedCategoryId}
                                                                                onChange={async (e) => {
                                                                                    if (!selectedCategoryId) return;
                                                                                    const isChecked = e.target.checked;
                                                                                    try {
                                                                                        if (isChecked) {
                                                                                            await linkCategoryContent({ category_id: selectedCategoryId, content_id: record.id });
                                                                                            setLinkedCategoryContents(prev => new Set([...prev, record.id]));
                                                                                            message.success("Linked successfully");
                                                                                        } else {
                                                                                            await unlinkCategoryContent({ category_id: selectedCategoryId, content_id: record.id });
                                                                                            setLinkedCategoryContents(prev => {
                                                                                                const newSet = new Set(prev);
                                                                                                newSet.delete(record.id);
                                                                                                return newSet;
                                                                                            });
                                                                                            message.success("Unlinked successfully");
                                                                                        }
                                                                                        // Refresh selected data if switch is ON
                                                                                        if (showOnlySelectedCategoryContents) {
                                                                                            const data = await getCategoryContents(selectedCategoryId);
                                                                                            setSelectedCategoryContentsData(data);
                                                                                        }
                                                                                    } catch (error) {
                                                                                        message.error(isChecked ? "Failed to link" : "Failed to unlink");
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ),
                                                                    },
                                                                    { title: "ID", dataIndex: "id", width: 80 },
                                                                    { title: "Title", dataIndex: "title" },
                                                                ]}
                                                                title={() => (
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-semibold">Contents</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm">Show selected only</span>
                                                                            <Switch
                                                                                checked={showOnlySelectedCategoryContents}
                                                                                onChange={setShowOnlySelectedCategoryContents}
                                                                                disabled={!selectedCategoryId}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                locale={{ emptyText: selectedCategoryId ? "No contents found" : "Select a category to view contents" }}
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                key: "cms-tree",
                                                label: "CMS Tree (Pages → Categories → Contents)",
                                                children: (
                                                    <CMSTreeManager
                                                        onEditPage={(pageId) => setEditingId(pageId)}
                                                        onEditCategory={(categoryId) => setEditingCategoryId(categoryId)}
                                                        onEditContent={(contentId) => router.push(`/cms/content/${contentId}`)}
                                                        onDeletePage={async (pageId) => {
                                                            Modal.confirm({
                                                                title: "Delete page?",
                                                                content: "This will delete the page and all its relations. Are you sure?",
                                                                okText: "Delete",
                                                                okButtonProps: { danger: true },
                                                                onOk: async () => {
                                                                    try {
                                                                        await deleteCmsPage(pageId);
                                                                        message.success("Deleted");
                                                                        refetch();
                                                                    } catch (error) {
                                                                        message.error("Failed to delete page");
                                                                    }
                                                                },
                                                            });
                                                        }}
                                                        onDeleteCategory={async (categoryId) => {
                                                            Modal.confirm({
                                                                title: "Delete category?",
                                                                content: "This will delete the category and all its relations. Are you sure?",
                                                                okText: "Delete",
                                                                okButtonProps: { danger: true },
                                                                onOk: async () => {
                                                                    try {
                                                                        await deleteCmsCategory(categoryId);
                                                                        message.success("Deleted");
                                                                        invalidateCategories();
                                                                    } catch (error) {
                                                                        message.error("Failed to delete category");
                                                                    }
                                                                },
                                                            });
                                                        }}
                                                        onDeleteContent={async (contentId) => {
                                                            Modal.confirm({
                                                                title: "Delete content?",
                                                                content: "This will delete the content and all its relations. Are you sure?",
                                                                okText: "Delete",
                                                                okButtonProps: { danger: true },
                                                                onOk: async () => {
                                                                    try {
                                                                        await deleteCmsContent(contentId);
                                                                        message.success("Deleted");
                                                                        invalidateContents();
                                                                    } catch (error) {
                                                                        message.error("Failed to delete content");
                                                                    }
                                                                },
                                                            });
                                                        }}
                                                        onCreateCategory={() => setOpenCreateCategory(true)}
                                                        onCreateContent={() => router.push('/cms/content/new')}
                                                    />
                                                ),
                                            },
                                            {
                                                key: "category-tree",
                                                label: "Category Tree (Legacy)",
                                                children: (
                                                    <CategoryTreeManager
                                                        onEditCategory={(categoryId) => setEditingCategoryId(categoryId)}
                                                        onDeleteCategory={async (categoryId) => {
                                                            Modal.confirm({
                                                                title: "Delete category?",
                                                                content: "This will delete the category and all its relations. Are you sure?",
                                                                okText: "Delete",
                                                                okButtonProps: { danger: true },
                                                                onOk: async () => {
                                                                    try {
                                                                        await deleteCmsCategory(categoryId);
                                                                        message.success("Deleted");
                                                                        invalidateCategories();
                                                                    } catch (error) {
                                                                        message.error("Failed to delete category");
                                                                    }
                                                                },
                                                            });
                                                        }}
                                                    />
                                                ),
                                            },
                                        ]}
                                    />
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
        </ConfigProvider>
    );
}


