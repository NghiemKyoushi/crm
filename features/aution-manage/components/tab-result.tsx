import React from "react";
import { Button } from "antd";
import { StatusTag } from "./status-tag";

export const TabResult = () => {
  const data = [
    { product: "Omega Seamaster", code: "o11223344", customer: "Phạm Văn D", price: "¥32,000", status: "Thắng" },
    { product: "Sony A7R V Body", code: "s22334455", customer: "Lê Văn C", price: "¥285,000", status: "Đã lên đơn" },
    { product: "Canon EOS R5", code: "c55667788", customer: "Hoàng Văn E", price: "¥320,000", status: "Đã thanh toán" },
    { product: "MacBook Pro M3", code: "m33445566", customer: "Trần Thị B", price: "¥180,000", status: "Hủy đơn" },
    { product: "Rolex Submariner", code: "r77889900", customer: "Kiều Văn G", price: "¥800,000", status: "Thua" },
    { product: "iPhone 15 Pro Max", code: "i99887766", customer: "Phạm Văn D", price: "¥125,000", status: "Bom · Khách đổi ý" },
  ];

  const colorStatus = (s: string) => {
    if (s.includes("Thắng")) return "success";
    if (s.includes("Đã lên đơn")) return "info";
    if (s.includes("Đã thanh toán")) return "success";
    if (s.includes("Hủy")) return "warning";
    if (s.includes("Thua")) return "error";
    if (s.includes("Bom")) return "error";
    return "info";
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <table className="w-full">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-2">Link / Sản phẩm</th>
            <th className="px-4 py-2">Khách</th>
            <th className="px-4 py-2">Giá thắng</th>
            <th className="px-4 py-2">Trạng thái</th>
            <th className="px-4 py-2">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td className="px-4 py-2">
                <div className="font-medium">{r.product}</div>
                <div className="text-blue-600 text-sm">{r.code}</div>
              </td>
              <td className="px-4 py-2">{r.customer}</td>
              <td className="px-4 py-2 text-green-600 font-semibold">{r.price}</td>
              <td className="px-4 py-2">
                <StatusTag text={r.status} type={colorStatus(r.status)} />
              </td>
              <td className="px-4 py-2 space-x-2">
                {r.status.includes("Thắng") && <Button type="primary">Tạo đơn</Button>}
                {r.status.includes("Đã lên đơn") && <Button danger>Hủy đơn</Button>}
                {r.status.includes("Đã thanh toán") && <Button>Xem đơn</Button>}
                {r.status.includes("Bom") && <></>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
