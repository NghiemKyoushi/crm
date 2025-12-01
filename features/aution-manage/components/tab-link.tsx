import React from "react";
import { Button, Tooltip } from "antd";
import { ReloadOutlined, CheckOutlined, CloseOutlined, LinkOutlined } from "@ant-design/icons";
import { StatusTag } from "./status-tag";

export const TabLink = () => {
  const data = [
    {
      id: 1,
      product: "Nintendo Switch OLED",
      url: "page.auctions.yahoo.co.jp/n98765432",
      end: "02/12 15:30",
      bids: [
        { name: "Nguyễn Văn A", vip: "VIP1", amount: "¥52,000", status: "Chờ duyệt" },
        { name: "Trần Thị B", vip: "VIP2", amount: "¥55,000", status: "Đã đặt" },
      ],
    },
    {
      id: 2,
      product: "Leica M6 Camera",
      url: "page.auctions.yahoo.co.jp/x12345678",
      end: "03/12 10:00",
      bids: [
        { name: "Lê Văn C", vip: "VIP2", amount: "¥90,000", status: "Đã đặt" },
        { name: "Phạm Văn D", vip: "VIP1", amount: "¥88,000", status: "Từ chối", reason: "Còn <15s" },
      ],
    },
  ];

  return (
    <div className="space-y-7">
      {data.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center gap-5 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-500 text-xl font-bold shadow-inner">
              {item.product.split(" ")[0][0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg text-gray-900 truncate">{item.product}</div>
              <a
                href={`https://${item.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 text-xs hover:text-blue-700 transition-colors"
              >
                <LinkOutlined className="align-middle text-[11px]" />
                <span className="truncate" title={item.url}>
                  {item.url}
                </span>
              </a>
            </div>
            <div className="flex flex-col items-end ml-2">
              <span className="text-gray-400 text-xs tracking-tight">Kết thúc</span>
              <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-700 text-xs font-medium shadow-sm border">{item.end}</span>
            </div>
          </div>

          <div className="border rounded-xl overflow-x-auto bg-gray-50 mt-2">
            <table className="w-full text-[15px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 font-medium text-xs text-gray-500">Khách</th>
                  <th className="px-4 py-2 font-medium text-xs text-gray-500">Bid</th>
                  <th className="px-4 py-2 font-medium text-xs text-gray-500 text-center">Trạng thái</th>
                  <th className="px-4 py-2 font-medium text-xs text-gray-500">Lý do</th>
                  <th className="px-4 py-2 font-medium text-xs text-gray-500 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {item.bids.map((b, i) => (
                  <tr
                    key={i}
                    className={
                      b.status === "Chờ duyệt"
                        ? "bg-yellow-50/70"
                        : b.status === "Từ chối"
                        ? "bg-red-50/70"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-2 font-medium whitespace-nowrap">
                      {b.name}{" "}
                      <span className="ml-1 text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-500 border border-violet-100">
                        {b.vip}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{b.amount}</td>
                    <td className="px-4 py-2 text-center">
                      {b.status === "Chờ duyệt" && <StatusTag text="Chờ duyệt" type="warning" />}
                      {b.status === "Đã đặt" && <StatusTag text="Đã đặt" type="info" />}
                      {b.status === "Từ chối" && <StatusTag text="Từ chối" type="error" />}
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-sm">
                      {b.reason || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2 text-center min-w-[120px]">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.status === "Chờ duyệt" && (
                          <>
                            <Tooltip title="Xác nhận đặt bid">
                              <Button
                                size="small"
                                type="primary"
                                shape="circle"
                                icon={<CheckOutlined />}
                              />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                              <Button
                                size="small"
                                danger
                                shape="circle"
                                icon={<CloseOutlined />}
                              />
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Làm mới trạng thái">
                          <Button
                            size="small"
                            shape="circle"
                            icon={<ReloadOutlined />}
                            className="border-gray-300"
                          />
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
