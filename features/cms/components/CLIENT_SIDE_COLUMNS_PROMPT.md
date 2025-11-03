# Prompt AI: Client-Side Responsive Columns Logic

## 🎯 Yêu cầu

Bạn cần implement logic responsive cho **tiptap-columns** khi render HTML trên client-side. 

## 📋 Context

Khi CMS editor tạo HTML với columns, HTML output có cấu trúc:
```html
<div data-type="columns" data-column-count="6" class="tiptap-columns">
  <div data-type="column" class="tiptap-column">Content 1</div>
  <div data-type="column" class="tiptap-column">Content 2</div>
  <div data-type="column" class="tiptap-column">Content 3</div>
  <div data-type="column" class="tiptap-column">Content 4</div>
  <div data-type="column" class="tiptap-column">Content 5</div>
  <div data-type="column" class="tiptap-column">Content 6</div>
</div>
```

## 🔧 Vấn đề hiện tại

- Columns hiện tại có width cố định theo số cột
- Trên màn hình nhỏ, columns bị nén và content không đọc được
- Cần tự động điều chỉnh số cột/hàng theo breakpoint

## ✅ Yêu cầu responsive

### Desktop (> 1024px):
- Giữ nguyên số cột như `data-column-count`
- Ví dụ: `data-column-count="6"` → hiển thị 6 cột

### Tablet (769px - 1024px):
- **Tối đa 3 cột/hàng**
- Nếu có 4, 5, hoặc 6 cột → tự động hiển thị 3 cột/hàng, wrap xuống dòng
- Ví dụ: 6 cột → 2 hàng x 3 cột

### Mobile (≤ 768px):
- **Tối đa 2 cột/hàng**
- Nếu có 3, 4, 5, hoặc 6 cột → tự động hiển thị 2 cột/hàng, wrap xuống dòng
- Ví dụ: 6 cột → 3 hàng x 2 cột

### Very Small Mobile (≤ 480px):
- Stack tất cả columns thành 1 cột (full width)
- Mỗi column chiếm 100% width

## 🎨 CSS cần implement

```css
/* Container */
.tiptap-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

/* Dynamic width based on column count */
.tiptap-columns[data-column-count="2"] .tiptap-column {
  flex: 0 0 calc((100% - 1rem) / 2);
  max-width: calc((100% - 1rem) / 2);
  width: calc((100% - 1rem) / 2);
}

.tiptap-columns[data-column-count="3"] .tiptap-column {
  flex: 0 0 calc((100% - 2rem) / 3);
  max-width: calc((100% - 2rem) / 3);
  width: calc((100% - 2rem) / 3);
}

.tiptap-columns[data-column-count="4"] .tiptap-column {
  flex: 0 0 calc((100% - 3rem) / 4);
  max-width: calc((100% - 3rem) / 4);
  width: calc((100% - 3rem) / 4);
}

.tiptap-columns[data-column-count="5"] .tiptap-column {
  flex: 0 0 calc((100% - 4rem) / 5);
  max-width: calc((100% - 4rem) / 5);
  width: calc((100% - 4rem) / 5);
}

.tiptap-columns[data-column-count="6"] .tiptap-column {
  flex: 0 0 calc((100% - 5rem) / 6);
  max-width: calc((100% - 5rem) / 6);
  width: calc((100% - 5rem) / 6);
}

/* Default column */
.tiptap-column {
  flex: 1 1 0;
  min-width: 0;
  padding: 0.5rem;
  box-sizing: border-box;
  overflow: hidden;
  word-wrap: break-word;
}

/* Tablet: Maximum 3 columns per row */
@media (min-width: 769px) and (max-width: 1024px) {
  .tiptap-columns[data-column-count="4"] .tiptap-column,
  .tiptap-columns[data-column-count="5"] .tiptap-column,
  .tiptap-columns[data-column-count="6"] .tiptap-column {
    flex: 0 0 calc((100% - 2rem) / 3) !important;
    max-width: calc((100% - 2rem) / 3) !important;
    width: calc((100% - 2rem) / 3) !important;
  }
}

/* Mobile: Maximum 2 columns per row */
@media (max-width: 768px) {
  .tiptap-columns[data-column-count="3"] .tiptap-column,
  .tiptap-columns[data-column-count="4"] .tiptap-column,
  .tiptap-columns[data-column-count="5"] .tiptap-column,
  .tiptap-columns[data-column-count="6"] .tiptap-column {
    flex: 0 0 calc((100% - 1rem) / 2) !important;
    max-width: calc((100% - 1rem) / 2) !important;
    width: calc((100% - 1rem) / 2) !important;
  }
}

/* Very small mobile: Stack all columns */
@media (max-width: 480px) {
  .tiptap-columns {
    flex-direction: column;
  }
  
  .tiptap-columns .tiptap-column {
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
```

