"use client";

import React from "react";
import { Card, Row, Col, Progress, Avatar, Badge } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYenSign,
  faDollarSign,
  faUsers,
  faCalendarDay,
  faHourglassHalf,
  faWarehouse,
  faTruckFast,
  faWallet,
  faMoneyBillTransfer,
  faTrophy,
  faShoppingCart,
  faArrowTrendUp,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import { useDashboardStats } from "../hooks/dashboard";

const DashboardPage: React.FC = () => {
  // TODO: Uncomment khi backend đã có API
  // const { data, isLoading, error } = useDashboardStats();
  // const stats = data?.data;

  // Dummy data tạm thời
  const stats = {
    remainingYen: 15750000,
    remainingUSD: 42500,
    totalUsers: 864,
    ordersToday: 127,
    ordersThisMonth: 1254,
    ordersPending: 24,
    ordersInVNWarehouse: 68,
    ordersWaitingShipment: 15,
    depositsToday: 45800000,
    depositsThisMonth: 987500000,
    withdrawalsToday: 28300000,
    withdrawalsThisMonth: 654200000,
    newCustomersToday: 12,
    newCustomersThisWeek: 48,
    topDepositUsers: [
      { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@email.com", value: 125000000, salesName: "Sale Minh Anh" },
      { id: 2, name: "Trần Thị B", email: "tranthib@email.com", value: 98500000, salesName: "Sale Hoàng Nam" },
      { id: 3, name: "Lê Văn C", email: "levanc@email.com", value: 87200000, salesName: "Sale Thu Hà" },
      { id: 4, name: "Phạm Thị D", email: "phamthid@email.com", value: 76800000, salesName: "Sale Minh Anh" },
      { id: 5, name: "Hoàng Văn E", email: "hoangvane@email.com", value: 65300000, salesName: "Sale Quang Huy" },
    ],
    topOrderUsers: [
      { id: 6, name: "Vũ Thị F", email: "vuthif@email.com", value: 156, salesName: "Sale Thu Hà" },
      { id: 7, name: "Đặng Văn G", email: "dangvang@email.com", value: 142, salesName: "Sale Hoàng Nam" },
      { id: 8, name: "Bùi Thị H", email: "buithih@email.com", value: 128, salesName: "Sale Minh Anh" },
      { id: 9, name: "Đỗ Văn I", email: "dovani@email.com", value: 115, salesName: "Sale Quang Huy" },
      { id: 10, name: "Mai Thị K", email: "maithik@email.com", value: 98, salesName: "Sale Thu Hà" },
    ],
  };

  // Tính toán metrics
  const totalOrders = stats.ordersPending + stats.ordersInVNWarehouse + stats.ordersWaitingShipment;
  const netCashFlow = stats.depositsThisMonth - stats.withdrawalsThisMonth;
  const avgOrderValue = stats.ordersThisMonth > 0 ? Math.round(stats.depositsThisMonth / stats.ordersThisMonth) : 0;

  // Component cho metric card lớn
  const MetricCard = ({ title, value, suffix, trend, trendValue, icon, gradient }: any) => (
    <Card className="shadow-md border-0 overflow-hidden h-full">
      <div className={`absolute top-0 left-0 w-full h-1 ${gradient}`} />
      <div className="pt-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {value?.toLocaleString() || 0}
              {suffix && <span className="text-lg ml-1 text-gray-600">{suffix}</span>}
            </h2>
          </div>
          <div className={`w-12 h-12 rounded-xl ${gradient} bg-opacity-10 flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="text-xl" style={{ color: gradient.includes('blue') ? '#3b82f6' : gradient.includes('green') ? '#10b981' : gradient.includes('purple') ? '#8b5cf6' : '#ef4444' }} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <FontAwesomeIcon
              icon={trend === 'up' ? faArrowTrendUp : faArrowTrendDown}
              className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
            />
            <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue}
            </span>
            <span className="text-xs text-gray-500 ml-1">so với tháng trước</span>
          </div>
        )}
      </div>
    </Card>
  );


  // Component cho stat card nhỏ
  const SmallStatCard = ({ title, value, suffix, icon, color }: any) => (
    <Card className="shadow-sm border border-gray-200 h-full">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
          <FontAwesomeIcon icon={icon} className="text-lg text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">
            {value?.toLocaleString() || 0}
            {suffix && <span className="text-sm ml-1 text-gray-600">{suffix}</span>}
          </p>
        </div>
      </div>
    </Card>
  );

    return <div></div>

  // return (
  //   <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
  //     {/* Header */}
  //     <div className="mb-6">
  //       <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
  //       <p className="text-sm text-gray-600 mt-1">Tổng quan hệ thống Stream Cargo</p>
  //     </div>

  //     {/* Row 1: Key Metrics - 4 cards lớn */}
  //     <Row gutter={[16, 16]} className="mb-5">
  //       <Col xs={24} sm={12} lg={6}>
  //         <MetricCard
  //           title="Tổng Nạp Tháng"
  //           value={stats.depositsThisMonth}
  //           suffix="đ"
  //           trend="up"
  //           trendValue="+12.5%"
  //           icon={faWallet}
  //           gradient="bg-gradient-to-br from-blue-500 to-blue-600"
  //         />
  //       </Col>
  //       <Col xs={24} sm={12} lg={6}>
  //         <MetricCard
  //           title="Tổng Rút Tháng"
  //           value={stats.withdrawalsThisMonth}
  //           suffix="đ"
  //           trend="down"
  //           trendValue="-3.1%"
  //           icon={faMoneyBillTransfer}
  //           gradient="bg-gradient-to-br from-red-500 to-red-600"
  //         />
  //       </Col>
  //       <Col xs={24} sm={12} lg={6}>
  //         <MetricCard
  //           title="Tổng Đơn Hàng"
  //           value={stats.ordersThisMonth}
  //           trend="up"
  //           trendValue="+8.2%"
  //           icon={faShoppingCart}
  //           gradient="bg-gradient-to-br from-green-500 to-green-600"
  //         />
  //       </Col>
  //       <Col xs={24} sm={12} lg={6}>
  //         <MetricCard
  //           title="Tổng Người Dùng"
  //           value={stats.totalUsers}
  //           trend="up"
  //           trendValue="+5.7%"
  //           icon={faUsers}
  //           gradient="bg-gradient-to-br from-purple-500 to-purple-600"
  //         />
  //       </Col>
  //     </Row>

  //     {/* Row 2: Nguyên Liệu & Tài Chính */}
  //     <Row gutter={[16, 16]} className="mb-5">
  //       <Col xs={24} lg={16}>
  //         <Card className="shadow-md border-0 h-full">
  //           <h3 className="text-base font-bold text-gray-900 mb-4">💰 Tài Chính & Nguyên Liệu</h3>
  //           <Row gutter={[12, 12]}>
  //             <Col xs={12} md={8}>
  //               <SmallStatCard
  //                 title="Nạp Hôm Nay"
  //                 value={stats.depositsToday}
  //                 suffix="đ"
  //                 icon={faWallet}
  //                 color="from-emerald-400 to-emerald-500"
  //               />
  //             </Col>
  //             <Col xs={12} md={8}>
  //               <SmallStatCard
  //                 title="Rút Hôm Nay"
  //                 value={stats.withdrawalsToday}
  //                 suffix="đ"
  //                 icon={faMoneyBillTransfer}
  //                 color="from-red-400 to-red-500"
  //               />
  //             </Col>
  //             <Col xs={12} md={8}>
  //               <SmallStatCard
  //                 title="Dòng Tiền Ròng"
  //                 value={netCashFlow}
  //                 suffix="đ"
  //                 icon={faArrowTrendUp}
  //                 color="from-teal-400 to-teal-500"
  //               />
  //             </Col>
  //             <Col xs={12} md={8}>
  //               <SmallStatCard
  //                 title="Nguyên Liệu Yên"
  //                 value={stats.remainingYen}
  //                 suffix="¥"
  //                 icon={faYenSign}
  //                 color="from-blue-400 to-blue-500"
  //               />
  //             </Col>
  //             <Col xs={12} md={8}>
  //               <SmallStatCard
  //                 title="Nguyên Liệu USD"
  //                 value={stats.remainingUSD}
  //                 suffix="$"
  //                 icon={faDollarSign}
  //                 color="from-green-400 to-green-500"
  //               />
  //             </Col>
  //             <Col xs={12} md={8}>
  //               <SmallStatCard
  //                 title="GT Đơn TB"
  //                 value={avgOrderValue}
  //                 suffix="đ"
  //                 icon={faShoppingCart}
  //                 color="from-violet-400 to-violet-500"
  //               />
  //             </Col>
  //           </Row>
  //         </Card>
  //       </Col>

  //       {/* Trạng thái đơn hàng */}
  //       <Col xs={24} lg={8}>
  //         <Card className="shadow-md border-0 h-full">
  //           <h3 className="text-base font-bold text-gray-900 mb-4">📊 Trạng Thái Đơn Hàng</h3>
  //           <div className="space-y-4">
  //             <div>
  //               <div className="flex justify-between items-center mb-2">
  //                 <span className="text-sm text-gray-700 font-medium">Pending</span>
  //                 <Badge
  //                   count={stats.ordersPending}
  //                   style={{ backgroundColor: '#eab308' }}
  //                 />
  //               </div>
  //               <Progress
  //                 percent={Math.round((stats.ordersPending / totalOrders) * 100)}
  //                 strokeColor="#eab308"
  //                 showInfo={false}
  //                 strokeWidth={10}
  //               />
  //             </div>
  //             <div>
  //               <div className="flex justify-between items-center mb-2">
  //                 <span className="text-sm text-gray-700 font-medium">Kho Việt Nam</span>
  //                 <Badge
  //                   count={stats.ordersInVNWarehouse}
  //                   style={{ backgroundColor: '#6366f1' }}
  //                 />
  //               </div>
  //               <Progress
  //                 percent={Math.round((stats.ordersInVNWarehouse / totalOrders) * 100)}
  //                 strokeColor="#6366f1"
  //                 showInfo={false}
  //                 strokeWidth={10}
  //               />
  //             </div>
  //             <div>
  //               <div className="flex justify-between items-center mb-2">
  //                 <span className="text-sm text-gray-700 font-medium">Đợi Chuyển</span>
  //                 <Badge
  //                   count={stats.ordersWaitingShipment}
  //                   style={{ backgroundColor: '#f43f5e' }}
  //                 />
  //               </div>
  //               <Progress
  //                 percent={Math.round((stats.ordersWaitingShipment / totalOrders) * 100)}
  //                 strokeColor="#f43f5e"
  //                 showInfo={false}
  //                 strokeWidth={10}
  //               />
  //             </div>
  //             <div className="pt-3 border-t-2 border-gray-200">
  //               <div className="flex justify-between items-center">
  //                 <span className="text-sm font-bold text-gray-900">Tổng Đơn</span>
  //                 <span className="text-2xl font-bold text-gray-900">{totalOrders}</span>
  //               </div>
  //             </div>
  //           </div>
  //         </Card>
  //       </Col>
  //     </Row>

  //     {/* Row 3: Khách Hàng & Đơn Hàng */}
  //     <Row gutter={[16, 16]} className="mb-5">
  //       <Col xs={24}>
  //         <Card className="shadow-md border-0">
  //           <h3 className="text-base font-bold text-gray-900 mb-4">👥 Khách Hàng & Đơn Hàng</h3>
  //           <Row gutter={[12, 12]}>
  //             <Col xs={12} sm={6} md={4}>
  //               <SmallStatCard
  //                 title="KH Mới Hôm Nay"
  //                 value={stats.newCustomersToday}
  //                 icon={faUsers}
  //                 color="from-violet-400 to-violet-500"
  //               />
  //             </Col>
  //             <Col xs={12} sm={6} md={4}>
  //               <SmallStatCard
  //                 title="KH Mới Tuần"
  //                 value={stats.newCustomersThisWeek}
  //                 icon={faUsers}
  //                 color="from-fuchsia-400 to-fuchsia-500"
  //               />
  //             </Col>
  //             <Col xs={12} sm={6} md={4}>
  //               <SmallStatCard
  //                 title="Đơn Hôm Nay"
  //                 value={stats.ordersToday}
  //                 icon={faCalendarDay}
  //                 color="from-orange-400 to-orange-500"
  //               />
  //             </Col>
  //             <Col xs={12} sm={6} md={4}>
  //               <SmallStatCard
  //                 title="Đơn Pending"
  //                 value={stats.ordersPending}
  //                 icon={faHourglassHalf}
  //                 color="from-yellow-400 to-yellow-500"
  //               />
  //             </Col>
  //             <Col xs={12} sm={6} md={4}>
  //               <SmallStatCard
  //                 title="Đơn Kho VN"
  //                 value={stats.ordersInVNWarehouse}
  //                 icon={faWarehouse}
  //                 color="from-indigo-400 to-indigo-500"
  //               />
  //             </Col>
  //             <Col xs={12} sm={6} md={4}>
  //               <SmallStatCard
  //                 title="Đơn Đợi Chuyển"
  //                 value={stats.ordersWaitingShipment}
  //                 icon={faTruckFast}
  //                 color="from-rose-400 to-rose-500"
  //               />
  //             </Col>
  //           </Row>
  //         </Card>
  //       </Col>
  //     </Row>

  //     {/* Row 4: Top Users */}
  //     <Row gutter={[16, 16]}>
  //       <Col xs={24}>
  //         <h3 className="text-lg font-bold text-gray-900 mb-3">🏆 Top Khách Hàng</h3>
  //       </Col>
  //       {/* Top Users Nạp Tiền */}
  //       <Col xs={24} lg={12}>
  //         <Card className="shadow-md border-0">
  //           <div className="flex items-center gap-3 mb-4">
  //             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
  //               <FontAwesomeIcon icon={faTrophy} className="text-lg text-white" />
  //             </div>
  //             <h3 className="text-base font-bold text-gray-900">Top Khách Nạp Tiền</h3>
  //           </div>
  //           <div className="space-y-3">
  //             {stats.topDepositUsers.map((user, index) => (
  //               <div
  //                 key={user.id}
  //                 className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all"
  //               >
  //                 <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
  //                   index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white" :
  //                   index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
  //                   index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white" :
  //                   "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
  //                 }`}>
  //                   {index === 0 && <span className="absolute -top-1 -right-1 text-lg">🥇</span>}
  //                   {index === 1 && <span className="absolute -top-1 -right-1 text-lg">🥈</span>}
  //                   {index === 2 && <span className="absolute -top-1 -right-1 text-lg">🥉</span>}
  //                   {index + 1}
  //                 </div>
  //                 <div className="flex-1 min-w-0">
  //                   <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
  //                   <p className="text-xs text-gray-500 truncate">{user.email}</p>
  //                   {user.salesName && (
  //                     <p className="text-xs text-blue-600 font-medium mt-0.5">
  //                       <FontAwesomeIcon icon={faUsers} className="mr-1" />
  //                       {user.salesName}
  //                     </p>
  //                   )}
  //                 </div>
  //                 <div className="text-right flex-shrink-0">
  //                   <p className="text-base font-bold text-emerald-600">
  //                     {(user.value / 1000000).toFixed(1)}M
  //                   </p>
  //                   <p className="text-xs text-gray-500">đồng</p>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </Card>
  //       </Col>

  //       {/* Top Users Mua Hàng */}
  //       <Col xs={24} lg={12}>
  //         <Card className="shadow-md border-0">
  //           <div className="flex items-center gap-3 mb-4">
  //             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
  //               <FontAwesomeIcon icon={faShoppingCart} className="text-lg text-white" />
  //             </div>
  //             <h3 className="text-base font-bold text-gray-900">Top Khách Mua Hàng</h3>
  //           </div>
  //           <div className="space-y-3">
  //             {stats.topOrderUsers.map((user, index) => (
  //               <div
  //                 key={user.id}
  //                 className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all"
  //               >
  //                 <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
  //                   index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white" :
  //                   index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
  //                   index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white" :
  //                   "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
  //                 }`}>
  //                   {index === 0 && <span className="absolute -top-1 -right-1 text-lg">🥇</span>}
  //                   {index === 1 && <span className="absolute -top-1 -right-1 text-lg">🥈</span>}
  //                   {index === 2 && <span className="absolute -top-1 -right-1 text-lg">🥉</span>}
  //                   {index + 1}
  //                 </div>
  //                 <div className="flex-1 min-w-0">
  //                   <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
  //                   <p className="text-xs text-gray-500 truncate">{user.email}</p>
  //                   {user.salesName && (
  //                     <p className="text-xs text-blue-600 font-medium mt-0.5">
  //                       <FontAwesomeIcon icon={faUsers} className="mr-1" />
  //                       {user.salesName}
  //                     </p>
  //                   )}
  //                 </div>
  //                 <div className="text-right flex-shrink-0">
  //                   <p className="text-base font-bold text-blue-600">{user.value}</p>
  //                   <p className="text-xs text-gray-500">đơn hàng</p>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </Card>
  //       </Col>
  //     </Row>
  //   </div>
  // );
};

export default DashboardPage;
