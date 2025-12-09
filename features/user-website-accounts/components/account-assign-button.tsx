"use client";
import React from "react";
import { Badge, Button } from "antd";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/features/user-profile/hooks/user-profile";

interface Props {
  userId: number;
  countData?: number;
}

const AccountAssignButton: React.FC<Props> = ({ userId, countData }) => {
  const router = useRouter();
  const { data: userRole } = useUserRole();

  const isSALE = React.useMemo(() => {
    return userRole?.role_name === "SALES";
  }, [userRole]);

  const shouldShowBadge = (countData ?? 0) > 0;

  const button = (
    <Button
      size="small"
      onClick={() =>
        router.push(`/user-management/user-website-accounts?userId=${userId}`)
      }
      disabled={isSALE}
    >
      Chọn tài khoản
    </Button>
  );

  if (!shouldShowBadge) {
    return button;
  }

  return (
    <Badge count={countData} color="red" offset={[-2, -2]}>
      {button}
    </Badge>
  );
};

export default AccountAssignButton;


