/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnsType } from "antd/es/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faKey,
  faLock,
  faTrash,
  faUserPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Tag, Button, Dropdown, Menu, Select, Input } from "antd";
import TableComponent from "@/components/TableComponent";
import ModalStaffAdd from "./modal-staff-add";
import { useMemo, useState } from "react";
import PopupConfirm from "@/components/PopupConfirm";
import {
  useCreateNewStaff,
  useDetailStaff,
  useListRole,
  useListStaff,
} from "../../hooks/staff-manage";
import { NewUserType, UserData } from "@/types/staff-manage-type";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteAcount,
  lockAcount,
  resetPassAccount,
  unlockAcount,
  updateStaff,
} from "../../apis/staff-manage";
import { useTranslation } from "react-i18next";
import { usePermission } from "@/components/layout/PermissionContext";

export default function StaffManageTable() {
  const { hasPermission, permissions } = usePermission();

  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [modalType, setModalType] = useState<
    "reset" | "lock" | "delete" | "unlock" | null
  >(null);
  const [page, setPage] = useState(0);
  const createNewStaffMutation = useCreateNewStaff();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>(""); // 👈 thêm search state

  const { data: listRole } = useListRole();
  const { data: detailStaff } = useDetailStaff(selectedId);

  const { data } = useListStaff({
    page,
    page_size: 10,
    search: search || undefined,
  });

  const handleSearch = () => {
    setPage(0); // reset về trang 1 khi search
    queryClient.invalidateQueries({ queryKey: ["listStaff"] });
  };

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAcount(id),
    onSuccess: () => {
      toast.success(t('staffManage.toast.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => lockAcount(id),
    onSuccess: () => {
      toast.success(t('staffManage.toast.lockSuccess'));
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: string) => unlockAcount(id),
    onSuccess: () => {
      toast.success(t('staffManage.toast.unlockSuccess'));
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const resetPassMutation = useMutation({
    mutationFn: (id: string) => resetPassAccount(id),
    onSuccess: () => {
      toast.success(t('staffManage.toast.resetSuccess'));
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const handleConfirm = () => {
    if (!selectedId) return;

    if (modalType === "delete") {
      deleteMutation.mutate(selectedId);
    } else if (modalType === "lock") {
      lockMutation.mutate(selectedId);
    } else if (modalType === "reset") {
      resetPassMutation.mutate(selectedId);
    }
    if (modalType === "unlock") {
      unlockMutation.mutate(selectedId);
    }
    setOpenConfirm(false);
  };

  const handleOpenConfirm = (
    type: "reset" | "lock" | "delete" | "unlock",
    id: string
  ) => {
    setModalType(type);
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const updateStaffMutation = useMutation({
    mutationFn: ({ param, id }: { param: NewUserType; id: string }) =>
      updateStaff(param, id),
    onSuccess: () => {
      toast.success(t('staffManage.toast.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const handleSubmitData = (data: NewUserType) => {
    const { email, active, full_name, phone_number, role_id, password } = data;
    if (detailStaff && selectedId) {
      if (selectedId)
        updateStaffMutation.mutate({
          param: {
            email,
            full_name,
            active,
            phone_number,
            role_id,
            password: detailStaff.password,
          },
          id: selectedId,
        });
    } else {
      createNewStaffMutation.mutate(
        {
          email,
          full_name,
          active,
          phone_number,
          role_id,
          password,
        },
        {
          onSuccess: () => {
            toast.success(t('staffManage.toast.createSuccess'));
            queryClient.invalidateQueries({ queryKey: ["listStaff"] });
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (err: any) =>
            toast.error(
              err.response?.data?.localizedMessage || t("common.error")
            ),
        }
      );
    }
  };

  const handleOpenEdit = (id: number) => {
    setSelectedId(id.toString());
    setOpen(true);
  };
  // const columns: ColumnsType<UserData> = [
  //   {
  //     title: t("staffManage.fullName"),
  //     dataIndex: "full_name",
  //     key: "full_name",
  //     width: 180,
  //     render: (text: string, record: UserData) => (
  //       <div>
  //         <div className="text-sm text-gray-800">{text}</div>
  //         <div className="text-xs text-gray-500">{record.email}</div>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: t("staffManage.phoneNumber"),
  //     dataIndex: "phone_number",
  //     key: "phone_number",
  //     width: 130,
  //     render: (text: string) => (
  //       <div className="text-sm text-gray-700">{text || "-"}</div>
  //     ),
  //   },
  //   {
  //     title: t("staffManage.role"),
  //     dataIndex: "role_name",
  //     key: "role_name",
  //     width: 180,
  //     render: (role: string, record: UserData) => {
  //       if (listRole) {
  //         return (
  //           <Select
  //             size="small"
  //             value={role}
  //             style={{ width: 160 }}
  //             disabled={record.user_id === 1}
  //             onChange={(value, option) => {
  //               if (value) {
  //                 updateStaffMutation.mutate({
  //                   param: {
  //                     email: record.email,
  //                     full_name: record.full_name,
  //                     active: record.active,
  //                     phone_number: record.phone_number,
  //                     role_id: value,
  //                   },
  //                   id: record.user_id.toString(),
  //                 });
  //               }
  //             }}
  //             options={listRole.map((r: any) => ({
  //               value: r.role_id,
  //               label: r.role_name,
  //             }))}
  //           />
  //         );
  //       }
  //       return null;
  //     },
  //   },
  //   {
  //     title: t("staffManage.status"),
  //     dataIndex: "active",
  //     key: "active",
  //     width: 100,
  //     align: "center",
  //     render: (active: boolean) => (
  //       <Tag color={active ? "green" : "red"} className="text-xs">
  //         {active ? t("staffManage.active") : t("staffManage.locked")}
  //       </Tag>
  //     ),
  //   },
  //   {
  //     title: t("staffManage.actions"),
  //     key: "actions",
  //     width: 140,
  //     fixed: "right",
  //     render: (_: any, record: UserData) => {
  //       const isSystemUser = record.user_id === 1;
  //       return (
  //         <div className="flex gap-3 text-sm justify-center">
  //           <FontAwesomeIcon
  //             icon={faEdit}
  //             onClick={() => !isSystemUser && handleOpenEdit(record.user_id)}
  //             className={
  //               (isSystemUser || hasPermission('user.edit'))
  //                 ? "text-gray-400 cursor-not-allowed"
  //                 : "cursor-pointer text-blue-500 hover:text-blue-700"
  //             }
  //             title={isSystemUser ? t("staffManage.cannotEditSystemUser") : t("staffManage.edit")}
  //           />
  //           <FontAwesomeIcon
  //             icon={faKey}
  //             className={
  //               (isSystemUser || hasPermission('user.edit'))
  //                 ? "text-gray-400 cursor-not-allowed"
  //                 : "cursor-pointer text-gray-600 hover:text-gray-800"
  //             }
  //             onClick={() =>
  //               !isSystemUser && handleOpenConfirm("reset", record.user_id.toString())
  //             }
  //             title={isSystemUser ? t("staffManage.cannotEditSystemUser") : t("staffManage.resetPassword")}
  //           />
  //           {record.active ? (
  //             <FontAwesomeIcon
  //               icon={faLock}
  //               className={
  //                 (isSystemUser || hasPermission('user.edit'))
  //                   ? "text-gray-400 cursor-not-allowed"
  //                   : "cursor-pointer text-amber-500 hover:text-amber-700"
  //               }
  //               onClick={() =>
  //                 !isSystemUser && handleOpenConfirm("lock", record.user_id.toString())
  //               }
  //               title={isSystemUser ? t("staffManage.cannotEditSystemUser") : t("staffManage.lock")}
  //             />
  //           ) : (
  //             <FontAwesomeIcon
  //               icon={faLock}
  //               className={
  //                 (isSystemUser || hasPermission('user.edit'))
  //                   ? "text-gray-400 cursor-not-allowed"
  //                   : "cursor-pointer text-green-500 hover:text-green-700"
  //               }
  //               onClick={() => {
  //                 !isSystemUser && handleOpenConfirm("unlock", record.user_id.toString());
  //               }}
  //               title={isSystemUser ? t("staffManage.cannotEditSystemUser") : t("staffManage.unlock")}
  //             />
  //           )}
  //           <FontAwesomeIcon
  //             icon={faTrash}
  //             className={
  //               (isSystemUser || hasPermission('user.delete'))
  //                 ? "text-gray-400 cursor-not-allowed"
  //                 : "cursor-pointer text-red-500 hover:text-red-700"
  //             }
  //             onClick={() =>
  //               !isSystemUser && handleOpenConfirm("delete", record.user_id.toString())
  //             }
  //             title={isSystemUser ? t("staffManage.cannotEditSystemUser") : t("staffManage.delete")}
  //           />
  //         </div>
  //       );
  //     },
  //   },
  // ];
console.log('hasPermission("user.delete")', hasPermission("user.edit"));

  const columns = useMemo<ColumnsType<UserData>>(() => [
    {
      title: t("staffManage.fullName"),
      dataIndex: "full_name",
      key: "full_name",
      width: 180,
      render: (text: string, record: UserData) => (
        <div>
          <div className="text-sm text-gray-800">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: t("staffManage.phoneNumber"),
      dataIndex: "phone_number",
      key: "phone_number",
      width: 130,
      render: (text: string) => (
        <div className="text-sm text-gray-700">{text || "-"}</div>
      ),
    },
    {
      title: t("staffManage.role"),
      dataIndex: "role_name",
      key: "role_name",
      width: 180,
      render: (role: string, record: UserData) => {
        let matchedRoleId: number | null | undefined;
        if (listRole && listRole.length > 0) {
          const foundRole = listRole.find((r: any) => r.role_name === role);
          matchedRoleId = foundRole ? Number(foundRole.role_id) : undefined;
        }        
        if (listRole && listRole.length > 0) {
          return (
            <Select
              size="small"
              value={matchedRoleId}
              style={{ width: 160 }}
              disabled={record.user_id === 1}
              loading={!listRole}
              onChange={(value) => {
                if (value && value !== matchedRoleId) {
                  updateStaffMutation.mutate({
                    param: {
                      email: record.email,
                      full_name: record.full_name,
                      active: record.active,
                      phone_number: record.phone_number,
                      role_id: value,
                    },
                    id: record.user_id.toString(),
                  });
                }
              }}
              options={listRole.map((r: any) => ({
                value: r.role_id,
                label: r.role_name,
              }))}
            />
          );
        }
        return (
          <div className="text-sm text-gray-500">
            {record.role_name || "-"}
          </div>
        );
      },
    },
    {
      title: t("staffManage.status"),
      dataIndex: "active",
      key: "active",
      width: 100,
      align: "center" as const,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"} className="text-xs">
          {active ? t("staffManage.active") : t("staffManage.locked")}
        </Tag>
      ),
    },
    {
      title: t("staffManage.actions"),
      key: "actions",
      width: 140,
      fixed: "right" as const,
      render: (_: any, record: UserData) => {
        const isSystemUser = record.user_id === 1;
        return (
          <div className="flex gap-3 text-sm justify-center">
            <FontAwesomeIcon
              icon={faEdit}
              onClick={() => (!isSystemUser && hasPermission("user.edit")) && handleOpenEdit(record.user_id)}
              className={
                isSystemUser || !hasPermission("user.edit")
                  ? "text-gray-400 cursor-not-allowed"
                  : "cursor-pointer text-blue-500 hover:text-blue-700"
              }
              title={
                isSystemUser
                  ? t("staffManage.cannotEditSystemUser")
                  : t("staffManage.edit")
              }
            />
            <FontAwesomeIcon
              icon={faKey}
              className={
                isSystemUser || !hasPermission("user.edit")
                  ? "text-gray-400 cursor-not-allowed"
                  : "cursor-pointer text-gray-600 hover:text-gray-800"
              }
              onClick={() =>
                (!isSystemUser && hasPermission("user.edit")) &&
                handleOpenConfirm("reset", record.user_id.toString())
              }
              title={
                isSystemUser
                  ? t("staffManage.cannotEditSystemUser")
                  : t("staffManage.resetPassword")
              }
            />
            {record.active ? (
              <FontAwesomeIcon
                icon={faLock}
                className={
                  isSystemUser || !hasPermission("user.edit")
                    ? "text-gray-400 cursor-not-allowed"
                    : "cursor-pointer text-amber-500 hover:text-amber-700"
                }
                onClick={() =>
                  (!isSystemUser && hasPermission("user.edit")) &&
                  handleOpenConfirm("lock", record.user_id.toString())
                }
                title={
                  isSystemUser
                    ? t("staffManage.cannotEditSystemUser")
                    : t("staffManage.lock")
                }
              />
            ) : (
              <FontAwesomeIcon
                icon={faLock}
                className={
                  isSystemUser || !hasPermission("user.edit")
                    ? "text-gray-400 cursor-not-allowed"
                    : "cursor-pointer text-green-500 hover:text-green-700"
                }
                onClick={() =>
                  (!isSystemUser && hasPermission("user.edit")) &&
                  handleOpenConfirm("unlock", record.user_id.toString())
                }
                title={
                  isSystemUser
                    ? t("staffManage.cannotEditSystemUser")
                    : t("staffManage.unlock")
                }
              />
            )}
            <FontAwesomeIcon
              icon={faTrash}
              className={
                isSystemUser || !hasPermission("user.delete")
                  ? "text-gray-400 cursor-not-allowed"
                  : "cursor-pointer text-red-500 hover:text-red-700"
              }
              onClick={() =>
                (!isSystemUser && hasPermission("user.delete")) &&
                handleOpenConfirm("delete", record.user_id.toString())
              }
              title={
                isSystemUser
                  ? t("staffManage.cannotEditSystemUser")
                  : t("staffManage.delete")
              }
            />
          </div>
        );
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [permissions, listRole]);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-800">{t("staffManage.title")}</h2>
        <Button
          type="primary"
          onClick={() => {
            setOpen(true);
            setSelectedId(null);
          }}
          icon={<FontAwesomeIcon icon={faUserPlus} />}
          className="!bg-green-500 !hover:bg-green-600 !font-medium"
        >
          {t("staffManage.addStaff")}
        </Button>
      </div>
      <div className="flex gap-2 mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <Input
          placeholder={t("staffManage.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faSearch} />}
          onClick={handleSearch}
        >
          {t("staffManage.search")}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <TableComponent
          columns={columns}
          dataSource={data?.data || []}
          rowHeight={55}
          pageSize={10}
          page={(data && data?.current_page + 1) || 0}
          onPageChange={handleChangePage}
          response={data}
          fontSize={13}
          headerHeight={46}
        />
      </div>

      <ModalStaffAdd
        initialValues={detailStaff}
        handleSubmitDataUser={handleSubmitData}
        open={open}
        onClose={() => {
          setSelectedId(null), setOpen(false);
        }}
      />
      <PopupConfirm
        open={openConfirm}
        type={modalType as "reset" | "lock" | "delete" | "unlock"}
        title={
          modalType === "reset"
            ? t("staffManage.confirmReset")
            : modalType === "lock"
            ? t("staffManage.confirmLock")
            : modalType === "unlock"
            ? t("staffManage.confirmUnlock")
            : t("staffManage.confirmDelete")
        }
        content={
          modalType === "reset"
            ? t("staffManage.resetContent")
            : modalType === "lock"
            ? t("staffManage.lockContent")
            : modalType === "unlock"
            ? t("staffManage.unlockContent")
            : t("staffManage.deleteContent")
        }
        onConfirm={handleConfirm}
        onCancel={() => setOpenConfirm(false)}
        confirmText={
          modalType === "delete"
            ?  t("staffManage.delete")
            : modalType === "lock"
            ? t("staffManage.lock")
            : modalType === "unlock"
            ? t("staffManage.unlock")
            : t("staffManage.reset")
        }
        cancelText={t("staffManage.cancel")}
      />
    </div>
  );
}
