import React, { useState } from "react";
import { Button, Pagination } from "antd";
import { StatusTag } from "./status-tag";

// Thêm trường 'slotStatus' để mô tả trạng thái Slot
const data = [
    { product: "Omega Seamaster", code: "o11223344", customer: "Phạm Văn D", price: "¥32,000", status: "Thắng", slotStatus: "-" },
    { product: "Sony A7R V Body", code: "s22334455", customer: "Lê Văn C", price: "¥285,000", status: "Đã lên đơn", slotStatus: "-" },
    { product: "Canon EOS R5", code: "c55667788", customer: "Hoàng Văn E", price: "¥320,000", status: "Đã thanh toán", slotStatus: "-" },
    { product: "MacBook Pro M3", code: "m33445566", customer: "Trần Thị B", price: "¥180,000", status: "Hủy đơn", slotStatus: "Đã hoàn" },
    { product: "Rolex Submariner", code: "r77889900", customer: "Kiều Văn G", price: "¥800,000", status: "Thua", slotStatus: "Đã hoàn" },
    { product: "iPhone 15 Pro Max", code: "i99887766", customer: "Phạm Văn D", price: "¥125,000", status: "Bom", reason: "Khách đổi ý", slotStatus: "Đã hoàn" },
];

export const TabResult = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalResults = 23; // Giả định tổng số kết quả là 23

    const colorStatus = (s: string) => {
        if (s.includes("Thắng") || s.includes("Đã thanh toán")) return "success";
        if (s.includes("Đã lên đơn")) return "info";
        if (s.includes("Hủy")) return "warning";
        if (s.includes("Thua") || s.includes("Bom")) return "error";
        return "info";
    };

    // Hàm xác định màu nền của hàng
    const getRowClass = (r: typeof data[0]) => {
        if (r.status.includes("Thắng") || r.status.includes("Đã lên đơn") || r.status.includes("Đã thanh toán")) {
            return "bg-green-50/50 hover:bg-green-100/50";
        }
        if (r.status.includes("Hủy")) {
            return "bg-yellow-50/50 hover:bg-yellow-100/50";
        }
        if (r.status.includes("Bom") || r.status.includes("Thua")) {
            return "bg-red-50/50 hover:bg-red-100/50";
        }
        return "hover:bg-gray-50";
    };

    const startIndex = (currentPage - 1) * pageSize;
    const actualEndIndex = Math.min(startIndex + pageSize, totalResults);

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <table className="w-full border-separate border-spacing-y-1">
                <thead className="bg-gray-50 text-left rounded-lg text-sm sticky top-0">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-500 rounded-l-lg w-[20%]">LINK / SẢN PHẨM</th>
                        <th className="px-4 py-3 font-medium text-gray-500 w-[15%]">KHÁCH</th>
                        <th className="px-4 py-3 font-medium text-gray-500 w-[15%]">GIÁ THẮNG</th>
                        <th className="px-4 py-3 font-medium text-gray-500 w-[20%]">TRẠNG THÁI</th>
                        <th className="px-4 py-3 font-medium text-gray-500 w-[15%]">SLOT</th>
                        <th className="px-4 py-3 font-medium text-gray-500 rounded-r-lg w-[15%]">THAO TÁC</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((r, i) => (
                        <tr
                            key={i}
                            className={`${getRowClass(r)} transition-colors duration-150 rounded-lg`}
                            style={{ borderCollapse: 'separate' }}
                        >
                            {/* Link / Sản phẩm */}
                            <td className="px-4 py-3 text-sm rounded-l-lg">
                                <div className="font-medium text-gray-900">{r.product}</div>
                                <div className="text-blue-600 text-xs">{r.code}</div>
                            </td>
                            {/* Khách */}
                            <td className="px-4 py-3 text-sm text-gray-700">{r.customer}</td>
                            {/* Giá thắng */}
                            <td className="px-4 py-3 text-green-600 font-semibold text-sm">{r.price}</td>
                            {/* Trạng thái */}
                            <td className="px-4 py-3 text-sm">
                                <StatusTag text={r.status + (r.reason ? ` · ${r.reason}` : '')} type={colorStatus(r.status)} />
                            </td>
                            {/* Slot */}
                            <td className="px-4 py-3 text-sm">
                                {r.slotStatus === "Đã hoàn" ? (
                                    <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs font-medium border border-green-200">
                                        {r.slotStatus}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                            {/* Thao tác */}
                            <td className="px-4 py-3 space-x-2 rounded-r-lg text-sm">
                                {r.status.includes("Thắng") && (
                                    <>
                                        <Button type="primary" size="small" className="h-7 px-3 font-medium rounded-lg">Tạo đơn</Button>
                                        <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Hủy đơn</Button>
                                        <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Bom</Button>
                                    </>
                                )}
                                {r.status.includes("Đã lên đơn") && (
                                    <>
                                        <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Hủy đơn</Button>
                                        <Button danger size="small" className="h-7 px-3 font-medium rounded-lg">Bom</Button>
                                    </>
                                )}
                                {r.status.includes("Đã thanh toán") && (
                                    <Button size="small" className="h-7 px-3 font-medium rounded-lg">Xem đơn</Button>
                                )}
                                {(r.status.includes("Hủy") || r.status.includes("Thua") || r.status.includes("Bom")) && (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer Phân trang */}
            <div className="flex justify-end items-center pt-4 mt-2 border-t border-gray-100">
                <div className="text-gray-500 text-sm mr-4">
                    Hiển thị {startIndex + 1}-{actualEndIndex} / <b>{totalResults} kết quả</b>
                </div>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalResults}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    className="flex items-center"
                    itemRender={(current, type, originalElement) => {
                        if (type === 'prev') return <span className="font-semibold">Trước</span>;
                        if (type === 'next') return <span className="font-semibold">Sau</span>;
                        return originalElement;
                    }}
                />
            </div>
        </div>
    );
};