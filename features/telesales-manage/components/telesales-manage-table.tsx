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

  const columns: ColumnsType<TelesaleCustomer> = [
    ...(isAdmin
      ? [
          {
            title: (
              <Checkbox
                checked={
                  !!data?.data &&
                  data.data.length > 0 &&
                  selectedRowKeys.length === data.data.length
                }
                indeterminate={
                  !!data?.data &&
                  selectedRowKeys.length > 0 &&
                  selectedRowKeys.length < data.data.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    if (data?.data) {
                      setSelectedRowKeys(data.data.map((d) => d.id));
                    }
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
    // ... rest unchanged
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: TelesaleCustomer) => (
        <div className="flex flex-col">
          <span className="font-xs">{record.name}</span>
          <span className="text-gray-400 text-xs">
            {record.email ? `${record.email}` : "--"}
          </span>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "info",
      key: "info",
      render: (_: any, record: TelesaleCustomer) => (
        <div className="whitespace-pre-line text-gray-600 text-xs">
          <div>
            <span className="font-semibold">Số dt:</span> {record.phone || "--"}
          </div>
          <div>
            <span className="font-semibold">Địa chỉ:</span>{" "}
            {record.address || "--"}
          </div>
        </div>
      ),
    },
    {
      title: "Lĩnh vực kinh doanh",
      dataIndex: "info",
      key: "info",
      render: (_: any, record: TelesaleCustomer) => (
        <div className="whitespace-pre-line text-gray-600 text-xs">
          <div>
            {record.businessField || "--"}
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin",
      dataIndex: "info",
      key: "info",
      render: (_: any, record: any) => (
        <div className="whitespace-pre-line text-gray-600 text-xs">
          <div>
            <span className="font-semibold">Nguồn:</span>{" "}
            {record.customerInfo || "--"}
          </div>
        </div>
      ),
    },
    {
      title: "Telesale",
      dataIndex: "telesale",
      key: "telesale",
      render: (_: any, record: TelesaleCustomer) => (
        <div className="flex flex-col text-xs">
          <span className="text-blue-600 font-medium">
            {record.saleName || "--"}
          </span>
          <span className="text-gray-600">
            Email: {record.emailSale || "--"}
          </span>
          <span className="text-gray-400">ID: {record.saleId || "--"}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let displayText = status;
        let color = "default";

        if (status === "NOT_CALLED") {
          displayText = "Chưa gọi";
          color = "gold";
        } else if (status === "CALLED") {
          displayText = "Đã gọi";
          color = "green";
        } else if (status === "UNASSIGNED") {
          displayText = "Chưa gán";
          color = "orange";
        } else if (status === "FAILED") {
          displayText = "Thất bại";
          color = "red";
        }

        return <Tag color={color}>{displayText}</Tag>;
      },
    },
    {
      title: "Tag",
      dataIndex: "tags",
      key: "tags",
      width: 180,
      render: (_: any, record: TelesaleCustomer) => {
        const hasTags =
          record.tags && record.tags.length > 0 && record.tags.some((t) => t);

        return (
          <div
            className={`flex gap-1 flex-wrap items-center ${
              !hasTags ? "justify-end" : ""
            }`}
          >
            {record.tags?.map((tag) => {
              if (!tag) return null;
              return (
                <div
                  key={tag.id}
                  className="group relative flex items-center"
                  style={{ lineHeight: 1 }}
                >
                  <Tag color={tag.color} className="flex items-center !mb-0">
                    <span>{tag.name}</span>
                    <span
                      className="ml-1 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                      style={{ display: "inline-block" }}
                      onClick={() => {
                        setDeleteTagModal({
                          open: true,
                          tag: { customerId: record.id, tagId: tag.id },
                          tagName: tag.name,
                        });
                      }}
                    >
                      <Tooltip title="Xoá tag">
                        <span>
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{
                              fontSize: 12,
                              verticalAlign: "middle",
                              color: "red",
                            }}
                          />
                        </span>
                      </Tooltip>
                    </span>
                  </Tag>
                </div>
              );
            })}
            <EditOutlined
              className="cursor-pointer"
              onClick={() => {
                setSelectedCustomer(record);
                setIsOpenTagModal(true);
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Ghi chú yc khách hàng",
      dataIndex: "note",
      key: "note",
      width: 150,
      render: (_: any, record: any) => {
        const note = record.note || "--";
        const isLong = typeof note === "string" && note.length > 30;
        return (
          <div className="whitespace-pre-line text-gray-600 text-xs">
            <div>
              {isLong ? (
                <Tooltip title={note}>
                  <span
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      display: "inline-block",
                      maxWidth: 120,
                      verticalAlign: "bottom",
                      cursor: "pointer",
                    }}
                  >
                    {note}
                  </span>
                </Tooltip>
              ) : (
                <span>{note}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 200,
      render: (_: any, record: TelesaleCustomer) => (
        <div className="flex items-start gap-2">
          <div style={{ maxWidth: 200, overflow: "hidden" }}>
            {record.notes && record.notes.length > 0 ? (
              <div className="flex flex-col gap-1">
                {record.notes.map((noteObj: any, idx: number) =>
                  noteObj && noteObj.trim().length > 0 ? (
                    <Tooltip
                      key={idx}
                      title={
                        noteObj.length > 30 ? noteObj : undefined
                      }
                      placement="topLeft"
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          display: "block",
                          cursor:
                            noteObj.length > 30 ? "pointer" : "default",
                        }}
                      >
                        {noteObj}
                      </span>
                    </Tooltip>
                  ) : null
                )}
              </div>
            ) : (
              <span className="text-gray-400 italic">-- Chưa có --</span>
            )}
          </div>
          <Tooltip title="Chỉnh sửa ghi chú">
            <EditOutlined
              className="cursor-pointer"
              onClick={() => handleOpenNoteModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      minWidth: 160,

      render: (_: any, record: TelesaleCustomer) => {
        if (record.status === "UNASSIGNED") {
          return (
            <div className="flex gap-2 flex-wrap">
              <Button
                size="small"
                onClick={() => {
                  setSelectedCustomer(record);
                  setIsOpenAssign(true);
                }}
                className="!bg-orange-500 !text-white !text-xs"
              >
                Gán Sale
              </Button>
            </div>
          );
        }
        return (
          <div className="flex gap-2 flex-wrap">
            {/* Button "Đã gọi" */}
            <Button
              size="small"
              className="!bg-green-500 !text-white !text-xs"
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
              className="!bg-red-500 !text-white !text-xs"
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
    service_tagId,
    source_tagId,
    status_tag_id,
  }: {
    search: string;
    business_field: string | null;
    saleId: string | null;
    status: string | null;
    service_tagId: string | null;
    source_tagId: string | null;
    status_tag_id: string | null;
  }) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      search: search || undefined,
      business_field: business_field ?? undefined,
      saleId: saleId ?? undefined,
      status: status ?? undefined,
      service_tagId: service_tagId ?? undefined,
      source_tagId: source_tagId ?? undefined,
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-row justify-between">
        <h2 className="text-xl font-bold mb-4">Quản Lý Telesales</h2>
        <div className="flex justify-end mb-4 items-end">
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                className="!bg-green-500 !text-white !h-10"
                icon={<FontAwesomeIcon icon={faFileExcel} />}
                loading={importing}
                onClick={handleImportClick}
              >
                Import Excel
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
              className="!bg-blue-500 !text-white !h-10"
              icon={<FontAwesomeIcon icon={faDownload} />}
              onClick={handleDownloadExample}
              loading={downloading}
            >
              Tải file mẫu
            </Button>
            <Button
              className="!bg-blue-500 !text-white !h-10"
              icon={<FontAwesomeIcon icon={faUserPlus} />}
              onClick={()=> setIsOpenAddCustomerModalOpen(true)}
              // loading={downloading}
            >
              Thêm khách hàng
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-start gap-4 py-4">
          <div className="p-2 bg-blue-500 rounded-lg mb-2 ml-4">
            <FontAwesomeIcon icon={faUsers} className=" text-white !h-5 !w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600 !mb-1">
              Tổng khách hàng
            </p>
            {/* Show statistic value */}
            <p className="text-2xl font-bold text-blue-900 !mb-1">
              {statLoading ? "..." : telesaleStat.total.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg flex items-center justify-start gap-4 py-4">
          <div className="p-2 bg-green-500 rounded-lg mb-2 ml-4">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className=" text-white !h-5 !w-4"
            />
          </div>
          <div>
            <p className="text-sm text-green-600 !mb-1">Đã gọi</p>
            <p className="text-2xl font-bold text-green-900 !mb-1">
              {statLoading
                ? "..."
                : telesaleStat.called.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="bg-red-50 p-2 rounded-lg flex items-center justify-start gap-4 py-4">
          <div className="p-2 bg-red-500 rounded-lg mb-2 ml-4">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className=" text-white !h-5 !w-4"
            />
          </div>

          <div>
            <p className="text-sm text-red-600 !mb-1">Thất bại</p>
            <p className="text-2xl font-bold text-red-900 !mb-1">
              {statLoading
                ? "..."
                : telesaleStat.failed.toLocaleString("vi-VN")}
            </p>
          </div>
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
                required: true,
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
    </div>
  );
};

export default TelesalesPage;
