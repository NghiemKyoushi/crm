"use client";

import React from "react";

type Props = {
  html: string;
  className?: string;
};

/**
 * Component để preview HTML content được tạo bởi CmsTiptapEditor
 * Render HTML đúng cách với tất cả styles và classes từ Tiptap
 */
export default function CmsContentPreview({ html, className }: Props) {
  return (
    <div className={className || ""}>
      {/* Preview Content */}
      <div 
        className="tiptap-preview prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      {/* Global Styles cho Preview (copy từ CmsTiptapEditor) */}
      <style jsx global>{`
        .tiptap-preview {
          width: 100%;
        }

        .tiptap-preview p {
          margin: 0.5em 0;
        }

        .tiptap-preview p:first-child {
          margin-top: 0;
        }

        .tiptap-preview p:last-child {
          margin-bottom: 0;
        }

        .tiptap-preview h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        .tiptap-preview h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        .tiptap-preview h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }

        .tiptap-preview h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0;
        }

        .tiptap-preview h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.17em 0;
        }

        .tiptap-preview h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin: 1.5em 0;
        }

        .tiptap-preview ul,
        .tiptap-preview ol {
          padding-left: 1.5rem;
          margin: 0.5em 0;
        }

        .tiptap-preview li {
          margin: 0.25em 0;
        }

        .tiptap-preview strong {
          font-weight: 700;
        }

        .tiptap-preview em {
          font-style: italic;
        }

        .tiptap-preview s {
          text-decoration: line-through;
        }

        .tiptap-preview u {
          text-decoration: underline;
        }

        .tiptap-preview code {
          background-color: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }

        .tiptap-preview pre {
          background-color: #f4f4f4;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .tiptap-preview pre code {
          background-color: transparent;
          padding: 0;
        }

        .tiptap-preview blockquote {
          border-left: 4px solid #ccc;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }

        .tiptap-preview hr {
          border: none;
          border-top: 2px solid #ccc;
          margin: 2em 0;
        }

        .tiptap-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }

        .tiptap-preview table td,
        .tiptap-preview table th {
          border: 1px solid #ccc;
          padding: 0.5em;
        }

        .tiptap-preview table th {
          background-color: #f4f4f4;
          font-weight: bold;
        }

        .tiptap-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .tiptap-preview .youtube-embed {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          margin: 1em 0;
        }

        .tiptap-preview .youtube-embed iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .tiptap-preview .tiptap-columns {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin: 1em 0;
          width: 100%;
          box-sizing: border-box;
        }

        /* Dynamic column width based on column count */
        .tiptap-preview .tiptap-columns[data-column-count="2"] .tiptap-column {
          flex: 0 0 calc((100% - 1rem) / 2);
          max-width: calc((100% - 1rem) / 2);
          width: calc((100% - 1rem) / 2);
        }

        .tiptap-preview .tiptap-columns[data-column-count="3"] .tiptap-column {
          flex: 0 0 calc((100% - 2rem) / 3);
          max-width: calc((100% - 2rem) / 3);
          width: calc((100% - 2rem) / 3);
        }

        .tiptap-preview .tiptap-columns[data-column-count="4"] .tiptap-column {
          flex: 0 0 calc((100% - 3rem) / 4);
          max-width: calc((100% - 3rem) / 4);
          width: calc((100% - 3rem) / 4);
        }

        .tiptap-preview .tiptap-columns[data-column-count="5"] .tiptap-column {
          flex: 0 0 calc((100% - 4rem) / 5);
          max-width: calc((100% - 4rem) / 5);
          width: calc((100% - 4rem) / 5);
        }

        .tiptap-preview .tiptap-columns[data-column-count="6"] .tiptap-column {
          flex: 0 0 calc((100% - 5rem) / 6);
          max-width: calc((100% - 5rem) / 6);
          width: calc((100% - 5rem) / 6);
        }

        /* Default for any other column count */
        .tiptap-preview .tiptap-column {
          flex: 1 1 0;
          min-width: 0;
          padding: 0.5rem;
          box-sizing: border-box;
          overflow: hidden;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Đảm bảo tất cả nội dung trong column không overflow */
        .tiptap-preview .tiptap-column * {
          max-width: 100%;
          box-sizing: border-box;
        }

        /* YouTube embed trong column - đảm bảo giữ tỷ lệ 16:9 và fit trong column */
        .tiptap-preview .tiptap-column .youtube-embed {
          position: relative !important;
          padding-bottom: 56.25% !important; /* 16:9 ratio */
          height: 0 !important;
          overflow: hidden !important;
          margin: 1em 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .tiptap-preview .tiptap-column .youtube-embed iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          border: 0 !important;
        }

        /* Nếu có div wrapper với data-youtube-video */
        .tiptap-preview .tiptap-column div[data-youtube-video] {
          position: relative !important;
          padding-bottom: 56.25% !important;
          height: 0 !important;
          overflow: hidden !important;
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .tiptap-preview .tiptap-column div[data-youtube-video] iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
        }

        /* Iframe trực tiếp trong column */
        .tiptap-preview .tiptap-column > iframe[src*="youtube.com"],
        .tiptap-preview .tiptap-column > iframe[src*="youtu.be"] {
          position: relative !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          aspect-ratio: 16 / 9 !important;
        }

        /* Hình ảnh và video trong column */
        .tiptap-preview .tiptap-column img,
        .tiptap-preview .tiptap-column video {
          max-width: 100% !important;
          height: auto !important;
          width: 100% !important;
        }

        /* Table trong column */
        .tiptap-preview .tiptap-column table {
          width: 100% !important;
          max-width: 100%;
          table-layout: auto;
        }

        /* Tablet: Maximum 3 columns */
        @media (min-width: 769px) and (max-width: 1024px) {
          .tiptap-preview .tiptap-columns[data-column-count="4"] .tiptap-column,
          .tiptap-preview .tiptap-columns[data-column-count="5"] .tiptap-column,
          .tiptap-preview .tiptap-columns[data-column-count="6"] .tiptap-column {
            flex: 0 0 calc((100% - 2rem) / 3) !important;
            max-width: calc((100% - 2rem) / 3) !important;
            width: calc((100% - 2rem) / 3) !important;
          }
        }

        /* Mobile: Maximum 2 columns */
        @media (max-width: 768px) {
          .tiptap-preview .tiptap-columns[data-column-count="3"] .tiptap-column,
          .tiptap-preview .tiptap-columns[data-column-count="4"] .tiptap-column,
          .tiptap-preview .tiptap-columns[data-column-count="5"] .tiptap-column,
          .tiptap-preview .tiptap-columns[data-column-count="6"] .tiptap-column {
            flex: 0 0 calc((100% - 1rem) / 2) !important;
            max-width: calc((100% - 1rem) / 2) !important;
            width: calc((100% - 1rem) / 2) !important;
          }

          /* Very small mobile: stack all columns */
          @media (max-width: 480px) {
            .tiptap-preview .tiptap-columns {
              flex-direction: column;
            }
            
            .tiptap-preview .tiptap-columns .tiptap-column {
              flex: 1 1 100% !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        }

        .tiptap-preview .tiptap-button {
          display: inline-block;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .tiptap-preview .tiptap-button:hover {
          opacity: 0.9;
        }

        /* Support text alignment */
        .tiptap-preview [style*="text-align: left"] {
          text-align: left;
        }

        .tiptap-preview [style*="text-align: center"] {
          text-align: center;
        }

        .tiptap-preview [style*="text-align: right"] {
          text-align: right;
        }

        .tiptap-preview [style*="text-align: justify"] {
          text-align: justify;
        }

        /* Allow custom fonts from inline styles */
        .tiptap-preview span[style*="font-family"],
        .tiptap-preview [style*="font-family"] {
          font-family: unset !important;
        }
      `}</style>
    </div>
  );
}

