// import React, { useState } from "react";
// import { Tabs, Card, InputNumber, Input, Button, Select, Table } from "antd";
// import type { ColumnsType } from "antd/es/table";

// interface Transaction {
//   id: string;
//   code: string;
//   exchangeRate?: number;
//   debt: number;
//   createdAt: string;
//   note?: string;
// }

// interface Partner {
//   id: string;
//   name: string;
//   description: string;
//   totalPurchase: number;
//   exchangeRate: number;
//   transactions: Transaction[];
// }

// const App: React.FC = () => {
//  const [partners, setPartners] = useState<Partner[]>([
//     {
//       id: "p1",
//       name: "Nhà cung cấp Tokyo ABC",
//       description: "Nguyên liệu điện tử chất lượng cao",
//       totalPurchase: 250000,
//       exchangeRate: 175,
//       transactions: [
//         {
//           id: "t1",
//           code: "#N-0805-2",
//           exchangeRate: 175,
//           debt: 16750000,
//           createdAt: "15/01/2024",
//         },
//         {
//           id: "t2",
//           code: "#N-0805-2",
//           debt: -15000000,
//           createdAt: "16/01/2024 10:20",
//         },
//         {
//           id: "t3",
//           code: "#N-0805-2",
//           debt: -12000000,
//           createdAt: "19/01/2024 09:15",
//         },
//       ],
//     },
//     {
//       id: "p2",
//       name: "Osaka Materials Ltd",
//       description: "Nhà cung cấp vật liệu xây dựng",
//       totalPurchase: 180000,
//       exchangeRate: 178,
//       transactions: [
//         {
//           id: "t4",
//           code: "#N-0805-2",
//           exchangeRate: 178,
//           debt: 24040000,
//           createdAt: "10/01/2024",
//         },
//         {
//           id: "t5",
//           code: "#N-0805-2",
//           debt: -8000000,
//           createdAt: "12/01/2024 14:35",
//         },
//       ],
//     },
//   ]);

//   const partnerColumns: ColumnsType<Partner> = [
//     {
//       title: "Đối tác",
//       dataIndex: "name",
//       key: "name",
//       render: (text, record) => (
//         <div>
//           <div className="font-semibold text-gray-800">{text}</div>
//           <div className="text-xs text-gray-500">{record.description}</div>
//         </div>
//       ),
//     },
//     {
//       title: "Tổng Mua (JPY)",
//       dataIndex: "totalPurchase",
//       key: "totalPurchase",
//       render: (val) => <span>{val.toLocaleString()} ¥</span>,
//     },
//     {
//       title: "Tỷ giá",
//       dataIndex: "exchangeRate",
//       key: "exchangeRate",
//       render: (rate) => (rate ? `1 ¥ = ${rate} đ` : "-"),
//     },
//   ];

//   const transactionColumns: ColumnsType<Transaction> = [
//     {
//       title: "Mã giao dịch",
//       dataIndex: "code",
//       key: "code",
//       render: (code) => (
//         <a className="text-blue-600 hover:underline">{code}</a>
//       ),
//     },
//     {
//       title: "Tỷ giá",
//       dataIndex: "exchangeRate",
//       key: "exchangeRate",
//       render: (rate) => (rate ? `1 ¥ = ${rate} đ` : "-"),
//     },
//     {
//       title: "Công nợ Hiện tại (VND)",
//       dataIndex: "debt",
//       key: "debt",
//       render: (val) => (
//         <span className={val >= 0 ? "text-red-500" : "text-green-600"}>
//           {val.toLocaleString()} đ
//         </span>
//       ),
//     },
//     {
//       title: "Ngày Tạo",
//       dataIndex: "createdAt",
//       key: "createdAt",
//     },
//     {
//       title: "Hành động",
//       key: "actions",
//       render: (_, record) => (
//         <Button danger type="text" onClick={() => handleDelete(record.id)}>
//           🗑
//         </Button>
//       ),
//     },
//   ];

//   const handleDelete = (id: string) => {
//     setPartners((prev) =>
//       prev.map((p) => ({
//         ...p,
//         transactions: p.transactions.filter((t) => t.id !== id),
//       }))
//     );
//   };


//   const [newPartnerId, setNewPartnerId] = useState<string>();
//   const [yen, setYen] = useState<number>(0);
//   const [rate, setRate] = useState<number>(180);
//   const [note, setNote] = useState<string>("");

//   // Tính toán summary
//   const totalPartner = partners.length;
//   const totalJPY = partners.reduce((sum, p) => sum + p.totalPurchase, 0);
//   const totalDebt = partners.reduce(
//     (sum, p) => sum + p.transactions.reduce((s, t) => s + t.debt, 0),
//     0
//   );
//   const totalPaid = partners.reduce(
//     (sum, p) =>
//       sum +
//       p.transactions.reduce((s, t) => (t.debt < 0 ? s + Math.abs(t.debt) : s), 0),
//     0
//   );





//   const handleDeleteTransaction = (id: string) => {
//     setPartners((prev) =>
//       prev.map((p) => ({
//         ...p,
//         transactions: p.transactions.filter((t) => t.id !== id),
//       }))
//     );
//   };

