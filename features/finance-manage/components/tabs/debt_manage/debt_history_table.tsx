import { Modal, Button, DatePicker, Upload, message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHistoryDebt, downloadExampleDebt, exportDebt, importDataDebt } from "@/features/finance-manage/apis";
import type { BankDepositRequest } from "@/types/deposit-type";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import TableComponent from "@/components/TableComponent";
import { DownloadOutlined, UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
const { RangePicker } = DatePicker;
dayjs.extend(weekday);
dayjs.extend(localeData);

export interface DebtHistoryRecord {
  amount_vnd: number;
  status: "PENDING" | "COMPLETE" | "CANCELED" | string;
  action_by: string;
  action_at: string;
  deposit_code: string;
  id?: string | number;
  created_at: string;
  debt_paid: number;
  debt: number;
}

// Use explicit [Dayjs, Dayjs] for ranges for type safety
const getDefaultDateRange = (): [Dayjs, Dayjs] => {
  const to_date = dayjs().endOf("day");
  const from_date = to_date.subtract(29, "day").startOf("day");
  return [from_date, to_date];
};

// Hỗ trợ download file từ base64 hoặc url thông thường
function downloadFileFromUrl(urlOrBase64: string, filename: string) {
  // Nếu chuỗi là base64 (rất dài, không có http) thì decode thành Blob
  if (
    typeof urlOrBase64 === "string" &&
    urlOrBase64.length > 500 &&
    !urlOrBase64.startsWith("http")
  ) {
    // cố gắng parse định dạng base64 (zip, excel, ...)
    // Tạo link download tạm
    const byteCharacters = atob(urlOrBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    // fallback dùng application/octet-stream
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(urlBlob), 200);
  } else {
    // Nếu là url dạng thông thường
    fetch(urlOrBase64)
      .then((response) => response.blob())
      .then((blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = urlBlob;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(urlBlob), 200); // clean up
      });
  }
}

