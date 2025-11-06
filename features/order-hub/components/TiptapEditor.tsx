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
  isDisable?: boolean;
};

export default function TiptapEditor({
  value = "",
  onChange,
  placeholder,
  className,
  isDisable
}: Props) {  
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
    editable: !isDisable 
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "");
    }
    editor.setEditable(!isDisable);

  }, [value, editor, isDisable]);

  return (
    <div className={`w-full ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border border-gray-200 border-b-0 rounded-t-lg bg-gray-50">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 transition ${
            editor?.isActive('bold') ? 'bg-gray-300 font-bold' : ''
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 transition ${
            editor?.isActive('italic') ? 'bg-gray-300 italic' : ''
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 transition ${
            editor?.isActive('strike') ? 'bg-gray-300 line-through' : ''
          }`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 transition ${
            editor?.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 transition ${
            editor?.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      {/* Editor Content */}
      <div className="border border-gray-200 border-t-0 rounded-b-lg min-h-[180px] bg-white">
        <EditorContent
          editor={editor}
          className="tiptap-editor w-full h-full p-3 prose prose-sm max-w-none focus:outline-none"
        />
      </div>

      {/* Global Styles for TipTap */}
      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          min-height: 160px;
          outline: none;
          width: 100%;
        }

        .tiptap-editor .ProseMirror:focus {
          outline: none;
        }

        /* Allow custom fonts from inline styles - don't override if inline style exists */
        .tiptap-editor .ProseMirror span[style*="font-family"],
        .tiptap-editor .ProseMirror [style*="font-family"] {
          font-family: unset !important;
        }

        .tiptap-editor p {
          margin: 0.5em 0;
        }

        .tiptap-editor p:first-child {
          margin-top: 0;
        }

        .tiptap-editor p:last-child {
          margin-bottom: 0;
        }

        .tiptap-editor ul,
        .tiptap-editor ol {
          padding-left: 1.5rem;
          margin: 0.5em 0;
        }

        .tiptap-editor li {
          margin: 0.25em 0;
        }

        .tiptap-editor strong {
          font-weight: 700;
        }

        .tiptap-editor em {
          font-style: italic;
        }

        .tiptap-editor s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
