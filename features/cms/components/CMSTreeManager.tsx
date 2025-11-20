"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tree, message, Button, Input, Spin, Space, Tag, Modal, Dropdown, Checkbox, Drawer } from "antd";
import type { TreeProps, DataNode } from "antd/es/tree";
import type { MenuProps } from "antd";
import {
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    ExpandOutlined,
    CompressOutlined,
    DisconnectOutlined,
    MoreOutlined,
    FileTextOutlined,
    FolderOutlined,
    HomeOutlined
} from "@ant-design/icons";
import { useCmsPages } from "../hooks/useCmsPages";
import { useCmsCategories, useInvalidateCategories } from "../hooks/useCmsCategories";
import { useCmsContents, useInvalidateContents } from "../hooks/useCmsContents";
import { CmsCategory } from "../apis/categories";
import {
    getPageCategories,
    getPageContents,
    getCategoryContents,
    getCategoryRelations,
    linkPageCategory,
    unlinkPageCategory,
    linkPageContent,
    unlinkPageContent,
    linkCategoryContent,
    unlinkCategoryContent,
    linkCategoryRelation,
    unlinkCategoryRelation,
    AggregateItem
} from "../apis/aggregate";

const { Search } = Input;

type NodeType = 'page' | 'category' | 'content';

interface CMSTreeNode extends DataNode {
    key: string;
    title: string;
    children?: CMSTreeNode[];
    nodeType: NodeType;
    entityId: number;
    parentId?: number;
    parentType?: NodeType;
    parentKey?: string;
    isLinked?: boolean; // For many-to-many display
    data?: any;
}

interface CMSTreeManagerProps {
    onEditPage?: (pageId: number) => void;
    onEditCategory?: (categoryId: number) => void;
    onEditContent?: (contentId: number) => void;
    onDeletePage?: (pageId: number) => void;
    onDeleteCategory?: (categoryId: number) => void;
    onDeleteContent?: (contentId: number) => void;
    onCreateCategory?: () => void;
    onCreateContent?: () => void;
}

