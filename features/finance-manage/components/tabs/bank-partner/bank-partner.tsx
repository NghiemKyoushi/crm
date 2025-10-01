import { Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AddBankAccountModal from "./modal/add-account-bank";
import { useState } from "react";
import TableComponent from "@/components/TableComponent";
import AssignRoleModal from "./modal/modal-assign";
import { BankAccount } from "@/types/deposit-type";
import {
  mapBankResponseToPaginatedResponse,
  useBankAccountsPartner,
} from "@/features/finance-manage/hooks";
import { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addBankCreateAccountPartner,
  addUserBankPermission,
  deleteBankCreateAccount,
  updateBankCreateAccountPartner,
} from "@/features/finance-manage/apis";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import PopupConfirm from "@/components/PopupConfirm";

export default function BankPartnerSetting() {
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

  const { data } = useBankAccountsPartner({ page, size: pageSize, type: 2 });

  const addMutation = useMutation({
    mutationFn: addBankCreateAccountPartner,
    onSuccess: () => {
      toast.success(t("bankPartner.addAccountSuccess"));
      queryClient.invalidateQueries({
        queryKey: ["bankAccountsPartner"],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      updateBankCreateAccountPartner(id, body),
    onSuccess: () => {
      toast.success(t("bankPartner.updateAccountSuccess"));
      queryClient.invalidateQueries({
        queryKey: ["bankAccountsPartner"],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.localizedMessage || t("common.error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBankCreateAccount(id),
    onSuccess: () => {
      toast.success(t("bankPartner.deleteAccountSuccess"));
      queryClient.invalidateQueries({
        queryKey: ["bankAccountsPartner"],
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
        toast.success(t("bankPartner.updatePermissionSuccess"));
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
      title: t('table.bankName'),
      dataIndex: "bank_name",
      key: "bank_name",
    },
    {
      title: t('table.accountNumber'),
      dataIndex: "account_number",
      key: "account_number",
    },
    {
      title: t('table.accountHolder'),
      dataIndex: "account_holder",
      key: "account_holder",
    },
    {
      title: "GroupID telegram",
      dataIndex: "telegram_channel_id",
      key: "telegram_channel_id",
      width: 150,
    },
    {
      title: "Tên gợi nhớ",
      dataIndex: "partner_name",
      key: "partner_name",
      width: 150,
    },
    {
      title: t('table.dailyLimit'),
      dataIndex: "daily_limit_vnd",
      key: "daily_limit_vnd",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { maximumFractionDigits: 0 }),
    },
    {
      title: t('table.status'),
      dataIndex: "status",
      key: "status",
      render: (_, record: BankAccount) =>
        record.is_active ? (
          <Tag color="green" className="px-3 py-1 !rounded-3xl">
            {t('status.active')}
          </Tag>
        ) : (
          <Tag color="default" className="px-3 py-1 !rounded-3xl">
            {t('status.paused')}
          </Tag>
        ),
    },
    {
      title: t('table.actions'),
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
            {t('common.edit')}
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
            {t('bankPartner.assignPermission')}
          </button>
          <span>|</span>
          <button
            onClick={() => {
              setSelectId(record.id.toString());
              setIsOpenConfirmDelete(true);
            }}
            className="!text-red-600 hover:underline"
          >
            {t('common.delete')}
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
          {t('bankPartner.title')}
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
          {t('bankPartner.addAccount')}
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
        title={t("bankPartner.deleteConfirmTitle")}
        content={t("bankPartner.deleteConfirmContent")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsOpenConfirmDelete(false)}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
}