//   const handleAddTransaction = () => {
//     if (!newPartnerId) return;

//     setPartners((prev) =>
//       prev.map((p) =>
//         p.id === newPartnerId
//           ? {
//               ...p,
//               transactions: [
//                 ...p.transactions,
//                 {
//                   id: `t-${Date.now()}`,
//                   code: `#N-${Math.floor(Math.random() * 10000)}`,
//                   exchangeRate: rate,
//                   debt: yen * rate,
//                   createdAt: new Date().toLocaleString(),
//                   note,
//                 },
//               ],
//             }
//           : p
//       )
//     );

//     setYen(0);
//     setNote("");
//   };

//   return (
//     <div className="p-4 space-y-6">
//       {/* Tabs */}
//       <Tabs
//         defaultActiveKey="1"
//         items={[
//           { key: "1", label: "Tổng quan Quản lý Nguyên liệu (JPY)" },
//           { key: "2", label: "Tài khoản Đối tác" },
//         ]}
//       />

//       {/* Summary cards */}
//       <div className="grid grid-cols-4 gap-4">
//         <Card className="bg-blue-500 text-white">
//           <div>Tổng Đối tác</div>
//           <div className="text-2xl font-bold">{totalPartner}</div>
//         </Card>
//         <Card className="bg-green-500 text-white">
//           <div>Tổng Mua (JPY)</div>
//           <div className="text-2xl font-bold">{totalJPY} ¥</div>
//         </Card>
//         <Card className="bg-red-500 text-white">
//           <div>Tổng Công nợ (VND)</div>
//           <div className="text-2xl font-bold">{totalDebt} đ</div>
//         </Card>
//         <Card className="bg-purple-500 text-white">
//           <div>Đã Thanh toán (VND)</div>
//           <div className="text-2xl font-bold">{totalPaid} đ</div>
//         </Card>
//       </div>

//       {/* Form thêm giao dịch */}
//       <div className="p-4 bg-gray-50 rounded-lg flex gap-4">
//         <Select
//           placeholder="-- Chọn đối tác --"
//           style={{ width: 200 }}
//           onChange={(v) => setNewPartnerId(v)}
//         >
//           {partners.map((p) => (
//             <Select.Option key={p.id} value={p.id}>
//               {p.name}
//             </Select.Option>
//           ))}
//         </Select>
//         <InputNumber
//           value={yen}
//           onChange={(val) => setYen(val || 0)}
//           addonAfter="¥"
//         />
//         <InputNumber
//           value={rate}
//           onChange={(val) => setRate(val || 180)}
//           addonAfter="đ"
//         />
//         <Input
//           placeholder="Ghi chú..."
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//         />
//         <Button type="primary" onClick={handleAddTransaction}>
//           + Thêm
//         </Button>
//       </div>

//       {/* Table cha – con */}
//           <Table
//       columns={partnerColumns}
//       dataSource={partners}
//       rowKey="id"
//       expandable={{
//         expandedRowRender: (record) => (
//           <Table
//             columns={transactionColumns}
//             dataSource={record.transactions}
//             rowKey="id"
//             pagination={false}
//             size="small"
//             bordered={false}
//           />
//         ),
//       }}
//       pagination={false}
//       bordered
//     />
//     </div>
//   );
// };

// export default App;


import React, { useState } from "react";
import { Tabs, Card, InputNumber, Input, Button, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import TableComponent from "@/components/TableComponent";

interface Transaction {
  id: string;
  code: string;
  exchangeRate?: number;
  debt: number;
  createdAt: string;
  note?: string;
}

interface Partner {
  id: string;
  name: string;
  description: string;
  totalPurchase: number;
  exchangeRate: number;
  transactions: Transaction[];
}

type RowData =
  | ({ type: "partner" } & Partner)
  | ({ type: "transaction"; parentId: string } & Transaction);

const App: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: "p1",
      name: "Nhà cung cấp Tokyo ABC",
      description: "Nguyên liệu điện tử chất lượng cao",
      totalPurchase: 250000,
      exchangeRate: 175,
      transactions: [
        {
          id: "t1",
          code: "#N-0805-2",
          exchangeRate: 175,
          debt: 16750000,
          createdAt: "15/01/2024",
        },
        {
          id: "t2",
          code: "#N-0805-2",
          debt: -15000000,
          createdAt: "16/01/2024 10:20",
        },
        {
          id: "t3",
          code: "#N-0805-2",
          debt: -12000000,
          createdAt: "19/01/2024 09:15",
        },
      ],
    },
    {
      id: "p2",
      name: "Osaka Materials Ltd",
      description: "Nhà cung cấp vật liệu xây dựng",
      totalPurchase: 180000,
      exchangeRate: 178,
      transactions: [
        {
          id: "t4",
          code: "#N-0805-2",
          exchangeRate: 178,
          debt: 24040000,
          createdAt: "10/01/2024",
        },
        {
          id: "t5",
          code: "#N-0805-2",
          debt: -8000000,
          createdAt: "12/01/2024 14:35",
        },
      ],
    },
    {
      id: "p3",
      name: "Kyoto Steel Co",
      description: "Thép và kim loại cao cấp",
      totalPurchase: 320000,
      exchangeRate: 172,
      transactions: [
        {
          id: "t6",
          code: "#N-0805-2",
          debt: -5040000,
          createdAt: "08/01/2024",
        },
      ],
    },
  ]);
