// import React, { useMemo, useCallback } from "react";
// import { Button, Tooltip, Table } from "antd";
// import { ReloadOutlined } from "@ant-design/icons";
// import { StatusTag } from "./status-tag";

// // Định nghĩa kiểu dữ liệu cho customers và links để tránh lỗi linter/typescript
// interface CustomerLink {
//   product: string;
//   bid: number;
//   status: string;
//   reason?: string;
// }

// interface Customer {
//   name: string;
//   vip: string;
//   slots: { used: number; total: number };
//   violations: { count: number; max: number };
//   active: boolean;
//   links: CustomerLink[];
// }

// // Kiểu dữ liệu cho từng dòng bảng
// interface LinkType {
//   key: string;
//   customer: string;
//   vip: string;
//   product: string;
//   bid: number;
//   status: string;
//   reason?: string;
//   slotsUsed: number;
//   slotsTotal: number;
//   violationsCount: number;
//   violationsMax: number;
//   active: boolean;
// }

// // Data mẫu khách hàng
// const customers: Customer[] = [
//   {
//     name: "Nguyễn Văn A",
//     vip: "VIP1",
//     slots: { used: 1, total: 2 },
//     violations: { count: 0, max: 3 },
//     active: true,
//     links: [
//       { product: "Nintendo Switch OLED", bid: 52000, status: "Chờ duyệt" },
//     ],
//   },
//   {
//     name: "Trần Thị B",
//     vip: "VIP2",
//     slots: { used: 48, total: 50 },
//     violations: { count: 0, max: 3 },
//     active: true,
//     links: [
//       { product: "Leica M6 Camera", bid: 90000, status: "Đã đặt" },
//       { product: "Nintendo Switch OLED", bid: 55000, status: "Đã đặt" },
//     ],
//   },
//   {
//     name: "Phạm Văn D",
//     vip: "VIP2",
//     slots: { used: 50, total: 50 },
//     violations: { count: 3, max: 3 },
//     active: false,
//     links: [
//       { product: "Leica M6 Camera", bid: 88000, status: "Từ chối", reason: "Còn <15s" },
//     ],
//   },
// ];

// // Hàm flattenData chuyển đổi data cho bảng
// function flattenData(cusList: Customer[]): LinkType[] {
//   const arr: LinkType[] = [];
//   cusList.forEach((cus, customerIdx) => {
//     cus.links.forEach((l, linkIdx) => {
//       arr.push({
//         key: `${customerIdx}-${linkIdx}`,
//         customer: cus.name,
//         vip: cus.vip,
//         product: l.product,
//         bid: l.bid,
//         status: l.status,
//         reason: l.reason,
//         slotsUsed: cus.slots.used,
//         slotsTotal: cus.slots.total,
//         violationsCount: cus.violations.count,
//         violationsMax: cus.violations.max,
//         active: cus.active,
//       });
//     });
//   });
//   return arr;
// }

// export const TabCustomer = () => {
//   const dataSource = useMemo<LinkType[]>(() => flattenData(customers), []);

//   // Format tiền JPY
//   const formatBid = useCallback((amount: number) => `¥${amount.toLocaleString("en-US")}`, []);

//   // Các hàm render cho từng cột, dùng useCallback để tránh truyền function REF vào Table Column, đồng thời định nghĩa ngoài columns[] cho safe.
//   const renderCustomer = useCallback(
//     (_text: string, record: LinkType) => (
//       <div>
//         <div className="flex items-center gap-2">
//           <span className="font-medium">{record.customer}</span>
//           <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-500 border border-violet-100">{record.vip}</span>
//           {!record.active && (
//             <span className="ml-2 text-red-500 text-xs bg-red-50 px-1.5 py-0.5 rounded font-semibold border border-red-100">Bị khóa</span>
//           )}
//         </div>
//         <div className="text-xs text-gray-400">
//           {record.slotsUsed}/{record.slotsTotal} slot • {record.violationsCount}/{record.violationsMax} vi phạm
//         </div>
//       </div>
//     ),
//     []
//   );

//   const renderProduct = useCallback((t: string) => <span className="font-medium">{t}</span>, []);

//   const renderBid = useCallback(
//     (val: number) => <span className="text-green-600 font-semibold">{formatBid(val)}</span>,
//     [formatBid]
//   );

//   const renderStatus = useCallback(
//     (_: string, record: LinkType) => {
//       const status = record.status;
//       if (status === "Đã đặt") return <StatusTag text="Đã đặt" type="info" />;
//       if (status === "Chờ duyệt") return <StatusTag text="Chờ duyệt" type="warning" />;
//       if (status === "Từ chối") {
//         return (
//           <div className="flex gap-1 items-center">
//             <StatusTag text="Từ chối" type="error" />
//             {record.reason && (
//               <span className="text-xs text-gray-400 truncate max-w-[110px]">({record.reason})</span>
//             )}
//           </div>
//         );
//       }
//       return <StatusTag text={status} />;
//     },
//     []
//   );

//   const renderActions = useCallback(
//     () => (
//       <Tooltip title="Làm mới trạng thái">
//         <Button
//           size="small"
//           icon={<ReloadOutlined />}
//           className="!border-gray-300"
//         />
//       </Tooltip>
//     ),
//     []
//   );

//   // Cấu hình columns, chỉ truyền reference đến các hàm render đã fix.
//   const columns = [
//     {
//       title: "Khách",
//       dataIndex: "customer",
//       key: "customer",
//       render: renderCustomer,
//     },
//     {
//       title: "Sản phẩm",
//       dataIndex: "product",
//       key: "product",
//       render: renderProduct,
//     },
//     {
//       title: "Bid",
//       dataIndex: "bid",
//       key: "bid",
//       render: renderBid,
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "status",
//       key: "status",
//       render: renderStatus,
//     },
//     {
//       title: "Thao tác",
//       key: "actions",
//       align: "center" as const,
//       render: renderActions,
//     }
//   ];

