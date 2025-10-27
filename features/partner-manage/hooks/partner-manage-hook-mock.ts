/**
 * Mock Hooks for FIFO System Testing
 * Use this when backend is not ready
 *
 * To enable mock mode:
 * 1. Rename this file to: partner-manage-hook.ts.backup
 * 2. Rename partner-manage-hook.ts to: partner-manage-hook-real.ts
 * 3. Rename this file to: partner-manage-hook.ts
 */

import { getListBankCreateAccount } from "@/features/finance-manage/apis";
import {
  BankAccountListResponse,
  BankDepositRequest,
} from "@/types/deposit-type";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  getListMasterialParams,
  MaterialTransactionRequest,
  RecalculateFifoParams,
  ProfitLossByDateParams,
  OrderProfitLossParams,
  FifoBalanceResponse,
  ProfitLossSummaryResponse,
  ProfitLossByDateResponse,
  OrderProfitLossResponse,
} from "@/types/partner";

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_FIFO_BALANCE: FifoBalanceResponse = {
  code: 0,
  message: "SUCCESS",
  data: [
    {
      currencyCode: "JPY",
      fifoBalance: 45000.00,
      totalIncoming: 100000.00,
      totalOutgoing: 55000.00,
      transactionCount: 46
    },
    {
      currencyCode: "USD",
      fifoBalance: 800.00,
      totalIncoming: 2000.00,
      totalOutgoing: 1200.00,
      transactionCount: 5
    },
    {
      currencyCode: "CNY",
      fifoBalance: 12000.00,
      totalIncoming: 30000.00,
      totalOutgoing: 18000.00,
      transactionCount: 15
    }
  ]
};

const MOCK_PROFIT_LOSS_SUMMARY: ProfitLossSummaryResponse = {
  code: 0,
  message: "SUCCESS",
  data: [
    {
      currencyCode: "JPY",
      totalConsumed: 55000.00,
      totalProfitLossVnd: 770000.00,
      avgSellRate: 192.00,
      avgCostRate: 178.00,
      consumptionCount: 25
    },
    {
      currencyCode: "USD",
      totalConsumed: 1200.00,
      totalProfitLossVnd: -60000.00,
      avgSellRate: 24500.00,
      avgCostRate: 24550.00,
      consumptionCount: 3
    },
    {
      currencyCode: "CNY",
      totalConsumed: 18000.00,
      totalProfitLossVnd: 450000.00,
      avgSellRate: 3450.00,
      avgCostRate: 3425.00,
      consumptionCount: 8
    }
  ]
};

const generateMockTransactions = (currencyCode: string, page: number, pageSize: number) => {
  const allTransactions = [
    {
      id: 1,
      partnerName: "Ngân hàng Vietcombank",
      bankName: "VCB",
      description: "Tài khoản chính",
      amount: 10000.00,
      exchangeRate: 178.50,
      createdAt: "2025-01-15T10:30:00Z",
      note: "Nhập kho lô ngày 15/01 - Invoice #ABC123",
      remainingAmount: 4000.00
    },
    {
      id: 2,
      partnerName: "Ngân hàng ACB",
      bankName: "ACB",
      description: "Tài khoản phụ",
      amount: 5000.00,
      exchangeRate: 179.00,
      createdAt: "2025-01-16T08:20:00Z",
      note: "Nhập kho lô ngày 16/01",
      remainingAmount: 2000.00
    },
    {
      id: 3,
      partnerName: "Đơn hàng PKG12345",
      bankName: null,
      description: null,
      amount: -6000.00,
      exchangeRate: 192.00,
      createdAt: "2025-01-17T14:20:00Z",
      note: "Xuất kho cho đơn hàng PKG12345",
      remainingAmount: 0
    },
    {
      id: 4,
      partnerName: "Ngân hàng Techcombank",
      bankName: "TCB",
      description: "Tài khoản USD",
      amount: 8000.00,
      exchangeRate: 177.80,
      createdAt: "2025-01-18T09:15:00Z",
      note: "Nhập kho từ TCB",
      remainingAmount: 8000.00
    },
    {
      id: 5,
      partnerName: "Đơn hàng PKG12346",
      bankName: null,
      description: null,
      amount: -3000.00,
      exchangeRate: 193.00,
      createdAt: "2025-01-19T11:30:00Z",
      note: "Xuất kho cho đơn PKG12346",
      remainingAmount: 0
    }
  ];

  const start = page * pageSize;
  const end = start + pageSize;

  return {
    data: allTransactions.slice(start, end),
    total_pages: Math.ceil(allTransactions.length / pageSize),
    total_items: allTransactions.length,
    current_page: page,
    page_size: pageSize
  };
};

const MOCK_PROFIT_LOSS_BY_DATE: ProfitLossByDateResponse = {
  code: 0,
  message: "SUCCESS",
  data: [
    ["2025-01-28", "JPY", 5000.00, 70000.00, 3],
    ["2025-01-27", "JPY", 8000.00, 112000.00, 5],
    ["2025-01-26", "JPY", 3000.00, -15000.00, 2],
    ["2025-01-25", "JPY", 6000.00, 84000.00, 4],
    ["2025-01-24", "JPY", 4000.00, 56000.00, 2],
    ["2025-01-23", "JPY", 7000.00, 98000.00, 6],
    ["2025-01-22", "JPY", 2000.00, 28000.00, 1],
  ]
};

