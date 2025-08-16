import React, { useState, forwardRef } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

interface PurePasswordProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: React.ReactNode;
}

const PurePasswordInput = forwardRef<HTMLInputElement, PurePasswordProps>(
  ({ prefix, style, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          padding: "0 8px",
          background: "#fff",
          ...style,
        }}
      >
        {prefix && <span style={{ marginRight: 8 }}>{prefix}</span>}
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            padding: "8px 0",
          }}
          {...props}
        />
        <span
          style={{ cursor: "pointer", fontSize: 16, color: "#999" }}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </span>
      </div>
    );
  }
);

PurePasswordInput.displayName = "PurePasswordInput";
export default React.memo(PurePasswordInput);
