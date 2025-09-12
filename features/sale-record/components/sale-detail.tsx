import React, { useState } from "react";
import { Table, Button, Select, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faWeight,
  faYenSign,
  faChartLine,
  faFileExcel,
  faCalculator,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import TableComponent, {
  ExtendedColumnsType,
} from "@/components/TableComponent";

const { Option } = Select;

interface CustomerData {
  key: string;
  maKH: string;
  kg: number;
  phiDV: string;
  tongTT: string;
  loiNhuanVC: string;
  loiNhuanPhiTT: string;
  loiNhuanTyGia: string;
  total: string;
  trangThai: string;
}

const dataSource: CustomerData[] = [
  {
    key: "1",
    maKH: "SC191",
    kg: 2.4,
    phiDV: "¥2.333",
    tongTT: "¥77.760",
    loiNhuanVC: "52.800 đ",
    loiNhuanPhiTT: "438.659 đ",
    loiNhuanTyGia: "657.228 đ",
    total: "0",
    trangThai: "Hoạt động",
  },
  {
    key: "2",
    maKH: "SC231",
    kg: 55.5,
    phiDV: "¥1.003",
    tongTT: "¥33.420",
    loiNhuanVC: "4.400 đ",
    loiNhuanPhiTT: "188.489 đ",
    loiNhuanTyGia: "703.048 đ",
    total: "10.931.449",
    trangThai: "Hoạt động",
  },
  {
    key: "2",
    maKH: "SC231",
    kg: 55.5,
    phiDV: "¥1.003",
    tongTT: "¥33.420",
    loiNhuanVC: "4.400 đ",
    loiNhuanPhiTT: "188.489 đ",
    loiNhuanTyGia: "703.048 đ",
    total: "10.931.449 ",
    trangThai: "Hoạt động",
  },
];

const columns: ExtendedColumnsType<any> = [
  { title: "Mã KH", dataIndex: "maKH", key: "maKH" },
  { title: "KG", dataIndex: "kg", key: "kg" },
  { title: "Phí DV (¥)", dataIndex: "phiDV", key: "phiDV" },
  { title: "Tổng TT (¥)", dataIndex: "tongTT", key: "tongTT" },
  { title: "Lợi nhuận VC", dataIndex: "loiNhuanVC", key: "loiNhuanVC" },
  {
    title: "Lợi nhuận Phí TT",
    dataIndex: "loiNhuanPhiTT",
    key: "loiNhuanPhiTT",
  },
  {
    title: "Lợi nhuận Tỷ giá",
    dataIndex: "loiNhuanTyGia",
    key: "loiNhuanTyGia",
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
    onCell: () => ({
      style: {
        backgroundColor: "#fefce8",
        color: "#854d0e",
        fontWeight: 600,
        textAlign: "right",
      },
    }),
    onHeaderCell: () => ({
      style: {
        backgroundColor: "#fefce8",
        color: "#78350f",
        fontWeight: 700,
        textAlign: "right",
      },
    }),
    render: (val: number) => {
      const baseClasses = "font-semibold px-2 py-1 rounded-md inline-block";
      let colorClasses = "text-green-700";

      if (+val === 0) {
        colorClasses = "text-gray-500";
      } else if (+val < 0) {
        colorClasses = "text-red-600";
      }

      return (
        <div className={`${baseClasses} ${colorClasses}`}>
          {val.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}đ
        </div>
      );
    },
  },
  { title: "Trạng thái", dataIndex: "trangThai", key: "trangThai" },
];

interface SaleDetailProps {
  selectId: string;
}
export default function SaleDetail(props: SaleDetailProps) {
  const { selectId } = props;
  const [page, setPage] = useState(0);

  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };

  return (
    <div className="p-6  min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Chi tiết Doanh số - PHƯƠNG LINH
          </h2>
          <p className="text-gray-500">
            Báo cáo chi tiết theo từng khách hàng và lợi nhuận
          </p>
          <Select defaultValue="PHƯƠNG LINH" className="mt-2 w-60">
            <Option value="PHƯƠNG LINH">PHƯƠNG LINH</Option>
            <Option value="KHÁC">Khác</Option>
          </Select>
        </div>
        <div className="text-right">
          <p className="text-gray-500 !mb-1">Tháng hiện tại</p>
          <p className="text-blue-600 text-xl font-semibold !mb-1">
            ₫437,185,422
          </p>
          <p className="text-gray-500 !mb-1">Hoa hồng 20%: 87,437,084</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card className="shadow-sm !h-[100px]">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-blue-500 text-xl"
              />
            </div>
            <div className="flex flex-col gap-0">
              <p className="text-gray-600 text-sm !mb-1">Tổng khách hàng</p>
              <p className="text-lg font-bold">34</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm !h-[100px]">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <FontAwesomeIcon
                icon={faWeight}
                className="text-green-500 text-xl"
              />
            </div>
            <div className="flex flex-col gap-0">
              <p className="text-gray-600 text-sm !mb-1">Tổng KG</p>
              <p className="text-lg font-bold">298.7</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm !h-[100px]">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FontAwesomeIcon
                icon={faYenSign}
                className="text-yellow-500 text-xl"
              />
            </div>
            <div className="flex flex-col gap-0">
              <p className="text-gray-600 text-sm !mb-1">Tổng doanh thu (¥)</p>
              <p className="text-lg font-bold">¥2,350,445</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm !h-[100px]">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-purple-500 text-xl"
              />
            </div>
            <div className="flex flex-col gap-0">
              <p className="text-gray-600 text-sm !mb-1">Hoa hồng ước tính</p>
              <p className="text-lg font-bold text-purple-600">₫87,437,086</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-white mt-6 rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800 text-xl">
            <FontAwesomeIcon icon={faTable} className="text-black" />
            Chi tiết Doanh số theo Khách hàng
          </h3>
          <div className="flex gap-2">
            <Button
              type="primary"
              className="!bg-green-500 !hover:!bg-green-600 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-white" />
              Xuất Excel
            </Button>
            <Button
              type="primary"
              className="!bg-blue-500 !hover:!bg-blue-600 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faCalculator} className="text-white" />
              Tính lương
            </Button>
          </div>
        </div>
        <TableComponent
          columns={columns}
          dataSource={dataSource || []}
          rowHeight={45}
          pageSize={10}
          page={0}
          onPageChange={handleChangePage}
          response={undefined}
          fontSize={14}
          headerHeight={44}
        />
        <div className="bg-gray-50 rounded-lg p-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* 1 */}
            <div className="text-center">
              <div className="text-sm text-gray-500">Tổng KG</div>
              <div className="mt-2 text-xl font-extrabold text-blue-600">
                298.7
              </div>
            </div>

            {/* 2 */}
            <div className="text-center ">
              <div className="text-sm text-gray-500">Tổng Phí DV</div>
              <div className="mt-2 text-xl font-extrabold text-green-600">
                ¥35,905
              </div>
            </div>

            {/* 3 */}
            <div className="text-center ">
              <div className="text-sm text-gray-500">Tổng Thanh toán</div>
              <div className="mt-2 text-xl  font-extrabold text-purple-600">
                ¥2,350,445
              </div>
            </div>

            {/* 4 - nổi bật phải */}
            <div className="text-center ">
              <div className="text-sm text-gray-500">Tổng Lợi nhuận</div>
              <div className="mt-2 text-2xl  font-extrabold text-red-600">
                ₫437,185,422
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
    </div>
  );
}
