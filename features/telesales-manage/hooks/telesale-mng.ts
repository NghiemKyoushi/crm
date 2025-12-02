import { useQuery } from "@tanstack/react-query";
import {
  changeTelesaleStatus,
  telesalesMngApi,
  getTelesaleAccounts,
  getTelesaleDashboard,
  assignTelesaleTag,
  unassignTelesaleTag,
} from "../apis/telesale-mng";
import { TelesaleParamsList } from "../types/telesales-mng";
import { useMutation } from "@tanstack/react-query";
import { addTelesaleNote } from "../apis/telesale-mng";
import { TelesaleCustomerListResponse } from "../types/telesales-mng";
import { useEffect, useState } from "react";

export const useTelesalesList = (params: TelesaleParamsList) => {
  return useQuery<TelesaleCustomerListResponse>({
    queryKey: ["telesalesList", params],
    queryFn: () => telesalesMngApi.getList(params),
  });
};

export const useAddCustomerNote = () => {
  return useMutation({
    mutationFn: async (body: {
      customerId: number;
      notes: string;
      saleId: number;
    }) => {
      return await addTelesaleNote(body);
    },
  });
};

export const useUpdateTelesaleStatus = () => {
  return useMutation({
    mutationFn: async ({
      contactId,
      status,
      note
    }: {
      contactId: string;
      status: string;
      note: string;
    }) => {
      const res = await changeTelesaleStatus(contactId, { status, note });
      return res;
    },
  });
};

// Hook to get telesale users/accounts (API: getTelesaleAccounts)
export const useTelesaleUsers = (page: number = 1, size: number = 10) => {
  return useQuery({
    queryKey: ["telesale-users-list", page, size],
    queryFn: async () => {
      const data = await getTelesaleAccounts(page, size);
      return data; // Array of telesale users
    },
  });
};

export function useAssignCustomerTag() {
  return useMutation({
    mutationFn: async ({
      customerId,
      tagId,
    }: {
      customerId: string | number;
      tagId: string | number;
    }) => {
      return assignTelesaleTag(String(customerId), [+tagId]);
    },
  });
}

export function useUnAssignCustomerTag() {
  return useMutation({
    mutationFn: async ({
      customerId,
    }: {
      customerId: string | number;
    }) => {
      return unassignTelesaleTag(String(customerId));
    },
  });
}


export function useTelesaleStatistic() {
  const [stat, setStat] = useState({
    total: 0,
    called: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(false);
  const fetchStat = async () => {
    setLoading(true);
    try {
      const res = await getTelesaleDashboard();
      setStat({
        total: res?.total_contacts ?? 0,
        called: res?.called ?? 0,
        failed: res?.failed ?? 0,
      });
    } catch (e) {
      setStat({ total: 0, called: 0, failed: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStat();
  }, []);

  return { stat, reload: fetchStat, loading };
}
