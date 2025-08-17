// CustomTable.tsx
"use client";

import React, { useState } from "react";
import { Table, Pagination } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";

interface TableComponentProps<RecordType> extends TableProps<RecordType> {
  columns: ColumnsType<RecordType>;
  dataSource: RecordType[];
  rowHeight?: number;       // chiều cao row mặc định 28px
  headerHeight?: number;    // chiều cao header mặc định 32px
  fontSize?: number;        // font size mặc định 12px
  pageSize?: number;        // số dòng mỗi trang mặc định 10
}

export default function TableComponent<RecordType>({
  columns,
  dataSource,
  rowHeight = 28,
  headerHeight = 32,
  fontSize = 12,
  pageSize = 10,
  ...rest
}: TableComponentProps<RecordType>) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <Table
        columns={columns}
        dataSource={paginatedData}
        pagination={false} // tắt pagination mặc định của AntD Table
        {...rest}
        rowClassName={() => "custom-row"}
        components={{
          header: {
            cell: (props: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLTableHeaderCellElement> & React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
              <th
                {...props}
                style={{
                  padding: "4px 8px",
                  height: headerHeight,
                  fontSize: fontSize,
                  ...props.style,
                }}
              />
            ),
          },
          body: {
            row: (props: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLTableRowElement> & React.HTMLAttributes<HTMLTableRowElement>) => (
              <tr
                {...props}
                style={{
                  height: rowHeight,
                  ...props.style,
                }}
              />
            ),
            cell: (props: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLTableDataCellElement> & React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
              <td
                {...props}
                style={{
                  padding: "4px 8px",
                  fontSize: fontSize,
                  ...props.style,
                }}
              />
            ),
          },
        }}
      />

      {/* Pagination riêng bên dưới table */}
      {dataSource.length > pageSize && (
        <div className="flex justify-end mt-2">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={dataSource.length}
            onChange={(page) => setCurrentPage(page)}
            size="small"
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
