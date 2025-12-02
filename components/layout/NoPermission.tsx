import { StopOutlined } from "@ant-design/icons";

export default function NoPermission() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10 mt-[15%]">
      <StopOutlined className="text-red-500" style={{ fontSize: "5rem" }} />
      <h2 className="mt-4 text-xl font-semibold text-gray-700">
        Bạn không có quyền truy cập
      </h2>
      <p className="mt-2 text-gray-500 text-center max-w-md">
        Vui lòng liên hệ với quản trị viên hoặc quản lý của bạn để được cấp quyền
        truy cập vào mục này.
      </p>
    </div>
  );
}
