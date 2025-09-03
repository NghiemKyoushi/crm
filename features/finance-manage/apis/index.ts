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
