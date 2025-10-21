"use client";
import React, { useEffect, useRef } from "react";
import { PackageInfo } from "../types";
import "./print-label.css";

interface PrintLabelProps {
  packageInfo: PackageInfo;
}

const PrintLabel: React.FC<PrintLabelProps> = ({ packageInfo }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const generateBarcode = async () => {
      if (barcodeRef.current && packageInfo.packageCode && packageInfo.trackingCode) {
        try {
          // Dynamic import to avoid SSR issues
          const JsBarcode = (await import("jsbarcode")).default;

          // Combine package code and tracking code for barcode
          const barcodeData = `${packageInfo.packageCode}|${packageInfo.trackingCode}`;
          JsBarcode(barcodeRef.current, barcodeData, {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: false,
            margin: 5,
          });
        } catch (error) {
          console.error("Failed to generate barcode:", error);
        }
      }
    };

    generateBarcode();
  }, [packageInfo]);

  return (
    <div className="print-label">
      <div className="print-content">
        {/* Barcode ở trên - to */}
        <div className="print-barcode">
          <svg ref={barcodeRef}></svg>
        </div>

        {/* Box chứa 2 mã - hình chữ nhật dài */}
        <div className="print-info-box">
          {/* Tracking bên trái */}
          <div className="print-info-left">
            <div className="print-label-text">TRACKING</div>
            <div className="print-value">{packageInfo.trackingCode}</div>
          </div>

          {/* Package bên phải */}
          <div className="print-info-right">
            <div className="print-label-text">PACKAGE</div>
            <div className="print-value">{packageInfo.packageCode}</div>
          </div>
        </div>

        {/* Ngày giờ */}
        <div className="print-datetime">
          {new Date(packageInfo.timestamp).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default PrintLabel;
