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

  console.log('Raw API Response:', JSON.stringify(res.data, null, 2));
  console.log('res.data.data structure:', res.data.data);

  // Handle different possible API response structures
  let itemsArray = [];
  if (Array.isArray(res.data.data?.data)) {
    itemsArray = res.data.data.data;
  } else if (Array.isArray(res.data.data)) {
    itemsArray = res.data.data;
  } else if (Array.isArray(res.data)) {
    itemsArray = res.data;
  }

  console.log('Items array:', itemsArray);

  // Transform snake_case to camelCase
  const transformedItems = itemsArray.map((item: any) => {
    console.log('Raw item:', item);
    const transformed = {
      id: item.id,
      partnerName: item.partner_name || item.partnerName || '',
      bankName: item.bank_name || item.bankName,
      description: item.description,
      amount: Number(item.amount) || 0,
      exchangeRate: Number(item.exchange_rate) || Number(item.exchangeRate) || 0,
      createdAt: item.created_at || item.createdAt,
      note: item.note,
      remainingAmount: item.remaining_amount !== undefined ? Number(item.remaining_amount) : undefined,
    };
    console.log('Transformed item:', transformed);
    return transformed;
  });

  const transformedData = {
    ...res.data.data,
    data: transformedItems
  };

  console.log('Final transformed data:', transformedData);
  return transformedData;
};

export const getMaterialSumary = async () => {
  const res = await api.get(API_TYPE_CONST.MATERIAL_TRANSACTIONS_SUMARY);
  return res.data.data;
};

export const createNewMaterial = async (body: MaterialTransactionRequest) => {
  // Transform camelCase to snake_case for backend
  const payload = {
    partner_id: body.partnerId,
    amount: body.amount,
    currency_code: body.currencyCode,
    exchange_rate: body.exchangeRate,
    note: body.note,
  };

  console.log('createNewMaterial - Original body:', body);
  console.log('createNewMaterial - Transformed payload:', payload);

  const res = await api.post(API_TYPE_CONST.MATERIAL_TRANSACTIONS, payload);
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

  // Transform snake_case to camelCase
  const transformedData = {
    ...res.data,
    data: res.data.data?.map((item: any) => ({
      currencyCode: item.currency_code,
      transactionCount: item.transaction_count,
      fifoBalance: Number(item.fifo_balance) || 0,
      totalIncoming: Number(item.total_incoming) || 0,
      totalOutgoing: Number(item.total_outgoing) || 0,
    })) || []
  };

  return transformedData;
};

export const recalculateFifo = async (params?: RecalculateFifoParams) => {
  // Convert camelCase to snake_case for backend
  const queryParams = params?.currencyCode ? { currency_code: params.currencyCode } : undefined;

  console.log('recalculateFifo called with params:', params);
  console.log('Transformed queryParams:', queryParams);
  console.log('API endpoint:', API_TYPE_CONST.MATERIAL_TRANSACTIONS_RECALCULATE_FIFO);

  const res = await api.post(
    API_TYPE_CONST.MATERIAL_TRANSACTIONS_RECALCULATE_FIFO,
    null,
    { params: queryParams }
  );

  console.log('recalculateFifo response:', res.data);
  return res.data;
};

// ============================================================================
// PROFIT/LOSS APIs
// ============================================================================

export const getProfitLossSummary = async (currencyCode?: string): Promise<ProfitLossSummaryResponse> => {
  const params = currencyCode ? { currency_code: currencyCode } : undefined;
  const res = await api.get(API_TYPE_CONST.FIFO_PROFIT_LOSS_SUMMARY, { params });

  // Transform snake_case to camelCase
  const transformedData = {
    ...res.data,
    data: res.data.data?.map((item: any) => ({
      currencyCode: item.currency_code || item.currencyCode,
      totalConsumed: Number(item.total_consumed) || 0,
      totalProfitLossVnd: Number(item.total_profit_loss_vnd) || 0,
      avgSellRate: Number(item.avg_sell_rate) || 0,
      avgCostRate: Number(item.avg_cost_rate) || 0,
      consumptionCount: Number(item.consumption_count) || 0,
    })) || []
  };

  return transformedData;
};

export const getProfitLossByDate = async (params: ProfitLossByDateParams): Promise<ProfitLossByDateResponse> => {
  const res = await api.get(API_TYPE_CONST.FIFO_PROFIT_LOSS_BY_DATE, { params });
  return res.data;
};

export const getOrderProfitLoss = async (params: OrderProfitLossParams): Promise<OrderProfitLossResponse> => {
  const res = await api.get(API_TYPE_CONST.FIFO_PROFIT_LOSS_ORDERS, { params });
  return res.data;
};
