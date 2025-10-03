export interface TopUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  value: number; // Giá trị (số tiền nạp hoặc số đơn hàng)
  salesName?: string; // Tên nhân viên sale phụ trách
}

export interface DashboardStats {
  // Nguyên liệu
  remainingYen: number; // Số lượng Yên còn lại
  remainingUSD: number; // Số lượng USD còn lại

  // User
  totalUsers: number; // Tổng số user trên hệ thống

  // Đơn hàng theo thời gian
  ordersToday: number; // Tổng đơn hàng trong ngày
  ordersThisMonth: number; // Tổng đơn hàng trong tháng

  // Đơn hàng theo trạng thái
  ordersPending: number; // Tổng đơn đang pending
  ordersInVNWarehouse: number; // Tổng đơn đang ở kho Việt
  ordersWaitingShipment: number; // Tổng đơn đang đợi chuyển

  // Tài chính
  depositsToday: number; // Tổng tiền nạp trong ngày (VND)
  depositsThisMonth: number; // Tổng tiền nạp trong tháng (VND)
  withdrawalsToday: number; // Tổng tiền rút trong ngày (VND)
  withdrawalsThisMonth: number; // Tổng tiền rút trong tháng (VND)

  // Khách hàng mới
  newCustomersToday: number; // Khách mới đăng ký trong ngày
  newCustomersThisWeek: number; // Khách mới đăng ký trong tuần

  // Top users
  topDepositUsers: TopUser[]; // Top users nạp tiền nhiều nhất
  topOrderUsers: TopUser[]; // Top users mua hàng nhiều nhất
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
  message_key?: string;
}
