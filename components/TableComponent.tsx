/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Table, Pagination } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";

interface TableComponentProps<T> extends TableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowHeight?: number;       // chiều cao row mặc định 28px
  headerHeight?: number;    // chiều cao header mặc định 32px
  fontSize?: number;        // font size mặc định 12px
  pageSize?: number;        // số dòng mỗi trang mặc định 10
}

export default function TableComponent<RecordType extends object>({
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
      <Table<RecordType>
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        {...rest}
        rowClassName={() => "custom-row"}
        components={{
          header: {
            cell: (props: { [x: string]: any; style: any; children: any; }) => {
              const { style, children, ...restProps } = props;
              return (
                <th
                  {...restProps}
                  style={{
                    padding: "4px 8px",
                    height: headerHeight,
                    fontSize: fontSize,
                    textAlign: (props as any)?.column?.align || "left", // 👈 đọc align từ column
                    ...style,
                  }}
                >
                  {children}
                </th>
              );
            },
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
            cell: (props: { [x: string]: any; style: any; children: any; }) => {
              const { style, children, ...restProps } = props;
              return (
                <td
                  {...restProps}
                  style={{
                    padding: "4px 8px",
                    fontSize: fontSize,
                    textAlign: (props as any)?.column?.align || "left", // 👈 đọc align từ column
                    ...style,
                  }}
                >
                  {children}
                </td>
              );
            },
          },
        }}
      />

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
