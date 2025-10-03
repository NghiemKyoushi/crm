"use client";

import React, { useRef, useEffect } from "react";

interface EnhancedTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Enhanced Table Wrapper với tính năng scroll ngang khi hover
 * Khi chuột ở trong vùng table (không phải fixed column),
 * scroll sẽ tự động chuyển thành scroll ngang
 */
export default function EnhancedTableWrapper({
  children,
  className = "",
}: EnhancedTableWrapperProps) {
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    if (!tableWrapper) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;

      // Kiểm tra xem target có phải là fixed column không
      // Fixed columns thường có class ant-table-cell-fix-right hoặc ant-table-cell-fix-left
      const isFixedColumn = target.closest('.ant-table-cell-fix-right') ||
                           target.closest('.ant-table-cell-fix-left');

      // Nếu đang hover vào fixed column thì không xử lý
      if (isFixedColumn) {
        return;
      }

      // Kiểm tra xem có đang hover vào table body không
      const isTableBody = target.closest('.ant-table-body') ||
                         target.closest('.ant-table-content');

      if (isTableBody) {
        const scrollContainer = tableWrapper.querySelector('.ant-table-body') as HTMLElement;

        if (scrollContainer) {
          // Ngăn scroll dọc mặc định
          e.preventDefault();

          // Scroll ngang thay vì dọc
          scrollContainer.scrollLeft += e.deltaY;
        }
      }
    };

    // Thêm event listener với passive: false để có thể preventDefault
    tableWrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      tableWrapper.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={tableWrapperRef} className={`enhanced-table-wrapper ${className}`}>
      {children}
    </div>
  );
}
