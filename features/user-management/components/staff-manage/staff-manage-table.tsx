import type { ColumnsType } from "antd/es/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faKey,
  faLock,
  faTrash,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Tag, Button, Dropdown, Menu } from "antd";
import TableComponent from "@/components/TableComponent";
import ModalStaffAdd from "./modal-staff-add";
import { useState } from "react";
import PopupConfirm from "@/components/PopupConfirm";
import {
  useCreateNewStaff,
  useDetailStaff,
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

export default function StaffManageTable() {
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

  const { data: detailStaff } = useDetailStaff(selectedId);

  const { data } = useListStaff({
    page,
    page_size: 10,
    search: "",
  });

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAcount(id),
    onSuccess: () => {
      toast.success("Xoá tài khoản thành công!");
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => lockAcount(id),
    onSuccess: () => {
      toast.success("Khoá tài khoản thành công!");
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: string) => unlockAcount(id),
    onSuccess: () => {
      toast.success("Mở khoá tài khoản thành công!");
      queryClient.invalidateQueries({ queryKey: ["listStaff"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.localizedMessage || t("common.error")),
  });

  const resetPassMutation = useMutation({
    mutationFn: (id: string) => resetPassAccount(id),
    onSuccess: () => {
      toast.success("Reset mật khẩu thành công!");
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
      toast.success("Cập nhật tài khoản thành công!");
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
            toast.success("Tạo nhân viên mới thành công!");
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
  const columns: ColumnsType<UserData> = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      render: (role: string) => (
        <Dropdown
          menu={{
            items: [
              { key: "sales", label: "Sales" },
              { key: "accounting", label: "Kế toán" },
              { key: "warehouse", label: "Nhân viên kho" },
              { key: "admin", label: "Admin" },
            ],
          }}
        >
          <span className="cursor-pointer">{role}</span>
        </Dropdown>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <>
          {active ? (
            <Tag color="green">Hoạt động</Tag>
          ) : (
            <Tag color="red">Đã khóa</Tag>
          )}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: UserData) => (
        <div className="flex gap-3 text-[16px]">
          <FontAwesomeIcon
            icon={faEdit}
            onClick={() => handleOpenEdit(record.user_id)}
            className="cursor-pointer text-blue-500 hover:text-blue-700"
          />
          <FontAwesomeIcon
            icon={faKey}
            className="cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() =>
              handleOpenConfirm("reset", record.user_id.toString())
            }
          />
          {record.active ? (
            <FontAwesomeIcon
              icon={faLock}
              className="cursor-pointer text-amber-500 hover:text-amber-700"
              onClick={() =>
                handleOpenConfirm("lock", record.user_id.toString())
              }
            />
          ) : (
            <FontAwesomeIcon
              icon={faLock}
              className="cursor-pointer text-green-500 hover:text-green-700"
              onClick={() => {
                handleOpenConfirm("unlock", record.user_id.toString());
              }}
            />
          )}
          <FontAwesomeIcon
            icon={faTrash}
            className="cursor-pointer text-red-500 hover:text-red-700"
            onClick={() =>
              handleOpenConfirm("delete", record.user_id.toString())
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white shadow-md rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Danh sách Nhân viên</h2>
        <Button
          type="primary"
          onClick={() => {
            setOpen(true);
            setSelectedId(null);
          }}
          icon={<FontAwesomeIcon icon={faUserPlus} />}
          className="!bg-green-500 !hover:bg-green-600 !font-medium"
        >
          Thêm nhân viên
        </Button>
      </div>
      <TableComponent
        columns={columns}
        dataSource={data?.data || []}
        rowHeight={45}
        pageSize={10}
        page={(data && data?.current_page + 1) || 0}
        onPageChange={handleChangePage}
        response={data}
      />

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
            ? "Xác nhận reset mật khẩu"
            : modalType === "lock"
            ? "Xác nhận khoá tài khoản"
            : modalType === "unlock"
            ? "Xác nhận mở khoá tài khoản"
            : "Xác nhận xoá tài khoản"
        }
        content={
          modalType === "reset"
            ? `Bạn có chắc chắn muốn reset mật khẩu cho tài khoản này?`
            : modalType === "lock"
            ? `Bạn có chắc chắn muốn khoá tài khoản này?`
            : modalType === "unlock"
            ? `Bạn có chắc chắn muốn mở khoá tài khoản này?`
            : `Bạn có chắc chắn muốn xoá tài khoản này?`
        }
        onConfirm={handleConfirm}
        onCancel={() => setOpenConfirm(false)}
        confirmText={
          modalType === "delete"
            ? "Xoá"
            : modalType === "lock"
            ? "Khoá"
            : modalType === "unlock"
            ? "Mở khoá"
            : "Reset"
        }
        cancelText="Huỷ"
      />
    </div>
  );
}
