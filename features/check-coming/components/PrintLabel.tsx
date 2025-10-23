"use client";
import React, { useEffect, useRef } from "react";
import { PackageInfo } from "../types";
import "./print-label.css";

/**
 * PrintLabel Component - Thermal Label for Toshiba B-EV4D (60x40mm)
 *
 * Label Layout (60mm x 40mm):
 * ┌─────────────────────────────────────┐
 * │  ▓▓▓▓ BARCODE (CODE128) ▓▓▓▓       │  ~12mm
 * ├─────────────────────────────────────┤
 * │ ┌────────────┬────────────────────┐ │
 * │ │  TRACKING  │     PACKAGE        │ │  ~15mm
 * │ │  ABC123... │   PKG17612...      │ │
 * │ └────────────┴────────────────────┘ │
 * ├─────────────────────────────────────┤
 * │    22/10/2025 14:30:45             │  ~8mm
 * └─────────────────────────────────────┘
 *
 * Configuration: See PRINTER-SETUP.md
 */

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
            width: 1.5,  // Compact width for 60mm label
            height: 40,  // Reduced height for 40mm label
            displayValue: false,
            margin: 2,   // Smaller margin
            fontSize: 8, // Smaller font if needed
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
