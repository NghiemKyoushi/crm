"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export default function TiptapEditor({ value = "", onChange, placeholder, className }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: value || "",
    editorProps: {
      attributes: {
        "aria-label": "editor",
        spellCheck: "true",
      },
    },
    immediatelyRender: false, // 👈 fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className={className}>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 8,
          border: "1px solid #eee",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
        }}
      >
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>
          B
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          I
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()}>
          S
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          •
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          1.
        </button>
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderTop: "none",
          borderRadius: "0 0 6px 6px",
          minHeight: 160,
        }}
      >
        <EditorContent editor={editor} style={{ padding: 12 }} />
      </div>
    </div>
  );
}
