import api from "@/api/axiosClient";
import { API_TYPE_CONST } from "@/constants/api-type";
import {
  getListMasterialParams,
  MaterialTransactionRequest,
  RecalculateFifoParams,
  ProfitLossByDateParams,
  OrderProfitLossParams,
  FifoBalanceResponse,
  ProfitLossSummaryResponse,
  ProfitLossByDateResponse,
  OrderProfitLossResponse
} from "@/types/partner";

// ============================================================================
// MATERIAL TRANSACTION APIs
// ============================================================================

export const getListMaterial = async (params: getListMasterialParams) => {
  const res = await api.get(API_TYPE_CONST.MATERIAL_TRANSACTIONS , { params });
  return res.data.data;
};

export const getMaterialSumary = async () => {
  const res = await api.get(API_TYPE_CONST.MATERIAL_TRANSACTIONS_SUMARY);
  return res.data.data;
};

export const createNewMaterial = async (body: MaterialTransactionRequest) => {
  const res = await api.post(API_TYPE_CONST.MATERIAL_TRANSACTIONS, body);
  return res.data;
};

export const deleteMaterial = async (id: number) => {
  const res = await api.delete(`${API_TYPE_CONST.MATERIAL_TRANSACTIONS}/${id}`);
  return res.data;
};

// ============================================================================
// FIFO BALANCE APIs
// ============================================================================

export const getFifoBalance = async (): Promise<FifoBalanceResponse> => {
  const res = await api.get(API_TYPE_CONST.MATERIAL_TRANSACTIONS_FIFO_BALANCE);
  return res.data;
};

export const recalculateFifo = async (params?: RecalculateFifoParams) => {
  const res = await api.post(
    API_TYPE_CONST.MATERIAL_TRANSACTIONS_RECALCULATE_FIFO,
    null,
    { params }
  );
  return res.data;
};

// ============================================================================
// PROFIT/LOSS APIs
// ============================================================================

export const getProfitLossSummary = async (currencyCode?: string): Promise<ProfitLossSummaryResponse> => {
  const params = currencyCode ? { currency_code: currencyCode } : undefined;
  const res = await api.get(API_TYPE_CONST.FIFO_PROFIT_LOSS_SUMMARY, { params });
  return res.data;
};

export const getProfitLossByDate = async (params: ProfitLossByDateParams): Promise<ProfitLossByDateResponse> => {
  const res = await api.get(API_TYPE_CONST.FIFO_PROFIT_LOSS_BY_DATE, { params });
  return res.data;
};

export const getOrderProfitLoss = async (params: OrderProfitLossParams): Promise<OrderProfitLossResponse> => {
  const res = await api.get(API_TYPE_CONST.FIFO_PROFIT_LOSS_ORDERS, { params });
  return res.data;
};
