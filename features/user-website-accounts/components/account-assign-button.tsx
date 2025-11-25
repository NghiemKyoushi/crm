"use client";
import React from "react";
import { Badge, Button } from "antd";
import { useRouter } from "next/navigation";
import { useUserWebsiteAccountCount } from "../hooks";
import { useUserRole } from "@/features/user-profile/hooks/user-profile";

interface Props {
  userId: number;
}

const AccountAssignButton: React.FC<Props> = ({ userId }) => {
  const router = useRouter();
  const { data: count, isLoading } = useUserWebsiteAccountCount(userId);
  const { data: userRole } = useUserRole();

  const isSALE = React.useMemo(() => {
    return userRole?.role_name === "SALES";
  }, [userRole]);

  return (
    <Badge count={count || 0} offset={[-2, 0]}>
      <Button
        size="small"
        onClick={() => router.push(`/user-management/user-website-accounts?userId=${userId}`)}
        disabled={isSALE}
      >
        Chọn tài khoản {isLoading ? "..." : ""}
      </Button>
    </Badge>
  );
};

export default AccountAssignButton;


