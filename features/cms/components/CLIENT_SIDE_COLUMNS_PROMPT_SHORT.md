# 📋 Prompt ngắn gọn cho AI

```
Implement responsive CSS cho tiptap-columns khi render HTML trên client-side.

HTML structure:
<div data-type="columns" data-column-count="6" class="tiptap-columns">
  <div data-type="column" class="tiptap-column">...</div>
  ...
</div>

Yêu cầu:
- Desktop (>1024px): Giữ nguyên số cột từ data-column-count
- Tablet (769-1024px): Tối đa 3 cột/hàng, wrap tự động
- Mobile (≤768px): Tối đa 2 cột/hàng, wrap tự động  
- Very small (≤480px): Stack thành 1 cột (full width)

CSS cần:
- Container: display: flex; flex-wrap: wrap; gap: 1rem
- Tính width động: calc((100% - gap*(n-1)) / n) với n = số cột
- Media queries để override width trên tablet/mobile
- Box-sizing: border-box, overflow: hidden, word-wrap: break-word

Ví dụ: 6 cột trên tablet → 3 cột/hàng x 2 hàng
Ví dụ: 6 cột trên mobile → 2 cột/hàng x 3 hàng
```

---

## 🚀 Copy prompt này vào AI:

Implement responsive CSS cho tiptap-columns khi render HTML trên client-side. HTML có cấu trúc: `<div data-type="columns" data-column-count="6" class="tiptap-columns">` chứa nhiều `<div data-type="column" class="tiptap-column">`. Yêu cầu: Desktop (>1024px) giữ nguyên số cột, Tablet (769-1024px) tối đa 3 cột/hàng với flex-wrap, Mobile (≤768px) tối đa 2 cột/hàng, Very small (≤480px) stack 1 cột. CSS: Container dùng flexbox với flex-wrap và gap 1rem. Tính width động theo formula: `calc((100% - gap*(columnCount-1)) / columnCount)`. Dùng media queries để override width trên tablet/mobile. Đảm bảo box-sizing border-box, overflow hidden, word-wrap break-word để content không tràn. Ví dụ 6 cột trên tablet → 3 cột/hàng x 2 hàng, trên mobile → 2 cột/hàng x 3 hàng.

