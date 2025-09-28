export interface Order {
  tracking_ship: string;
  customer_name: string;
  user_name: string;
  status: string;
  order_list: OrderItem[] | null; // nếu có danh sách đơn hàng chi tiết
  amount: number;
  amountvnd: number;
}

export interface OrderItem {
  // định nghĩa theo dữ liệu chi tiết của từng item, ví dụ:
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}