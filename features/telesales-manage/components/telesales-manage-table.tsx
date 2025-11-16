"use client";
import React, { useState, useRef, useMemo } from "react";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faDownload,
  faFileExcel,
  faTimesCircle,
  faTrash,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
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
  deleteTelesaleContactTags,
  downloadTelesaleExample,
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isOpenAddCustomerModalOpen, setIsOpenAddCustomerModalOpen] = useState(false);

  const [noteAssign, setNoteAssign] = useState<string>("");
  const [bulkAssignCustomers, setBulkAssignCustomers] = useState<
    TelesaleCustomer[]
  >([]);
  const [downloading, setDownloading] = useState(false);

  // note modal (ghi chú customer)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteCustomer, setEditingNoteCustomer] =
    useState<TelesaleCustomer | null>(null);

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

  const isAdmin = useMemo(() => {
    const isAdmin = hasPermission("system.admin");
    return isAdmin;
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

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
    setParams((prev) => ({
      ...prev,
      page: pageNumber - 1,
    }));
  };

  // Filter only unassigned customers for selection
  const unassignedCustomers = data?.data?.filter((d) => d.status === "UNASSIGNED") || [];
  const allUnassignedIds = unassignedCustomers.map((d) => d.id);

  const columns: ColumnsType<TelesaleCustomer> = [
    ...(isAdmin
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
      title: "Thông tin khách hàng",
      dataIndex: "name",
      key: "customerInfo",
      width: 220,
      render: (_: string, record: TelesaleCustomer) => (
        <div className="text-xs">
          <div className="font-medium text-gray-900 mb-1">{record.name}</div>
          <div className="text-gray-600">📞 {record.phone || "--"}</div>
          <div className="text-gray-500 truncate" title={record.email}>
            {record.email || "--"}
          </div>
        </div>
      ),
    },
    // Merged: Business Field + Source Info
    {
      title: "Nghiệp vụ",
      dataIndex: "business",
      key: "business",
      width: 160,
      render: (_: any, record: any) => (
        <div className="text-xs text-gray-700">
          <div className="font-medium mb-1">{record.businessField || "--"}</div>
          <div className="text-gray-500">
            {record.customerInfo ? `Nguồn: ${record.customerInfo}` : "--"}
          </div>
        </div>
      ),
    },
    // Merged: Telesale + Status
    {
      title: "Sale & TT",
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
            <div className="font-medium text-blue-600 hover:text-blue-800 mb-1">
              {record.saleName || "Chưa gán"}
            </div>
            <Tag color={statusColor} className="!text-xs !py-0">
              {statusText}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Tag",
      dataIndex: "tags",
      key: "tags",
      width: 130,
      render: (_: any, record: TelesaleCustomer) => {
        const hasTags =
          record.tags && record.tags.length > 0 && record.tags.some((t) => t);

        return (
          <div className="flex flex-col gap-1 px-1">
            {/* Tags - one per line, arrow style */}
            {record.tags?.map((tag) => {
              if (!tag) return null;
              return (
                <div
                  key={tag.id}
                  className="group relative flex items-center mx-1"
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  {/* Tag with arrow */}
                  <div
                    className="relative flex items-center h-5 w-full rounded-l"
                    style={{ backgroundColor: tag.color || '#3b82f6' }}
                  >
                    {/* Main tag body */}
                    <div className="flex-1 flex items-center justify-between px-2 py-0.5 text-white text-[9px] font-medium">
                      <span className="truncate">{tag.name}</span>
                      <span
                        className="ml-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTagModal({
                            open: true,
                            tag: { customerId: record.id, tagId: tag.id },
                            tagName: tag.name,
                          });
                        }}
                      >
                        <Tooltip title="Xoá tag">
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="text-white hover:text-red-200"
                            style={{ fontSize: 8 }}
                          />
                        </Tooltip>
                      </span>
                    </div>

                    {/* Triangle arrow on the right */}
                    <div
                      className="absolute -right-2 top-0 bottom-0 w-0 h-0"
                      style={{
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderLeft: `8px solid ${tag.color || '#3b82f6'}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* "Thêm tags" text */}
            <div
              className="text-[9px] text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5 mt-0.5"
              onClick={() => {
                setSelectedCustomer(record);
                setIsOpenTagModal(true);
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
        const customerNote = record.note || "";
        const salesNotes = record.notes && record.notes.length > 0
          ? record.notes.filter((n: any) => {
              if (!n) return false;
              if (typeof n === 'string') return n.trim().length > 0;
              // If it's an object, check if it has content
              return (n.note && n.note.trim().length > 0) ||
                     (n.content && n.content.trim().length > 0) ||
                     Object.keys(n).length > 0;
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
                <div className="text-gray-400 italic text-[10px]">Chưa có yêu cầu</div>
              </div>
            )}

            {/* Sales Notes - with background */}
            {salesNotes.length > 0 && (
              <div className="bg-blue-50 border-l-2 border-blue-400 px-2 py-1 rounded">
                <div className="font-semibold text-blue-700 mb-0.5 text-[10px]">
                  Ghi chú Sale:
                </div>
                <div className="space-y-0.5">
                  {salesNotes.slice(0, 2).map((noteObj: any, idx: number) => (
                    <div key={idx} className="text-gray-700 truncate leading-tight">
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
            {
              isAdmin &&
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
              </div>
            }
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
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 !h-3.5 !w-3.5" />
              <span className="text-gray-600">Tổng:</span>
              <span className="font-semibold text-gray-900">
                {statLoading ? "..." : telesaleStat.total.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 !h-3.5 !w-3.5" />
              <span className="text-gray-600">Gọi:</span>
              <span className="font-semibold text-green-700">
                {statLoading ? "..." : telesaleStat.called.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 !h-3.5 !w-3.5" />
              <span className="text-gray-600">Thất bại:</span>
              <span className="font-semibold text-red-700">
                {statLoading ? "..." : telesaleStat.failed.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              size="small"
              className="!bg-green-600 hover:!bg-green-700 !text-white"
              icon={<FontAwesomeIcon icon={faFileExcel} className="!h-3 !w-3" />}
              loading={importing}
              onClick={handleImportClick}
            >
              Import
            </Button>
          )}

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
            icon={<FontAwesomeIcon icon={faDownload} className="!h-3 !w-3" />}
            onClick={handleDownloadExample}
            loading={downloading}
          >
            Tải mẫu
          </Button>
          <Button
            size="small"
            className="!bg-purple-600 hover:!bg-purple-700 !text-white"
            icon={<FontAwesomeIcon icon={faUserPlus} className="!h-3 !w-3" />}
            onClick={()=> setIsOpenAddCustomerModalOpen(true)}
          >
            Thêm KH
          </Button>
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
          selectedRowKeys={selectedRowKeys}
        />
      </div>

      {/* Table */}
      <TableComponent
        columns={columns}
        dataSource={data?.data || []}
        rowHeight={100}
        pageSize={20}
        page={(data && data.current_page + 1) || 0}
        onPageChange={handleChangePage}
        response={data}
        fontSize={12}
        headerHeight={48}
        loading={isPending}
      />
      <CustomerAddModal
        onCancel={() => setIsOpenAddCustomerModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await addTelesaleCustomer(data);
            setIsOpenAddCustomerModalOpen(false);
            refetch(); 
            reloadTelesaleStat()
            toast.success("Tạo khách hàng thành công");
          }  catch (error: any) {
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
            Bạn có chắc chắn muốn <span className="font-semibold text-red-600">huỷ gán Sale</span> cho khách hàng
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
          <Button key="close" type="primary" onClick={() => setAllNotesModal({ open: false, notes: [] })}>
            Đóng
          </Button>
        ]}
        centered
        width={700}
        title={<span className="font-bold text-lg">Tất cả ghi chú của Sale ({allNotesModal.notes.length} ghi chú)</span>}
      >
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {allNotesModal.notes && allNotesModal.notes.length > 0 ? (
            allNotesModal.notes.map((noteObj: any, idx: number) => {
              // Handle both string and object formats
              const noteText = typeof noteObj === 'string' ? noteObj : (noteObj?.note || noteObj?.content || String(noteObj));
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
            <div className="text-center text-gray-500 py-8">Không có ghi chú nào</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TelesalesPage;
