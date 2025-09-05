"use client";
import { useUserRole } from "@/features/user-profile/hooks/user-profile";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface Permission {
  name: string;
  id: number;
  description: string;
  active: boolean;
  group_id: number;
}

interface PermissionContextType {
  permissions: Permission[];
  hasPermission: (permName: string) => boolean | undefined;
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  loading: true,
});

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { data: listRole, isLoading } = useUserRole(); // hook trả về thêm isLoading

  useEffect(() => {
    if (listRole) {
      const allPerms = listRole.groups.flatMap((g) => g.permissions);      
      setPermissions(allPerms);
    }
  }, [listRole]);

  const hasPermission = useCallback(
    (permName: string) => permissions.some((p) => p.name === permName && p.active),
    [permissions, listRole]
  );
const stillLoading = isLoading || !listRole || permissions.length === 0;
  return (
    <PermissionContext.Provider
      value={{ permissions, hasPermission, loading: stillLoading }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

// custom hook
export const usePermission = () => useContext(PermissionContext);
