"use client";
export interface Product {
  id: number;
  url: string;
  price: number;
  route_id: number;
  map_data: {
    url: string;
    price: string;
    images: string[];
    description: string;
    productName: string;
  };
  created_at: string; // ISO datetime
  updated_at: string;
  currency_code: string;
  items_per_unit?: number;
}

// Item trong metadata.items
export interface Item {
  count: number;
  product: Product;
  item_quantity: number;
}

// Phí dịch vụ trong metadata.infos.fees
export interface Fee {
  id: number;
  code: string;
  name: string;
  amount: number | null;
  method: number;
  optional: boolean;
  description: string | null;
  currency_code: string | null;
  is_checked?: boolean;
  amount_vnd: number | null;
}

// Bảo hiểm trong metadata.infos.insurancePackage
export interface InsurancePackage {
  id: number;
  name: string;
  status: string;
  is_delete: boolean;
  created_at: string;
  updated_at: string | null;
  description: string;
  max_value_vnd: number | null;
  fee_percentage: number;
}

// Metadata
export interface Metadata {
  items: Item[];
  infos: {
    fees: Fee[];
    insurancePackage: InsurancePackage;
    codeType: number,
    productCategory: any,
    codInJapan: number,
    exchangeRateMap: any,
  };
}

// Order chính
export interface OrderDetail {
  id: number;
  invoice_no: string;
  user_id: number;
  metadata: Metadata;
  amount: number;
  amount_vnd: number;
  description: string;
  status: string;
  created_by: number;
  created_at: string;
  approved_by: number | null;
  deposit_fee: number | null;
  rate: number;
  tracking_other: string | null;
  tracking_vn: string | null;
  customer_name: string;
  created_by_name: string;
  approved_by_name: string | null;
  is_user_created: boolean | null;
  fee_list: any;
  source_website: any | null;
}
interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  idOrder: number;
}

// const OrderDetailModal = ({
//   open,
//   onClose,
//   idOrder,
// }: OrderDetailModalProps) => {
//   const { data } = useDetailOrder(idOrder);

//   const { data: listInsurance } = useListInsurance();
//   const { data: listService } = useListService();

//   if (!data) return null;
//   const order: OrderDetail = data;

//   const renderTagStatus = (status: string) => {
//     let color: string;
//     let text: string;
//     switch (status) {
//       case OrderStatusType.PENDING_APPROVAL:
//         color = "orange";
//         text = "Đợi duyệt";
//         break;
//       case OrderStatusType.PENDING_DEPOSIT:
//         color = "gold";
//         text = "Đợi đặt cọc";
//         break;
//       case OrderStatusType.DEPOSIT_PAID:
//         color = "green";
//         text = "Đã đặt cọc";
//         break;
//       case OrderStatusType.PURCHASED:
//         color = "blue";
//         text = "Đã mua";
//         break;
//       case OrderStatusType.ARRIVED_JP_WAREHOUSE:
//         color = "purple";
//         text = "Đến kho Nhật";
//         break;
//       case OrderStatusType.ARRIVED_VN_WAREHOUSE:
//         color = "cyan";
//         text = "Đến kho Việt";
//         break;
//       case OrderStatusType.UNDER_INSPECTION:
//         color = "lime";
//         text = "Đang kiểm hàng";
//         break;
//       case OrderStatusType.PENDING_PAYMENT:
//         color = "red";
//         text = "Đợi thanh toán";
//         break;
//       case OrderStatusType.READY_TO_SHIP:
//         color = "geekblue";
//         text = "Sẵn sàng giao";
//         break;
//       case OrderStatusType.SHIPPED:
//         color = "volcano";
//         text = "Đã chuyển";
//         break;
//       case OrderStatusType.SHIPPING_REQUEST_CLIENT:
//         color = "magenta";
//         text = "Yêu cầu chuyển hàng";
//         break;
//       case OrderStatusType.CANCELED:
//         color = "red";
//         text = "Đã Huỷ";
//         break;
//       default:
//         color = "default";
//         text = status;
//     }