export default function CMSTreeManager({
    onEditPage,
    onEditCategory,
    onEditContent,
    onDeletePage,
    onDeleteCategory,
    onDeleteContent,
    onCreateCategory,
    onCreateContent
}: CMSTreeManagerProps) {
    // Load all data
    const [pagesPage] = useState(0);
    const [pagesSize] = useState(1000);
    const { data: pagesData, isLoading: loadingPages, refetch: refetchPages } = useCmsPages(pagesPage, pagesSize);
    const pages = Array.isArray(pagesData?.items) ? pagesData?.items : [];

    const [categoriesPage] = useState(0);
    const [categoriesSize] = useState(1000);
    const { data: categoriesData, isLoading: loadingCategories } = useCmsCategories(categoriesPage, categoriesSize);
    const categories = Array.isArray(categoriesData?.items) ? categoriesData?.items : [];
    const invalidateCategories = useInvalidateCategories();

    const [contentsPage] = useState(0);
    const [contentsSize] = useState(1000);
    const { data: contentsData, isLoading: loadingContents } = useCmsContents(contentsPage, contentsSize);
    const contents = Array.isArray(contentsData?.items) ? contentsData?.items : [];
    const invalidateContents = useInvalidateContents();
    const categoryMap = useMemo(() => new Map(categories.map(cat => [cat.id, cat])), [categories]);
    const contentMap = useMemo(() => new Map(contents.map(cnt => [cnt.id, cnt])), [contents]);

    // Relations state
    const [pageRelations, setPageRelations] = useState<Map<number, { categories: number[], contents: number[] }>>(new Map());
    const [categoryRelations, setCategoryRelations] = useState<Map<number, { children: number[], contents: number[] }>>(new Map());
    const [loadingRelations, setLoadingRelations] = useState(false);

    // UI state
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [showManyToMany, setShowManyToMany] = useState(false);
    const [categorySelectionLoadingIds, setCategorySelectionLoadingIds] = useState<number[]>([]);
    const [contentSelectionLoadingIds, setContentSelectionLoadingIds] = useState<number[]>([]);
    const [categorySearch, setCategorySearch] = useState("");
    const [contentSearch, setContentSearch] = useState("");
    const [categorySelectionModal, setCategorySelectionModal] = useState<{
        open: boolean;
        pageId: number | null;
        selectedIds: number[];
    }>({
        open: false,
        pageId: null,
        selectedIds: [],
    });

    const [contentSelectionModal, setContentSelectionModal] = useState<{
        open: boolean;
        parentId: number | null;
        parentType: 'page' | 'category' | null;
        selectedIds: number[];
    }>({
        open: false,
        parentId: null,
        parentType: null,
        selectedIds: [],
    });
    const [childCategoryModal, setChildCategoryModal] = useState<{
        open: boolean;
        parentId: number | null;
        selectedIds: number[];
    }>({
        open: false,
        parentId: null,
        selectedIds: [],
    });
    const [childCategorySearch, setChildCategorySearch] = useState("");
    const [childCategoryLoadingIds, setChildCategoryLoadingIds] = useState<number[]>([]);
    const [previewContent, setPreviewContent] = useState<any | null>(null);
    const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);

    const closeCategorySelectionModal = () => {
        setCategorySelectionModal({ open: false, pageId: null, selectedIds: [] });
        setCategorySearch("");
    };

    const closeContentSelectionModal = () => {
        setContentSelectionModal({ open: false, parentId: null, parentType: null, selectedIds: [] });
        setContentSearch("");
    };

    const closeChildCategoryModal = () => {
        setChildCategoryModal({ open: false, parentId: null, selectedIds: [] });
        setChildCategorySearch("");
    };


    // Load all relations
    useEffect(() => {
        const loadAllRelations = async () => {
            if (pages.length === 0 && categories.length === 0) return;

            setLoadingRelations(true);
            try {
                const pageRels = new Map<number, { categories: number[], contents: number[] }>();
                const categoryRels = new Map<number, { children: number[], contents: number[] }>();

                // Load page relations
                const pagePromises = pages.map(async (page) => {
                    try {
                        const [linkedCategories, linkedContents] = await Promise.all([
                            getPageCategories(page.id),
                            getPageContents(page.id)
                        ]);
                        pageRels.set(page.id, {
                            categories: linkedCategories.map(c => c.id),
                            contents: linkedContents.map(c => c.id)
                        });
                    } catch (error) {
                        console.error(`Failed to load relations for page ${page.id}:`, error);
                    }
                });

                // Load category relations
                const categoryPromises = categories.map(async (cat) => {
                    try {
                        const [children, linkedContents] = await Promise.all([
                            getCategoryRelations(cat.id),
                            getCategoryContents(cat.id)
                        ]);
                        categoryRels.set(cat.id, {
                            children: children.map(c => c.id),
                            contents: linkedContents.map(c => c.id)
                        });
                    } catch (error) {
                        console.error(`Failed to load relations for category ${cat.id}:`, error);
                    }
                });

                await Promise.all([...pagePromises, ...categoryPromises]);
                setPageRelations(pageRels);
                setCategoryRelations(categoryRels);
            } catch (error) {
                message.error("Failed to load relations");
            } finally {
                setLoadingRelations(false);
            }
        };

        loadAllRelations();
    }, [pages, categories]);

    // Build tree structure
    const treeData = useMemo(() => {
        const buildContentNode = (content: any, parentId: number, parentType: NodeType, parentKey: string): CMSTreeNode => ({
            key: `${parentKey}-content-${content.id}`,
            title: content.title,
            nodeType: 'content',
            entityId: content.id,
            parentId,
            parentType,
            parentKey,
            data: content,
            isLeaf: true,
        });

        const buildCategoryNode = (category: any, options: { pageId: number; parentId: number; parentType: NodeType; parentKey: string }): CMSTreeNode => {
            const catRelations = categoryRelations.get(category.id);
            const childrenNodes: CMSTreeNode[] = [];
            const currentKey = `${options.parentKey}-category-${category.id}`;

            // Add child categories
            if (catRelations?.children) {
                catRelations.children.forEach(childId => {
                    const childCat = categoryMap.get(childId);
                    if (childCat) {
                        childrenNodes.push(
                            buildCategoryNode(childCat, {
                                pageId: options.pageId,
                                parentId: category.id,
                                parentType: 'category',
                                parentKey: currentKey
                            })
                        );
                    }
                });
            }

            // Add linked contents
            if (catRelations?.contents) {
                catRelations.contents.forEach(contentId => {
                    const content = contentMap.get(contentId);
                    if (content) {
                        childrenNodes.push(buildContentNode(content, category.id, 'category', currentKey));
                    }
                });
            }

            return {
                key: currentKey,
                title: category.title,
                nodeType: 'category',
                entityId: category.id,
                parentId: options.parentId,
                parentType: options.parentType,
                parentKey: options.parentKey,
                data: category,
                children: childrenNodes.length > 0 ? childrenNodes : undefined,
            };
        };

        const buildPageNode = (page: any): CMSTreeNode => {
            const pageRels = pageRelations.get(page.id);
            const childrenNodes: CMSTreeNode[] = [];

            // Add linked categories
            if (pageRels?.categories) {
                pageRels.categories.forEach(catId => {
                    const category = categoryMap.get(catId);
                    if (category) {
                        childrenNodes.push(
                            buildCategoryNode(category, {
                                pageId: page.id,
                                parentId: page.id,
                                parentType: 'page',
                                parentKey: `page-${page.id}`
                            })
                        );
                    }
                });
            }

            // Add direct page contents (contents linked to page but not through category)
            if (pageRels?.contents) {
                pageRels.contents.forEach(contentId => {
                    const content = contentMap.get(contentId);
                    if (content) {
                        childrenNodes.push(buildContentNode(content, page.id, 'page', `page-${page.id}`));
                    }
                });
            }

            return {
                key: `page-${page.id}`,
                title: page.title,
                nodeType: 'page',
                entityId: page.id,
                data: page,
                children: childrenNodes.length > 0 ? childrenNodes : undefined,
            };
        };

        return pages.map(buildPageNode);
    }, [pages, categories, contents, pageRelations, categoryRelations]);

    // Handlers
    const handleExpandAll = () => {
        const getAllKeys = (nodes: CMSTreeNode[]): React.Key[] => {
            const keys: React.Key[] = [];
            const traverse = (node: CMSTreeNode) => {
                keys.push(node.key);
                if (node.children) node.children.forEach(traverse);
            };
            nodes.forEach(traverse);
            return keys;
        };
        setExpandedKeys(getAllKeys(treeData));
    };

    const handleCollapseAll = () => {
        setExpandedKeys([]);
    };

    const handleReload = async () => {
        setLoadingRelations(true);
        try {
            await Promise.all([
                refetchPages(),
                invalidateCategories(),
                invalidateContents()
            ]);
            message.success("Reloaded successfully");
        } catch (error) {
            message.error("Failed to reload");
        } finally {
            setLoadingRelations(false);
        }
    };

    const filteredCategoryOptions = useMemo(() => {
        const term = categorySearch.toLowerCase().trim();
        return categories.filter(cat => {
            if (!term) return true;
            return cat.title?.toLowerCase().includes(term) || String(cat.id).includes(term);
        });
    }, [categories, categorySearch]);

    const filteredContentOptions = useMemo(() => {
        const term = contentSearch.toLowerCase().trim();
        return contents.filter(cnt => {
            if (!term) return true;
            return cnt.title?.toLowerCase().includes(term) || String(cnt.id).includes(term);
        });
    }, [contents, contentSearch]);

    const filteredChildCategoryOptions = useMemo(() => {
        const term = childCategorySearch.toLowerCase().trim();
        return categories.filter(cat => {
            if (cat.id === childCategoryModal.parentId) return false;
            if (!term) return true;
            return cat.title?.toLowerCase().includes(term) || String(cat.id).includes(term);
        });
    }, [categories, childCategorySearch, childCategoryModal.parentId]);

    const handleLinkCategory = (pageId: number) => {
        const pageRels = pageRelations.get(pageId);
        const selectedIds = pageRels?.categories ?? [];
        setCategorySelectionModal({
            open: true,
            pageId,
            selectedIds,
        });
        setCategorySearch("");
    };

    const handleLinkChildCategory = (parentCategoryNode: CMSTreeNode) => {
        const selectedIds = categoryRelations.get(parentCategoryNode.entityId)?.children ?? [];
        setChildCategoryModal({
            open: true,
            parentId: parentCategoryNode.entityId,
            selectedIds,
        });
        setChildCategorySearch("");
    };

    const handleLinkContent = (parentId: number, parentType: 'page' | 'category') => {
        let selectedIds: number[] = [];
        if (parentType === 'page') {
            selectedIds = pageRelations.get(parentId)?.contents ?? [];
        } else if (parentType === 'category') {
            selectedIds = categoryRelations.get(parentId)?.contents ?? [];
        }
        setContentSelectionModal({
            open: true,
            parentId,
            parentType,
            selectedIds,
        });
        setContentSearch("");
    };

    const handleTogglePageCategory = async (
        categoryId: number,
        checked: boolean,
        pageIdOverride?: number
    ) => {
        const pageId = pageIdOverride ?? categorySelectionModal.pageId;
        if (!pageId) return;
        setCategorySelectionLoadingIds(prev => (prev.includes(categoryId) ? prev : [...prev, categoryId]));
        try {
            if (checked) {
                await linkPageCategory({ page_id: pageId, category_id: categoryId });
            } else {
                await unlinkPageCategory({ page_id: pageId, category_id: categoryId });
            }
            setCategorySelectionModal(prev => {
                if (prev.pageId !== pageId) return prev;
                const nextIds = checked
                    ? Array.from(new Set([...prev.selectedIds, categoryId]))
                    : prev.selectedIds.filter(id => id !== categoryId);
                return { ...prev, selectedIds: nextIds };
            });
            setPageRelations(prev => {
                const next = new Map(prev);
                const existing = next.get(pageId) ?? { categories: [], contents: [] };
                const nextCategories = checked
                    ? Array.from(new Set([...existing.categories, categoryId]))
                    : existing.categories.filter(id => id !== categoryId);
                next.set(pageId, { ...existing, categories: nextCategories });
                return next;
            });
        } catch (error) {
            message.error(checked ? "Failed to add category" : "Failed to unlink category");
        } finally {
            setCategorySelectionLoadingIds(prev => prev.filter(id => id !== categoryId));
        }
    };

    const handleToggleContentSelection = async (
        contentId: number,
        checked: boolean,
        parentIdOverride?: number | null,
        parentTypeOverride?: 'page' | 'category' | null
    ) => {
        const parentId = parentIdOverride ?? contentSelectionModal.parentId;
        const parentType = parentTypeOverride ?? contentSelectionModal.parentType;
        if (!parentId || !parentType) return;
        setContentSelectionLoadingIds(prev => (prev.includes(contentId) ? prev : [...prev, contentId]));
        try {
            if (parentType === 'page') {
                if (checked) {
                    await linkPageContent({ page_id: parentId, content_id: contentId });
                } else {
                    await unlinkPageContent({ page_id: parentId, content_id: contentId });
                }
                setPageRelations(prev => {
                    const next = new Map(prev);
                    const existing = next.get(parentId) ?? { categories: [], contents: [] };
                    const nextContents = checked
                        ? Array.from(new Set([...existing.contents, contentId]))
                        : existing.contents.filter(id => id !== contentId);
                    next.set(parentId, { ...existing, contents: nextContents });
                    return next;
                });
            } else {
                if (checked) {
                    await linkCategoryContent({ category_id: parentId, content_id: contentId });
                } else {
                    await unlinkCategoryContent({ category_id: parentId, content_id: contentId });
                }
                setCategoryRelations(prev => {
                    const next = new Map(prev);
                    const existing = next.get(parentId) ?? { children: [], contents: [] };
                    const nextContents = checked
                        ? Array.from(new Set([...existing.contents, contentId]))
                        : existing.contents.filter(id => id !== contentId);
                    next.set(parentId, { ...existing, contents: nextContents });
                    return next;
                });
            }

            setContentSelectionModal(prev => {
                if (prev.parentId !== parentId) return prev;
                const nextIds = checked
                    ? Array.from(new Set([...prev.selectedIds, contentId]))
                    : prev.selectedIds.filter(id => id !== contentId);
                return { ...prev, selectedIds: nextIds };
            });
        } catch (error) {
            message.error(checked ? "Failed to assign content" : "Failed to unlink content");
        } finally {
            setContentSelectionLoadingIds(prev => prev.filter(id => id !== contentId));
        }
    };

    const handleToggleChildCategory = async (
        parentId: number,
        childCategoryId: number,
        checked: boolean
    ) => {
        if (!parentId || childCategoryId === parentId) return;
        setChildCategoryLoadingIds(prev => (prev.includes(childCategoryId) ? prev : [...prev, childCategoryId]));
        try {
            if (checked) {
                await linkCategoryRelation({ parent_id: parentId, child_id: childCategoryId });
            } else {
                await unlinkCategoryRelation({ parent_id: parentId, child_id: childCategoryId });
            }
            setCategoryRelations(prev => {
                const next = new Map(prev);
                const existing = next.get(parentId) ?? { children: [], contents: [] };
                const nextChildren = checked
                    ? Array.from(new Set([...existing.children, childCategoryId]))
                    : existing.children.filter(id => id !== childCategoryId);
                next.set(parentId, { ...existing, children: nextChildren });
                return next;
            });
            setChildCategoryModal(prev => {
                if (prev.parentId !== parentId) return prev;
                const nextIds = checked
                    ? Array.from(new Set([...prev.selectedIds, childCategoryId]))
                    : prev.selectedIds.filter(id => id !== childCategoryId);
                return { ...prev, selectedIds: nextIds };
            });
        } catch (error) {
            message.error(checked ? "Failed to add child category" : "Failed to unlink child category");
        } finally {
            setChildCategoryLoadingIds(prev => prev.filter(id => id !== childCategoryId));
        }
    };

    const handlePreviewContent = (contentId: number) => {
        const content = contentMap.get(contentId);
        if (!content) {
            message.warning("Content not found");
            return;
        }
        setPreviewContent(content);
        setPreviewDrawerOpen(true);
    };

    const handleTreeSelect: TreeProps["onSelect"] = (_, info) => {
        const node = info.node as unknown as CMSTreeNode;
        if (node.nodeType === 'content') {
            handlePreviewContent(node.entityId);
        }
    };


    if (loadingPages || loadingCategories || loadingContents) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spin size="large" tip="Loading CMS tree..." />
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-lg font-semibold">CMS Tree Management</h3>
                        <p className="text-sm text-gray-500">Pages → Categories → Contents hierarchy</p>
                    </div>
                    <Space>
                        {onCreateCategory && (
                            <Button icon={<FolderOutlined />} onClick={onCreateCategory}>
                                New Category
                            </Button>
                        )}
                        {onCreateContent && (
                            <Button icon={<FileTextOutlined />} onClick={onCreateContent}>
                                New Content
                            </Button>
                        )}
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleReload}
                            loading={loadingRelations}
                        >
                            Reload
                        </Button>
                    </Space>
                </div>

                <Space wrap className="w-full mb-3">
                    <Search
                        placeholder="Search pages, categories, or contents..."
                        allowClear
                        style={{ width: 350 }}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        prefix={<SearchOutlined />}
                    />

                    <Button icon={<ExpandOutlined />} onClick={handleExpandAll}>
                        Expand All
                    </Button>

                    <Button icon={<CompressOutlined />} onClick={handleCollapseAll}>
                        Collapse All
                    </Button>
                </Space>
            </div>

            {treeData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No pages found. Create pages first in the Pages tab.
                </div>
            ) : (
                <Tree
                    className="bg-white p-4 rounded border border-gray-200"
                    showLine
                    showIcon
                    blockNode
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    onSelect={handleTreeSelect}
                    onExpand={(keys) => {
                        setExpandedKeys(keys);
                        setAutoExpandParent(false);
                    }}
                    treeData={treeData}
                    titleRender={(nodeData) => {
                        const node = nodeData as CMSTreeNode;
                        const isMatch = searchValue && (
                            node.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                            String(node.entityId).includes(searchValue)
                        );

                        const getNodeIcon = () => {
                            switch (node.nodeType) {
                                case 'page': return <HomeOutlined className="text-blue-500" />;
                                case 'category': return <FolderOutlined className="text-orange-500" />;
                                case 'content': return <FileTextOutlined className="text-green-500" />;
                            }
                        };

                        const handleNodeClick = () => {
                            if (node.nodeType === 'content') {
                                handlePreviewContent(node.entityId);
                            }
                        };

                        const getNodeActions = (): MenuProps['items'] => {
                            const actions: MenuProps['items'] = [];

                            if (node.nodeType === 'page') {
                                actions.push(
                                    { key: 'add-category', label: 'Add Category', icon: <PlusOutlined />, onClick: () => handleLinkCategory(node.entityId) },
                                    { key: 'assign-content', label: 'Assign Content', icon: <FileTextOutlined />, onClick: () => handleLinkContent(node.entityId, 'page') },
                                    { type: 'divider' }
                                );
                            } else if (node.nodeType === 'category') {
                                actions.push(
                                    { key: 'add-child-category', label: 'Add Child Category', icon: <PlusOutlined />, onClick: () => handleLinkChildCategory(node) },
                                    { key: 'assign-content', label: 'Assign Content', icon: <FileTextOutlined />, onClick: () => handleLinkContent(node.entityId, 'category') },
                                    {
                                        key: 'unlink',
                                        label: node.parentType === 'category' ? 'Unlink from Parent' : 'Unlink from Page',
                                        icon: <DisconnectOutlined />,
                                        onClick: () => {
                                            if (!node.parentId || !node.parentType) return;
                                            if (node.parentType === 'page') {
                                                handleTogglePageCategory(node.entityId, false, node.parentId);
                                            } else {
                                                handleToggleChildCategory(node.parentId, node.entityId, false);
                                            }
                                        }
                                    },
                                    { type: 'divider' }
                                );
                            } else if (node.nodeType === 'content') {
                                actions.push(
                                    {
                                        key: 'unlink',
                                        label: 'Unlink from Parent',
                                        icon: <DisconnectOutlined />,
                                        onClick: () => {
                                            if (!node.parentId || !node.parentType) return;
                                            if (node.parentType === 'page' || node.parentType === 'category') {
                                                handleToggleContentSelection(node.entityId, false, node.parentId, node.parentType);
                                            }
                                        }
                                    },
                                    { type: 'divider' }
                                );
                            }

                            return actions;
                        };

                        return (
                            <div
                                className="flex items-center justify-between group hover:bg-gray-50 px-2 py-1 rounded w-full cursor-pointer"
                                onClick={handleNodeClick}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    {getNodeIcon()}
                                    <span className={isMatch ? "text-blue-600 font-semibold" : ""}>
                                        {node.title}
                                    </span>
                                    <span className="text-gray-400 text-xs">#{node.entityId}</span>
                                    {node.data?.status && (
                                        <Tag
                                            color={node.data.status === "active" ? "green" : "gray"}
                                            className="text-xs"
                                        >
                                            {node.data.status}
                                        </Tag>
                                    )}
                                </div>
                                <Dropdown
                                    menu={{ items: getNodeActions() }}
                                    trigger={['click']}
                                    placement="bottomRight"
                                >
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<MoreOutlined />}
                                        className="opacity-0 group-hover:opacity-100"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </Dropdown>
                            </div>
                        );
                    }}
                />
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>How to use CMS Tree Management:</strong>
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside mt-1 space-y-1">
                    <li><FileTextOutlined className="text-blue-500" /> <strong>Pages</strong> - Root level nodes. Click <MoreOutlined /> to "Add Category" or "Assign Content"</li>
                    <li><FolderOutlined className="text-orange-500" /> <strong>Categories</strong> - Only show when linked to a page. Can have child categories and contents</li>
                    <li><FileTextOutlined className="text-green-500" /> <strong>Contents</strong> - Can be assigned to multiple pages and categories (many-to-many)</li>
                    <li>Click <MoreOutlined /> on category to "Add Child Category" or "Assign Content"</li>
                    <li>Use "Unlink" to remove a category/content from its parent (doesn't delete the entity)</li>
                    <li>Use "Delete" to permanently delete the entity and all its relations</li>
                </ul>
            </div>

            <Modal
                title="Manage Page Categories"
                open={categorySelectionModal.open}
                onCancel={closeCategorySelectionModal}
                footer={null}
                width={520}
            >
                {categorySelectionModal.pageId ? (
                    categories.length > 0 ? (
                        <>
                            <p className="text-sm text-gray-500 mb-3">
                                Check or uncheck categories to link/unlink immediately.
                            </p>
                            <Input
                                allowClear
                                placeholder="Search categories..."
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                className="mb-3"
                            />
                            <div className="max-h-72 overflow-auto space-y-2 pr-2">
                                {filteredCategoryOptions.length === 0 && (
                                    <p className="text-sm text-gray-400">No categories match your search.</p>
                                )}
                                {filteredCategoryOptions.map(cat => {
                                    const checked = categorySelectionModal.selectedIds.includes(cat.id);
                                    const loading = categorySelectionLoadingIds.includes(cat.id);
                                    return (
                                        <div key={cat.id} className="flex items-center justify-between">
                                            <Checkbox
                                                checked={checked}
                                                disabled={loading}
                                                onChange={(e) => handleTogglePageCategory(cat.id, e.target.checked, categorySelectionModal.pageId ?? undefined)}
                                            >
                                                <span className="font-medium">{cat.title}</span>{" "}
                                                <span className="text-gray-400 text-xs">#{cat.id}</span>
                                            </Checkbox>
                                            {loading && <Spin size="small" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">No categories available.</p>
                    )
                ) : (
                    <p className="text-sm text-gray-500">Select a page to manage categories.</p>
                )}
            </Modal>

            <Modal
                title="Manage Child Categories"
                open={childCategoryModal.open}
                onCancel={closeChildCategoryModal}
                footer={null}
                width={520}
            >
                {childCategoryModal.parentId ? (
                    categories.length > 0 ? (
                        <>
                            <p className="text-sm text-gray-500 mb-3">
                                Check or uncheck child categories to link/unlink immediately.
                            </p>
                            <Input
                                allowClear
                                placeholder="Search categories..."
                                value={childCategorySearch}
                                onChange={(e) => setChildCategorySearch(e.target.value)}
                                className="mb-3"
                            />
                            <div className="max-h-72 overflow-auto space-y-2 pr-2">
                                {filteredChildCategoryOptions.length === 0 && (
                                    <p className="text-sm text-gray-400">No categories match your search.</p>
                                )}
                                {filteredChildCategoryOptions.map(cat => {
                                    const checked = childCategoryModal.selectedIds.includes(cat.id);
                                    const loading = childCategoryLoadingIds.includes(cat.id);
                                    return (
                                        <div key={cat.id} className="flex items-center justify-between">
                                            <Checkbox
                                                checked={checked}
                                                disabled={loading || cat.id === childCategoryModal.parentId}
                                                onChange={(e) => handleToggleChildCategory(childCategoryModal.parentId!, cat.id, e.target.checked)}
                                            >
                                                <span className="font-medium">{cat.title}</span>{" "}
                                                <span className="text-gray-400 text-xs">#{cat.id}</span>
                                            </Checkbox>
                                            {loading && <Spin size="small" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">No categories available.</p>
                    )
                ) : (
                    <p className="text-sm text-gray-500">Select a category to manage child categories.</p>
                )}
            </Modal>

            <Modal
                title={`Manage Contents for ${contentSelectionModal.parentType === 'category' ? 'Category' : 'Page'}`}
                open={contentSelectionModal.open}
                onCancel={closeContentSelectionModal}
                footer={null}
                width={520}
            >
                {contentSelectionModal.parentId ? (
                    contents.length > 0 ? (
                        <>
                            <p className="text-sm text-gray-500 mb-3">
                                Check or uncheck contents to link/unlink immediately.
                            </p>
                            <Input
                                allowClear
                                placeholder="Search contents..."
                                value={contentSearch}
                                onChange={(e) => setContentSearch(e.target.value)}
                                className="mb-3"
                            />
                            <div className="max-h-72 overflow-auto space-y-2 pr-2">
                                {filteredContentOptions.length === 0 && (
                                    <p className="text-sm text-gray-400">No contents match your search.</p>
                                )}
                                {filteredContentOptions.map(cnt => {
                                    const checked = contentSelectionModal.selectedIds.includes(cnt.id);
                                    const loading = contentSelectionLoadingIds.includes(cnt.id);
                                    return (
                                        <div key={cnt.id} className="flex items-center justify-between">
                                            <Checkbox
                                                checked={checked}
                                                disabled={loading}
                                                onChange={(e) => handleToggleContentSelection(
                                                    cnt.id,
                                                    e.target.checked,
                                                    contentSelectionModal.parentId,
                                                    contentSelectionModal.parentType
                                                )}
                                            >
                                                <span className="font-medium">{cnt.title}</span>{" "}
                                                <span className="text-gray-400 text-xs">#{cnt.id}</span>
                                            </Checkbox>
                                            {loading && <Spin size="small" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">No contents available.</p>
                    )
                ) : (
                    <p className="text-sm text-gray-500">Select a parent to manage contents.</p>
                )}
            </Modal>

            <Drawer
                title={previewContent ? `${previewContent.title} (#${previewContent.id})` : "Content Preview"}
                open={previewDrawerOpen}
                onClose={() => {
                    setPreviewDrawerOpen(false);
                    setPreviewContent(null);
                }}
                width={720}
            >
                {previewContent ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Tag color={previewContent.status === "active" ? "green" : "gray"}>
                                {previewContent.status}
                            </Tag>
                            {previewContent.type && <Tag>{previewContent.type}</Tag>}
                            {previewContent.position && <Tag>{previewContent.position}</Tag>}
                        </div>
                        {previewContent.short_desc && (
                            <p className="text-gray-600">{previewContent.short_desc}</p>
                        )}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            {previewContent.body ? (
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: previewContent.body }}
                                />
                            ) : (
                                <p className="text-gray-500 text-sm">No content body</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Select a content node to preview.</p>
                )}
            </Drawer>

        </div>
    );
}
