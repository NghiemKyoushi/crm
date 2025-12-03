"use client";
import React, { useState, useRef, useMemo } from "react";
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, DownloadOutlined, FileExcelOutlined, TeamOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  Tag,
  Modal,
  Checkbox,
  Tooltip,
  message,
  Form,
} from "antd";
import TableComponent from "@/components/TableComponent";
import TelesaleDetailModal from "./telesale-detail-modal";
import AssignTelesaleModal from "./assign-telesale-modal";
import TagManagerModal from "./tag-modal";
import { ColumnsType } from "antd/es/table";
import {
  AssignSaleModel,
  TelesaleCustomer,
  TelesaleParamsList,
} from "../types/telesales-mng";
import {
  useTelesalesList,
  useAddCustomerNote,
  useUpdateTelesaleStatus,
  useTelesaleUsers,
  useTelesaleStatistic,
  useAssignCustomerTag,
  useUnAssignCustomerTag,
} from "../hooks/telesale-mng";
import { EditOutlined } from "@ant-design/icons";
import AddMultiCustomerModal from "./modal/add-multi-customer";
import {
  addTelesaleCustomer,
  assignTelesale,
  deleteBulkTelesaleContacts,
  deleteTelesaleContactTags,
  downloadTelesaleExample,
  updateTelesaleCustomer,
  // updateTelesaleCustomer,
} from "../apis/telesale-mng";

import { importTelesaleCustomers } from "../apis/telesale-mng";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { NoteModal } from "./modal/note-modal";
import { usePermission } from "@/components/layout/PermissionContext";
import { FilterForm } from "./modal/filter-telesale-modal";
import { CustomerAddModal } from "./modal/customer-add-modal";

const TelesalesPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const [page, setPage] = useState(0);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isOpenAssign, setIsOpenAssign] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<TelesaleCustomer | null>(null);
  const [isOpenTagModal, setIsOpenTagModal] = useState(false);
  const [tagTypeModal, setTagTypeModal] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isOpenAddCustomerModalOpen, setIsOpenAddCustomerModalOpen] =
    useState(false);

  const [noteAssign, setNoteAssign] = useState<string>("");
  const [bulkAssignCustomers, setBulkAssignCustomers] = useState<
    TelesaleCustomer[]
  >([]);
  const [isDeleteMultiModalOpen, setIsDeleteMultiModalOpen] = useState(false);

  const [downloading, setDownloading] = useState(false);

  // note modal (ghi chú customer)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteCustomer, setEditingNoteCustomer] =
    useState<TelesaleCustomer | null>(null);

  // --- Contact Info Edit Modal ---
  const [isEditContactInfoModalOpen, setIsEditContactInfoModalOpen] =
    useState(false);
  const [editingContactCustomer, setEditingContactCustomer] =
    useState<TelesaleCustomer | null>(null);
  const [editContactForm] = Form.useForm();
  const [editContactLoading, setEditContactLoading] = useState(false);

  // --- Email Edit Modal ---
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false);
  const [editingEmailCustomer, setEditingEmailCustomer] =
    useState<TelesaleCustomer | null>(null);
  const [editEmailForm] = Form.useForm();
  const [editEmailLoading, setEditEmailLoading] = useState(false);

  // for all notes modal
  const [allNotesModal, setAllNotesModal] = useState<{
    open: boolean;
    notes: any[];
  }>({
    open: false,
    notes: [],
  });

  // for call confirm modal (gọi/thất bại)
  const [confirmCallModal, setConfirmCallModal] = useState<{
    open: boolean;
    customer: TelesaleCustomer | null;
    status: "CALLED" | "FAILED" | null;
    note?: string;
  }>({
    open: false,
    customer: null,
    status: null,
    note: "",
  });
  const [deleteTagModal, setDeleteTagModal] = useState<{
    open: boolean;
    tag?: { tagId: number; customerId: number };
    tagName?: string;
  }>({ open: false, tag: undefined, tagName: "" });

  const [deleteCustomerModal, setDeleteCustomerModal] = useState<{
    open: boolean;
    record?: TelesaleCustomer
  }>({ open: false, record: undefined});

  // Popup Hủy gán Sale Modal state/handlers
  const [unassignSaleModal, setUnassignSaleModal] = useState<{
    open: boolean;
    customer: TelesaleCustomer | null;
  }>({
    open: false,
    customer: null,
  });

  const { mutate: addCustomerNote } = useAddCustomerNote();
  const { mutate: updateTelesaleStatus, isPending: isStatusUpdating } =
    useUpdateTelesaleStatus();
  const assignTelesaleMutation = useMutation({
    mutationFn: (body: AssignSaleModel) => assignTelesale(body),
  });
  const deleteCustomerTagMutation = useMutation({
    mutationFn: (data: { customerId: number; tagId: number[] }) =>
      deleteTelesaleContactTags(data.customerId.toString(), data.tagId),
  });

  const updateTelesaleCustomerMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        email: string;
        address?: string;
        business_field?: string;
        customer_info?: string;
      };
    }) => updateTelesaleCustomer(id, data),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [params, setParams] = useState<TelesaleParamsList>({
    page: 0,
    pageSize: 10,
  });

  const { data, isPending, refetch } = useTelesalesList(params);
  const { data: telesaleUserList, isLoading: isLoadingTelesaleUsers } =
    useTelesaleUsers();

  const {
    stat: telesaleStat,
    reload: reloadTelesaleStat,
    loading: statLoading,
  } = useTelesaleStatistic();
  const { mutate: assignTagMutate } = useAssignCustomerTag();

  const handleOpenNoteModal = (customer: TelesaleCustomer) => {
    setEditingNoteCustomer(customer);
    setIsNoteModalOpen(true);
  };

  // Handle open modal to edit contact info
  const handleOpenEditContactModal = (customer: TelesaleCustomer) => {
    setEditingContactCustomer(customer);
    setIsEditContactInfoModalOpen(true);
    setTimeout(() => {
      editContactForm.setFieldsValue({
        address: customer.address || "",
        businessField: customer.businessField || "",
        customerInfo: customer.customerInfo || "",
      });
    }, 0);
  };

  // Handle open modal to edit email
  const handleOpenEditEmailModal = (customer: TelesaleCustomer) => {
    setEditingEmailCustomer(customer);
    setIsEditEmailModalOpen(true);
    setTimeout(() => {
      editEmailForm.setFieldsValue({
        email: customer.email || "",
      });
    }, 0);
  };

  const isTelesaleManager = useMemo(() => {
    return hasPermission("telesales.manager") || hasPermission("system.admin");
  }, [hasPermission]);

  const handleSaveNote = async (newNote: string) => {
    if (!editingNoteCustomer) return;
    addCustomerNote(
      {
        customerId: editingNoteCustomer.id,
        notes: newNote,
        saleId: editingNoteCustomer.saleId ? +editingNoteCustomer.saleId : 0,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật ghi chú thành công!");
          refetch();
          setIsNoteModalOpen(false);
          setEditingNoteCustomer(null);
        },
        onError: () => {
          toast.error("Cập nhật ghi chú thất bại. Vui lòng thử lại.");
        },
      }
    );
  };

  const handleCancelNote = () => {
    setIsNoteModalOpen(false);
    setEditingNoteCustomer(null);
  };

  // Handle save update contact info
  const handleSaveContactEdit = async () => {
    if (!editingContactCustomer) return;
    try {
      const values = await editContactForm.validateFields();
      setEditContactLoading(true);
      await updateTelesaleCustomer(editingContactCustomer.id, {
        address: values.address,
        business_field: values.businessField,
        customer_info: values.customerInfo,
        email: editingContactCustomer.email,
      });
      toast.success("Cập nhật thông tin liên hệ thành công!");
      setIsEditContactInfoModalOpen(false);
      setEditingContactCustomer(null);
      refetch();
    } catch (err: any) {
      toast.error("Cập nhật thông tin liên hệ thất bại!");
    } finally {
      setEditContactLoading(false);
    }
  };
  const handleCancelContactEdit = () => {
    setIsEditContactInfoModalOpen(false);
    setEditingContactCustomer(null);
    editContactForm.resetFields();
  };

  // --- Handle save update email ---
  const handleSaveEmailEdit = async () => {
    if (!editingEmailCustomer) return;
    try {
      const values = await editEmailForm.validateFields();
      setEditEmailLoading(true);
      await updateTelesaleCustomerMutation.mutateAsync({
        id: editingEmailCustomer.id,
        data: {
          email: values.email,
          address: editingEmailCustomer.address ?? undefined,
          business_field: editingEmailCustomer.businessField ?? undefined,
          customer_info: editingEmailCustomer.customerInfo ?? undefined,
        },
      });
      toast.success("Cập nhật email thành công!");
      setIsEditEmailModalOpen(false);
      setEditingEmailCustomer(null);
      refetch();
    } catch (err: any) {
      toast.error("Cập nhật email thất bại!");
    } finally {
      setEditEmailLoading(false);
    }
  };

  const handleCancelEmailEdit = () => {
    setIsEditEmailModalOpen(false);
    setEditingEmailCustomer(null);
    editEmailForm.resetFields();
  };

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
    setParams((prev) => ({
      ...prev,
      page: pageNumber - 1,
    }));
  };

  // Filter only unassigned customers for selection
  const unassignedCustomers =
    data?.data?.filter((d) => d.status === "UNASSIGNED") || [];
  const allUnassignedIds = unassignedCustomers.map((d) => d.id);

  const columns: ColumnsType<TelesaleCustomer> = [
    ...(isTelesaleManager
      ? [
          {
            title: (
              <Checkbox
                checked={
                  unassignedCustomers.length > 0 &&
                  selectedRowKeys.length === unassignedCustomers.length &&
                  allUnassignedIds.every((id) => selectedRowKeys.includes(id))
                }
                indeterminate={
                  selectedRowKeys.length > 0 &&
                  selectedRowKeys.length < unassignedCustomers.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    // Select only unassigned customers
                    setSelectedRowKeys(allUnassignedIds);
                  } else {
                    setSelectedRowKeys([]);
                  }
                }}
              />
            ),
            dataIndex: "select",
            key: "select",
            width: 48,
            render: (_: any, record: TelesaleCustomer) => (
              <Checkbox
                checked={selectedRowKeys.includes(record.id)}
                disabled={record.status !== "UNASSIGNED"}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    setSelectedRowKeys((prev) => [...prev, record.id]);
                  } else {
                    setSelectedRowKeys((prev) =>
                      prev.filter((k) => k !== record.id)
                    );
                  }
                }}
              />
            ),
          },
        ]
      : []),
    // Merged: Customer Info + Contact
    {
      title: "Khách hàng",
      dataIndex: "customerInfo",
      key: "customerInfo",
      width: 160,
      render: (_: any, record: TelesaleCustomer) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900 mb-1">{record.name}</div>
          <div className="text-gray-700 mb-1">
            <span className="font-medium">{record.phone || "--"}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="font-medium">{record.email || "--"}</span>
            <span
              className="text-[9px] text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditEmailModal(record);
              }}
            >
              <EditOutlined style={{ fontSize: 9 }} />
              <span>Sửa</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin liên hệ",
      dataIndex: "contactInfo",
      key: "contactInfo",
      width: 160,
      render: (_: any, record: any) => (
        <div className="text-xs text-gray-700 space-y-1 relative">
          <div>
            <span className="font-semibold text-gray-800">Địa chỉ: </span>
            <span className="font-medium text-gray-900">
              {record.address || "--"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-800">Lĩnh vực KD: </span>
            <span className="font-medium">{record.businessField || "--"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800">Khác: </span>
              <span className="font-medium">{record.customerInfo || "--"}</span>
            </div>
            <div
              className="text-[9px] text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5"
              style={{ zIndex: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditContactModal(record);
              }}
            >
              <EditOutlined style={{ fontSize: 9 }} />
              <span>Sửa</span>
            </div>
          </div>
        </div>
      ),
    },
    // ... (rest columns unchanged!)
    // The rest of columns definition is unchanged below
    {
      title: "Note yêu cầu khách hàng",
      dataIndex: "notes",
      key: "notesColumn",
      width: 200,
      render: (_: any, record: any) => {
        const customerNote = record.note || "";
        return (
          <div className="text-[11px] space-y-1.5">
            {/* Customer Request Note - with background and edit button */}
            {customerNote ? (
              <div className="bg-amber-50 border-l-2 border-amber-400 px-2 py-1 rounded">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="font-semibold text-amber-700 text-[10px]">
                    Yêu cầu KH:
                  </div>
                  <div
                    className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5"
                    onClick={() => handleOpenNoteModal(record)}
                  >
                    <EditOutlined style={{ fontSize: 9 }} />
                    <span className="text-[9px] font-medium">Sửa</span>
                  </div>
                </div>
                <Tooltip title={customerNote}>
                  <div className="text-gray-700 line-clamp-2 leading-tight">
                    {customerNote}
                  </div>
                </Tooltip>
              </div>
            ) : (
              /* No customer note - show add button */
              <div className="bg-amber-50 border-l-2 border-amber-400 px-2 py-1 rounded">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-amber-700 text-[10px]">
                    Yêu cầu KH:
                  </div>
                  <div
                    className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5"
                    onClick={() => handleOpenNoteModal(record)}
                  >
                    <EditOutlined style={{ fontSize: 9 }} />
                    <span className="text-[9px] font-medium">Thêm</span>
                  </div>
                </div>
                <div className="text-gray-400 italic text-[10px]">
                  Chưa có yêu cầu
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Telesale",
      dataIndex: "business",
      key: "business",
      width: 120,
      render: (_: any, record: any) => (
        <div className="text-xs text-gray-700">
          <div className="font-medium mb-1">
            {record.saleName || "Chưa gán"}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "telesale",
      key: "telesaleStatus",
      width: 120,
      render: (_: any, record: TelesaleCustomer) => {
        let statusColor = "default";
        let statusText = record.status;

        if (record.status === "NOT_CALLED") {
          statusText = "Chưa gọi";
          statusColor = "gold";
        } else if (record.status === "CALLED") {
          statusText = "Đã gọi";
          statusColor = "green";
        } else if (record.status === "UNASSIGNED") {
          statusText = "Chưa gán";
          statusColor = "orange";
        } else if (record.status === "FAILED") {
          statusText = "Thất bại";
          statusColor = "red";
        }

        return (
          <div
            className="text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
            onClick={() => {
              setSelectedCustomer(record);
              setIsOpenDetail(true);
            }}
          >
            {/* <div className="font-medium text-blue-600 hover:text-blue-800 mb-1">
              {record.saleName || "Chưa gán"}
            </div> */}
            <Tag color={statusColor} className="!text-xs !py-0">
              {statusText}
            </Tag>
          </div>
        );
      },
    },
    // ... Other columns remain unchanged ...
    {
      title: "Loại dịch vụ",
      dataIndex: "serviceTag",
      key: "serviceTag",
      width: 120,
      render: (_: any, record: TelesaleCustomer) => {
        const tag = record.serviceTag;
        if (!Array.isArray(tag) || tag.length === 0) {
          return <span className="text-xs text-gray-400">--</span>;
        }
        return (
          <div className="flex flex-col gap-1 px-1">
            {Array.isArray(tag) && tag.length > 0 ? (
              tag.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="group relative flex items-center mx-1"
                  style={{ width: "calc(100% - 8px)" }}
                >
                  <div
                    className="relative flex items-center h-5 w-full rounded-l"
                    style={{ backgroundColor: t.color || "#3b82f6" }}
                  >
                    <div className="flex-1 flex items-center justify-between px-2 py-0.5 text-white text-[9px] font-medium">
                      <span className="truncate">{t.name}</span>
                      <span
                        className="ml-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTagModal({
                            open: true,
                            tag: { customerId: record.id, tagId: t.id },
                            tagName: t.name,
                          });
                        }}
                      >
                        <Tooltip title="Xoá tag">
                          <DeleteOutlined className="text-white hover:text-red-200" style={{ fontSize: 8 }} />
                        </Tooltip>
                      </span>
                    </div>
                    <div
                      className="absolute -right-2 top-0 bottom-0 w-0 h-0"
                      style={{
                        borderTop: "10px solid transparent",
                        borderBottom: "10px solid transparent",
                        borderLeft: `8px solid ${t.color || "#3b82f6"}`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">--</span>
            )}

            <div
              className="text-[9px] text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5 mt-0.5"
              onClick={() => {
                setSelectedCustomer(record);
                setIsOpenTagModal(true);
                setTagTypeModal("SERVICE");
              }}
            >
              <EditOutlined style={{ fontSize: 9 }} />
              <span>Thêm tags</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Nguồn",
      dataIndex: "sourceTag",
      key: "sourceTag",
      width: 110,
      render: (_: any, record: TelesaleCustomer) => {
        const tag = record.sourceTag;
        if (!tag) return <span className="text-xs text-gray-400">--</span>;
        return (
          <div className="flex flex-col gap-1 px-1">
            <div
              key={tag.id}
              className="group relative flex items-center mx-1"
              style={{ width: "calc(100% - 8px)" }}
            >
              <div
                className="relative flex items-center h-5 w-full rounded-l"
                style={{ backgroundColor: tag.color || "#3b82f6" }}
              >
                <div className="flex-1 flex items-center justify-between px-2 py-0.5 text-white text-[9px] font-medium">
                  <span className="truncate">{tag.name}</span>
                </div>
                <div
                  className="absolute -right-2 top-0 bottom-0 w-0 h-0"
                  style={{
                    borderTop: "10px solid transparent",
                    borderBottom: "10px solid transparent",
                    borderLeft: `8px solid ${tag.color || "#3b82f6"}`,
                  }}
                />
              </div>
            </div>
            <div className="h-4"></div>
          </div>
        );
      },
    },
    {
      title: "Tình trạng",
      dataIndex: "statusTag",
      key: "statusTag",
      width: 110,
      render: (_: any, record: TelesaleCustomer) => {
        const tag = record.statusTag;
        return (
          <div className="flex flex-col gap-1 px-1">
            {Array.isArray(tag) && tag.length > 0 ? (
              tag.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="group relative flex items-center mx-1"
                  style={{ width: "calc(100% - 8px)" }}
                >
                  <div
                    className="relative flex items-center h-5 w-full rounded-l"
                    style={{ backgroundColor: t.color || "#3b82f6" }}
                  >
                    <div className="flex-1 flex items-center justify-between px-2 py-0.5 text-white text-[9px] font-medium">
                      <span className="truncate">{t.name}</span>
                      {/* Hiển thị button xoá chỉ khi hover */}
                      <span
                        className="ml-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTagModal({
                            open: true,
                            tag: { customerId: record.id, tagId: t.id },
                            tagName: t.name,
                          });
                        }}
                      >
                        <Tooltip title="Xoá tag">
                          <DeleteOutlined className="text-white hover:text-red-200" style={{ fontSize: 8 }} />
                        </Tooltip>
                      </span>
                    </div>
                    <div
                      className="absolute -right-2 top-0 bottom-0 w-0 h-0"
                      style={{
                        borderTop: "10px solid transparent",
                        borderBottom: "10px solid transparent",
                        borderLeft: `8px solid ${t.color || "#3b82f6"}`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">--</span>
            )}

            <div
              className="text-[9px] text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5 mt-0.5"
              onClick={() => {
                setSelectedCustomer(record);
                setIsOpenTagModal(true);
                setTagTypeModal("STATUS");
              }}
            >
              <EditOutlined style={{ fontSize: 9 }} />
              <span>Thêm tags</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notesColumn",
      width: 200,
      render: (_: any, record: any) => {
        const salesNotes =
          record.notes && record.notes.length > 0
            ? record.notes.filter((n: any) => {
                if (!n) return false;
                if (typeof n === "string") return n.trim().length > 0;
                // If it's an object, check if it has content
                return (
                  (n.note && n.note.trim().length > 0) ||
                  (n.content && n.content.trim().length > 0) ||
                  Object.keys(n).length > 0
                );
              })
            : [];

        const showAllNotes = (notes: any[]) => {
          setAllNotesModal({
            open: true,
            notes: notes,
          });
        };

        return (
          <div className="text-[11px] space-y-1.5">
            {/* Sales Notes - with background */}
            {salesNotes.length > 0 && (
              <div className="bg-blue-50 border-l-2 border-blue-400 px-2 py-1 rounded">
                <div className="font-semibold text-blue-700 mb-0.5 text-[10px]">
                  Ghi chú Sale:
                </div>
                <div className="space-y-0.5">
                  {salesNotes.slice(0, 2).map((noteObj: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-gray-700 truncate leading-tight"
                    >
                      • {noteObj}
                    </div>
                  ))}
                  {salesNotes.length > 2 && (
                    <div
                      className="text-blue-600 hover:text-blue-800 font-medium text-[10px] cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        showAllNotes(salesNotes);
                      }}
                    >
                      +{salesNotes.length - 2} ghi chú khác (xem tất cả)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,

      render: (_: any, record: TelesaleCustomer) => {
        if (record.status === "UNASSIGNED") {
          return (
            <div className="flex flex-col gap-1.5">
              {isTelesaleManager && (
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedCustomer(record);
                    setIsOpenAssign(true);
                  }}
                  className="!bg-gradient-to-r !from-orange-500 !to-orange-600 hover:!from-orange-600 hover:!to-orange-700 !text-white !text-xs !font-medium !rounded-md !shadow-sm hover:!shadow-md !transition-all !w-full"
                >
                  Gán Sale
                </Button>
              )}
               <Button
                  size="small"
                  onClick={() => {
                    setDeleteCustomerModal({
                      open: true,
                      record: record,
                    });
                  }}
                  className="!bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-600 hover:!to-red-700 !text-white !text-xs !font-medium !rounded-md !shadow-sm hover:!shadow-md !transition-all !w-full"
                >
                  Xoá khách hàng
                </Button>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-1.5">
            {/* Button "Đã gọi" */}
            <Button
              size="small"
              className="!bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 !text-white !text-xs !font-medium !rounded-md !shadow-sm hover:!shadow-md !transition-all !w-full"
              loading={isStatusUpdating}
              onClick={() => {
                setConfirmCallModal({
                  open: true,
                  customer: record,
                  status: "CALLED",
                  note: "",
                });
              }}
            >
              Đã gọi
            </Button>
            {/* Button "Thất bại" */}
            <Button
              size="small"
              className="!bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-600 hover:!to-red-700 !text-white !text-xs !font-medium !rounded-md !shadow-sm hover:!shadow-md !transition-all !w-full"
              loading={isStatusUpdating}
              onClick={() => {
                setConfirmCallModal({
                  open: true,
                  customer: record,
                  status: "FAILED",
                  note: "",
                });
              }}
            >
              Thất bại
            </Button>
            {isTelesaleManager && (
              <div className="flex flex-col gap-1.5">
                <Button
                  size="small"
                  onClick={() => {
                    setUnassignSaleModal({
                      open: true,
                      customer: record,
                    });
                  }}
                  className="!bg-gradient-to-r !from-gray-500 !to-gray-600 hover:!from-gray-600 hover:!to-gray-700 !text-white !text-xs !font-medium !rounded-md !shadow-sm hover:!shadow-md !transition-all !w-full"
                >
                  Huỷ gán Sale
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setDeleteCustomerModal({
                      open: true,
                      record: record,
                    });
                  }}
                  className="!bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-600 hover:!to-red-700 !text-white !text-xs !font-medium !rounded-md !shadow-sm hover:!shadow-md !transition-all !w-full"
                >
                  Xoá khách hàng
                </Button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const selectedCustomers = data?.data?.filter((c) =>
    selectedRowKeys.includes(c.id)
  );

  const handleDownloadExample = async () => {
    setDownloading(true);
    try {
      const blob = await downloadTelesaleExample();
      if (!blob) {
        throw new Error("Không lấy được file mẫu!");
      }
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "file_telesale_sample.xlsx";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    } catch (e) {
      message.error("Không thể tải file mẫu. Vui lòng thử lại!");
    } finally {
      setDownloading(false);
    }
  };

  // State and handler for call note form inside Modal
  const [callNoteForm] = Form.useForm();
  const [callNoteError, setCallNoteError] = useState<string | null>(null);

  // 👉 handleConfirmUpdateStatus: call statistic refresh after status update
  const handleConfirmUpdateStatus = async () => {
    if (
      confirmCallModal.customer &&
      (confirmCallModal.status === "CALLED" ||
        confirmCallModal.status === "FAILED")
    ) {
      try {
        const values = await callNoteForm.validateFields();
        updateTelesaleStatus(
          {
            contactId: String(confirmCallModal.customer.id),
            status: confirmCallModal.status,
            note: values.note,
          },
          {
            onSuccess: () => {
              toast.success(
                confirmCallModal.status === "CALLED"
                  ? "Cập nhật trạng thái thành công!"
                  : "Cập nhật trạng thái thất bại thành công!"
              );
              setConfirmCallModal({
                open: false,
                customer: null,
                status: null,
                note: "",
              });
              reloadTelesaleStat();
              refetch();
            },
            onError: () => {
              toast.error("Cập nhật trạng thái thất bại!");
              setConfirmCallModal({
                open: false,
                customer: null,
                status: null,
                note: "",
              });
            },
          }
        );
      } catch (err) {
        setCallNoteError("Vui lòng nhập ghi chú!");
      }
    }
  };

  const handleCancelUpdateStatus = () => {
    setConfirmCallModal({
      open: false,
      customer: null,
      status: null,
      note: "",
    });
    callNoteForm.resetFields();
    setCallNoteError(null);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // 👉 After import, also refresh telesale statistics
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await importTelesaleCustomers(formData);
      toast.success("Import thành công!");
      refetch();
      reloadTelesaleStat();
    } catch (error) {
      toast.error("Import thất bại. Vui lòng thử lại!");
    } finally {
      setImporting(false);
    }
  };

  // Handler for filtering: always trigger refetch, even if the filters have not changed
  const handleFilter = ({
    search,
    business_field,
    saleId,
    status,
    service_tag_id,
    source_tag_id,
    status_tag_id,
  }: {
    search: string;
    business_field: string | null;
    saleId: string | null;
    status: string | null;
    service_tag_id: string | null;
    source_tag_id: string | null;
    status_tag_id: string | null;
  }) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      search: search || undefined,
      business_field: business_field ?? undefined,
      saleId: saleId ?? undefined,
      status: status ?? undefined,
      service_tag_id: service_tag_id ?? undefined,
      source_tag_id: source_tag_id ?? undefined,
      status_tag_id: status_tag_id ?? undefined,
    }));
    setPage(0);

    // Always call refetch, regardless of whether the params actually changed
    refetch();
  };

  // Confirm logic for tag deletion
  const handleConfirmDeleteTag = () => {
    if (!deleteTagModal.tag) {
      setDeleteTagModal({ open: false, tag: undefined, tagName: "" });
      return;
    }
    deleteCustomerTagMutation.mutate(
      {
        customerId: deleteTagModal.tag.customerId,
        tagId: [deleteTagModal.tag.tagId],
      },
      {
        onSuccess: () => {
          toast.success("Xoá tag thành công!");
          setDeleteTagModal({ open: false, tag: undefined, tagName: "" });
          refetch();
          reloadTelesaleStat();
        },
        onError: () => {
          toast.error("Xoá tag thất bại, vui lòng thử lại!");
          setDeleteTagModal({ open: false, tag: undefined, tagName: "" });
        },
      }
    );
  };

  const handleConfirmDeleteCustomer = () => {
    if (!deleteCustomerModal.record?.id) {
      setDeleteCustomerModal({ open: false, record: undefined });
      return;
    }

    deleteBulkTelesaleContacts([deleteCustomerModal.record.id])
      .then(() => {
        toast.success("Xoá khách hàng thành công!");
        setDeleteCustomerModal({ open: false, record: undefined });
        refetch();
        reloadTelesaleStat();
      })
      .catch(() => {
        toast.error("Xoá khách hàng thất bại, vui lòng thử lại!");
        setDeleteCustomerModal({ open: false, record: undefined });
      });
  };

  const handleCancelDeleteTag = () => {
    setDeleteTagModal({ open: false, tag: undefined, tagName: "" });
  };

  // Handler for unassign sale modal (huỷ gán Sale)
  const { mutate: unassignCustomerTagMutation } = useUnAssignCustomerTag();

  const handleConfirmUnassignSale = async () => {
    if (!unassignSaleModal.customer) return;
    unassignCustomerTagMutation(
      { customerId: unassignSaleModal.customer.id },
      {
        onSuccess: () => {
          toast.success("Huỷ gán Sale thành công!");
          refetch();
          reloadTelesaleStat();
          setUnassignSaleModal({ open: false, customer: null });
          setSelectedRowKeys((prev) =>
            prev.filter((id) => id !== unassignSaleModal.customer!.id)
          );
        },
        onError: () => {
          toast.error("Huỷ gán Sale thất bại. Vui lòng thử lại!");
          setUnassignSaleModal({ open: false, customer: null });
        },
      }
    );
  };

  const handleCancelUnassignSale = () => {
    setUnassignSaleModal({ open: false, customer: null });
  };

  return (
    <div className="bg-white">
      {/* Ultra Compact Header - Single Row */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-6">
          <h2 className="text-base font-semibold text-gray-800">Telesales</h2>

          {/* Inline Statistics */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <TeamOutlined className="text-blue-600 !h-3.5 !w-3.5" />
              <span className="text-gray-600">Tổng:</span>
              <span className="font-semibold text-gray-900">
                {statLoading
                  ? "..."
                  : telesaleStat.total.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <CheckCircleOutlined className="text-green-600 !h-3.5 !w-3.5" />
              <span className="text-gray-600">Gọi:</span>
              <span className="font-semibold text-green-700">
                {statLoading
                  ? "..."
                  : telesaleStat.called.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <CloseCircleOutlined className="text-red-600 !h-3.5 !w-3.5" />
              <span className="text-gray-600">Thất bại:</span>
              <span className="font-semibold text-red-700">
                {statLoading
                  ? "..."
                  : telesaleStat.failed.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isTelesaleManager && (
            <>
              <Button
                size="small"
                className="!bg-green-600 hover:!bg-green-700 !text-white"
                icon={
                  <FileExcelOutlined className="!h-3 !w-3" />
                }
                loading={importing}
                onClick={handleImportClick}
              >
                Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={importing}
              />
              <Button
                size="small"
                className="!bg-blue-600 hover:!bg-blue-700 !text-white"
                icon={
                  <DownloadOutlined className="!h-3 !w-3" />
                }
                onClick={handleDownloadExample}
                loading={downloading}
              >
                Tải mẫu
              </Button>
              <Button
                size="small"
                className="!bg-purple-600 hover:!bg-purple-700 !text-white"
                icon={
                  <UserAddOutlined className="!h-3 !w-3" />
                }
                onClick={() => setIsOpenAddCustomerModalOpen(true)}
              >
                Thêm KH
              </Button>
            </>
          )}
        </div>
      </div>
      <div>
        <FilterForm
          telesaleUserList={telesaleUserList || []}
          loadingUsers={isLoadingTelesaleUsers}
          onFilter={handleFilter}
          onBulkAssign={() => {
            setBulkAssignCustomers(selectedCustomers || []);
            setIsBulkAssignModalOpen(true);
          }}
          onDeleteMulti={()=>{
            setBulkAssignCustomers(selectedCustomers || []);
            setIsDeleteMultiModalOpen(true)
          }}
          selectedRowKeys={selectedRowKeys}
          isAdmin={isTelesaleManager}
        />
      </div>

      {/* Table */}
      <div className="mt-4">
        <TableComponent
          columns={columns}
          dataSource={data?.data || []}
          rowHeight={100}
          pageSize={10}
          page={(data && data.current_page + 1) || 0}
          onPageChange={handleChangePage}
          response={data}
          fontSize={12}
          headerHeight={48}
          loading={isPending}
        />
      </div>
      <CustomerAddModal
        onCancel={() => setIsOpenAddCustomerModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await addTelesaleCustomer(data);
            setIsOpenAddCustomerModalOpen(false);
            refetch();
            reloadTelesaleStat();
            toast.success("Tạo khách hàng thành công");
          } catch (error: any) {
            toast.error(
              error?.response?.data?.message ||
                error?.message ||
                "Có lỗi xảy ra khi tạo khách hàng"
            );
          }
        }}
        open={isOpenAddCustomerModalOpen}
      />
      <AddMultiCustomerModal
        customers={bulkAssignCustomers}
        isOpen={isBulkAssignModalOpen}
        note={noteAssign}
        onClose={() => {
          setNoteAssign("");
          setIsBulkAssignModalOpen(false);
        }}
        onConfirm={(saleId) => {
          setIsBulkAssignModalOpen(false);
          setIsOpenAssign(true);

          const payload: AssignSaleModel = {
            note: noteAssign,
            prospect_ids: (bulkAssignCustomers || []).map(
              (customer) => customer.id
            ),
            sale_id: saleId,
          };
          assignTelesaleMutation.mutate(payload, {
            onSuccess: () => {
              refetch();
              setIsOpenAssign(false);
              setSelectedRowKeys([]);
            },
          });
        }}
        onNoteChange={(note) => {
          setNoteAssign(note);
        }}
      />
      <NoteModal
        open={isNoteModalOpen}
        note=""
        onOk={handleSaveNote}
        onCancel={handleCancelNote}
      />

      {/* --- Edit Contact Info Modal --- */}
      <Modal
        open={isEditContactInfoModalOpen}
        title="Chỉnh sửa thông tin liên hệ"
        onOk={handleSaveContactEdit}
        onCancel={handleCancelContactEdit}
        okText="Lưu"
        cancelText="Huỷ"
        confirmLoading={editContactLoading}
        centered
        destroyOnClose
        afterClose={() => {
          editContactForm.resetFields();
        }}
      >
        <Form
          form={editContactForm}
          layout="vertical"
          initialValues={{
            address: "",
            businessField: "",
            customerInfo: "",
          }}
        >
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: false }]}
          >
            <Input placeholder="Nhập địa chỉ khách hàng" />
          </Form.Item>
          <Form.Item
            label="Lĩnh vực kinh doanh"
            name="businessField"
            rules={[{ required: false }]}
          >
            <Input placeholder="Nhập lĩnh vực KD" />
          </Form.Item>
          <Form.Item
            label="Khác"
            name="customerInfo"
            rules={[{ required: false }]}
          >
            <Input placeholder="Thông tin khác..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* --- Edit Email Modal --- */}
      <Modal
        open={isEditEmailModalOpen}
        title="Chỉnh sửa Email"
        onOk={handleSaveEmailEdit}
        onCancel={handleCancelEmailEdit}
        okText="Lưu"
        cancelText="Huỷ"
        confirmLoading={editEmailLoading}
        centered
        destroyOnClose
        afterClose={() => {
          editEmailForm.resetFields();
        }}
      >
        <Form
          form={editEmailForm}
          layout="vertical"
          initialValues={{
            email: "",
          }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email khách hàng" />
          </Form.Item>
        </Form>
      </Modal>

      <TelesaleDetailModal
        open={isOpenDetail}
        onCancel={() => setIsOpenDetail(false)}
        customer={{
          address: "111",
          dob: "23/09/2000",
          gender: "Male",
          name: "Name",
          phone: "PhoneNumber",
        }}
        callHistory={[]}
        onEdit={() => console.log("")}
      />

      {selectedCustomer && (
        <AssignTelesaleModal
          onCancel={() => setIsOpenAssign(false)}
          onSubmit={(value) => {
            const payload = {
              ...value,
              prospect_ids: [selectedCustomer.id],
            };
            assignTelesaleMutation.mutate(payload, {
              onSuccess: () => {
                refetch();
                setIsOpenAssign(false);
                setSelectedRowKeys([]);
              },
            });
          }}
          open={isOpenAssign}
        />
      )}
      <TagManagerModal
        open={isOpenTagModal}
        onClose={() => setIsOpenTagModal(false)}
        customer={selectedCustomer}
        tagTypeModal={tagTypeModal}
        onAssignTag={(customerId, tagId) => {
          assignTagMutate(
            { customerId, tagId },
            {
              onSuccess: () => {
                toast.success("Gán tag thành công!");
                setIsOpenTagModal(false);
                refetch();
                reloadTelesaleStat(); // Optionally refresh stat when tag assign affects grouping
              },
              onError: () => {
                toast.error("Gán tag thất bại. Vui lòng thử lại.");
              },
            }
          );
        }}
      />

      {/* Tag delete confirm popup */}
      <Modal
        open={deleteTagModal.open}
        title="Xác nhận xoá tag"
        onOk={handleConfirmDeleteTag}
        onCancel={handleCancelDeleteTag}
        okText="Xoá"
        cancelText="Huỷ"
        confirmLoading={deleteCustomerTagMutation.isPending}
        centered
        maskClosable={false}
      >
        <p>
          Bạn có chắc chắn muốn xoá tag
          <span className="font-semibold ml-1">{deleteTagModal.tagName}</span>
          khỏi khách hàng này?
        </p>
      </Modal>

      <Modal
        open={deleteCustomerModal.open}
        title="Xác nhận xoá khách hàng"
        onOk={handleConfirmDeleteCustomer}
        onCancel={()=> setDeleteCustomerModal({ open: false, record: undefined })}
        okText="Xoá"
        cancelText="Huỷ"
        confirmLoading={deleteCustomerTagMutation.isPending}
        centered
        maskClosable={false}
      >
        <p>
          Bạn có chắc chắn muốn xoá khách hàng {deleteCustomerModal.record?.name} ?
        </p>
      </Modal>

      {/* Modal xác nhận gọi/failed có thêm field Note và validate */}
      <Modal
        open={confirmCallModal.open}
        title={
          confirmCallModal.status === "CALLED"
            ? "Xác nhận đã gọi khách hàng?"
            : confirmCallModal.status === "FAILED"
            ? "Xác nhận khách hàng thất bại?"
            : ""
        }
        onOk={handleConfirmUpdateStatus}
        onCancel={handleCancelUpdateStatus}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isStatusUpdating}
        maskClosable={false}
        centered
        afterClose={() => {
          callNoteForm.resetFields();
          setCallNoteError(null);
        }}
      >
        <div className="mb-2">
          <p>
            Bạn có chắc muốn chuyển trạng thái khách hàng
            <span className="font-semibold ml-1">
              {confirmCallModal.customer?.name
                ? confirmCallModal.customer.name
                : ""}
            </span>
            {confirmCallModal.status === "CALLED"
              ? " sang Đã gọi?"
              : confirmCallModal.status === "FAILED"
              ? " sang Thất bại?"
              : ""}
          </p>
        </div>
        <Form
          form={callNoteForm}
          layout="vertical"
          initialValues={{ note: "" }}
        >
          <Form.Item
            name="note"
            label="Ghi chú"
            rules={[
              {
                // required: true,
                message: "Ghi chú là bắt buộc",
              },
              {
                min: 5,
                message: "Ghi chú phải tối thiểu 5 ký tự!",
              },
            ]}
            validateStatus={callNoteError ? "error" : undefined}
            help={callNoteError}
          >
            <Input.TextArea placeholder="Nhập ghi chú..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận huỷ gán Sale */}
      <Modal
        open={unassignSaleModal.open}
        title="Xác nhận huỷ gán Sale"
        onOk={handleConfirmUnassignSale}
        onCancel={handleCancelUnassignSale}
        okText="Xác nhận"
        cancelText="Huỷ"
        confirmLoading={assignTelesaleMutation.isPending}
        centered
        maskClosable={false}
      >
        <div className="mb-2">
          <p>
            Bạn có chắc chắn muốn{" "}
            <span className="font-semibold text-red-600">huỷ gán Sale</span> cho
            khách hàng
            <span className="font-semibold ml-1">
              {unassignSaleModal.customer?.name
                ? unassignSaleModal.customer.name
                : ""}
            </span>
            ?
          </p>
        </div>
      </Modal>

      {/* All Sales Notes Modal */}
      <Modal
        open={allNotesModal.open}
        onCancel={() => setAllNotesModal({ open: false, notes: [] })}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setAllNotesModal({ open: false, notes: [] })}
          >
            Đóng
          </Button>,
        ]}
        centered
        width={700}
        title={
          <span className="font-bold text-lg">
            Tất cả ghi chú của Sale ({allNotesModal.notes.length} ghi chú)
          </span>
        }
      >
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {allNotesModal.notes && allNotesModal.notes.length > 0 ? (
            allNotesModal.notes.map((noteObj: any, idx: number) => {
              // Handle both string and object formats
              const noteText =
                typeof noteObj === "string"
                  ? noteObj
                  : noteObj?.note || noteObj?.content || String(noteObj);
              return (
                <div
                  key={idx}
                  className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 text-sm min-w-[24px]">
                      {idx + 1}.
                    </span>
                    <p className="text-sm text-gray-700 flex-1">{noteText}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              Không có ghi chú nào
            </div>
          )}
        </div>
      </Modal>

    {/* Modal xác nhận xoá nhiều khách hàng */}
    <Modal
      open={isDeleteMultiModalOpen}
      onCancel={() => setIsDeleteMultiModalOpen(false)}
      footer={[
        <Button key="back" onClick={() => setIsDeleteMultiModalOpen(false)}>
          Huỷ bỏ
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          onClick={async () => {
            deleteBulkTelesaleContacts(
              (bulkAssignCustomers || []).map((customer) => customer.id)
            )
            .then(() => {
              toast.success("Xoá khách hàng thành công!");
              setIsDeleteMultiModalOpen(false);
              refetch();
              reloadTelesaleStat();
              setBulkAssignCustomers([])
            })
            .catch(() => {
              toast.error("Xoá khách hàng thất bại, vui lòng thử lại!");
              setIsDeleteMultiModalOpen(false);
            });
            setSelectedRowKeys([]);
            setIsDeleteMultiModalOpen(false);
          }}
        >
          Xác nhận xoá
        </Button>,
      ]}
      centered
      width={600}
      title={
        <span className="font-bold text-lg">
          Xác nhận xoá {bulkAssignCustomers?.length || 0} khách hàng
        </span>
      }
    >
      <div className="mb-4">
        Bạn có chắc chắn muốn xoá những khách hàng sau khỏi danh sách không? <br/>
        <span className="text-red-600 font-semibold">Hành động này sẽ không thể hoàn tác!</span>
      </div>
      <div className="max-h-[320px] overflow-y-auto border border-gray-100 rounded">
        {bulkAssignCustomers?.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {bulkAssignCustomers.map((customer: any, idx: number) => (
              <li key={customer.id || idx} className="p-2 flex items-center gap-2">
                <span className="text-gray-500">{idx + 1}.</span>
                <span className="font-medium text-gray-800">{customer.fullname || customer.name || "Không tên"}</span>
                {customer.phonenumber && (
                  <span className="ml-2 text-gray-500 text-sm">{customer.phonenumber}</span>
                )}
                {customer.email && (
                  <span className="ml-2 text-gray-400 text-xs">{customer.email}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 italic text-center py-8">Không có khách hàng nào.</div>
        )}
      </div>
    </Modal>
    </div>
  );
};

export default TelesalesPage;
