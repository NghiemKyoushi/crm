"use client";
import React from "react";
import { Badge, Button } from "antd";
import { useRouter } from "next/navigation";
import { useUserWebsiteAccountCount } from "../hooks";

interface Props {
  userId: number;
}

const AccountAssignButton: React.FC<Props> = ({ userId }) => {
  const router = useRouter();
  const { data: count, isLoading } = useUserWebsiteAccountCount(userId);

  return (
    <Badge count={count || 0} offset={[-2, 0]}>
      <Button
        size="small"
        onClick={() => router.push(`/user-management/user-website-accounts?userId=${userId}`)}
      >
        Chọn tài khoản {isLoading ? "..." : ""}
      </Button>
    </Badge>
  );
};

export default AccountAssignButton;


