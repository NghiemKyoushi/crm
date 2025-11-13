"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Image as ImageBase } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit, FontSize } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import YouTube from "@tiptap/extension-youtube";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Node, Mark, mergeAttributes } from "@tiptap/core";
import { Input, Modal, Select, Upload, message, Form, ColorPicker, InputNumber, Button as AntButton } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  LinkOutlined,
  PictureOutlined,
  TableOutlined,
  YoutubeOutlined,
  CodeOutlined,
  ColumnWidthOutlined,
  AppstoreAddOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons";
import { uploadImage } from "@/features/user-profile/hooks/user-profile";
import { VIEW_IMAGE } from "@/constants/api-type";

// Custom Columns Extension with customizable column count
const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',
  addAttributes() {
    return {
      columnCount: {
        default: 2,
        parseHTML: element => parseInt(element.getAttribute('data-column-count') || '2'),
        renderHTML: attributes => {
          if (!attributes.columnCount || attributes.columnCount === 2) {
            return {};
          }
          return {
            'data-column-count': attributes.columnCount,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes, node }) {
    const columnCount = node.attrs.columnCount || 2;
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'columns',
      'data-column-count': columnCount,
      class: 'tiptap-columns',
      style: `display: flex; gap: 1rem; margin: 1em 0; width: 100%; box-sizing: border-box;`
    }), 0];
  },
  addCommands() {
    return {
      setColumns: (options: { columnCount: number; verticalAlign?: 'top' | 'middle' | 'bottom' }) => ({ commands }: any) => {
        const count = options?.columnCount || 2;
        const verticalAlign = options?.verticalAlign || 'top';
        const columns = Array.from({ length: count }, () => ({
          type: 'column',
          attrs: { verticalAlign },
          content: [{ type: 'paragraph' }],
        }));
        return commands.insertContent({
          type: this.name,
          attrs: { columnCount: count },
          content: columns,
        });
      },
    } as any;
  },
});

const Column = Node.create({
  name: 'column',
  content: 'block+',
  addAttributes() {
    return {
      verticalAlign: {
        default: 'top',
        parseHTML: (element: HTMLElement) => {
          const align = element.getAttribute('data-vertical-align') ||
            element.style.justifyContent ||
            'top';
          return align === 'flex-start' ? 'top' :
            align === 'center' ? 'middle' :
              align === 'flex-end' ? 'bottom' : align;
        },
        renderHTML: (attributes: any) => {
          if (!attributes.verticalAlign || attributes.verticalAlign === 'top') {
            return {};
          }
          return {
            'data-vertical-align': attributes.verticalAlign,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes, node }) {
    const attrs = node.attrs;
    const verticalAlign = attrs.verticalAlign || 'top';

    // Map vertical align to CSS justify-content
    let justifyContent = 'flex-start';
    if (verticalAlign === 'middle') {
      justifyContent = 'center';
    } else if (verticalAlign === 'bottom') {
      justifyContent = 'flex-end';
    }

    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'column',
      'data-vertical-align': verticalAlign,
      class: `tiptap-column vertical-align-${verticalAlign}`,
      style: `flex: 1; min-width: 0; padding: 0.5rem; box-sizing: border-box; overflow: hidden; word-wrap: break-word; overflow-wrap: break-word; display: flex; flex-direction: column; justify-content: ${justifyContent};`
    }), 0];
  },
  addCommands() {
    return {
      setColumnVerticalAlign: (alignment: 'top' | 'middle' | 'bottom') => ({ commands }: any) => {
        return commands.updateAttributes('column', { verticalAlign: alignment });
      },
    } as any;
  },
});

// Enhanced Image Extension with size and layout controls
const EnhancedImage = ImageBase.extend({
  name: 'image',
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('width'),
        renderHTML: (attributes: any) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('height'),
        renderHTML: (attributes: any) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      align: {
        default: 'inline',
        parseHTML: (element: HTMLElement) => {
          const align = element.getAttribute('data-align') ||
            (element.style as any).float ||
            element.style.textAlign ||
            'inline';
          return align === 'left' ? 'left' :
            align === 'right' ? 'right' :
              align === 'center' ? 'center' : 'inline';
        },
        renderHTML: (attributes: any) => {
          if (!attributes.align || attributes.align === 'inline') {
            return {};
          }
          return {
            'data-align': attributes.align,
          };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes, node }: any) {
    const attrs = node.attrs;
    let style = '';
    let className = 'tiptap-image';

    // Handle alignment and wrapping
    if (attrs.align === 'left') {
      style += 'float: left; margin-right: 1em; margin-bottom: 0.5em;';
      className += ' align-left';
    } else if (attrs.align === 'right') {
      style += 'float: right; margin-left: 1em; margin-bottom: 0.5em;';
      className += ' align-right';
    } else if (attrs.align === 'center') {
      style += 'display: block; margin-left: auto; margin-right: auto;';
      className += ' align-center';
    } else {
      style += 'display: inline-block;';
      className += ' align-inline';
    }

    // Add width and height if specified
    if (attrs.width) {
      style += ` width: ${attrs.width}${typeof attrs.width === 'number' ? 'px' : ''};`;
    }
    if (attrs.height) {
      style += ` height: ${attrs.height}${typeof attrs.height === 'number' ? 'px' : ''};`;
    }

    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        src: attrs.src,
        alt: attrs.alt,
        title: attrs.title,
        width: attrs.width,
        height: attrs.height,
        'data-align': attrs.align,
        style,
        class: className,
      }),
    ];
  },
  addCommands() {
    return {
      setImage: (options: any) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
      updateImageAttributes: (attributes: any) => ({ commands }: any) => {
        return commands.updateAttributes(this.name, attributes);
      },
    };
  },
});