//     return <Tag key={color} color={color}>{text}</Tag>;
//   };
//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       footer={null}
//       width={1000}
//       centered
//       title={
//         <span className="font-bold text-lg">
//           Chi tiết Đơn hàng {order.invoice_no}
//         </span>
//       }
//       styles={{
//         body: {
//           maxHeight: "80vh",
//           overflowY: "auto",
//           paddingRight: "8px",
//           overflowX: "hidden",
//         },
//       }}
//     >
//       {/* Grid 2 cột */}
//       <div className="grid grid-cols-2 gap-6">
//         {/* ==== CỘT TRÁI ==== */}
//         <div className="space-y-4">
//           {/* Thông tin Đơn hàng */}
//           <div className="rounded-lg shadow-sm !border !border-blue-100">
//             <div className="px-3 py-2 bg-blue-50 rounded-t-lg">
//               <h1 className="font-semibold text-base">Thông tin Đơn hàng</h1>
//             </div>
//             <div className="p-3 text-sm space-y-2">
//               <p>
//                 <b>Mã đơn:</b> {order.invoice_no}
//               </p>
//               <p>
//                 <b>Ngày tạo:</b> {new Date(order.created_at).toLocaleString()}
//               </p>
//               <p>
//                 <b>Khách hàng:</b> {order.customer_name}
//               </p>
//               <p>
//                 <b>Trạng thái:</b>{" "}
//                 <span className="text-red-500 font-medium">
//                   {renderTagStatus(order.status)}
//                 </span>
//               </p>
//             </div>
//           </div>

//           {/* Thông tin Sản phẩm */}
//           <div className="rounded-lg shadow-sm !border !border-blue-100">
//             <div className="px-3 py-2 bg-blue-50 rounded-t-lg">
//               <h3 className="font-semibold text-base">Thông tin Sản phẩm</h3>
//             </div>
//             {order.metadata.items.map((item, idx) => (
//               <div key={idx} className="p-3 border-b last:border-b-0">
//                 <p>
//                   <b>Tên sản phẩm:</b> {item.product.map_data.productName}
//                 </p>
//                 <p>
//                   <b>Link:</b>{" "}
//                   <a
//                     href={item.product.url}
//                     target="_blank"
//                     className="text-blue-600 underline"
//                   >
//                     {item.product.url}
//                   </a>
//                 </p>
//                 <p>
//                   <b>Giá:</b> {item.product.price} {item.product.currency_code}
//                 </p>
//                 <p>
//                   <b>Số lượng:</b> {item.count}
//                 </p>
//                 {item.product?.map_data?.images?.length > 0 && (
//                   <ProductImageSlider images={item.product.map_data.images} />
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="rounded-lg shadow-sm !border !border-blue-100">
//             <div className="px-3 py-2 bg-blue-50 rounded-t-lg">
//               <h2 className="font-semibold">Vận chuyển</h2>
//             </div>
//             <div className="p-3 text-sm space-y-1">
//               <p>
//                 <b>Tracking ngoài:</b> {order.tracking_other || "Chưa có"}
//               </p>
//               <p>
//                 <b>Tracking VN:</b> {order.tracking_vn || "Chưa có"}
//               </p>
//               <p>
//                 <b>Cân nặng:</b> Chưa cân
//               </p>
//               <p>
//                 <b>Phí cân nặng:</b> Chưa tính
//               </p>
//             </div>
//           </div>
//           {/* Bảo hiểm */}
//         </div>

//         {/* ==== CỘT PHẢI ==== */}
//         <div className="space-y-4">
//           {/* Thông tin Tài chính */}
//           <div className="rounded-lg shadow-sm !border !border-blue-100">
//             <div className="px-3 py-2 bg-blue-50 rounded-t-lg">
//               <h2 className="font-semibold text-base">Thông tin Tài chính</h2>
//             </div>
//             <div className="p-3 text-sm space-y-1">
//               <div className="flex justify-between">
//                 <span>Giá sản phẩm:</span>
//                 <span>
//                   {order.amount}{" "}
//                   {order.metadata.items[0]?.product.currency_code}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Quy đổi (VNĐ):</span>
//                 <span>{order.amount_vnd.toLocaleString()} đ</span>
//               </div>

//               {order.metadata.infos.fees.map((fee) => (
//                 <div key={fee.id} className="flex justify-between">
//                   <span>{fee.name}:</span>
//                   <span>
//                     {fee.amount?.toLocaleString()} {fee.currency_code || "đ"}
//                   </span>
//                 </div>
//               ))}