const data: Partner[] = partners.map((p) => ({
  ...p,
  key: p.id,
  children: p.transactions.map((t) => ({
    ...t,
    key: `${p.id}-${t.id}`,
    isTransaction: true,
  })),
}));
  // Flatten Partner + Transaction
//   const data: RowData[] = partners.flatMap((p) => [
//     { type: "partner", ...p },
//     ...p.transactions.map((t) => ({ type: "transaction", parentId: p.id, ...t })),
//   ]);

  const handleDelete = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => ({
        ...p,
        transactions: p.transactions.filter((t) => t.id !== id),
      }))
    );
  };

//   const columns: ColumnsType<RowData> = [
//     {
//       title: "Đối tác",
//       key: "partner",
//       render: (_, record) => {
//         if (record.type === "partner") {
//           return (
//             <div>
//               <div className="font-semibold text-gray-800">{record.name}</div>
//               <div className="text-xs text-gray-500">{record.description}</div>
//             </div>
//           );
//         }
//         return (
//           <div className="pl-8">
//             <a className="text-blue-600 hover:underline">{record.code}</a>
//           </div>
//         );
//       },
//     },
//     {
//       title: "Tổng Mua (JPY)",
//       key: "purchase",
//       render: (_, record) =>
//         record.type === "partner"
//           ? `${record.totalPurchase.toLocaleString()} ¥`
//           : "-",
//     },
//     {
//       title: "Tỷ giá",
//       key: "exchangeRate",
//       render: (_, record) =>
//         record.exchangeRate ? `1 ¥ = ${record.exchangeRate} đ` : "-",
//     },
//     {
//       title: "Công nợ Hiện tại (VND)",
//       key: "debt",
//       render: (_, record) =>
//         record.type === "transaction" ? (
//           <span
//             className={
//               record.debt >= 0 ? "text-red-500 font-semibold" : "text-green-600"
//             }
//           >
//             {record.debt.toLocaleString()} đ
//           </span>
//         ) : null,
//     },
//     {
//       title: "Ngày Tạo",
//       key: "createdAt",
//       render: (_, record) =>
//         record.type === "transaction" ? record.createdAt : "-",
//     },
//     {
//       title: "Hành động",
//       key: "actions",
//       render: (_, record) =>
//         record.type === "transaction" ? (
//           <Button danger type="text" onClick={() => handleDelete(record.id)}>
//             🗑
//           </Button>
//         ) : null,
//     },
//   ];
    
const columns: ColumnsType<any> = [
  {
    title: "Đối tác / Mã giao dịch",
    dataIndex: "name",
    key: "partner",
    render: (_, record) => {
      if (record.isTransaction) {
        return (
          <div className="pl-8">
            <a className="text-blue-600 hover:underline">{record.code}</a>
          </div>
        );
      }
      return (
        <div>
          <div className="font-semibold text-gray-800">{record.name}</div>
          <div className="text-xs text-gray-500">{record.description}</div>
        </div>
      );
    },
  },
  {
    title: "Tổng Mua (JPY)",
    dataIndex: "totalPurchase",
    key: "purchase",
    render: (val, record) =>
      record.isTransaction ? "-" : `${val.toLocaleString()} ¥`,
  },
  {
    title: "Tỷ giá",
    dataIndex: "exchangeRate",
    key: "exchangeRate",
    render: (rate, record) =>
      rate ? `1 ¥ = ${rate} đ` : record.isTransaction ? "-" : "-",
  },
  {
    title: "Công nợ Hiện tại (VND)",
    dataIndex: "debt",
    key: "debt",
    render: (val, record) =>
      record.isTransaction ? (
        <span
          className={
            val >= 0 ? "text-red-500 font-semibold" : "text-green-600"
          }
        >
          {val.toLocaleString()} đ
        </span>
      ) : null,
  },
  {
    title: "Ngày Tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (val, record) => (record.isTransaction ? val : "-"),
  },
  {
    title: "Hành động",
    key: "actions",
    render: (_, record) =>
      record.isTransaction ? (
        <Button danger type="text" onClick={() => handleDelete(record.id)}>
          🗑
        </Button>
      ) : null,
  },
];
const [page, setPage] = useState(0);

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };
  return (
    <div className="p-4 space-y-6">
      <TableComponent
        columns={columns}
        dataSource={data}
        rowKey={(r) =>
          r.type === "partner" ? r.id : `${r.parentId}-${r.id}`
        }
        pagination={false}
        rowHeight={45}
        pageSize={10}
        page={data.length || 0}
        onPageChange={handleChangePage}
        response={undefined}
        fontSize={14}
        headerHeight={44}
      />
    </div>
  );
};

export default App;
