"use client";
import React from "react";
import CheckComingView from "@/features/check-coming/views/CheckComingView";
import { WithAuth } from "@/components/common/with-authen";

const CheckComingPage = () => {
  return <CheckComingView />;
};

export default WithAuth(CheckComingPage);
