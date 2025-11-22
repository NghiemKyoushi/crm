import { Modal, Button, DatePicker, Upload, message, Tooltip } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHistoryDebt, downloadExampleDebt, exportDebt, importDataDebt } from "@/features/finance-manage/apis";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import TableComponent from "@/components/TableComponent";
import { DownloadOutlined, UploadOutlined, FileExcelOutlined, CopyOutlined } from "@ant-design/icons";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { toast } from "react-toastify";
const { RangePicker } = DatePicker;
dayjs.extend(weekday);
dayjs.extend(localeData);

export interface BankAccountInfo {
  account_number: string;
  account_holder: string;
  bank_name: string;
}

export interface DebtHistoryRecord {
  id: number;                          // Cột A: ID giao dịch
  transaction_date: string;            // Cột B: Ngày giờ giao dịch (ISO 8601)
  debt_amount: number;                 // Cột C: CN (Đối tác) - Công nợ phát sinh (VND)
  payment_amount: number;              // Cột D: Đã thanh toán (Ngân hàng)
  running_balance: number;             // Cột E: Số dư công nợ còn lại
  note: string | null;                 // Cột F: Ghi chú
  bank_account_info: BankAccountInfo | null; // Cột G: Tài khoản nhận (chỉ có khi thanh toán)
  deposit_code: string | null;         // Cột H: Mã giao dịch (chỉ có khi thanh toán)
  transaction_type: "MATERIAL" | "PAYMENT"; // Loại: MATERIAL hoặc PAYMENT
  currency_code: string;               // Loại tiền: VND, JPY, USD
  exchange_rate: number;               // Tỷ giá quy đổi
}

const getDefaultDateRange = (): [Dayjs, Dayjs] => {
  const to_date = dayjs().endOf("day");
  const from_date = to_date.subtract(29, "day").startOf("day");
  return [from_date, to_date];
};