export const DebtDetailModal = ({
  visible,
  onClose,
  record,
}: {
  visible: boolean;
  onClose: () => void;
  record: any;
}) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(getDefaultDateRange());
  // Use plain object for params since BankDepositRequest likely does not include these props
  const [params, setParams] = useState<any>({
    page: 0,
    size: 10,
    from_date: getDefaultDateRange()[0].format("YYYY-MM-DD"),
    to_date: getDefaultDateRange()[1].format("YYYY-MM-DD"),
  });

  const inputRef = useRef<any>();

  const {
    data: histories,
    isPending,
    refetch,
  } = useQuery({
    enabled: !!record.user_id && visible,
    queryKey: ["debt-history", record.user_id, params],
    queryFn: () => getHistoryDebt(record.user_id, params),
  });

  useEffect(() => {
    if (visible && !!record.user_id) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record.user_id, params]);

  // Date range change handler
  const handleRangeChange = (range: [Dayjs | null, Dayjs | null]) => {
    if (
      !range ||
      range.length !== 2 ||
      !range[0] ||
      !range[1] ||
      !dayjs.isDayjs(range[0]) ||
      !dayjs.isDayjs(range[1])
    )
      return;
    setDateRange([range[0], range[1]]);
    setParams((prev: any) => ({
      ...prev,
      from_date: dayjs(range[0]).format("YYYY-MM-DD"),
      to_date: dayjs(range[1]).format("YYYY-MM-DD"),
      page: 0,
    }));
  };

  // Defensive: Make sure current and dateRange values are Dayjs objects before calling Dayjs methods
  const disabledDate = (current: any) => {
    // Antd can pass non-Dayjs values in certain edge-cases, skip those
    if (!current || !dayjs.isDayjs(current)) return false;
    const [start /* , end */] = dateRange;
    if (!start || !dayjs.isDayjs(start)) return false;
    const earliest = start.subtract(29, "day").startOf("day");
    const latest = start.add(29, "day").endOf("day");
    return current.isBefore(earliest) || current.isAfter(latest);
  };

  const columns: ColumnsType<DebtHistoryRecord> = [
    {
      title: "Mã giao dịch",
      dataIndex: "deposit_code",
      key: "deposit_code",
      width: 170,
      ellipsis: true,
    },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "amount_vnd",
      key: "amount_vnd",
      align: "right",
      width: 140,
      render: (amount_vnd: number) =>
        amount_vnd?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }),
    },
    {
      title: "Công nợ",
      dataIndex: "debt",
      key: "debt",
      width: 170,
      render: (amount_vnd: number) =>
        amount_vnd?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }),
    },
    {
      title: "Số dư còn lại",
      dataIndex: "debt_paid",
      key: "debt_paid",
      width: 170,
      render: (amount_vnd: number) =>
        amount_vnd?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        let color = "";
        let txt = "";
        switch (status) {
          case "PENDING":
            color = "text-yellow-600 bg-yellow-50 border border-yellow-200";
            txt = "Chờ xác nhận";
            break;
          case "COMPLETED":
            color = "text-green-700 bg-green-50 border-green-200";
            txt = "Hoàn thành";
            break;
          case "CANCELED":
            color = "text-gray-500 bg-gray-100 border-gray-200";
            txt = "Đã từ chối";
            break;
          default:
            color = "";
            txt = status;
        }
        return (
          <span
            className={`rounded px-2 py-[2px] text-xs font-medium ${color}`}
          >
            {txt}
          </span>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 170,
      ellipsis: true,
    },
    {
      title: "Thời gian tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      ellipsis: true,
      render: (created_at: string) =>
        created_at ? dayjs(created_at).format("DD-MM-YYYY HH:mm:ss") : "",
    },
  ];

  const handlePageChange = (p: number) => {
    setParams((prev: any) => ({
      ...prev,
      page: p - 1,
    }));
  };

  // Download sample file handler using API
  const handleDownloadSample = async () => {
    try {
      message.loading({ content: "Đang tải file mẫu...", key: "download-sample" });
      const res = await downloadExampleDebt();
      console.log('res', res);

      if (res && res) {
        // Download from url in current tab as attachment
        downloadFileFromUrl(res, "file-mau-import-debt.xlsx");
        message.success({ content: "Tải file mẫu thành công!", key: "download-sample", duration: 2 });
      } else if (res && res.file) {
        // fallback: if file data (base64/Blob) returned, create a link and trigger
        const link = document.createElement("a");
        link.href = res.file;
        link.download = "file-mau-import-debt.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success({ content: "Tải file mẫu thành công!", key: "download-sample", duration: 2 });
      } else {
        throw new Error("Không tìm thấy file mẫu!");
      }
    } catch (e: any) {
      message.error({ content: e?.message || "Tải file mẫu thất bại!", key: "download-sample" });
    }
  };

  // Actual Import: sử dụng importDataDebt API
  const handleImportChange = async (info: any) => {
    // Only proceed when upload finishes
    if (info.file.status === "uploading") return;

    if (info.file.status === "done" || info.file.status === undefined) {
      // Gọi API importDataDebt
      try {
        message.loading({ content: "Đang import...", key: "import-debt" });
        const formData = new FormData();
        if (info.file.originFileObj) {
          formData.append("file", info.file.originFileObj);
        } else if (info.file instanceof File) {
          formData.append("file", info.file);
        }
        await importDataDebt(formData);
        message.success({ content: "Import thành công!", key: "import-debt" });
        refetch();
      } catch (err: any) {
        message.error({ content: err?.message || "Import thất bại!", key: "import-debt" });
      }
    } else if (info.file.status === "error") {
      message.error("Import thất bại!");
    }
  };

  // Export handler using API
  const handleExport = async () => {
    if (!record?.user_id) {
      message.error({ content: "Không có thông tin đối tác!", key: "export" });
      return;
    }
    try {
      message.loading({ content: "Đang xuất file...", key: "export" });
      const { from_date, to_date } = params;
      const res = await exportDebt(
        record.user_id,
        { from_date, to_date }
      );
      // Nếu backend trả về URL:
      if (res && res.url) {
        // Download from url in current tab as attachment
        downloadFileFromUrl(res.url, "export-debt-history.xlsx");
        message.success({ content: "Xuất file thành công!", key: "export", duration: 2 });
      } else if (res && res.file) {
        // fallback: if file data (base64/Blob) returned, create a download
        const link = document.createElement("a");
        link.href = res.file;
        link.download = "export-debt-history.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success({ content: "Xuất file thành công!", key: "export", duration: 2 });
      } else {
        throw new Error("Không tìm thấy file export!");
      }
    } catch (e: any) {
      message.error({ content: e?.message || "Xuất file thất bại!", key: "export" });
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Lịch sử giao dịch công nợ:{" "}
            <span className="text-base font-semibold">
              {Array.isArray(record)
                ? record.map((r: any) => r?.name).join(", ")
                : record?.name}
            </span>
          </span>
          <div className="flex-1" />
        </div>
      }
      style={{
        maxHeight: "99vh",
        overflowY: "auto",
        paddingTop: 10,
      }}
      centered
      destroyOnClose
    >
      <div
        style={{
          height: "87vh",
          overflowY: "auto",
          paddingTop: 10,
        }}
      >
        {/* Các nút và input phía trên table */}
        <div className="flex flex-wrap gap-3 items-end mb-3 justify-end">
          <RangePicker
            className="min-w-[250px]"
            allowClear={false}
            value={dateRange}
            onChange={(dates) =>
              handleRangeChange(
                Array.isArray(dates)
                  ? ([
                      dayjs.isDayjs(dates[0]) ? dates[0] : null,
                      dayjs.isDayjs(dates[1]) ? dates[1] : null,
                    ] as [Dayjs | null, Dayjs | null])
                  : [null, null]
              )
            }
            disabledDate={disabledDate}
            format="DD/MM/YYYY"
            ranges={{
              "30 ngày gần nhất": getDefaultDateRange(),
            }}
            placeholder={["Từ ngày", "Đến ngày"]}
            style={{ minWidth: 230 }}
            allowEmpty={[false, false]}
            inputReadOnly
          />
          <Button
            icon={<DownloadOutlined />}
            type="default"
            onClick={handleDownloadSample}
          >
            Tải file mẫu
          </Button>
          <Upload
            accept=".xlsx,.csv"
            showUploadList={false}
            maxCount={1}
            customRequest={options => {
              // "upload" ngay lập tức để onChange được gọi với status 'done'
              options.onSuccess && options.onSuccess({}, options.file);
            }}
            onChange={handleImportChange}
          >
            <Button icon={<UploadOutlined />} type="default">
              Import
            </Button>
          </Upload>
          <Button
            icon={<FileExcelOutlined />}
            type="primary"
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
        <TableComponent
          columns={columns}
          dataSource={histories?.data || []}
          response={histories}
          page={params.page ? params.page + 1 : 0}
          rowHeight={60}
          onPageChange={handlePageChange}
          fontSize={13}
          loading={isPending}
        />
      </div>
    </Modal>
  );
};
