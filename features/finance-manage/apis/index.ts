import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  BankDepositRequest,
  BankSettingAccountModel,
  DepositParams,
  DepositRequest,
} from "@/types/deposit-type";

export const getListTopup = async (params: DepositParams) => {
  const res = await api.get(API_TYPE_CONST.LIST_TOPUP, { params });
  return res.data.data;
};

export const getListWithdraw = async (params: DepositParams) => {
  const res = await api.get(API_TYPE_CONST.LIST_WITHDRAW, { params });
  return res.data.data;
};

export const createTopupManual = async (body: DepositRequest) => {
  const res = await api.post(API_TYPE_CONST.ADD_TOPUP_MANUAL, body);
  return res.data.data;
};

export const createMinusTopupManual = async (body: DepositRequest) => {
  const res = await api.post(API_TYPE_CONST.MINUS_TOPUP_MANUAL, body);
  return res.data.data;
};

export const getListBankCreateAccount = async (params: BankDepositRequest) => {
  const res = await api.get(`${API_TYPE_CONST.BANK_LIST_DEPOSIT}`, { params });
  return res.data.data;
};

export const addBankCreateAccount = async (body: BankSettingAccountModel) => {
  const res = await api.post(`${API_TYPE_CONST.BANK_LIST_DEPOSIT}/withdrawal`, body);
  return res.data.data;
};

export const updateBankCreateAccount = async (
  id: number,
  body: BankSettingAccountModel
) => {
  const res = await api.put(`${API_TYPE_CONST.BANK_LIST_DEPOSIT}/withdrawal/${id}`, body);
  return res.data.data;
};

export const deleteBankCreateAccount = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.BANK_LIST_DEPOSIT}/${id}`);
  return res.data.data;
};

export const getDetailBankCreateAccount = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.BANK_LIST_DEPOSIT}/${id}`);
  return res.data.data;
};

export const confirmTopup = async (id: number, confirmed_amount: number) => {
  const res = await api.post(`${API_TYPE_CONST.CONFIRM_TOPUP}${id}/confirm`, {
    confirmed_amount,
  });
  return res.data.data;
};

export const cancelTopup = async (id: number, note: string) => {
  const res = await api.post(`${API_TYPE_CONST.CONFIRM_TOPUP}${id}/cancel`, {
    note,
  });
  return res.data.data;
};

export const confirmWithdraw = async (id: number, node: string) => {
  const res = await api.put(`${API_TYPE_CONST.CONFIRM_WITHDRAW}${id}`, {
    node,
  });
  return res.data.data;
};

export const completeWithdraw = async (id: number, body: { note: string }) => {
  const res = await api.put(`${API_TYPE_CONST.COMPLETE_WITHDRAW}${id}`, body);
  return res.data.data;
};

export const cancelWithdraw = async (id: number, note: string) => {
  const res = await api.put(`${API_TYPE_CONST.CANCEL_WITHDRAW}${id}`, {
    reason: note,
  });
  return res.data.data;
};

export const getDetailHistoryWithdraw = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.WITHDRAW_HISTORY}${id}/history`);
  return res.data.data;
};

export const getDetailHistoryTopups = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.HISTORY_TOPUP}${id}/history`);
  return res.data.data;
};

export const getCodeGeneration = async () => {
  const res = await api.get(`${API_TYPE_CONST.GEN_CODE_TOPUP}`);
  return res.data.data;
};

export const getListBankPermission = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.BANK_LIST_PERMISSION}${id}/get-list-permissions`);
  return res.data.data;
};

export const addUserBankPermission = async (id: number, body: {admin_user_ids: number[], type: number}) => {
  const res = await api.post(`${API_TYPE_CONST.ADD_USER_MANAGE_ACCOUNT_BANK}${id}/permissions`, body);
  return res.data.data;
};

export const getDetailWithdraw = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.WITHDRAW_DETAIL}${id}`);
  return res.data.data;
};

export type TopupType = 
  | "TOP_UP"             // lệnh nạp tiền
  | "MANUAL_TOP_UP"      // lệnh nạp tiền thủ công
  | "MANUAL_WITHDRAWAL"; // lệnh trừ tiền thủ công

export const getDetailTopup = async (id: number, type: TopupType) => {
  const res = await api.get(`${API_TYPE_CONST.TOPUP_DETAIL}${id}`, {
    params: { type },
  });
  return res.data.data;
};

export const getListBankCreateAccountPartner = async (params: BankDepositRequest) => {
  const res = await api.get(API_TYPE_CONST.BANK_LIST_DEPOSIT, { params });
  return res.data.data;
};

export const addBankCreateAccountPartner = async (body: BankSettingAccountModel) => {
  const res = await api.post(API_TYPE_CONST.BANK_PARTNER, body);
  return res.data.data;
};

export const updateBankCreateAccountPartner = async (
  id: number,
  body: BankSettingAccountModel
) => {
  const res = await api.put(`${API_TYPE_CONST.BANK_PARTNER}/${id}`, body);
  return res.data.data;
};

export const deleteBankCreateAccountPartner = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.BANK_LIST_DEPOSIT}/${id}`);
  return res.data.data;
};

export const getDetailBankCreateAccountPartner = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.BANK_LIST_DEPOSIT}/${id}`);
  return res.data.data;
};