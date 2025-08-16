"use client";

import React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = createCache();

  useServerInsertedHTML(() => (
    <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
  ));

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