## 📝 Logic tính toán

**Formula cho width mỗi column:**
```
width = (100% - (gap × (columnCount - 1))) / columnCount
```

**Ví dụ:**
- 2 cột, gap 1rem: `(100% - 1rem) / 2`
- 3 cột, gap 1rem: `(100% - 2rem) / 3`
- 6 cột, gap 1rem: `(100% - 5rem) / 6`

**Responsive override:**
- Tablet (4,5,6 cột) → Force thành 3 cột: `(100% - 2rem) / 3`
- Mobile (3,4,5,6 cột) → Force thành 2 cột: `(100% - 1rem) / 2`

## 🔍 Lưu ý quan trọng

1. **Flex-wrap**: Container phải có `flex-wrap: wrap` để columns tự động xuống dòng khi không đủ chỗ
2. **Gap calculation**: Nhớ tính gap giữa các cột trong công thức width
3. **Box-sizing**: Luôn dùng `box-sizing: border-box` để tính width chính xác
4. **Min-width**: Đặt `min-width: 0` để tránh flex item overflow
5. **Overflow**: Columns nên có `overflow: hidden` và `word-wrap: break-word` để content không bị tràn

## 🎯 Test cases

### Test 1: 6 columns
- Desktop: 6 cột trên 1 hàng
- Tablet: 3 cột/hàng → 2 hàng
- Mobile: 2 cột/hàng → 3 hàng
- Very small: 1 cột/hàng → 6 hàng

### Test 2: 4 columns
- Desktop: 4 cột trên 1 hàng
- Tablet: 3 cột/hàng → 2 hàng (3 + 1)
- Mobile: 2 cột/hàng → 2 hàng
- Very small: 1 cột/hàng → 4 hàng

### Test 3: 2 columns
- Desktop: 2 cột trên 1 hàng
- Tablet: 2 cột trên 1 hàng
- Mobile: 2 cột trên 1 hàng
- Very small: 1 cột/hàng → 2 hàng

## 💡 Implementation checklist

- [ ] Add `flex-wrap: wrap` to `.tiptap-columns`
- [ ] Implement dynamic width calculation based on `data-column-count`
- [ ] Add tablet media query (769px - 1024px) - max 3 columns
- [ ] Add mobile media query (≤ 768px) - max 2 columns
- [ ] Add very small mobile media query (≤ 480px) - stack all
- [ ] Test with different column counts (2, 3, 4, 5, 6)
- [ ] Verify content doesn't overflow
- [ ] Verify columns wrap correctly on each breakpoint
- [ ] Test on actual devices/simulators

## 📦 Class names cần dùng

- Container: `.tiptap-columns` hoặc `[data-type="columns"]`
- Column: `.tiptap-column` hoặc `[data-type="column"]`
- Attribute: `data-column-count` chứa số cột (2, 3, 4, 5, 6)

---

**Hãy implement CSS responsive cho columns theo yêu cầu trên, đảm bảo columns tự động wrap và điều chỉnh số cột/hàng theo breakpoint.**