//   // Đảm bảo không truyền function inline cho rowKey mà chỉ truyền string property
//   return (
//     <div className="bg-white rounded-xl shadow p-4 md:p-6">
//       <Table
//         dataSource={dataSource}
//         columns={columns}
//         pagination={{ pageSize: 5, showSizeChanger: false }}
//         rowKey="key"
//         bordered
//         size="middle"
//       />
//     </div>
//   );
// };

import React, { useMemo, useCallback } from "react";
import { Button, Tooltip, Table } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { StatusTag } from "./status-tag";

interface CustomerLink {
  product: string;
  bid: number;
  status: string;
  reason?: string;
}

interface Customer {
  name: string;
  vip: string;
  slots: { used: number; total: number };
  violations: { count: number; max: number };
  active: boolean;
  links: CustomerLink[];
}

interface LinkType {
  key: string;
  customer: string;
  vip: string;
  product: string;
  bid: number;
  status: string;
  reason?: string;
  slotsUsed: number;
  slotsTotal: number;
  violationsCount: number;
  violationsMax: number;
  active: boolean;
}

const customers: Customer[] = [
  {
    name: "Nguyễn Văn A",
    vip: "VIP1",
    slots: { used: 1, total: 2 },
    violations: { count: 0, max: 3 },
    active: true,
    links: [{ product: "Nintendo Switch OLED", bid: 52000, status: "Chờ duyệt" }],
  },
  {
    name: "Trần Thị B",
    vip: "VIP2",
    slots: { used: 48, total: 50 },
    violations: { count: 0, max: 3 },
    active: true,
    links: [
      { product: "Leica M6 Camera", bid: 90000, status: "Đã đặt" },
      { product: "Nintendo Switch OLED", bid: 55000, status: "Đã đặt" },
    ],
  },
  {
    name: "Phạm Văn D",
    vip: "VIP2",
    slots: { used: 50, total: 50 },
    violations: { count: 3, max: 3 },
    active: false,
    links: [
      { product: "Leica M6 Camera", bid: 88000, status: "Từ chối", reason: "Còn <15s" },
    ],
  },
];

function flattenData(cusList: Customer[]): LinkType[] {
  const arr: LinkType[] = [];
  cusList.forEach((cus, customerIdx) => {
    cus.links.forEach((l, linkIdx) => {
      arr.push({
        key: `${customerIdx}-${linkIdx}`,
        customer: cus.name,
        vip: cus.vip,
        product: l.product,
        bid: l.bid,
        status: l.status,
        reason: l.reason,
        slotsUsed: cus.slots.used,
        slotsTotal: cus.slots.total,
        violationsCount: cus.violations.count,
        violationsMax: cus.violations.max,
        active: cus.active,
      });
    });
  });
  return arr;
}

export const TabCustomer = () => {
  const dataSource = useMemo(() => flattenData(customers), []);

  const formatBid = useCallback(
    (amount: number) => `¥${amount.toLocaleString("en-US")}`, 
    []
  );

  // ---------- UI GIỐNG HỆT ẢNH GỬI ----------
  const renderCustomer = useCallback(
    (_: string, record: LinkType) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[15px]">{record.customer}</span>

          <span className="text-xs px-2 py-[2px] rounded bg-violet-50 text-violet-600 border border-violet-200">
            {record.vip}
          </span>

          {!record.active && (
            <span className="text-xs px-2 py-[2px] rounded bg-red-50 text-red-500 border border-red-200 font-semibold">
              Bị khóa
            </span>
          )}
        </div>

        <div className="text-xs text-gray-400 mt-[2px]">
          {record.slotsUsed}/{record.slotsTotal} slot · {record.violationsCount}/{record.violationsMax} vi phạm
        </div>
      </div>
    ),
    []
  );

  const renderProduct = (p: string) => (
    <span className="font-medium text-[15px]">{p}</span>
  );

  const renderBid = (v: number) => (
    <span className="text-green-600 font-semibold">{formatBid(v)}</span>
  );

  const renderStatus = (_: string, record: LinkType) => {
    if (record.status === "Đã đặt") return <StatusTag text="Đã đặt" type="info" />;

    if (record.status === "Chờ duyệt")
      return <StatusTag text="Chờ duyệt" type="warning" />;

    if (record.status === "Từ chối") {
      return (
        <div className="flex items-center gap-1">
          <StatusTag text="Từ chối" type="error" />
          {record.reason && (
            <span className="text-xs text-gray-400">({record.reason})</span>
          )}
        </div>
      );
    }

    return <StatusTag text={record.status} />;
  };

  const renderActions = () => (
    <Tooltip title="Làm mới trạng thái">
      <Button
        size="small"
        icon={<ReloadOutlined />}
        className="!border-gray-300"
      />
    </Tooltip>
  );

  // ---------- COLUMNS CUSTOM UI ----------
  const columns = [
    {
      title: "",
      key: "full-card",
      render: (_: any, record: LinkType) => (
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="flex justify-between mb-2">
            {renderCustomer("", record)}
          </div>

          <div className="flex justify-between items-center">
            <div>
              {renderProduct(record.product)}
              <div className="mt-1">{renderBid(record.bid)}</div>

              <div className="mt-1">{renderStatus("", record)}</div>
            </div>

            {renderActions()}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6">
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey="key"
        showHeader={false}
      />
    </div>
  );
};

