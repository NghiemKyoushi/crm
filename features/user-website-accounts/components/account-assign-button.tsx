"use client";
import React from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/features/user-profile/hooks/user-profile";

interface Props {
  userId: number;
}

const AccountAssignButton: React.FC<Props> = ({ userId }) => {
  const router = useRouter();
  const { data: userRole } = useUserRole();

  const isSALE = React.useMemo(() => {
    return userRole?.role_name === "SALES";
  }, [userRole]);

  return (
    <Button
      size="small"
      onClick={() => router.push(`/user-management/user-website-accounts?userId=${userId}`)}
      disabled={isSALE}
    >
      Chọn tài khoản
    </Button>
  );
};

export default AccountAssignButton;


