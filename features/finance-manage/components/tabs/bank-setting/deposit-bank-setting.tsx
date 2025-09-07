import { Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AddBankAccountModal from "./modal/add-account-bank";
import { useState } from "react";
import TableComponent from "@/components/TableComponent";
import AssignRoleModal from "./modal/modal-assign";
import { BankAccount } from "@/types/deposit-type";
import {
  mapBankResponseToPaginatedResponse,
  useBankAccounts,
} from "@/features/finance-manage/hooks";
import { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addBankCreateAccount,
  addUserBankPermission,
  deleteBankCreateAccount,
  updateBankCreateAccount,
} from "@/features/finance-manage/apis";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import PopupConfirm from "@/components/PopupConfirm";

export default function BankAccountSetting() {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BankAccount | null>(null);
  const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
  const [selectId, setSelectId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [page, setPage] = useState(0);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const { data } = useBankAccounts({ page, size: pageSize });

  const addMutation = useMutation({
    mutationFn: addBankCreateAccount,
    onSuccess: () => {
      toast.success("Thêm tài khoản thành công!");
      queryClient.invalidateQueries({
        queryKey: ["bankAccounts"],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateBankCreateAccount(id, body),
    onSuccess: () => {
      toast.success("Cập nhật tài khoản thành công!");
      queryClient.invalidateQueries({
        queryKey: ["bankAccounts"],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBankCreateAccount(id),
    onSuccess: () => {
      toast.success("Xóa tài khoản thành công!");
      queryClient.invalidateQueries({
        queryKey: ["bankAccounts"],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const handleConfirmDelete = () => {
    if (selectId) {
      deleteMutation.mutate(+selectId);
      setIsOpenConfirmDelete(false);
    }
  };

  const useAddBankPermission = (idBank: number, onSuccess?: () => void) => {
    return useMutation({
      mutationFn: (admin_user_ids: number[]) =>
        addUserBankPermission(idBank, { admin_user_ids }),
      onSuccess: () => {
        toast.success("Cập nhật phân quyền thành công!");
        if (onSuccess) onSuccess();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.localizedMessage || t("common.error"));
      },
    });
  };

  const { mutate: savePermissions } = useAddBankPermission(+selectId, () =>
    setOpenAssign(false)
  );

  const columns: ColumnsType<BankAccount> = [
    {
      title: "Ngân hàng",
      dataIndex: "bank_name",
      key: "bank_name",
    },
    {
      title: "Số tài khoản",
      dataIndex: "account_number",
      key: "account_number",
    },
    {
      title: "Chủ tài khoản",
      dataIndex: "account_holder",
      key: "account_holder",
    },
    {
      title: "Hạn mức/ngày (VND)",
      dataIndex: "daily_limit_vnd",
      key: "daily_limit_vnd",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { maximumFractionDigits: 0 }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record: BankAccount) =>
        record.is_active ? (
          <Tag color="green" className="px-3 py-1 !rounded-3xl">
            Hoạt động
          </Tag>
        ) : (
          <Tag color="default" className="px-3 py-1 !rounded-3xl">
            Tạm dừng
          </Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: BankAccount) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingRecord(record);
              setOpen(true);
            }}
            className="!text-blue-600 hover:underline"
          >
            Sửa
          </button>
          <span>|</span>
          <button
            className="!text-green-600 hover:underline"
            onClick={() => {
              setAccountName(record.account_holder);
              setAccountNumber(record.account_number);
              setSelectId(record.id.toString());
              setOpenAssign(true);
            }}
          >
            Gán quyền
          </button>
          <span>|</span>
          <button
            onClick={() => {
              setSelectId(record.id.toString());
              setIsOpenConfirmDelete(true);
            }}
            className="!text-red-600 hover:underline"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Cài đặt Tài khoản Ngân hàng Công ty
        </h2>
        <Button
          onClick={() => {
            setEditingRecord(null);
            setOpen(true);
          }}
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          Thêm tài khoản
        </Button>
      </div>
      <TableComponent
        columns={columns}
        dataSource={data?.content || []}
        rowHeight={45}
        pageSize={10}
        page={page + 1 || 0}
        onPageChange={handleChangePage}
        response={
          data
            ? mapBankResponseToPaginatedResponse<BankAccount>(data)
            : undefined
        }
        fontSize={14}
        headerHeight={44}
      />
      <AddBankAccountModal
        open={open}
        record={editingRecord}
        onCancel={() => setOpen(false)}
        onOk={(values: any) => {
          if (editingRecord) {
            updateMutation.mutate({ id: editingRecord.id, body: values });
          } else {
            addMutation.mutate(values);
          }
          setOpen(false);
        }}
      />
      <AssignRoleModal
        open={openAssign}
        onCancel={() => setOpenAssign(false)}
        onSave={(selectedIds: number[]) => {
          savePermissions(selectedIds);
        }}
        accountName={accountName}
        accountNumber={accountNumber}
        idBank={selectId}
      />
      <PopupConfirm
        open={isOpenConfirmDelete}
        type={"delete"}
        title={"confirm delete"}
        content={"confirm delete"}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsOpenConfirmDelete(false)}
        confirmText={t("deposit.modal.confirmText")}
        cancelText={t("deposit.modal.cancelText")}
      />
    </div>
  );
}
