"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tree, message, Button, Input, Spin, Select, Space, Tag, Modal, Dropdown, Drawer } from "antd";
import type { TreeProps, DataNode } from "antd/es/tree";
import type { MenuProps } from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ReloadOutlined,
    SearchOutlined,
    ExpandOutlined,
    CompressOutlined,
    LinkOutlined,
    DisconnectOutlined,
    MoreOutlined,
    FileTextOutlined,
    FolderOutlined,
    CopyOutlined,
    HomeOutlined,
    EyeOutlined
} from "@ant-design/icons";
import { useCmsPages } from "../hooks/useCmsPages";
import { useCmsCategories, useInvalidateCategories } from "../hooks/useCmsCategories";
import { useCmsContents, useInvalidateContents } from "../hooks/useCmsContents";
import { CmsCategory } from "../apis/categories";
import CmsContentPreview from "./CmsContentPreview";
import { CmsContent, getCmsContentImageUrl } from "../apis/contents";
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

    // Relations state
    const [pageRelations, setPageRelations] = useState<Map<number, { categories: number[], contents: number[] }>>(new Map());
    const [categoryRelations, setCategoryRelations] = useState<Map<number, { children: number[], contents: number[] }>>(new Map());
    const [loadingRelations, setLoadingRelations] = useState(false);

    // UI state
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [showManyToMany, setShowManyToMany] = useState(false);
    const [previewContent, setPreviewContent] = useState<CmsContent | null>(null);
    const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);

    // Modal states for linking
    const [linkCategoryModalOpen, setLinkCategoryModalOpen] = useState(false);
    const [linkContentModalOpen, setLinkContentModalOpen] = useState(false);
    const [linkChildCategoryModalOpen, setLinkChildCategoryModalOpen] = useState(false);
    const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedParentType, setSelectedParentType] = useState<'page' | 'category' | null>(null);
    const [selectedLinkCategoryId, setSelectedLinkCategoryId] = useState<number | null>(null);
    const [selectedLinkContentId, setSelectedLinkContentId] = useState<number | null>(null);
    const [selectedLinkChildCategoryId, setSelectedLinkChildCategoryId] = useState<number | null>(null);

    // Modal state for unlink
    const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
    const [nodeToUnlink, setNodeToUnlink] = useState<CMSTreeNode | null>(null);

    // Load all relations function
    const loadAllRelations = useCallback(async () => {
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
    }, [pages, categories]);

    // Load all relations on mount and when pages/categories change
    useEffect(() => {
        loadAllRelations();
    }, [loadAllRelations]);

    // Build tree structure
    const treeData = useMemo(() => {
        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
        const contentMap = new Map(contents.map(cnt => [cnt.id, cnt]));

        const buildContentNode = (content: any, parentId: number, parentType: NodeType): CMSTreeNode => ({
            key: `${parentType}-${parentId}-content-${content.id}`,
            title: content.title,
            nodeType: 'content',
            entityId: content.id,
            parentId,
            parentType,
            data: content,
            isLeaf: true,
        });

        const buildCategoryNode = (category: any, pageId: number, parentCategoryId?: number): CMSTreeNode => {
            const catRelations = categoryRelations.get(category.id);
            const childrenNodes: CMSTreeNode[] = [];

            // Determine if this is a child category
            const isChildCategory = parentCategoryId !== undefined;

            // Add child categories
            if (catRelations?.children) {
                catRelations.children.forEach(childId => {
                    const childCat = categoryMap.get(childId);
                    if (childCat) {
                        // Pass current category as parent for child categories
                        childrenNodes.push(buildCategoryNode(childCat, pageId, category.id));
                    }
                });
            }

            // Add linked contents
            if (catRelations?.contents) {
                catRelations.contents.forEach(contentId => {
                    const content = contentMap.get(contentId);
                    if (content) {
                        childrenNodes.push(buildContentNode(content, category.id, 'category'));
                    }
                });
            }

            return {
                key: isChildCategory
                    ? `page-${pageId}-category-${parentCategoryId}-child-${category.id}`
                    : `page-${pageId}-category-${category.id}`,
                title: category.title,
                nodeType: 'category',
                entityId: category.id,
                parentId: isChildCategory ? parentCategoryId : pageId,
                parentType: isChildCategory ? 'category' : 'page',
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
                        childrenNodes.push(buildCategoryNode(category, page.id));
                    }
                });
            }

            // Add direct page contents (contents linked to page but not through category)
            if (pageRels?.contents) {
                pageRels.contents.forEach(contentId => {
                    const content = contentMap.get(contentId);
                    if (content) {
                        childrenNodes.push(buildContentNode(content, page.id, 'page'));
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
            // Refetch all data
            await Promise.all([
                refetchPages(),
                invalidateCategories(),
                invalidateContents()
            ]);
            // Wait a bit for data to be refetched, then reload relations
            setTimeout(async () => {
                await loadAllRelations();
                message.success("Reloaded successfully");
            }, 300);
        } catch (error) {
            message.error("Failed to reload");
            setLoadingRelations(false);
        }
    };

    const handleLinkCategory = (pageId: number) => {
        // Show modal to select category to link
        const availableCategories = categories.filter(cat => {
            const pageRels = pageRelations.get(pageId);
            return !pageRels?.categories.includes(cat.id);
        });

        if (availableCategories.length === 0) {
            message.warning("All categories are already linked to this page");
            return;
        }

        setSelectedPageId(pageId);
        setSelectedLinkCategoryId(null);
        setLinkCategoryModalOpen(true);
    };

    const handleConfirmLinkCategory = async () => {
        if (!selectedPageId || !selectedLinkCategoryId) {
            message.warning("Please select a category");
            return;
        }
        try {
            await linkPageCategory({ page_id: selectedPageId, category_id: selectedLinkCategoryId });
            message.success("Category added successfully");
            setLinkCategoryModalOpen(false);
            setSelectedPageId(null);
            setSelectedLinkCategoryId(null);
            // Reload relations immediately to update tree
            await loadAllRelations();
        } catch (error) {
            message.error("Failed to add category");
        }
    };

    const handleLinkChildCategory = (parentCategoryId: number) => {
        // Show modal to select child category to link
        const availableCategories = categories.filter(cat => {
            // Exclude self and already linked children
            if (cat.id === parentCategoryId) return false;
            const catRels = categoryRelations.get(parentCategoryId);
            return !catRels?.children.includes(cat.id);
        });

        if (availableCategories.length === 0) {
            message.warning("All categories are already linked");
            return;
        }

        setSelectedCategoryId(parentCategoryId);
        setSelectedLinkChildCategoryId(null);
        setLinkChildCategoryModalOpen(true);
    };

    const handleConfirmLinkChildCategory = async () => {
        if (!selectedCategoryId || !selectedLinkChildCategoryId) {
            message.warning("Please select a category");
            return;
        }
        try {
            await linkCategoryRelation({ parent_id: selectedCategoryId, child_id: selectedLinkChildCategoryId });
            message.success("Child category added successfully");
            setLinkChildCategoryModalOpen(false);
            setSelectedCategoryId(null);
            setSelectedLinkChildCategoryId(null);
            // Reload relations immediately to update tree
            await loadAllRelations();
        } catch (error) {
            message.error("Failed to add child category");
        }
    };

    const handleLinkContent = (parentId: number, parentType: 'page' | 'category') => {
        const availableContents = contents.filter(content => {
            if (parentType === 'page') {
                const pageRels = pageRelations.get(parentId);
                return !pageRels?.contents.includes(content.id);
            } else {
                const catRels = categoryRelations.get(parentId);
                return !catRels?.contents.includes(content.id);
            }
        });

        if (availableContents.length === 0) {
            message.warning("All contents are already assigned");
            return;
        }

        if (parentType === 'page') {
            setSelectedPageId(parentId);
        } else {
            setSelectedCategoryId(parentId);
        }
        setSelectedParentType(parentType);
        setSelectedLinkContentId(null);
        setLinkContentModalOpen(true);
    };

    const handleConfirmLinkContent = async () => {
        if (!selectedLinkContentId) {
            message.warning("Please select a content");
            return;
        }
        try {
            if (selectedParentType === 'page' && selectedPageId) {
                await linkPageContent({ page_id: selectedPageId, content_id: selectedLinkContentId });
            } else if (selectedParentType === 'category' && selectedCategoryId) {
                await linkCategoryContent({ category_id: selectedCategoryId, content_id: selectedLinkContentId });
            }
            message.success("Content assigned successfully");
            setLinkContentModalOpen(false);
            setSelectedPageId(null);
            setSelectedCategoryId(null);
            setSelectedParentType(null);
            setSelectedLinkContentId(null);
            // Reload relations immediately to update tree
            await loadAllRelations();
        } catch (error) {
            message.error("Failed to assign content");
        }
    };

    const handleUnlink = (node: CMSTreeNode) => {
        console.log("🔍 handleUnlink called with node:", node);
        console.log("🔍 node.parentId:", node.parentId);
        console.log("🔍 node.parentType:", node.parentType);

        if (!node.parentId || !node.parentType) {
            console.warn("⚠️ Cannot unlink: missing parentId or parentType");
            message.warning("Cannot unlink: missing parent information");
            return;
        }

        setNodeToUnlink(node);
        setUnlinkModalOpen(true);
    };

    const handleConfirmUnlink = async () => {
        if (!nodeToUnlink || !nodeToUnlink.parentId || !nodeToUnlink.parentType) {
            message.warning("Cannot unlink: missing parent information");
            return;
        }

        const node = nodeToUnlink;
        const parentId = node.parentId!; // Non-null assertion since we checked above

        try {
            console.log("🔍 Unlinking:", {
                nodeType: node.nodeType,
                parentType: node.parentType,
                parentId,
                entityId: node.entityId
            });

            if (node.nodeType === 'category' && node.parentType === 'page') {
                console.log("🔍 Calling unlinkPageCategory with:", { page_id: parentId, category_id: node.entityId });
                await unlinkPageCategory({ page_id: parentId, category_id: node.entityId });
            } else if (node.nodeType === 'content' && node.parentType === 'page') {
                console.log("🔍 Calling unlinkPageContent with:", { page_id: parentId, content_id: node.entityId });
                await unlinkPageContent({ page_id: parentId, content_id: node.entityId });
            } else if (node.nodeType === 'content' && node.parentType === 'category') {
                console.log("🔍 Calling unlinkCategoryContent with:", { category_id: parentId, content_id: node.entityId });
                await unlinkCategoryContent({ category_id: parentId, content_id: node.entityId });
            } else if (node.nodeType === 'category' && node.parentType === 'category') {
                console.log("🔍 Calling unlinkCategoryRelation with:", { parent_id: parentId, child_id: node.entityId });
                await unlinkCategoryRelation({ parent_id: parentId, child_id: node.entityId });
            } else {
                console.error("❌ Unknown unlink case:", {
                    nodeType: node.nodeType,
                    parentType: node.parentType
                });
                message.error("Unknown unlink case");
                return;
            }

            console.log("🔍✅ API call completed successfully");
            message.success("Unlinked successfully");
            setUnlinkModalOpen(false);
            setNodeToUnlink(null);
            // Reload relations immediately to update tree
            await loadAllRelations();
        } catch (error) {
            console.error("❌ Unlink error:", error);
            message.error("Failed to unlink");
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

                        const getNodeActions = (): MenuProps['items'] => {
                            const actions: MenuProps['items'] = [];

                            if (node.nodeType === 'page') {
                                actions.push(
                                    { key: 'add-category', label: 'Add Category', icon: <PlusOutlined />, onClick: () => handleLinkCategory(node.entityId) },
                                    { key: 'assign-content', label: 'Assign Content', icon: <FileTextOutlined />, onClick: () => handleLinkContent(node.entityId, 'page') }
                                );
                            } else if (node.nodeType === 'category') {
                                actions.push(
                                    { key: 'add-child-category', label: 'Add Child Category', icon: <PlusOutlined />, onClick: () => handleLinkChildCategory(node.entityId) },
                                    { key: 'assign-content', label: 'Assign Content', icon: <FileTextOutlined />, onClick: () => handleLinkContent(node.entityId, 'category') },
                                    { key: 'unlink', label: 'Unlink from Page', icon: <DisconnectOutlined />, onClick: () => handleUnlink(node) }
                                );
                            } else if (node.nodeType === 'content') {
                                actions.push(
                                    {
                                        key: 'preview', label: 'Preview', icon: <EyeOutlined />, onClick: () => {
                                            if (node.data) {
                                                setPreviewContent(node.data);
                                                setPreviewDrawerOpen(true);
                                            }
                                        }
                                    },
                                    { type: 'divider' },
                                    { key: 'unlink', label: 'Unlink from Parent', icon: <DisconnectOutlined />, onClick: () => handleUnlink(node) }
                                );
                            }

                            return actions;
                        };

                        return (
                            <div className="flex items-center justify-between group hover:bg-gray-50 px-2 py-1 rounded w-full">
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
                    <li><HomeOutlined className="text-blue-500" /> <strong>Pages</strong> - Root level nodes. Click <MoreOutlined /> to "Add Category" or "Assign Content"</li>
                    <li><FolderOutlined className="text-orange-500" /> <strong>Categories</strong> - Only show when linked to a page. Can have child categories and contents</li>
                    <li><FileTextOutlined className="text-green-500" /> <strong>Contents</strong> - Can be assigned to multiple pages and categories (many-to-many)</li>
                    <li>Click <MoreOutlined /> on category to "Add Child Category" or "Assign Content"</li>
                    <li>Click <MoreOutlined /> on content to "Preview" the content</li>
                    <li>Use "Unlink" to remove a category/content from its parent (doesn't delete the entity)</li>
                    <li>Use "Delete" to permanently delete the entity and all its relations</li>
                </ul>
            </div>

            <Drawer
                title={
                    <div>
                        <h3 className="text-lg font-semibold">{previewContent?.title}</h3>
                        {previewContent?.short_desc && (
                            <p className="text-sm text-gray-500 mt-1">{previewContent.short_desc}</p>
                        )}
                    </div>
                }
                placement="right"
                size="large"
                open={previewDrawerOpen}
                onClose={() => {
                    setPreviewDrawerOpen(false);
                    setPreviewContent(null);
                }}
                width={800}
            >
                {previewContent && (
                    <div className="space-y-4">
                        {getCmsContentImageUrl(previewContent) && (
                            <div className="mb-4">
                                <img
                                    src={getCmsContentImageUrl(previewContent)!}
                                    alt={previewContent.title}
                                    className="w-full rounded-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <Tag color={previewContent.status === "active" ? "green" : "gray"}>
                                {previewContent.status}
                            </Tag>
                            {previewContent.type && (
                                <Tag className="ml-2">{previewContent.type}</Tag>
                            )}
                            {previewContent.position && (
                                <Tag className="ml-2">{previewContent.position}</Tag>
                            )}
                        </div>
                        {previewContent.body && (
                            <div className="border-t pt-4">
                                <CmsContentPreview html={previewContent.body} />
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            {/* Modal for linking category to page */}
            <Modal
                title="Add Category to Page"
                open={linkCategoryModalOpen}
                onOk={handleConfirmLinkCategory}
                onCancel={() => {
                    setLinkCategoryModalOpen(false);
                    setSelectedPageId(null);
                    setSelectedLinkCategoryId(null);
                }}
                okText="Add"
            >
                <div className="py-4">
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a category"
                        value={selectedLinkCategoryId}
                        onChange={(value) => setSelectedLinkCategoryId(value)}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={selectedPageId ? categories.filter(cat => {
                            const pageRels = pageRelations.get(selectedPageId);
                            return !pageRels?.categories.includes(cat.id);
                        }).map(cat => ({
                            value: cat.id,
                            label: `${cat.title} (#${cat.id})`
                        })) : []}
                    />
                </div>
            </Modal>

            {/* Modal for linking content to page/category */}
            <Modal
                title={`Assign Content to ${selectedParentType === 'page' ? 'Page' : 'Category'}`}
                open={linkContentModalOpen}
                onOk={handleConfirmLinkContent}
                onCancel={() => {
                    setLinkContentModalOpen(false);
                    setSelectedPageId(null);
                    setSelectedCategoryId(null);
                    setSelectedParentType(null);
                    setSelectedLinkContentId(null);
                }}
                okText="Assign"
            >
                <div className="py-4">
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a content"
                        value={selectedLinkContentId}
                        onChange={(value) => setSelectedLinkContentId(value)}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={(() => {
                            if (!selectedParentType) return [];
                            const availableContents = contents.filter(content => {
                                if (selectedParentType === 'page' && selectedPageId) {
                                    const pageRels = pageRelations.get(selectedPageId);
                                    return !pageRels?.contents.includes(content.id);
                                } else if (selectedParentType === 'category' && selectedCategoryId) {
                                    const catRels = categoryRelations.get(selectedCategoryId);
                                    return !catRels?.contents.includes(content.id);
                                }
                                return false;
                            });
                            return availableContents.map(cnt => ({
                                value: cnt.id,
                                label: `${cnt.title} (#${cnt.id})`
                            }));
                        })()}
                    />
                </div>
            </Modal>

            {/* Modal for linking child category */}
            <Modal
                title="Add Child Category"
                open={linkChildCategoryModalOpen}
                onOk={handleConfirmLinkChildCategory}
                onCancel={() => {
                    setLinkChildCategoryModalOpen(false);
                    setSelectedCategoryId(null);
                    setSelectedLinkChildCategoryId(null);
                }}
                okText="Add"
            >
                <div className="py-4">
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a category"
                        value={selectedLinkChildCategoryId}
                        onChange={(value) => setSelectedLinkChildCategoryId(value)}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={selectedCategoryId ? categories.filter(cat => {
                            if (cat.id === selectedCategoryId) return false;
                            const catRels = categoryRelations.get(selectedCategoryId);
                            return !catRels?.children.includes(cat.id);
                        }).map(cat => ({
                            value: cat.id,
                            label: `${cat.title} (#${cat.id})`
                        })) : []}
                    />
                </div>
            </Modal>

            {/* Modal for unlinking */}
            <Modal
                title={`Unlink ${nodeToUnlink?.nodeType || ''}?`}
                open={unlinkModalOpen}
                onOk={handleConfirmUnlink}
                onCancel={() => {
                    setUnlinkModalOpen(false);
                    setNodeToUnlink(null);
                }}
                okText="Unlink"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to unlink "{nodeToUnlink?.title}" from its parent?</p>
            </Modal>
        </div>
    );
}
