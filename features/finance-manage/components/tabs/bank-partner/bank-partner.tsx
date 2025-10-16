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
import { usePermission } from "@/components/layout/PermissionContext";

export default function BankPartnerSetting() {
  const { t } = useTranslation();
  const { hasPermission } = usePermission();
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
        addUserBankPermission(idBank, { admin_user_ids, type: 2 }),
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
      width: 150,
      render: (text: string, record: BankAccount) => (
        <div>
          <div className="text-sm text-gray-800">{text}</div>
          <div className="text-xs text-gray-500">{record.account_number}</div>
        </div>
      ),
    },
    {
      title: t('table.accountHolder'),
      dataIndex: "account_holder",
      key: "account_holder",
      width: 180,
      render: (text: string, record: BankAccount) => (
        <div>
          <div className="text-sm text-gray-800">{text}</div>
          {record.partner_name && (
            <div className="text-xs text-gray-500">
              Tên nhớ: {record.partner_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Telegram",
      dataIndex: "telegram_channel_id",
      key: "telegram_channel_id",
      width: 130,
      render: (text: string) => (
        <div className="text-sm text-gray-700">{text || "-"}</div>
      ),
    },
    {
      title: t('table.dailyLimit'),
      dataIndex: "daily_limit_vnd",
      key: "daily_limit_vnd",
      width: 140,
      render: (value: number) => (
        <div className="text-sm text-gray-700">
          {value.toLocaleString("vi-VN")}đ
        </div>
      ),
    },
    {
      title: t('table.status'),
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (_, record: BankAccount) =>
        record.is_active ? (
          <Tag color="green" className="!rounded-3xl text-xs">
            {t('status.active')}
          </Tag>
        ) : (
          <Tag color="default" className="!rounded-3xl text-xs">
            {t('status.paused')}
          </Tag>
        ),
    },
    {
      title: t('table.actions'),
      key: "action",
      width: 200,
      fixed: "right",
      render: (_: any, record: BankAccount) => (
        <div className="flex gap-2 items-center text-sm">
          <Button
            type="link"
            size="small"
            className="!p-0 !h-auto !text-xs"
            onClick={() => {
              setEditingRecord(record);
              setOpen(true);
            }}
          >
            Sửa
          </Button>
          <span className="text-gray-300">|</span>
          <Button
            type="link"
            size="small"
            className={`!p-0 !h-auto !text-xs  ${hasPermission('finance.manage_bank_permissions') ? '!text-green-600': '!text-gray-600'}`}
            onClick={() => {
              if(!hasPermission('finance.manage_bank_permissions')){
                return;
              }
              setAccountName(record.account_holder);
              setAccountNumber(record.account_number);
              setSelectId(record.id.toString());
              setOpenAssign(true);
            }}
          >
            Phân quyền
          </Button>
          <span className="text-gray-300">|</span>
          <Button
            type="link"
            size="small"
            danger
            className="!p-0 !h-auto !text-xs"
            onClick={() => {
              setSelectId(record.id.toString());
              setIsOpenConfirmDelete(true);
            }}
          >
            Xóa
          </Button>
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
      <div className="overflow-x-auto">
        <TableComponent
          columns={columns}
          dataSource={data?.content || []}
          rowHeight={55}
          pageSize={10}
          page={page + 1 || 0}
          onPageChange={handleChangePage}
          response={
            data
              ? mapBankResponseToPaginatedResponse<BankAccount>(data)
              : undefined
          }
          fontSize={13}
          headerHeight={46}
        />
      </div>
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