function downloadFileFromUrl(urlOrBase64: string, filename: string) {
  if (
    typeof urlOrBase64 === "string" &&
    urlOrBase64.length > 500 &&
    !urlOrBase64.startsWith("http")
  ) {
    const byteCharacters = atob(urlOrBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
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

// Helper to get max selectable date range: 3 months (90 days)
// Used in disabledDate
const MAX_RANGE_DAYS = 90;

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
    // Không cho phép chọn ngoài khoảng 3 tháng
    if (range[1].diff(range[0], "day") > MAX_RANGE_DAYS - 1) {
      toast.error("Chỉ được chọn tối đa trong vòng 3 tháng!");
      return;
    }
    setDateRange([range[0], range[1]]);
    setParams((prev: any) => ({
      ...prev,
      from_date: dayjs(range[0]).format("YYYY-MM-DD"),
      to_date: dayjs(range[1]).format("YYYY-MM-DD"),
      page: 0,
    }));
  };

  const disabledDate = (current: any) => {
    if (!current || !dayjs.isDayjs(current)) return false;

    if (!dateRange || !Array.isArray(dateRange) || (!dateRange[0] && !dateRange[1])) {
      return false;
    }
    const [start, end] = dateRange;

    if (start && !end) {
      const maxEnd = start.add(MAX_RANGE_DAYS - 1, "day").endOf("day");
      const minEnd = start; 
      return current.isBefore(minEnd, "day") || current.isAfter(maxEnd, "day");
    }
    if (!start && end) {
      const minStart = end.subtract(MAX_RANGE_DAYS - 1, "day").startOf("day");
      const maxStart = end; // không cho chọn start lớn hơn end
      return current.isAfter(maxStart, "day") || current.isBefore(minStart, "day");
    }
    return false;
  };

  const columns: ColumnsType<DebtHistoryRecord> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
    },
    {
      title: "Ngày giờ",
      dataIndex: "transaction_date",
      key: "transaction_date",
      width: 150,
      render: (transaction_date: string) =>
        transaction_date
          ? dayjs(transaction_date).add(7, "hour").format("DD/MM/YYYY HH:mm")
          : "",
    },
    {
      title: "CN (Đối tác)",
      dataIndex: "debt_amount",
      key: "debt_amount",
      align: "right",
      width: 130,
      render: (debt_amount: number) => {
        if (!debt_amount || debt_amount === 0) return "-";
        return (
          <span className="text-red-600 font-medium">
            {debt_amount.toLocaleString("vi-VN")} ₫
          </span>
        );
      },
    },
    {
      title: "Đã thanh toán",
      dataIndex: "payment_amount",
      key: "payment_amount",
      align: "right",
      width: 140,
      render: (payment_amount: number) => {
        if (!payment_amount || payment_amount === 0) return "-";
        return (
          <span className="text-green-600 font-medium">
            {payment_amount.toLocaleString("vi-VN")} ₫
          </span>
        );
      },
    },
    {
      title: "Số dư",
      dataIndex: "running_balance",
      key: "running_balance",
      align: "right",
      width: 130,
      render: (running_balance: number) => {
        if (running_balance === undefined || running_balance === null) {
          return "-";
        }
        const isPositive = running_balance > 0;
        const isZero = running_balance === 0;
        return (
          <span
            className={`font-semibold ${
              isZero
                ? "text-gray-600"
                : isPositive
                ? "text-orange-600"
                : "text-blue-600"
            }`}
          >
            {running_balance.toLocaleString("vi-VN")} ₫
          </span>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 200,
      ellipsis: true,
      render: (note: string | null, record: DebtHistoryRecord) => {
        // Hiển thị ghi chú cùng với thông tin tiền tệ nếu không phải VND
        if (record.currency_code && record.currency_code !== "VND") {
          return (
            <div>
              <div>{note || "-"}</div>
              <div className="text-xs text-gray-500">
                ({record.currency_code} - Tỷ giá: {record.exchange_rate.toLocaleString()})
              </div>
            </div>
          );
        }
        return note || "-";
      },
    },
    {
      title: "Tài khoản nhận",
      dataIndex: "bank_account_info",
      key: "bank_account_info",
      width: 250,
      ellipsis: true,
      render: (bank_account_info: BankAccountInfo | null) => {
        if (!bank_account_info) return "-";
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {bank_account_info.account_number}
            </span>
            <span className="text-xs text-gray-600">
              {bank_account_info.account_holder}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {bank_account_info.bank_name}
            </span>
          </div>
        );
      },
    },
    {
      title: "Mã giao dịch",
      dataIndex: "deposit_code",
      key: "deposit_code",
      width: 220,
      ellipsis: true,
      render: (deposit_code: string | null, record: DebtHistoryRecord) => {
        if (!deposit_code) return "-";

        // Hàm copy mã giao dịch
        const handleCopy = () => {
          navigator.clipboard.writeText(deposit_code).then(() => {
            toast.success("Đã copy mã giao dịch!");
          }).catch(() => {
            toast.error("Copy thất bại!");
          });
        };

        // Hiển thị badge theo loại giao dịch
        const badge =
          record.transaction_type === "PAYMENT" ? (
            <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 mr-1">
              TT
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 mr-1">
              VT
            </span>
          );
        return (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center min-w-0 flex-1">
              {badge}
              <span className="truncate">{deposit_code}</span>
            </div>
            <Tooltip title="Copy mã">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                className="flex-shrink-0"
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const handlePageChange = (p: number) => {
    setParams((prev: any) => ({
      ...prev,
      page: p - 1,
    }));
  };

  const handleDownloadSample = async () => {
    try {
      message.loading({ content: "Đang tải file mẫu...", key: "download-sample" });
      const res = await downloadExampleDebt();
      console.log('res', res);

      if (res && res) {
        downloadFileFromUrl(res, "file-mau-import-debt.xlsx");
        toast.success("Tải file mẫu thành công!");
      } else if (res && res.file) {
        const link = document.createElement("a");
        link.href = res.file;
        link.download = "file-mau-import-debt.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Tải file mẫu thành công!");
      } else {
        throw new Error("Không tìm thấy file mẫu!");
      }
    } catch (e: any) {
      toast.error(e?.message || "Tải file mẫu thất bại!");
    } finally {
      message.destroy("download-sample");
    }
  };

  const handleImportChange = async (info: any) => {
    if (info.file.status === "uploading") return;
    if (info.file.status === "done" || info.file.status === undefined) {
      try {
        message.loading({ content: "Đang import...", key: "import-debt" });
        const formData = new FormData();
        if (info.file.originFileObj) {
          formData.append("fileExcel", info.file.originFileObj);
        } else if (info.file instanceof File) {
          formData.append("fileExcel", info.file);
        }
        const res = await importDataDebt(formData);
        downloadFileFromUrl(res, "file-mau-import-debt.xlsx");
        refetch();
        toast.success("Import thành công!");
      } catch (err: any) {
        toast.error(err?.message || "Import thất bại!");
      } finally {
        message.destroy("import-debt");
      }
    } else if (info.file.status === "error") {
      toast.error("Import thất bại!");
      message.destroy("import-debt");
    }
  };

  const handleExport = async () => {
    if (!record?.user_id) {
      toast.error("Không có thông tin đối tác!");
      return;
    }
    try {
      message.loading({ content: "Đang xuất file...", key: "export" });
      const { from_date, to_date } = params;
      const res = await exportDebt(
        record.user_id,
        { from_date, to_date }
      );
      // exportDebt trả ra kiểu dữ liệu giống với downloadExampleDebt (có thể là base64 hoặc url hoặc file object)
      if (res && res) {
        downloadFileFromUrl(res, "export-debt-history.xlsx");
        toast.success("Xuất file thành công!");
      } else if (res && res.file) {
        const link = document.createElement("a");
        link.href = res.file;
        link.download = "export-debt-history.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Xuất file thành công!");
      } else {
        throw new Error("Không tìm thấy file export!");
      }
    } catch (e: any) {
      toast.error(e?.message || "Xuất file thất bại!");
    } finally {
      message.destroy("export");
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={1500}
      footer={null}
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Lịch sử giao dịch công nợ:{" "}
            <span className="text-base font-semibold">
              {Array.isArray(record)
                ? record.map((r: any) => r?.full_name || r?.name).join(", ")
                : record?.full_name || record?.name}
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
        <div className="flex flex-wrap gap-3 items-end mb-3 justify-end">
          <RangePicker
            className="min-w-[250px]"
            allowClear={false}
            value={dateRange}
            onChange={(dates) => {
              const [from, to] =
                Array.isArray(dates) && dates
                  ? [
                      dayjs.isDayjs(dates[0]) ? dates[0] : null,
                      dayjs.isDayjs(dates[1]) ? dates[1] : null,
                    ]
                  : [null, null];
              if (from && to && to.diff(from, "day") > MAX_RANGE_DAYS - 1) {
                toast.error("Chỉ được chọn tối đa trong vòng 3 tháng (90 ngày)!");
                return;
              }
              handleRangeChange([from, to] as [Dayjs | null, Dayjs | null]);
            }}
            disabledDate={disabledDate}
            format="DD/MM/YYYY"
            presets={[
              {
                label: "30 ngày gần nhất",
                value: getDefaultDateRange(),
              },
            ]}
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

        {/* Summary Row */}
        {histories?.totals && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Tổng CN (Đối tác):</span>
                <span className="text-base font-bold text-red-600">
                  {histories.totals.total_debt_amount.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Tổng Đã thanh toán:</span>
                <span className="text-base font-bold text-green-600">
                  {histories.totals.total_payment_amount.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Số dư cuối:</span>
                <span className={`text-base font-bold ${
                  histories.totals.final_running_balance > 0
                    ? 'text-orange-600'
                    : histories.totals.final_running_balance < 0
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>
                  {histories.totals.final_running_balance.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
          </div>
        )}

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