const MOCK_ORDER_PROFIT_LOSS: OrderProfitLossResponse = {
  code: 0,
  message: "SUCCESS",
  data: {
    data: [
      [168, "PKG12345", "JPY", 656.60, 9192.40, 192.00, 178.00],
      [154, "PKG12346", "JPY", 4475.81, 62661.34, 192.00, 178.00],
      [152, "PKG12347", "JPY", 1039.02, 14546.28, 192.00, 178.00],
      [145, "PKG12348", "JPY", 3200.00, 44800.00, 192.00, 178.00],
      [132, "PKG12349", "JPY", 2100.50, 29407.00, 192.00, 178.00],
    ],
    page: 0,
    size: 20,
    total: 25
  }
};

const MOCK_MATERIAL_SUMMARY = [
  {
    total_in: 45000,
    total_out: -55000,
    currency_code: "JPY",
    partner_count: 5
  },
  {
    total_in: 800,
    total_out: -1200,
    currency_code: "USD",
    partner_count: 2
  },
  {
    total_in: 12000,
    total_out: -18000,
    currency_code: "CNY",
    partner_count: 3
  }
];

// ============================================================================
// MOCK HOOKS
// ============================================================================

export function useBankAccountsPartnerScreen(params: BankDepositRequest) {
  return useQuery<BankAccountListResponse>({
    queryKey: ["bankAccountsPartner", params],
    queryFn: () => getListBankCreateAccount(params),
    placeholderData: keepPreviousData,
  });
}

export const useListMaterial = (params: getListMasterialParams) => {
  return useQuery({
    queryKey: ["listMaterial", params],
    queryFn: () => {
      // Simulate API delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateMockTransactions(params.currency_code, params.page, params.page_size));
        }, 500);
      });
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useListMaterialSumary = () => {
  return useQuery({
    queryKey: ["listMaterialSumary"],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_MATERIAL_SUMMARY);
        }, 300);
      });
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateNewMaterial = () => {
  return useMutation({
    mutationFn: (param: MaterialTransactionRequest) => {
      console.log("📝 Mock: Creating material transaction", param);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ code: 0, message: "Tạo giao dịch thành công!" });
        }, 1000);
      });
    },
  });
};

export const useDeleteMaterial = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => {
      console.log("🗑️ Mock: Deleting material transaction", id);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ code: 0, message: "Xóa giao dịch thành công!" });
        }, 800);
      });
    },
  });
};

// ============================================================================
// FIFO BALANCE HOOKS
// ============================================================================

export const useFifoBalance = () => {
  return useQuery({
    queryKey: ["fifoBalance"],
    queryFn: () => {
      console.log("📊 Mock: Fetching FIFO balance");
      return new Promise<FifoBalanceResponse>((resolve) => {
        setTimeout(() => {
          resolve(MOCK_FIFO_BALANCE);
        }, 500);
      });
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useRecalculateFifo = () => {
  return useMutation({
    mutationFn: (params?: RecalculateFifoParams) => {
      console.log("🔄 Mock: Recalculating FIFO", params);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ code: 0, message: "Tính toán lại FIFO thành công!" });
        }, 2000); // Simulate longer operation
      });
    },
  });
};

// ============================================================================
// PROFIT/LOSS HOOKS
// ============================================================================

export const useProfitLossSummary = (currencyCode?: string) => {
  return useQuery({
    queryKey: ["profitLossSummary", currencyCode],
    queryFn: () => {
      console.log("💰 Mock: Fetching profit/loss summary", currencyCode);
      return new Promise<ProfitLossSummaryResponse>((resolve) => {
        setTimeout(() => {
          if (currencyCode) {
            const filtered = {
              ...MOCK_PROFIT_LOSS_SUMMARY,
              data: MOCK_PROFIT_LOSS_SUMMARY.data.filter(
                item => item.currencyCode === currencyCode
              )
            };
            resolve(filtered);
          } else {
            resolve(MOCK_PROFIT_LOSS_SUMMARY);
          }
        }, 500);
      });
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useProfitLossByDate = (params: ProfitLossByDateParams) => {
  return useQuery({
    queryKey: ["profitLossByDate", params],
    queryFn: () => {
      console.log("📅 Mock: Fetching profit/loss by date", params);
      return new Promise<ProfitLossByDateResponse>((resolve) => {
        setTimeout(() => {
          resolve(MOCK_PROFIT_LOSS_BY_DATE);
        }, 600);
      });
    },
    enabled: !!params.currency_code && !!params.start_date && !!params.end_date,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useOrderProfitLoss = (params: OrderProfitLossParams) => {
  return useQuery({
    queryKey: ["orderProfitLoss", params],
    queryFn: () => {
      console.log("📦 Mock: Fetching order profit/loss", params);
      return new Promise<OrderProfitLossResponse>((resolve) => {
        setTimeout(() => {
          resolve(MOCK_ORDER_PROFIT_LOSS);
        }, 500);
      });
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
