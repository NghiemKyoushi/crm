"use client";

import React from "react";
import { Table, Pagination } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";

import type { ReactNode } from "react";

export interface CommonColumn<T> {
  renderHeader?: (title: ReactNode, column: CommonColumn<T>) => ReactNode;
  renderCell?: (value: any, record: T, index: number) => ReactNode;
}

export type ExtendedColumnsType<T> = (ColumnsType<T>[number] &
  CommonColumn<T>)[];
interface TableComponentProps<T> extends TableProps<T> {
  columns: ExtendedColumnsType<T>;
  dataSource: T[];
  rowHeight?: number;
  headerHeight?: number;
  fontSize?: number;
  pageSize?: number;
  response: PaginatedResponse<T> | undefined;
  page: number; // 👈 controlled page
  onPageChange: (page: number) => void; // 👈 external callback
}

export interface PaginatedResponse<T> {
  data: T[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
}
export default function TableComponent<RecordType extends object>({
  columns,
  response,
  page,
  dataSource,
  onPageChange,
  rowHeight = 28,
  headerHeight = 32,
  fontSize = 12,
  ...rest
}: TableComponentProps<RecordType>) {
  // If headerHeight === 0, supply an empty header component to hide header
  const tableComponents =
    headerHeight === 0
      ? {
          header: {
            wrapper: () => null, // Hide thead entirely
          },
          body: {
            row: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
              <tr
                {...props}
                style={{
                  height: rowHeight,
                  ...props.style,
                }}
              />
            ),
            cell: (props: any) => {
              const { style, children, ...restProps } = props;
              return (
                <td
                  {...restProps}
                  style={{
                    padding: "4px 8px",
                    fontSize,
                    textAlign: props?.column?.align || "left",
                    ...style,
                  }}
                >
                  {children}
                </td>
              );
            },
          },
        }
      : {
          header: {
            cell: (props: any) => {
              const { style, children, ...restProps } = props;
              return (
                <th
                  {...restProps}
                  style={{
                    padding: "4px 8px",
                    height: headerHeight,
                    fontSize,
                    textAlign: props?.column?.align || "left",
                    ...style,
                  }}
                >
                  {children}
                </th>
              );
            },
          },
          body: {
            row: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
              <tr
                {...props}
                style={{
                  height: rowHeight,
                  ...props.style,
                }}
              />
            ),
            cell: (props: any) => {
              const { style, children, ...restProps } = props;
              return (
                <td
                  {...restProps}
                  style={{
                    padding: "4px 8px",
                    fontSize,
                    textAlign: props?.column?.align || "left",
                    ...style,
                  }}
                >
                  {children}
                </td>
              );
            },
          },
        };

  return (
    <div className="table-wrapper">
      <Table<RecordType>
        columns={columns}
        dataSource={dataSource || []}
        // rowKey={(record: any, index) =>
        //   record.id ?? record.user_id ?? `row-${index}`
        // }
        rowKey={(record: any, index) =>
          `${record.id ?? record.user_id ?? "row"}-${index}`
        }
        pagination={false}
        {...rest}
        rowClassName={() => "custom-row"}
        scroll={{ x: "max-content" }}
        components={tableComponents}
      />

      {response && response.total_items > response.page_size && (
        <div className="flex justify-end mt-2">
          <Pagination
            current={page}
            pageSize={response.page_size}
            total={response.total_items}
            onChange={onPageChange}
            size="small"
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
