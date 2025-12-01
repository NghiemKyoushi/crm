import React from "react";
import clsx from "clsx";

interface Props {
  text: string;
  type?: "success" | "warning" | "error" | "info";
}

const colorMap = {
  success: "bg-green-100 text-green-600",
  warning: "bg-yellow-100 text-yellow-600",
  error: "bg-red-100 text-red-600",
  info: "bg-blue-100 text-blue-600",
};

export const StatusTag: React.FC<Props> = ({ text, type = "info" }) => {
  return (
    <span className={clsx("px-3 py-1 rounded-lg text-sm font-medium", colorMap[type])}>
      {text}
    </span>
  );
};
