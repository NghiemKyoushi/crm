import React from "react";

interface AntdButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const AntdButton: React.FC<AntdButtonProps> = ({ loading, children, disabled, ...props }) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        bg-[#1677ff] 
        hover:bg-[#165fcb] 
        !text-white 
        font-medium 
        rounded-md 
        px-5 py-2 
        text-base 
        shadow-sm 
        transition-all 
        duration-200 
        disabled:bg-gray-400 
        disabled:cursor-not-allowed 
        flex 
        items-center 
        justify-center
      `}
    >
      {loading && (
        <svg
          className="animate-spin mr-2 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default AntdButton;