// Custom Button Extension
const Button = Node.create({
  name: 'button',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,
  addAttributes() {
    return {
      text: {
        default: 'Button',
      },
      href: {
        default: '#',
      },
      padding: {
        default: '8px 16px',
      },
      background: {
        default: '#1890ff',
      },
      color: {
        default: '#ffffff',
      },
      borderRadius: {
        default: '4px',
      },
      border: {
        default: 'none',
      },
      fontSize: {
        default: '14px',
      },
      fontWeight: {
        default: '500',
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'a[data-type="button"]',
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    const style = `display: inline-block; padding: ${attrs.padding}; background: ${attrs.background}; color: ${attrs.color}; border-radius: ${attrs.borderRadius}; border: ${attrs.border}; font-size: ${attrs.fontSize}; font-weight: ${attrs.fontWeight}; text-decoration: none; cursor: pointer;`;
    return ['a', mergeAttributes(HTMLAttributes, {
      'data-type': 'button',
      href: attrs.href,
      style,
      class: 'tiptap-button'
    }), attrs.text];
  },
  addCommands() {
    return {
      setButton: (options: any) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    } as any;
  },
});

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  isDisable?: boolean;
};

export default function CmsTiptapEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className,
  isDisable
}: Props) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [buttonModalOpen, setButtonModalOpen] = useState(false);
  const [buttonForm] = Form.useForm();
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [columnsCount, setColumnsCount] = useState(2);
  const [columnsVerticalAlign, setColumnsVerticalAlign] = useState<'top' | 'middle' | 'bottom'>('top');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageForm] = Form.useForm();
  const [selectedImageNode, setSelectedImageNode] = useState<any>(null);
  const [resizing, setResizing] = useState(false);
  const [resizeData, setResizeData] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    handle: string;
  } | null>(null);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      EnhancedImage.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyleKit,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 p-4 rounded font-mono text-sm",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-gray-300 pl-4 italic my-4",
        },
      }),
      HorizontalRule,
      YouTube.configure({
        controls: true,
        nocookie: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 w-full my-4",
        },
      }),
      TableRow,
      TableHeader,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
      Subscript,
      Superscript,
      Columns,
      Column,
      Button,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        "aria-label": "editor",
        spellCheck: "true",
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editable: !isDisable,
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "");
    }
    editor.setEditable(!isDisable);
  }, [value, editor, isDisable]);

  const setLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setLinkModalOpen(false);
    setLinkUrl("");
  };

  const insertYoutube = () => {
    if (youtubeUrl) {
      // Extract YouTube video ID from URL
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = youtubeUrl.match(youtubeRegex);
      if (match && match[1]) {
        editor?.commands.setYoutubeVideo({
          src: `https://www.youtube.com/embed/${match[1]}`,
          width: 640,
          height: 480,
        });
        setYoutubeModalOpen(false);
        setYoutubeUrl("");
      } else {
        message.error("Invalid YouTube URL");
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageId = await uploadImage(file);
      const base = process.env.NEXT_PUBLIC_ROOT_STATIC_URL || "";
      const imageUrl = `${base}/${VIEW_IMAGE}${imageId}`;

      // Open image configuration modal
      imageForm.setFieldsValue({
        src: imageUrl,
        alt: '',
        width: '',
        height: '',
        align: 'inline',
      });
      setSelectedImageNode(null);
      setImageModalOpen(true);
    } catch (error) {
      message.error("Failed to upload image");
    }
  };

  const handleImageConfigSave = () => {
    imageForm.validateFields().then((values) => {
      const attrs: any = {
        src: values.src,
        alt: values.alt || '',
      };

      if (values.width) {
        attrs.width = values.width;
      }
      if (values.height) {
        attrs.height = values.height;
      }
      if (values.align) {
        attrs.align = values.align;
      }

      if (selectedImageNode !== null) {
        // Update existing image
        editor?.chain().focus().setNodeSelection(selectedImageNode).updateAttributes('image', attrs).run();
      } else {
        // Insert new image
        editor?.chain().focus().setImage(attrs).run();
      }

      setImageModalOpen(false);
      imageForm.resetFields();
      setSelectedImageNode(null);
      message.success("Image configured");
    });
  };

  // Handle image resize with handles
  useEffect(() => {
    if (!editor) return;

    const updateImageSize = (img: HTMLImageElement, newWidth: number, newHeight: number) => {
      const pos = editor.state.selection.from;
      const node = editor.state.doc.nodeAt(pos);
      if (node && node.type.name === 'image') {
        editor.chain().focus().setNodeSelection(pos).updateAttributes('image', {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        }).run();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('resize-handle')) {
        e.preventDefault();
        e.stopPropagation();

        const img = target.closest('.tiptap-image-container')?.querySelector('img') as HTMLImageElement;
        if (!img) return;

        const rect = img.getBoundingClientRect();
        const handle = target.getAttribute('data-handle') || '';

        setResizing(true);
        setResizeData({
          startX: e.clientX,
          startY: e.clientY,
          startWidth: rect.width,
          startHeight: rect.height,
          handle,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !resizeData) return;

      e.preventDefault();

      const container = document.querySelector('.tiptap-image-container.selected');
      if (!container) return;

      const img = container.querySelector('img') as HTMLImageElement;
      if (!img) return;

      const deltaX = e.clientX - resizeData.startX;
      const deltaY = e.clientY - resizeData.startY;

      let newWidth = resizeData.startWidth;
      let newHeight = resizeData.startHeight;

      const handle = resizeData.handle;

      // Calculate new dimensions based on handle position
      if (handle.includes('n')) {
        newHeight = Math.max(50, resizeData.startHeight - deltaY);
      }
      if (handle.includes('s')) {
        newHeight = Math.max(50, resizeData.startHeight + deltaY);
      }
      if (handle.includes('w')) {
        newWidth = Math.max(50, resizeData.startWidth - deltaX);
      }
      if (handle.includes('e')) {
        newWidth = Math.max(50, resizeData.startWidth + deltaX);
      }

      // Maintain aspect ratio if Shift is held
      if (e.shiftKey && resizeData.startWidth && resizeData.startHeight) {
        const aspectRatio = resizeData.startWidth / resizeData.startHeight;
        if (handle.includes('n') || handle.includes('s')) {
          newWidth = newHeight * aspectRatio;
        } else if (handle.includes('w') || handle.includes('e')) {
          newHeight = newWidth / aspectRatio;
        } else {
          // Corner handles with shift - maintain aspect ratio
          const diagonalChange = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          if (handle === 'nw') {
            newWidth = resizeData.startWidth - deltaX;
            newHeight = resizeData.startHeight - deltaY;
          } else if (handle === 'ne') {
            newWidth = resizeData.startWidth + deltaX;
            newHeight = resizeData.startHeight - deltaY;
          } else if (handle === 'sw') {
            newWidth = resizeData.startWidth - deltaX;
            newHeight = resizeData.startHeight + deltaY;
          } else if (handle === 'se') {
            newWidth = resizeData.startWidth + deltaX;
            newHeight = resizeData.startHeight + deltaY;
          }

          // Apply aspect ratio
          const widthRatio = newWidth / resizeData.startWidth;
          const heightRatio = newHeight / resizeData.startHeight;
          const ratio = Math.min(widthRatio, heightRatio);
          newWidth = resizeData.startWidth * ratio;
          newHeight = resizeData.startHeight * ratio;

          newWidth = Math.max(50, newWidth);
          newHeight = Math.max(50, newHeight);
        }
      }

      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      if (!resizing || !resizeData) return;

      const container = document.querySelector('.tiptap-image-container.selected');
      if (container) {
        const img = container.querySelector('img') as HTMLImageElement;
        if (img) {
          const newWidth = parseFloat(img.style.width);
          const newHeight = parseFloat(img.style.height);

          if (!isNaN(newWidth) && !isNaN(newHeight) && newWidth > 0 && newHeight > 0) {
            updateImageSize(img, newWidth, newHeight);
          }

          img.style.width = '';
          img.style.height = '';
        }
      }

      setResizing(false);
      setResizeData(null);
    };

    document.addEventListener('mousedown', handleMouseDown);
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor, resizing, resizeData]);

  // Handle image click to edit and show resize handles
  useEffect(() => {
    if (!editor) return;

    const addResizeHandles = (img: HTMLImageElement) => {
      let container = img.parentElement?.classList.contains('tiptap-image-container')
        ? img.parentElement as HTMLDivElement
        : null;

      // If no container, create one
      if (!container) {
        container = document.createElement('div');
        container.className = 'tiptap-image-container selected';
        img.parentNode?.insertBefore(container, img);
        container.appendChild(img);
      } else {
        // Container exists, just mark as selected and remove old handles
        container.classList.add('selected');
        const oldHandles = container.querySelectorAll('.resize-handle');
        oldHandles.forEach(h => h.remove());
      }

      // Add resize handles (8 handles: 4 corners + 4 edges)
      const handles = [
        { position: 'nw', cursor: 'nw-resize' }, // top-left
        { position: 'n', cursor: 'n-resize' },   // top
        { position: 'ne', cursor: 'ne-resize' }, // top-right
        { position: 'e', cursor: 'e-resize' },  // right
        { position: 'se', cursor: 'se-resize' }, // bottom-right
        { position: 's', cursor: 's-resize' },   // bottom
        { position: 'sw', cursor: 'sw-resize' }, // bottom-left
        { position: 'w', cursor: 'w-resize' },   // left
      ];

      handles.forEach(({ position, cursor }) => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.setAttribute('data-handle', position);
        handle.style.cursor = cursor;
        handle.style.position = 'absolute';
        handle.style.background = '#1890ff';
        handle.style.border = '2px solid #fff';
        handle.style.borderRadius = '50%';
        handle.style.width = '12px';
        handle.style.height = '12px';
        handle.style.zIndex = '1000';
        handle.style.boxSizing = 'border-box';
        handle.style.pointerEvents = 'auto';
        container.appendChild(handle);
      });

      // Force reflow to ensure handles are rendered
      container.offsetHeight;
    };

    const removeResizeHandles = () => {
      const containers = document.querySelectorAll('.tiptap-image-container');
      containers.forEach(container => {
        container.classList.remove('selected');
        const handles = container.querySelectorAll('.resize-handle');
        handles.forEach(h => h.remove());
        const img = container.querySelector('img');
        if (img && img.parentNode) {
          img.parentNode.insertBefore(img, container);
          container.remove();
        }
      });
    };

    editor.on('selectionUpdate', ({ editor }) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);

      // Remove all handles first
      removeResizeHandles();

      if (node && node.type.name === 'image') {
        // Find the image element in DOM - use more specific selector
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          // Try multiple ways to find the image
          const allImages = Array.from(document.querySelectorAll('.tiptap-editor img, .ProseMirror img')) as HTMLImageElement[];
          const nodeSrc = node.attrs.src || '';

          // Find image that matches the selected node
          let targetImg = allImages.find((img) => {
            const imgSrc = img.src || img.getAttribute('src') || '';
            return imgSrc === nodeSrc || imgSrc.includes(nodeSrc) || nodeSrc.includes(imgSrc);
          });

          // If not found by src, try to find by position in DOM
          if (!targetImg && allImages.length > 0) {
            // Get all image nodes from editor state
            const imageNodes: number[] = [];
            editor.state.doc.descendants((node, pos) => {
              if (node.type.name === 'image') {
                imageNodes.push(pos);
              }
            });

            // Find position of current node
            const currentPos = editor.state.selection.from;
            const nodeIndex = imageNodes.indexOf(currentPos);
            if (nodeIndex >= 0 && nodeIndex < allImages.length) {
              targetImg = allImages[nodeIndex];
            }
          }

          if (targetImg) {
            // Double check the image is in the DOM
            if (targetImg.isConnected) {
              addResizeHandles(targetImg);
              // Double check handles were added
              setTimeout(() => {
                const addedHandles = document.querySelectorAll('.tiptap-image-container.selected .resize-handle');
                if (addedHandles.length === 0) {
                  // Retry after a short delay
                  addResizeHandles(targetImg);
                }
              }, 10);
            }
          }
        });
      }
    });

    // Cleanup on click outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tiptap-image-container') && !target.closest('.resize-handle')) {
        removeResizeHandles();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [editor]);

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addColumns = () => {
    setColumnsModalOpen(true);
  };

  const handleInsertColumns = () => {
    if (columnsCount >= 2 && columnsCount <= 6) {
      // @ts-ignore - Custom command
      editor?.chain().focus().setColumns({
        columnCount: columnsCount,
        verticalAlign: columnsVerticalAlign
      }).run();
      setColumnsModalOpen(false);
      setColumnsCount(2);
      setColumnsVerticalAlign('top');
    } else {
      message.error("Please enter a number between 2 and 6");
    }
  };

  const handleInsertButton = () => {
    buttonForm.validateFields().then((values) => {
      const padding = `${values.paddingVertical || 8}px ${values.paddingHorizontal || 16}px`;
      const border = values.borderWidth ? `${values.borderWidth}px solid ${values.borderColor || '#000000'}` : 'none';

      // @ts-ignore - Custom command
      editor?.chain().focus().setButton({
        text: values.text || 'Button',
        href: values.href || '#',
        padding,
        background: values.background || '#1890ff',
        color: values.color || '#ffffff',
        borderRadius: `${values.borderRadius || 4}px`,
        border,
        fontSize: `${values.fontSize || 14}px`,
        fontWeight: values.fontWeight || '500',
      }).run();

      setButtonModalOpen(false);
      buttonForm.resetFields();
    });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`w-full ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border border-gray-200 border-b-0 rounded-t-lg bg-gray-50">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Bold (Ctrl+B)"
          >
            <BoldOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Italic (Ctrl+I)"
          >
            <ItalicOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Strikethrough"
          >
            <StrikethroughOutlined />
          </button>
        </div>

        {/* Text Size */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Select
            size="small"
            style={{ width: 100 }}
            placeholder="Size"
            value={editor.getAttributes('textStyle').fontSize || ""}
            onChange={(value) => {
              if (value) {
                editor.chain().focus().setFontSize(value).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
            }}
            options={[
              { value: "8px", label: "8px" },
              { value: "10px", label: "10px" },
              { value: "12px", label: "12px" },
              { value: "14px", label: "14px" },
              { value: "16px", label: "16px" },
              { value: "18px", label: "18px" },
              { value: "20px", label: "20px" },
              { value: "24px", label: "24px" },
              { value: "28px", label: "28px" },
              { value: "32px", label: "32px" },
              { value: "36px", label: "36px" },
              { value: "48px", label: "48px" },
            ]}
          />
        </div>

        {/* Text Color & Highlight */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <input
            type="color"
            onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || "#000000"}
            className="w-8 h-8 cursor-pointer rounded border border-gray-300"
            title="Text Color"
          />
          <input
            type="color"
            onInput={(e: any) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
            className="w-8 h-8 cursor-pointer rounded border border-gray-300"
            title="Highlight Color"
          />
        </div>

        {/* Heading */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Select
            size="small"
            style={{ width: 120 }}
            placeholder="Heading"
            value={
              editor.isActive('heading', { level: 1 }) ? "h1" :
                editor.isActive('heading', { level: 2 }) ? "h2" :
                  editor.isActive('heading', { level: 3 }) ? "h3" :
                    editor.isActive('heading', { level: 4 }) ? "h4" :
                      editor.isActive('heading', { level: 5 }) ? "h5" :
                        editor.isActive('heading', { level: 6 }) ? "h6" :
                          "paragraph"
            }
            onChange={(value) => {
              if (value === "paragraph") {
                editor.chain().focus().setParagraph().run();
              } else {
                const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            options={[
              { value: "paragraph", label: "Paragraph" },
              { value: "h1", label: "Heading 1" },
              { value: "h2", label: "Heading 2" },
              { value: "h3", label: "Heading 3" },
              { value: "h4", label: "Heading 4" },
              { value: "h5", label: "Heading 5" },
              { value: "h6", label: "Heading 6" },
            ]}
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Align Left"
          >
            <AlignLeftOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Align Center"
          >
            <AlignCenterOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Align Right"
          >
            <AlignRightOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Justify"
          >
            <span className="text-xs">≡</span>
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Bullet List"
          >
            <UnorderedListOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Numbered List"
          >
            <OrderedListOutlined />
          </button>
        </div>

        {/* Subscript/Superscript */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('subscript') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Subscript"
          >
            <span className="text-xs">x₂</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('superscript') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Superscript"
          >
            <span className="text-xs">x²</span>
          </button>
        </div>

        {/* Block Elements */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Blockquote"
          >
            <span className="text-xs">"</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Code Block"
          >
            <CodeOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="px-2 py-1 rounded hover:bg-gray-200 transition"
            title="Horizontal Rule"
          >
            <span className="text-xs">─</span>
          </button>
        </div>

        {/* Insert */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => {
              const url = editor.getAttributes('link').href;
              setLinkUrl(url || "");
              setLinkModalOpen(true);
            }}
            className={`px-2 py-1 rounded hover:bg-gray-200 transition ${editor.isActive('link') ? 'bg-blue-100 text-blue-700' : ''
              }`}
            title="Insert Link"
          >
            <LinkOutlined />
          </button>
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              handleImageUpload(file);
              return false;
            }}
            accept="image/*"
          >
            <button
              type="button"
              className="px-2 py-1 rounded hover:bg-gray-200 transition"
              title="Insert Image"
            >
              <PictureOutlined />
            </button>
          </Upload>
          <button
            type="button"
            onClick={() => setYoutubeModalOpen(true)}
            className="px-2 py-1 rounded hover:bg-gray-200 transition"
            title="Insert YouTube"
          >
            <YoutubeOutlined />
          </button>
          <button
            type="button"
            onClick={addTable}
            className="px-2 py-1 rounded hover:bg-gray-200 transition"
            title="Insert Table"
          >
            <TableOutlined />
          </button>
          <button
            type="button"
            onClick={addColumns}
            className="px-2 py-1 rounded hover:bg-gray-200 transition"
            title="Insert Columns Layout"
          >
            <ColumnWidthOutlined />
          </button>
          {/* Column Vertical Alignment - chỉ hiện khi đang ở trong column */}
          {editor.isActive('column') && (
            <Select
              size="small"
              style={{ width: 120 }}
              placeholder="V. Align"
              value={
                editor.getAttributes('column').verticalAlign || 'top'
              }
              onChange={(value: 'top' | 'middle' | 'bottom') => {
                // @ts-ignore
                editor.chain().focus().setColumnVerticalAlign(value).run();
              }}
              options={[
                { value: 'top', label: <><VerticalAlignTopOutlined /> Top</> },
                { value: 'middle', label: <><VerticalAlignMiddleOutlined /> Middle</> },
                { value: 'bottom', label: <><VerticalAlignBottomOutlined /> Bottom</> },
              ]}
            />
          )}
          <button
            type="button"
            onClick={() => setButtonModalOpen(true)}
            className="px-2 py-1 rounded hover:bg-gray-200 transition"
            title="Insert Button"
          >
            <AppstoreAddOutlined />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="px-2 py-1 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <UndoOutlined />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="px-2 py-1 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <RedoOutlined />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="border border-gray-200 border-t-0 rounded-b-lg min-h-[180px] bg-white">
        <EditorContent
          editor={editor}
          className="tiptap-editor w-full h-full p-3 focus:outline-none"
        />
      </div>

      {/* Link Modal */}
      <Modal
        title="Insert Link"
        open={linkModalOpen}
        onOk={setLink}
        onCancel={() => {
          setLinkModalOpen(false);
          setLinkUrl("");
        }}
      >
        <Input
          placeholder="Enter URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onPressEnter={setLink}
        />
      </Modal>

      {/* YouTube Modal */}
      <Modal
        title="Insert YouTube Video"
        open={youtubeModalOpen}
        onOk={insertYoutube}
        onCancel={() => {
          setYoutubeModalOpen(false);
          setYoutubeUrl("");
        }}
      >
        <Input
          placeholder="Paste YouTube URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          onPressEnter={insertYoutube}
        />
      </Modal>

      {/* Columns Modal */}
      <Modal
        title="Insert Columns Layout"
        open={columnsModalOpen}
        onOk={handleInsertColumns}
        onCancel={() => {
          setColumnsModalOpen(false);
          setColumnsCount(2);
          setColumnsVerticalAlign('top');
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Number of Columns (2-6)</label>
            <InputNumber
              min={2}
              max={6}
              value={columnsCount}
              onChange={(value) => setColumnsCount(value || 2)}
              style={{ width: '100%' }}
              placeholder="Enter number of columns"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Vertical Alignment</label>
            <Select
              value={columnsVerticalAlign}
              onChange={(value) => setColumnsVerticalAlign(value)}
              style={{ width: '100%' }}
              options={[
                { value: 'top', label: 'Top - Căn trên' },
                { value: 'middle', label: 'Middle - Căn giữa' },
                { value: 'bottom', label: 'Bottom - Căn dưới' },
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* Button Config Modal */}
      <Modal
        title="Insert Button"
        open={buttonModalOpen}
        onOk={handleInsertButton}
        onCancel={() => {
          setButtonModalOpen(false);
          buttonForm.resetFields();
        }}
        width={600}
      >
        <Form
          form={buttonForm}
          layout="vertical"
          initialValues={{
            text: 'Đăng ký',
            href: '#',
            paddingVertical: 8,
            paddingHorizontal: 16,
            background: '#1890ff',
            color: '#ffffff',
            borderRadius: 4,
            borderWidth: 0,
            borderColor: '#000000',
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          <Form.Item name="text" label="Button Text" rules={[{ required: true }]}>
            <Input placeholder="Đăng ký" />
          </Form.Item>
          <Form.Item name="href" label="Link URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="paddingVertical" label="Padding Vertical (px)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="paddingHorizontal" label="Padding Horizontal (px)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="background"
              label="Background Color"
              getValueFromEvent={(color) => {
                // ColorPicker returns an object with toHexString method or a string
                if (typeof color === 'string') {
                  return color;
                }
                if (color && typeof color.toHexString === 'function') {
                  return color.toHexString();
                }
                if (color && color.hex) {
                  return color.hex;
                }
                return '#1890ff';
              }}
            >
              <ColorPicker showText format="hex" />
            </Form.Item>
            <Form.Item
              name="color"
              label="Text Color"
              getValueFromEvent={(color) => {
                // ColorPicker returns an object with toHexString method or a string
                if (typeof color === 'string') {
                  return color;
                }
                if (color && typeof color.toHexString === 'function') {
                  return color.toHexString();
                }
                if (color && color.hex) {
                  return color.hex;
                }
                return '#ffffff';
              }}
            >
              <ColorPicker showText format="hex" />
            </Form.Item>
          </div>
          <Form.Item name="borderRadius" label="Border Radius (px)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="borderWidth" label="Border Width (px)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="borderColor"
            label="Border Color"
            shouldUpdate={(prevValues: any, currentValues: any) =>
              prevValues?.borderWidth !== currentValues?.borderWidth
            }
            getValueFromEvent={(color) => {
              // ColorPicker returns an object with toHexString method or a string
              if (typeof color === 'string') {
                return color;
              }
              if (color && typeof color.toHexString === 'function') {
                return color.toHexString();
              }
              if (color && color.hex) {
                return color.hex;
              }
              return '#000000';
            }}
          >
            {({ getFieldValue }) => {
              const borderWidth = getFieldValue('borderWidth');
              return borderWidth > 0 ? (
                <ColorPicker showText format="hex" />
              ) : (
                <div className="text-gray-400 text-sm">Set border width to enable</div>
              );
            }}
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="fontSize" label="Font Size (px)">
              <InputNumber min={8} max={72} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="fontWeight" label="Font Weight">
              <Select
                options={[
                  { value: '300', label: 'Light (300)' },
                  { value: '400', label: 'Normal (400)' },
                  { value: '500', label: 'Medium (500)' },
                  { value: '600', label: 'Semi Bold (600)' },
                  { value: '700', label: 'Bold (700)' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item shouldUpdate={(prev: any, curr: any) =>
            prev?.text !== curr?.text ||
            prev?.paddingVertical !== curr?.paddingVertical ||
            prev?.paddingHorizontal !== curr?.paddingHorizontal ||
            prev?.background !== curr?.background ||
            prev?.color !== curr?.color ||
            prev?.borderRadius !== curr?.borderRadius ||
            prev?.borderWidth !== curr?.borderWidth ||
            prev?.borderColor !== curr?.borderColor ||
            prev?.fontSize !== curr?.fontSize ||
            prev?.fontWeight !== curr?.fontWeight
          }>
            {() => {
              const values = buttonForm.getFieldsValue();
              const padding = `${values.paddingVertical || 8}px ${values.paddingHorizontal || 16}px`;
              const border = values.borderWidth > 0
                ? `${values.borderWidth}px solid ${values.borderColor || '#000000'}`
                : 'none';
              return (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <div className="inline-block" style={{
                    padding,
                    background: values.background || '#1890ff',
                    color: values.color || '#ffffff',
                    borderRadius: `${values.borderRadius || 4}px`,
                    border,
                    fontSize: `${values.fontSize || 14}px`,
                    fontWeight: values.fontWeight || '500',
                  }}>
                    {values.text || 'Đăng ký'}
                  </div>
                </div>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Configuration Modal */}
      <Modal
        title="Cấu hình Ảnh"
        open={imageModalOpen}
        onOk={handleImageConfigSave}
        onCancel={() => {
          setImageModalOpen(false);
          imageForm.resetFields();
          setSelectedImageNode(null);
        }}
        width={600}
      >
        <Form
          form={imageForm}
          layout="vertical"
          initialValues={{
            align: 'inline',
            width: '',
            height: '',
            alt: '',
          }}
        >
          <Form.Item name="src" label="URL Ảnh" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="alt" label="Alt Text">
            <Input placeholder="Mô tả ảnh" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="width" label="Chiều rộng (px)">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Tự động" />
            </Form.Item>
            <Form.Item name="height" label="Chiều cao (px)">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Tự động" />
            </Form.Item>
          </div>
          <Form.Item name="align" label="Bố cục">
            <Select
              options={[
                { value: 'inline', label: 'Trong dòng (Inline)' },
                { value: 'left', label: 'Trái - Văn bản bao quanh (Wrap Left)' },
                { value: 'right', label: 'Phải - Văn bản bao quanh (Wrap Right)' },
                { value: 'center', label: 'Giữa - Ngắt dòng (Break)' },
              ]}
            />
          </Form.Item>
          <Form.Item shouldUpdate={(prev: any, curr: any) =>
            prev?.src !== curr?.src ||
            prev?.width !== curr?.width ||
            prev?.height !== curr?.height ||
            prev?.align !== curr?.align
          }>
            {() => {
              const values = imageForm.getFieldsValue();
              const style: any = {};
              if (values.width) style.width = `${values.width}px`;
              if (values.height) style.height = `${values.height}px`;

              let alignStyle = '';
              if (values.align === 'left') {
                alignStyle = 'float: left; margin-right: 1em; margin-bottom: 0.5em;';
              } else if (values.align === 'right') {
                alignStyle = 'float: right; margin-left: 1em; margin-bottom: 0.5em;';
              } else if (values.align === 'center') {
                alignStyle = 'display: block; margin-left: auto; margin-right: auto;';
              }

              return values.src ? (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <div style={{ minHeight: '100px', border: '1px dashed #ddd', padding: '1em' }}>
                    <img
                      src={values.src}
                      alt={values.alt || ''}
                      style={{ ...style, ...{ maxWidth: '100%', height: 'auto' } }}
                      className={alignStyle ? '' : 'inline-block'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    {alignStyle && (
                      <style dangerouslySetInnerHTML={{
                        __html: `.preview-img { ${alignStyle} }`
                      }} />
                    )}
                  </div>
                </div>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Global Styles for TipTap */}
      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          min-height: 160px;
          outline: none;
          width: 100%;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif !important;
        }

        .tiptap-editor .ProseMirror:focus {
          outline: none;
        }

        /* Force SF Pro Display for all editor content - but allow inline color styles */
        .tiptap-editor .ProseMirror p,
        .tiptap-editor .ProseMirror h1,
        .tiptap-editor .ProseMirror h2,
        .tiptap-editor .ProseMirror h3,
        .tiptap-editor .ProseMirror h4,
        .tiptap-editor .ProseMirror h5,
        .tiptap-editor .ProseMirror h6,
        .tiptap-editor .ProseMirror div,
        .tiptap-editor .ProseMirror li,
        .tiptap-editor .ProseMirror td,
        .tiptap-editor .ProseMirror th {
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        
        /* Force SF Pro Display for spans without inline styles */
        .tiptap-editor .ProseMirror span:not([style*="color"]) {
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        
        /* Allow inline color styles to work - don't override color */
        .tiptap-editor .ProseMirror span[style*="color"],
        .tiptap-editor .ProseMirror [style*="color"] {
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif !important;
          /* Color will be applied via inline style - don't override */
        }
        
        /* Code blocks should still use monospace */
        .tiptap-editor .ProseMirror code,
        .tiptap-editor .ProseMirror pre {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
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

        .tiptap-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        .tiptap-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        .tiptap-editor h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }

        .tiptap-editor h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0;
        }

        .tiptap-editor h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.17em 0;
        }

        .tiptap-editor h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin: 1.5em 0;
        }

        .tiptap-editor ul,
        .tiptap-editor ol {
          padding-left: 1.5rem;
          margin: 0.5em 0;
          list-style-position: outside;
        }

        .tiptap-editor ul {
          list-style-type: disc;
        }

        .tiptap-editor ol {
          list-style-type: decimal;
        }

        .tiptap-editor li {
          margin: 0.25em 0;
          display: list-item;
          list-style-position: outside;
          padding-left: 0.5rem;
        }

        .tiptap-editor ul li {
          list-style-type: disc;
        }

        .tiptap-editor ol li {
          list-style-type: decimal;
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

        .tiptap-editor u {
          text-decoration: underline;
        }

        .tiptap-editor code {
          background-color: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }

        .tiptap-editor pre {
          background-color: #f4f4f4;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .tiptap-editor pre code {
          background-color: transparent;
          padding: 0;
        }

        .tiptap-editor blockquote {
          border-left: 4px solid #ccc;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }

        .tiptap-editor hr {
          border: none;
          border-top: 2px solid #ccc;
          margin: 2em 0;
        }

        .tiptap-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }

        .tiptap-editor table td,
        .tiptap-editor table th {
          border: 1px solid #ccc;
          padding: 0.5em;
        }

        .tiptap-editor table th {
          background-color: #f4f4f4;
          font-weight: bold;
        }

        .tiptap-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .tiptap-editor .tiptap-image {
          cursor: pointer;
          transition: opacity 0.2s;
          position: relative;
        }

        .tiptap-editor .tiptap-image:hover {
          opacity: 0.8;
          outline: 2px solid #1890ff;
          outline-offset: 2px;
        }

        .tiptap-image-container {
          position: relative;
          display: inline-block;
        }

        .tiptap-image-container.selected {
          outline: 2px solid #1890ff;
          outline-offset: 2px;
          position: relative;
        }

        .tiptap-image-container.selected .tiptap-image {
          outline: none;
        }

        .resize-handle {
          position: absolute;
          background: #1890ff;
          border: 2px solid #fff;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          z-index: 1000;
          box-sizing: border-box;
          pointer-events: auto;
        }

        .resize-handle:hover {
          background: #40a9ff;
          transform: scale(1.3);
          border-color: #fff;
        }

        /* Corner handles */
        .tiptap-image-container.selected .resize-handle[data-handle="nw"] {
          top: -6px;
          left: -6px;
        }

        .tiptap-image-container.selected .resize-handle[data-handle="ne"] {
          top: -6px;
          right: -6px;
        }

        .tiptap-image-container.selected .resize-handle[data-handle="se"] {
          bottom: -6px;
          right: -6px;
        }

        .tiptap-image-container.selected .resize-handle[data-handle="sw"] {
          bottom: -6px;
          left: -6px;
        }

        /* Edge handles */
        .tiptap-image-container.selected .resize-handle[data-handle="n"] {
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .tiptap-image-container.selected .resize-handle[data-handle="s"] {
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .tiptap-image-container.selected .resize-handle[data-handle="e"] {
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
        }

        .tiptap-image-container.selected .resize-handle[data-handle="w"] {
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
        }

        .tiptap-image-container.selected .resize-handle[data-handle="n"]:hover,
        .tiptap-image-container.selected .resize-handle[data-handle="s"]:hover {
          transform: translateX(-50%) scale(1.2);
        }

        .tiptap-image-container.selected .resize-handle[data-handle="e"]:hover,
        .tiptap-image-container.selected .resize-handle[data-handle="w"]:hover {
          transform: translateY(-50%) scale(1.2);
        }

        .tiptap-editor .tiptap-image.align-left {
          float: left;
          margin-right: 1em;
          margin-bottom: 0.5em;
        }

        .tiptap-editor .tiptap-image.align-right {
          float: right;
          margin-left: 1em;
          margin-bottom: 0.5em;
        }

        .tiptap-editor .tiptap-image.align-center {
          display: block;
          margin-left: auto;
          margin-right: auto;
          clear: both;
        }

        .tiptap-editor .tiptap-image.align-inline {
          display: inline-block;
          vertical-align: middle;
        }

        /* Clear floats after images */
        .tiptap-editor .tiptap-image.align-left + *,
        .tiptap-editor .tiptap-image.align-right + * {
          clear: none;
        }

        .tiptap-editor::after {
          content: "";
          display: table;
          clear: both;
        }

        .tiptap-editor .youtube-embed {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          margin: 1em 0;
        }

        .tiptap-editor .youtube-embed iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .tiptap-editor [data-placeholder]::before {
          content: attr(data-placeholder);
          float: left;
          color: #999;
          pointer-events: none;
          height: 0;
        }

        .tiptap-editor .tiptap-columns {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin: 1em 0;
          width: 100%;
          box-sizing: border-box;
        }

        /* Dynamic column width based on column count */
        .tiptap-editor .tiptap-columns[data-column-count="2"] .tiptap-column {
          flex: 0 0 calc((100% - 1rem) / 2);
          max-width: calc((100% - 1rem) / 2);
          width: calc((100% - 1rem) / 2);
        }

        .tiptap-editor .tiptap-columns[data-column-count="3"] .tiptap-column {
          flex: 0 0 calc((100% - 2rem) / 3);
          max-width: calc((100% - 2rem) / 3);
          width: calc((100% - 2rem) / 3);
        }

        .tiptap-editor .tiptap-columns[data-column-count="4"] .tiptap-column {
          flex: 0 0 calc((100% - 3rem) / 4);
          max-width: calc((100% - 3rem) / 4);
          width: calc((100% - 3rem) / 4);
        }

        .tiptap-editor .tiptap-columns[data-column-count="5"] .tiptap-column {
          flex: 0 0 calc((100% - 4rem) / 5);
          max-width: calc((100% - 4rem) / 5);
          width: calc((100% - 4rem) / 5);
        }

        .tiptap-editor .tiptap-columns[data-column-count="6"] .tiptap-column {
          flex: 0 0 calc((100% - 5rem) / 6);
          max-width: calc((100% - 5rem) / 6);
          width: calc((100% - 5rem) / 6);
        }

        /* Default for any other column count */
        .tiptap-editor .tiptap-column {
          flex: 1 1 0;
          min-width: 0;
          padding: 0.5rem;
          border: 1px dashed #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          overflow: hidden;
          word-wrap: break-word;
          overflow-wrap: break-word;
          display: flex;
          flex-direction: column;
        }

        /* Vertical alignment classes */
        .tiptap-editor .tiptap-column.vertical-align-top {
          justify-content: flex-start;
        }

        .tiptap-editor .tiptap-column.vertical-align-middle {
          justify-content: center;
        }

        .tiptap-editor .tiptap-column.vertical-align-bottom {
          justify-content: flex-end;
        }

        .tiptap-editor .tiptap-column:focus-within {
          border-color: #4A90E2;
          border-style: solid;
        }

        /* Đảm bảo tất cả nội dung trong column không overflow */
        .tiptap-editor .tiptap-column * {
          max-width: 100%;
          box-sizing: border-box;
        }

        /* YouTube embed trong column - đảm bảo giữ tỷ lệ 16:9 và fit trong column */
        .tiptap-editor .tiptap-column .youtube-embed {
          position: relative;
          padding-bottom: 56.25% !important; /* 16:9 ratio */
          height: 0 !important;
          overflow: hidden !important;
          margin: 1em 0;
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .tiptap-editor .tiptap-column .youtube-embed iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          border: 0 !important;
        }

        /* Nếu có div wrapper với data-youtube-video */
        .tiptap-editor .tiptap-column div[data-youtube-video] {
          position: relative;
          padding-bottom: 56.25% !important;
          height: 0 !important;
          overflow: hidden !important;
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .tiptap-editor .tiptap-column div[data-youtube-video] iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
        }

        /* Hình ảnh và video trong column */
        .tiptap-editor .tiptap-column img,
        .tiptap-editor .tiptap-column video {
          max-width: 100% !important;
          height: auto !important;
          width: 100% !important;
        }

        /* Table trong column */
        .tiptap-editor .tiptap-column table {
          width: 100% !important;
          max-width: 100%;
          table-layout: auto;
        }

        /* Tablet: Maximum 3 columns */
        @media (min-width: 769px) and (max-width: 1024px) {
          .tiptap-editor .tiptap-columns[data-column-count="4"] .tiptap-column,
          .tiptap-editor .tiptap-columns[data-column-count="5"] .tiptap-column,
          .tiptap-editor .tiptap-columns[data-column-count="6"] .tiptap-column {
            flex: 0 0 calc((100% - 2rem) / 3) !important;
            max-width: calc((100% - 2rem) / 3) !important;
            width: calc((100% - 2rem) / 3) !important;
          }
        }

        /* Mobile: Maximum 2 columns */
        @media (max-width: 768px) {
          .tiptap-editor .tiptap-columns[data-column-count="3"] .tiptap-column,
          .tiptap-editor .tiptap-columns[data-column-count="4"] .tiptap-column,
          .tiptap-editor .tiptap-columns[data-column-count="5"] .tiptap-column,
          .tiptap-editor .tiptap-columns[data-column-count="6"] .tiptap-column {
            flex: 0 0 calc((100% - 1rem) / 2) !important;
            max-width: calc((100% - 1rem) / 2) !important;
            width: calc((100% - 1rem) / 2) !important;
          }

          /* Very small mobile: stack all columns */
          @media (max-width: 480px) {
            .tiptap-editor .tiptap-columns {
              flex-direction: column;
            }
            
            .tiptap-editor .tiptap-columns .tiptap-column {
              flex: 1 1 100% !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        }

        .tiptap-editor .tiptap-button {
          display: inline-block;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .tiptap-editor .tiptap-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

