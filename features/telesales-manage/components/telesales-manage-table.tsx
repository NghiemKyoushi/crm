"use client";
import React, { useState } from "react";
import { Table, Button, Input, Select, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faFileExcel,
  faFilter,
  faPhone,
  faTimesCircle,
  faUserPlus,
  faUsers,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import TableComponent from "@/components/TableComponent";
import TelesaleDetailModal from "./telesale-detail-modal";
import AssignTelesaleModal from "./assign-telesale-modal";
import ImportCustomerModal from "./import-telesale-modal";
import TagManagerModal from "./tag-modal";

const { Option } = Select;

interface Customer {
  key: string;
  name: string;
  contact: string;
  info: string;
  telesale: string;
  status: string;
  tags?: Array<any>;
}

const data: Customer[] = [
  {
    key: "1",
    name: "Nguyễn Thị Mai",
    contact: "0901234567\nNữ - 28/03/1985\n123 Nguyễn Trãi, Q1, HCM",
    info: "Import: 15/01/2025\nNguồn: Facebook Lead",
    telesale: "Nguyễn Văn A",
    status: "Thành công",
  },
  {
    key: "2",
    name: "Trần Văn Hoàng",
    contact: "0912345678\nNam - 15/07/1990\n456 Lê Lợi, Q3, HCM",
    info: "Import: 15/01/2025\nNguồn: Google Ads",
    telesale: "Trần Thị B",
    status: "Chưa gọi",
  },
  {
    key: "3",
    name: "Lê Thị Hương",
    contact: "0923456789\nNữ - 22/11/1992\n789 Điện Biên Phủ, Q10, HCM",
    info: "Import: 14/01/2025\nNguồn: Zalo Lead",
    telesale: "Nguyễn Văn A",
    status: "Thất bại",
  },
  {
    key: "4",
    name: "Phạm Văn Đức",
    contact: "0934567890\nNam - 05/05/1988\n321 Võ Văn Tần, Q3, HCM",
    info: "Import: 15/01/2025\nNguồn: Website Form",
    telesale: "Chưa gán",
    status: "Chưa gán",
  },
];

const TelesalesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isOpenAssign, setIsOpenAssign] = useState(false);
  const [isOpenImport, setIsOpenImport] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isOpenTagModal, setIsOpenTagModal] = useState(false);

  const [tags, setTags] = useState([
    { id: "1", name: "Khách hàng", color: "red" },
    { id: "2", name: "Gia đình", color: "green" },
    { id: "3", name: "Công việc", color: "orange" },
    { id: "4", name: "Bạn bè", color: "purple" },
    { id: "5", name: "Trả lời sau", color: "gold" },
    { id: "6", name: "Đồng nghiệp", color: "blue" },
  ]);
  const handleChangePage = (pageNumber: number) => {
    setPage(pageNumber - 1);
  };
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-xs">{text}</span>,
    },
    {
      title: "Liên hệ",
      dataIndex: "contact",
      key: "contact",
      render: (text: string) => (
        <div className="whitespace-pre-line text-gray-600 font-xs">{text}</div>
      ),
    },
    {
      title: "Thông tin",
      dataIndex: "info",
      key: "info",
      render: (text: string) => (
        <div className="whitespace-pre-line text-gray-600">{text}</div>
      ),
    },
    {
      title: "Telesale",
      dataIndex: "telesale",
      key: "telesale",
      render: (text: string) => (
        <span className="text-blue-600 font-medium">{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "Thành công") color = "green";
        else if (status === "Chưa gọi") color = "gold";
        else if (status === "Thất bại") color = "red";
        else if (status === "Chưa gán") color = "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Tag",
      dataIndex: "tags",
      key: "tags",
      render: (_: any, record: Customer) => (
        <div className="flex gap-1 flex-wrap">
          {record.tags?.map((tagId: string) => {
            const tag = tags.find((t) => t.id === tagId);
            return tag ? (
              <Tag color={tag.color} key={tag.id}>
                {tag.name}
              </Tag>
            ) : null;
          })}
          <Button
            size="small"
            onClick={() => {
              setSelectedCustomer(record);
              setIsOpenTagModal(true);
            }}
          >
            + Tag
          </Button>
        </div>
      ),
    },
    // {
    //   title: "Hành động",
    //   key: "action",
    //   render: (_: any, record: Customer) => (
    //     <div className="flex gap-2 flex-wrap">
    //       <Button size="small" className="!bg-blue-500  !text-white !text-xs">
    //         Đã gọi
    //       </Button>
    //       <Button
    //         size="small"
    //         type="primary"
    //         className="!bg-green-500 !text-xs"
    //       >
    //         Thành công
    //       </Button>
    //       <Button size="small" className="!bg-red-500 !text-white !text-xs">
    //         Thất bại
    //       </Button>
    //       {record.status === "Chưa gán" ? (
    //         <Button
    //           size="small"
    //           onClick={() => setIsOpenAssign(true)}
    //           className="!bg-orange-500 !text-white !text-xs"
    //         >
    //           Gán Sale
    //         </Button>
    //       ) : (
    //         <Button size="small" className="!bg-gray-500 !text-white !text-xs">
    //           Ghi chú
    //         </Button>
    //       )}
    //       <Button
    //         onClick={() => setIsOpenDetail(true)}
    //         size="small"
    //         className="!bg-blue-500 !text-white !text-xs"
    //       >
    //         Chi tiết
    //       </Button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-row justify-between">
        <h2 className="text-xl font-bold mb-4">Quản Lý Telesales</h2>
        <div className="flex justify-end mb-4 items-end">
          <div className="flex gap-2">
            <Button
              className="!bg-green-500 !text-white"
              icon={<FontAwesomeIcon icon={faFileExcel} />}
              onClick={() => setIsOpenImport(true)}
            >
              Import Excel
            </Button>
            <Button type="primary" icon={<FontAwesomeIcon icon={faUserPlus} />}>
              Thêm Telesale
            </Button>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Tổng khách hàng */}
        <div className="border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-start gap-4 ">
          <div className="p-2 bg-blue-500 rounded-lg mb-2 ml-4">
            <FontAwesomeIcon icon={faUsers} className=" text-white !h-5 !w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600 !mb-1">
              Tổng khách hàng
            </p>
            <p className="text-2xl font-bold text-blue-900 !mb-1">1,234</p>
          </div>
        </div>

        {/* Chưa gọi */}
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg flex items-center justify-start gap-4">
          <div className="p-2 bg-yellow-500 rounded-lg mb-2 ml-4">
            <FontAwesomeIcon icon={faPhone} className=" text-white !h-5 !w-4" />
          </div>
          <div>
            <p className="text-sm text-yellow-600 !mb-1">Chưa gọi</p>
            <p className="text-2xl font-bold text-yellow-900 !mb-1">456</p>
          </div>
        </div>

        {/* Thành công */}
        <div className="bg-green-50 border border-green-200 rounded-lg flex items-center justify-start gap-4">
          <div className="p-2 bg-green-500 rounded-lg mb-2 ml-4">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className=" text-white !h-5 !w-4"
            />
          </div>
          <div>
            <p className="text-sm text-green-600 !mb-1">Thành công</p>
            <p className="text-2xl font-bold text-green-900 !mb-1">234</p>
          </div>
        </div>

        {/* Thất bại */}
        <div className="bg-red-50 p-2 rounded-lg flex items-center justify-start gap-4">
          <div className="p-2 bg-red-500 rounded-lg mb-2 ml-4">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className=" text-white !h-5 !w-4"
            />
          </div>

          <div>
            <p className="text-sm text-red-600 !mb-1">Thất bại</p>
            <p className="text-2xl font-bold text-red-900 !mb-1">544</p>
          </div>
        </div>
      </div>

      {/* Actions */}

      <div>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Tìm theo tên, SĐT..." className="!w-full" />
          <Select defaultValue="all" className="!w-full">
            <Option value="all">-- Tất cả Telesale --</Option>
            <Option value="TS001">Nguyễn Văn A</Option>
            <Option value="TS002">Trần Thị B</Option>
          </Select>
          <Select defaultValue="all" className="!w-full">
            <Option value="all">-- Tất cả trạng thái --</Option>
            <Option value="success">Thành công</Option>
            <Option value="pending">Chưa gọi</Option>
            <Option value="failed">Thất bại</Option>
          </Select>
          <Button
            type="primary"
            icon={
              <FontAwesomeIcon
                icon={faFilter}
                className=" text-white !h-6 !w-4"
              />
            }
            className="!w-48"
          >
            Lọc
          </Button>
          <Button
            icon={
              <FontAwesomeIcon
                icon={faUserTag}
                className=" text-white !h-6 !w-4"
              />
            }
            className="!w-50 !bg-purple-600 !text-white"
          >
            Gán Hàng Loạt
          </Button>
        </div>
      </div>

      {/* Table */}
      <TableComponent
        columns={columns}
        dataSource={data || []}
        rowHeight={45}
        pageSize={10}
        page={0}
        onPageChange={handleChangePage}
        response={undefined}
        fontSize={14}
        headerHeight={44}
      />

      <TelesaleDetailModal
        open={isOpenDetail}
        onCancel={() => setIsOpenDetail(false)}
        customer={{
          address: "111",
          dob: "23/09/2000",
          gender: "Male",
          name: "Name",
          phone: "PhoneNumber",
        }}
        callHistory={[]}
        onEdit={() => console.log("")}
      />
      <AssignTelesaleModal
        onCancel={() => setIsOpenAssign(false)}
        onSubmit={() => console.log("")}
        open={isOpenAssign}
      />
      <ImportCustomerModal
        onClose={() => setIsOpenImport(false)}
        open={isOpenImport}
        onImport={() => console.log("")}
      />
      <TagManagerModal
        open={isOpenTagModal}
        onClose={() => setIsOpenTagModal(false)}
        tags={tags}
        onChange={setTags}
        customer={selectedCustomer}
        onAssignTag={(customerId, tagId) => {
          const updated = data.map((c) =>
            c.key === customerId
              ? { ...c, tags: [...(c.tags || []), tagId] }
              : c
          );
          console.log("Updated data", updated);
          setIsOpenTagModal(false);
        }}
      />
    </div>
  );
};

export default TelesalesPage;