//               <Divider className="my-1" />
//               <div className="flex gap-2 flex-col font-bold">
//                 <div className="flex justify-between font-bold">
//                   <span>Tổng cộng:</span>
//                   <span>{order.amount_vnd.toLocaleString()} đ</span>
//                 </div>

//                 <div className="flex justify-between text-blue-600">
//                   <span>Tiền cọc:</span>
//                   <span>{order.deposit_fee?.toLocaleString() || 0} đ</span>
//                 </div>
//                 <div className="flex justify-between text-red-600">
//                   <span>Còn lại:</span>
//                   <span>
//                     {(
//                       order.amount_vnd - (order.deposit_fee || 0)
//                     ).toLocaleString()}{" "}
//                     đ
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Vận chuyển */}

//           <Collapse
//             defaultActiveKey={["1"]}
//             className="!bg-blue-50 !rounded-sm !border !border-blue-200 "
//           >
//             <Panel
//               key="1"
//               header={
//                 <span className="font-semibold text-blue-800 text-base flex items-center gap-2">
//                   <FontAwesomeIcon icon={faCog} /> Dịch vụ bổ sung (tùy chọn)
//                 </span>
//               }
//             >
//               <div className="space-y-1 ">
//                 {listService?.map((item: ServiceFee) => {
//                   if (item.optional) return null;
//                   const isChecked = order.metadata.infos.fees.some(
//                     (fee: { code: string }) => fee.code === item.code
//                   );
//                   return (
//                     <div
//                       key={item.id}
//                       className="flex items-start justify-between bg-white rounded-md p-4 border border-blue-200 hover:shadow-sm transition"
//                     >
//                       <div className="flex-1 pr-4">
//                         <Checkbox
//                           checked={isChecked}
//                           disabled
//                           className="!text-blue-600"
//                         >
//                           <div>
//                             <div className="font-medium text-blue-700">
//                               {item.name}
//                             </div>
//                             <div className="text-blue-500 text-sm mt-1">
//                               {item.description}
//                             </div>
//                           </div>
//                         </Checkbox>
//                       </div>
//                       <div className="text-blue-600 font-semibold text-sm min-w-[60px] text-right">
//                         {item.amount}
//                         {item.currency_code}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </Panel>
//           </Collapse>
//           <Collapse
//             defaultActiveKey={["2"]}
//             className="!bg-yellow-50 !rounded-sm !border !border-yellow-200  !mt-4"
//           >
//             <Panel
//               key="2"
//               header={
//                 <span className="font-semibold text-yellow-800 text-base flex items-center gap-1">
//                   <FontAwesomeIcon icon={faShield} /> Bảo hiểm đơn hàng
//                 </span>
//               }
//             >
//               <div className="space-y-2">
//                 {listInsurance?.map((item: InsuranceOptionModel) => {
//                   const isChecked =
//                     order.metadata.infos.insurancePackage?.id === item.id;
//                   return (
//                     <div
//                       key={item.id}
//                       className="flex items-start justify-between bg-white rounded-md p-4 border border-yellow-200 hover:shadow-sm transition"
//                     >
//                       <div className="flex-1 pr-4">
//                         <Checkbox
//                           checked={isChecked}
//                           disabled
//                           className="!text-yellow-700"
//                         >
//                           <div>
//                             <div className="font-medium text-yellow-700">
//                               {item.name}
//                             </div>
//                             <div className="text-yellow-500 text-xs mt-1">
//                               {item.description}
//                             </div>
//                           </div>
//                         </Checkbox>
//                       </div>
//                       <div className="text-yellow-600 font-semibold text-sm min-w-[50px] text-right">
//                         {item.fee_percentage ?? 0}%
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </Panel>
//           </Collapse>
//         </div>
//       </div>
//       {/* </div> */}

//       {/* Ghi chú */}
//       <div className="rounded-lg shadow-sm mt-4 p-3">
//         <h2 className="font-semibold mb-2">Ghi chú</h2>
//         <textarea
//         disabled
//           defaultValue={order.description || ""}
//           placeholder="Nhập ghi chú..."
//           className="w-full border border-blue-400 rounded-md p-2 text-sm"
//         />
//       </div>
//     </Modal>
//   );
// };

// export default OrderDetailModal;
