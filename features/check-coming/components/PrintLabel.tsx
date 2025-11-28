"use client";
import React, { useEffect, useRef } from "react";
import { PackageInfo } from "../types";
import "./print-label.css";

/**
 * PrintLabel Component - Thermal Label for Toshiba B-EV4D (60x40mm Landscape)
 *
 * Label Layout (60mm x 40mm Landscape):
 * ┌─────────────────────────────────────────────────────────┐
 * │ TRACKING123456                   22/10/2025 14:30      │
 * │                                                          │
 * │ PKG-12345                                               │
 * │                                                          │
 * │        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                      │
 * │        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                      │
 * │        F000001                                          │
 * └─────────────────────────────────────────────────────────┘
 *
 * Configuration: See PRINTER-SETUP.md
 */

interface PrintLabelProps {
  packageInfo: PackageInfo;
  printMode?: "full" | "package_only";
}

const PrintLabel: React.FC<PrintLabelProps> = ({ packageInfo, printMode = "full" }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const generateBarcode = async () => {
      if (barcodeRef.current && packageInfo.code) {
        try {
          // Dynamic import to avoid SSR issues
          const JsBarcode = (await import("jsbarcode")).default;

          // Use code field for barcode
          JsBarcode(barcodeRef.current, packageInfo.code, {
            format: "CODE128",
            width: 2,    // Width for landscape label
            height: 50,  // Height for barcode
            displayValue: false, // Don't show text in barcode itself
            margin: 5,
          });
        } catch (error) {
          console.error("Failed to generate barcode:", error);
        }
      }
    };

    generateBarcode();
  }, [packageInfo]);

  const packageBarcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const generatePackageBarcode = async () => {
      if (packageBarcodeRef.current && packageInfo.packageCode && printMode === "package_only") {
        try {
          const JsBarcode = (await import("jsbarcode")).default;
          JsBarcode(packageBarcodeRef.current, packageInfo.packageCode, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false,
            margin: 3,
          });
        } catch (error) {
          console.error("Failed to generate package barcode:", error);
        }
      }
    };
    generatePackageBarcode();
  }, [packageInfo.packageCode, printMode]);

  // Print only package code with barcode
  if (printMode === "package_only") {
    return (
      <div className="print-label print-label-small">
        <div className="print-content print-package-only">
          {/* Package code text */}
          <div className="print-package-code-only">
            {packageInfo.packageCode}
          </div>
          {/* Barcode */}
          <div className="print-package-barcode">
            <svg ref={packageBarcodeRef}></svg>
          </div>
        </div>
      </div>
    );
  }

  // Full print mode
  return (
    <div className="print-label">
      <div className="print-content">
        {/* Header: Tracking code (bold) and Date (top right) */}
        <div className="print-header">
          <div className="print-tracking-code">
            {packageInfo.trackingCode}
          </div>
          <div className="print-datetime">
            {new Date(packageInfo.timestamp).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Package code - smaller, not bold */}
        <div className="print-package-code">
          {packageInfo.packageCode}
        </div>

        {/* Barcode - center */}
        <div className="print-barcode">
          <svg ref={barcodeRef}></svg>
        </div>

        {/* Code text below barcode - smaller */}
        {packageInfo.code && (
          <div className="print-code-text">
            {packageInfo.code}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintLabel;
