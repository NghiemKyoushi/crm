import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import { BankDepositRequest, DepositParams, DepositRequest } from "@/types/deposit-type";

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

export const getListBankCreateAccount = async (params: BankDepositRequest) => {
    const res = await api.get(API_TYPE_CONST.BANK_LIST_DEPOSIT, { params });
    return res.data.data;
};

export const confirmTopup = async (id: number, confirmed_amount: number) => {
    const res = await api.post(`${API_TYPE_CONST.CONFIRM_TOPUP}${id}/confirm`, {confirmed_amount});
    return res.data.data;
};

export const cancelTopup = async (id: number, note: string) => {
  const res = await api.post(`${API_TYPE_CONST.CONFIRM_TOPUP}${id}/cancel`, {note});
  return res.data.data;
};

export const confirmWithdraw = async (id: number) => {
    const res = await api.put(`${API_TYPE_CONST.CONFIRM_WITHDRAW}${id}`);
    return res.data.data;
};

export const cancelWithdraw = async (id: number, note: string) => {
  const res = await api.put(`${API_TYPE_CONST.CANCEL_WITHDRAW}${id}`,{note});
  return res.data.data;
};


export const getDetailHistoryWithdraw = async (id: number) => {
  const res = await api.get(`${API_TYPE_CONST.HISTORY_WITHDRAW}${id}`);
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