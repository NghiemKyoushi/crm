"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tree, message, Button, Modal, Input, Spin, Select, Space, Tag, Checkbox } from "antd";
import type { TreeProps, DataNode } from "antd/es/tree";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ReloadOutlined,
    SearchOutlined,
    ExpandOutlined,
    CompressOutlined,
    ClearOutlined
} from "@ant-design/icons";
import { useCmsCategories, useInvalidateCategories } from "../hooks/useCmsCategories";
import { CmsCategory } from "../apis/categories";
import { getCategoryRelations, linkCategoryRelation, unlinkCategoryRelation, AggregateItem } from "../apis/aggregate";

const { Search } = Input;

interface CategoryTreeNode extends DataNode {
    key: string;
    title: string;
    children?: CategoryTreeNode[];
    categoryId: number;
    category: CmsCategory;
}

interface CategoryTreeManagerProps {
    onEditCategory?: (categoryId: number) => void;
    onDeleteCategory?: (categoryId: number) => void;
}

export default function CategoryTreeManager({ onEditCategory, onDeleteCategory }: CategoryTreeManagerProps) {
    const [categoriesPage] = useState<number>(0);
    const [categoriesSize] = useState<number>(1000); // Load all categories for tree
    const { data: categoriesData, isLoading: loadingCategories } = useCmsCategories(categoriesPage, categoriesSize);
    const categories = Array.isArray(categoriesData?.items) ? categoriesData?.items : [];
    const invalidateCategories = useInvalidateCategories();

    const [categoryRelations, setCategoryRelations] = useState<Map<number, number[]>>(new Map());
    const [loadingRelations, setLoadingRelations] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

    // Load all category relations
    useEffect(() => {
        const loadAllRelations = async () => {
            if (categories.length === 0) return;

            setLoadingRelations(true);
            try {
                const relationsMap = new Map<number, number[]>();

                // Fetch relations for all categories
                const promises = categories.map(async (cat) => {
                    try {
                        const children = await getCategoryRelations(cat.id);
                        if (children.length > 0) {
                            relationsMap.set(cat.id, children.map(c => c.id));
                        }
                    } catch (error) {
                        console.error(`Failed to load relations for category ${cat.id}:`, error);
                    }
                });

                await Promise.all(promises);
                setCategoryRelations(relationsMap);
            } catch (error) {
                message.error("Failed to load category relations");
            } finally {
                setLoadingRelations(false);
            }
        };

        loadAllRelations();
    }, [categories]);

    // Build tree structure with filtering
    const treeData = useMemo(() => {
        const categoryMap = new Map<number, CmsCategory>();

        // Apply status filter
        const filteredCategories = categories.filter(cat => {
            if (statusFilter === "all") return true;
            return cat.status === statusFilter;
        });

        filteredCategories.forEach(cat => categoryMap.set(cat.id, cat));

        const childrenSet = new Set<number>();
        categoryRelations.forEach((children) => {
            children.forEach(childId => childrenSet.add(childId));
        });

        // Find root categories (those that are not children of any category)
        const rootCategories = filteredCategories.filter(cat => !childrenSet.has(cat.id));

        // Recursive function to build tree
        const buildTreeNode = (category: CmsCategory): CategoryTreeNode => {
            const children = categoryRelations.get(category.id) || [];
            const childNodes = children
                .map(childId => categoryMap.get(childId))
                .filter((c): c is CmsCategory => c !== undefined)
                .map(buildTreeNode);

            return {
                key: `cat-${category.id}`,
                title: `${category.title} (#${category.id})`,
                categoryId: category.id,
                category,
                children: childNodes.length > 0 ? childNodes : undefined,
            };
        };

        return rootCategories.map(buildTreeNode);
    }, [categories, categoryRelations, statusFilter]);

    // Get all keys for expand/collapse all
    const getAllKeys = (nodes: CategoryTreeNode[]): React.Key[] => {
        const keys: React.Key[] = [];
        const traverse = (node: CategoryTreeNode) => {
            keys.push(node.key);
            if (node.children) {
                node.children.forEach(traverse);
            }
        };
        nodes.forEach(traverse);
        return keys;
    };

    // Search functionality
    const getParentKey = (key: React.Key, tree: CategoryTreeNode[]): React.Key | null => {
        let parentKey: React.Key | null = null;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some((item) => item.key === key)) {
                    parentKey = node.key;
                } else if (getParentKey(key, node.children)) {
                    parentKey = getParentKey(key, node.children);
                }
            }
        }
        return parentKey;
    };

    // Handle search
    useEffect(() => {
        if (searchValue) {
            const allKeys = getAllKeys(treeData);
            const expandedKeysList: React.Key[] = [];

            allKeys.forEach((key) => {
                const keyStr = String(key);
                const node = findNodeByKey(keyStr, treeData);
                if (node && (
                    node.category.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                    node.category.slug.toLowerCase().includes(searchValue.toLowerCase()) ||
                    String(node.categoryId).includes(searchValue)
                )) {
                    const parentKey = getParentKey(key, treeData);
                    if (parentKey) {
                        expandedKeysList.push(parentKey);
                    }
                }
            });

            setExpandedKeys(expandedKeysList);
            setAutoExpandParent(true);
        } else {
            setExpandedKeys([]);
            setAutoExpandParent(false);
        }
    }, [searchValue, treeData]);

    const findNodeByKey = (key: string, nodes: CategoryTreeNode[]): CategoryTreeNode | null => {
        for (const node of nodes) {
            if (node.key === key) return node;
            if (node.children) {
                const found = findNodeByKey(key, node.children);
                if (found) return found;
            }
        }
        return null;
    };

    // Handle drag and drop
    const onDrop: TreeProps['onDrop'] = async (info) => {
        const dragNode = info.dragNode as CategoryTreeNode;
        const dropNode = info.node as CategoryTreeNode;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const dragCategoryId = dragNode.categoryId;

        try {
            // Remove from old parent (if exists)
            const oldParentId = findParentId(dragCategoryId);
            if (oldParentId !== null) {
                await unlinkCategoryRelation({ parent_id: oldParentId, child_id: dragCategoryId });
            }

            // If dropped on a node (not between nodes), make it a child
            if (!info.dropToGap) {
                const newParentId = dropNode.categoryId;
                if (newParentId !== dragCategoryId) {
                    await linkCategoryRelation({ parent_id: newParentId, child_id: dragCategoryId });
                    message.success("Category moved successfully");
                }
            } else if (dropPosition === -1 || dropPosition === 1) {
                // Dropped between nodes - make it a sibling
                const newParentId = findParentId(dropNode.categoryId);
                if (newParentId !== null && newParentId !== dragCategoryId) {
                    await linkCategoryRelation({ parent_id: newParentId, child_id: dragCategoryId });
                    message.success("Category moved successfully");
                } else {
                    // Dropped at root level
                    message.success("Category moved to root level");
                }
            }

            // Reload relations
            await reloadRelations();
        } catch (error) {
            message.error("Failed to move category");
        }
    };

    // Find parent ID of a category
    const findParentId = (childId: number): number | null => {
        for (const [parentId, children] of categoryRelations.entries()) {
            if (children.includes(childId)) {
                return parentId;
            }
        }
        return null;
    };

    // Reload all relations
    const reloadRelations = async () => {
        setLoadingRelations(true);
        try {
            const relationsMap = new Map<number, number[]>();
            const promises = categories.map(async (cat) => {
                try {
                    const children = await getCategoryRelations(cat.id);
                    if (children.length > 0) {
                        relationsMap.set(cat.id, children.map(c => c.id));
                    }
                } catch (error) {
                    console.error(`Failed to load relations for category ${cat.id}:`, error);
                }
            });
            await Promise.all(promises);
            setCategoryRelations(relationsMap);
            invalidateCategories();
        } catch (error) {
            message.error("Failed to reload relations");
        } finally {
            setLoadingRelations(false);
        }
    };

    const onExpand = (keys: React.Key[]) => {
        setExpandedKeys(keys);
        setAutoExpandParent(false);
    };

    const onSelect = (selectedKeys: React.Key[], info: any) => {
        // Optional: handle selection
    };

    const onCheck = (checkedKeysValue: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
        if (Array.isArray(checkedKeysValue)) {
            setCheckedKeys(checkedKeysValue);
        } else {
            setCheckedKeys(checkedKeysValue.checked);
        }
    };

    const handleExpandAll = () => {
        const allKeys = getAllKeys(treeData);
        setExpandedKeys(allKeys);
    };

    const handleCollapseAll = () => {
        setExpandedKeys([]);
    };

    const handleBulkDelete = () => {
        if (checkedKeys.length === 0) {
            message.warning("Please select categories to delete");
            return;
        }

        Modal.confirm({
            title: `Delete ${checkedKeys.length} selected categories?`,
            content: "This will delete the selected categories and all their relations. Are you sure?",
            okText: "Delete",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const categoryIds = checkedKeys
                        .map(key => {
                            const node = findNodeByKey(String(key), treeData);
                            return node?.categoryId;
                        })
                        .filter((id): id is number => id !== undefined);

                    // Delete in parallel
                    await Promise.all(
                        categoryIds.map(id => onDeleteCategory && onDeleteCategory(id))
                    );

                    message.success(`Deleted ${categoryIds.length} categories`);
                    setCheckedKeys([]);
                    invalidateCategories();
                } catch (error) {
                    message.error("Failed to delete some categories");
                }
            },
        });
    };

    if (loadingCategories) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spin size="large" tip="Loading categories..." />
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-lg font-semibold">Category Tree Management</h3>
                        <p className="text-sm text-gray-500">Drag and drop categories to reorganize the hierarchy</p>
                    </div>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={reloadRelations}
                        loading={loadingRelations}
                    >
                        Reload Tree
                    </Button>
                </div>

                {/* Controls Row */}
                <Space wrap className="w-full mb-3">
                    <Search
                        placeholder="Search by title, slug, or ID..."
                        allowClear
                        style={{ width: 300 }}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        prefix={<SearchOutlined />}
                    />

                    <Select
                        placeholder="Filter by status"
                        style={{ width: 150 }}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: "all", label: "All Status" },
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                        ]}
                    />

                    <Button
                        icon={<ExpandOutlined />}
                        onClick={handleExpandAll}
                    >
                        Expand All
                    </Button>

                    <Button
                        icon={<CompressOutlined />}
                        onClick={handleCollapseAll}
                    >
                        Collapse All
                    </Button>

                    {checkedKeys.length > 0 && (
                        <>
                            <Tag color="blue">{checkedKeys.length} selected</Tag>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleBulkDelete}
                            >
                                Delete Selected
                            </Button>
                            <Button
                                icon={<ClearOutlined />}
                                onClick={() => setCheckedKeys([])}
                            >
                                Clear Selection
                            </Button>
                        </>
                    )}
                </Space>
            </div>

            {treeData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {categories.length === 0
                        ? "No categories found. Create categories first in the Categories tab."
                        : "No categories match the current filters."}
                </div>
            ) : (
                <Tree
                    className="bg-white p-4 rounded border border-gray-200"
                    showLine
                    showIcon={false}
                    checkable
                    draggable
                    blockNode
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    checkedKeys={checkedKeys}
                    onExpand={onExpand}
                    onSelect={onSelect}
                    onCheck={onCheck}
                    onDrop={onDrop}
                    treeData={treeData}
                    titleRender={(nodeData) => {
                        const node = nodeData as CategoryTreeNode;
                        const isMatch = searchValue && (
                            node.category.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                            node.category.slug.toLowerCase().includes(searchValue.toLowerCase()) ||
                            String(node.categoryId).includes(searchValue)
                        );

                        return (
                            <div className="flex items-center justify-between group hover:bg-gray-50 px-2 py-1 rounded">
                                <div className="flex items-center gap-2">
                                    <span className={isMatch ? "text-blue-600 font-semibold" : ""}>
                                        {node.title}
                                    </span>
                                    <Tag
                                        color={node.category.status === "active" ? "green" : "gray"}
                                        className="text-xs"
                                    >
                                        {node.category.status}
                                    </Tag>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {onEditCategory && (
                                        <Button
                                            size="small"
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditCategory(node.categoryId);
                                            }}
                                        />
                                    )}
                                    {onDeleteCategory && (
                                        <Button
                                            size="small"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteCategory(node.categoryId);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    }}
                />
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Tips:</strong>
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside mt-1">
                    <li>Use checkboxes to select multiple categories for bulk actions</li>
                    <li>Drag a category and drop it on another to make it a child</li>
                    <li>Drag a category and drop it between nodes to make it a sibling</li>
                    <li>Drag a category to the top/bottom to move it to root level</li>
                    <li>Use search to quickly find categories by title, slug, or ID</li>
                    <li>Filter by status to view only active or inactive categories</li>
                </ul>
            </div>
        </div>
    );
}
