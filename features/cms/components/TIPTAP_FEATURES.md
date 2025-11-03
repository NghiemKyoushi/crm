# CmsTiptapEditor - Hướng dẫn Render HTML cho Client

## 📋 Mục đích
File này mô tả chi tiết cách render HTML content được tạo ra từ CMS editor. Sử dụng để prompt AI client-side render chính xác content từ CMS.

## 🎯 Tổng quan
Content được lưu dưới dạng HTML. Client cần parse và render HTML với đúng styles và structure.

## 📦 Extensions và HTML Structure

### 1. **Text Formatting (StarterKit)**

#### Bold
```html
<strong>Bold text</strong>
```

#### Italic
```html
<em>Italic text</em>
```

#### Strikethrough
```html
<s>Strikethrough text</s>
```

#### Underline
```html
<u>Underlined text</u>
```

#### Inline Code
```html
<code>inline code</code>
```

#### Heading (H1-H6)
```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
```

#### Paragraph
```html
<p>Paragraph text</p>
```

### 2. **Lists**

#### Bullet List
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

#### Ordered List
```html
<ol>
  <li>Item 1</li>
  <li>Item 2</li>
</ol>
```

### 3. **Link Extension**

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 underline cursor-pointer">Link text</a>
```

**Attributes:**
- `href`: URL
- `target`: "_blank" (default)
- `rel`: "noopener noreferrer nofollow"
- `class`: "text-blue-600 underline cursor-pointer"

### 4. **Image Extension (Enhanced)**

```html
<img 
  src="https://example.com/image.jpg" 
  alt="Image description"
  title="Image title"
  width="800"
  height="600"
  data-align="center"
  style="display: block; margin-left: auto; margin-right: auto; width: 800px; height: 600px;"
  class="tiptap-image align-center"
/>
```

**Attributes:**
- `src`: URL của ảnh (required)
- `alt`: Mô tả ảnh
- `title`: Title tooltip
- `width`: Chiều rộng (px hoặc số)
- `height`: Chiều cao (px hoặc số)
- `data-align`: Alignment - một trong: `"inline"`, `"left"`, `"right"`, `"center"`
- `class`: Luôn có `tiptap-image` + class alignment:
  - `align-inline`: Inline với text
  - `align-left`: Float left, text wrap around
  - `align-right`: Float right, text wrap around
  - `align-center`: Block center, break line

**Style theo alignment:**
- `left`: `float: left; margin-right: 1em; margin-bottom: 0.5em;`
- `right`: `float: right; margin-left: 1em; margin-bottom: 0.5em;`
- `center`: `display: block; margin-left: auto; margin-right: auto;`
- `inline`: `display: inline-block;`

### 5. **Text Alignment**

```html
<div style="text-align: left;">Left aligned</div>
<div style="text-align: center;">Center aligned</div>
<div style="text-align: right;">Right aligned</div>
<div style="text-align: justify;">Justified text</div>
```

Áp dụng cho `heading` và `paragraph` elements.

### 6. **Font Size**

```html
<span style="font-size: 16px;">Text with font size</span>
```

**Available sizes:** 8px, 10px, 12px, 14px, 16px, 18px, 20px, 24px, 28px, 32px, 36px, 48px

### 7. **Font Family**

```html
<span style="font-family: Roboto, sans-serif;">Text with font</span>
```

Hoặc với font có khoảng trắng:
```html
<span style="font-family: &quot;Open Sans&quot;, sans-serif;">Text with font</span>
```

**Available fonts:**
- Default (no font-family)
- Roboto
- Open Sans
- Lato
- Montserrat
- Poppins
- Raleway
- Ubuntu
- Playfair Display
- Merriweather
- Oswald
- Source Sans Pro
- Lora
- Nunito
- PT Sans
- Dancing Script
- Pacifico
- Comfortaa
- Crimson Text
- Libre Baskerville

### 8. **Text Color**

```html
<span style="color: #ff0000;">Red text</span>
```

Color dưới dạng hex code (ví dụ: `#000000`, `#ff0000`, `#1890ff`)

### 9. **Highlight**

```html
<mark style="background-color: #ffff00;">Highlighted text</mark>
```

Hoặc:
```html
<mark data-color="#ffff00" style="background-color: #ffff00;">Highlighted</mark>
```

### 10. **Subscript**

```html
<sub>Subscript text</sub>
```

### 11. **Superscript**

```html
<sup>Superscript text</sup>
```

### 12. **Blockquote**

```html
<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">
  Quoted text
</blockquote>
```

**CSS Classes:** `border-l-4 border-gray-300 pl-4 italic my-4`

### 13. **Code Block**

```html
<pre class="bg-gray-100 p-4 rounded font-mono text-sm"><code>Code here</code></pre>
```

**CSS Classes:** `bg-gray-100 p-4 rounded font-mono text-sm`

### 14. **Horizontal Rule**

```html
<hr />
```

**CSS:** `border: none; border-top: 2px solid #ccc; margin: 2em 0;`

### 15. **YouTube Embed**

```html
<div class="youtube-embed">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    width="640" 
    height="480"
    frameborder="0"
    allowfullscreen
  ></iframe>
</div>
```

**CSS cho `.youtube-embed`:**
```css
.youtube-embed {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 ratio */
  height: 0;
  overflow: hidden;
  margin: 1em 0;
}

.youtube-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

**Video ID extraction:** Từ URL YouTube (youtube.com/watch?v=ID hoặc youtu.be/ID)

### 16. **Table**

```html
<table class="border-collapse border border-gray-300 w-full my-4">
  <tr>
    <th class="border border-gray-300 px-4 py-2">Header 1</th>
    <th class="border border-gray-300 px-4 py-2">Header 2</th>
  </tr>
  <tr>
    <td class="border border-gray-300 px-4 py-2">Cell 1</td>
    <td class="border border-gray-300 px-4 py-2">Cell 2</td>
  </tr>
</table>
```

**CSS Classes:**
- Table: `border-collapse border border-gray-300 w-full my-4`
- TH/TD: `border border-gray-300 px-4 py-2`
- TH có thêm: `background-color: #f4f4f4; font-weight: bold;`

### 17. **Columns Layout (Custom)**

```html
<div data-type="columns" data-column-count="2" class="tiptap-columns" style="display: flex; gap: 1rem; margin: 1em 0; width: 100%; box-sizing: border-box;">
  <div data-type="column" class="tiptap-column" style="flex: 1; min-width: 0; padding: 0.5rem; box-sizing: border-box; overflow: hidden; word-wrap: break-word; overflow-wrap: break-word;">
    <p>Content cột 1</p>
  </div>
  <div data-type="column" class="tiptap-column" style="flex: 1; min-width: 0; padding: 0.5rem; box-sizing: border-box; overflow: hidden; word-wrap: break-word; overflow-wrap: break-word;">
    <p>Content cột 2</p>
  </div>
</div>
```

**Attributes:**
- Container (`div[data-type="columns"]`):
  - `data-type="columns"` (required)
  - `data-column-count`: Số cột (2-6, default: 2)
  - `class`: `tiptap-columns`
  - `style`: Flexbox layout với gap

- Column (`div[data-type="column"]`):
  - `data-type="column"` (required)
  - `class`: `tiptap-column`
  - `style`: Flex properties

**CSS:**
```css
.tiptap-columns {
  display: flex;
  gap: 1rem;
  margin: 1em 0;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-column {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  box-sizing: border-box;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Responsive: Mobile → 1 column */
@media (max-width: 768px) {
  .tiptap-columns {
    flex-direction: column;
  }
  
  .tiptap-column {
    width: 100%;
    max-width: 100%;
  }
}
```

**Special handling trong columns:**
- Images: `max-width: 100%; height: auto;`
- YouTube: `width: 100%; padding-bottom: 56.25%;`
- Tables: `width: 100%; max-width: 100%;`

### 18. **Button (Custom)**

```html
<a 
  data-type="button" 
  href="https://example.com" 
  class="tiptap-button"
  style="display: inline-block; padding: 8px 16px; background: #1890ff; color: #ffffff; border-radius: 4px; border: none; font-size: 14px; font-weight: 500; text-decoration: none; cursor: pointer;"
>
  Button Text
</a>
```

**Attributes:**
- `data-type="button"` (required để identify button)
- `href`: Link URL
- `class`: `tiptap-button`
- `style`: Inline styles với các properties:
  - `display: inline-block;`
  - `padding`: Format `{vertical}px {horizontal}px` (ví dụ: `8px 16px`)
  - `background`: Hex color (ví dụ: `#1890ff`)
  - `color`: Hex color (ví dụ: `#ffffff`)
  - `border-radius`: `{value}px` (ví dụ: `4px`)
  - `border`: `none` hoặc `{width}px solid {color}` (ví dụ: `2px solid #000000`)
  - `font-size`: `{value}px` (ví dụ: `14px`)
  - `font-weight`: `300`, `400`, `500`, `600`, hoặc `700`
  - `text-decoration: none;`
  - `cursor: pointer;`

**CSS:**
```css
.tiptap-button {
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.tiptap-button:hover {
  opacity: 0.9;
}
```

## 🎨 CSS Styles cần thiết cho Client

### Base Styles

```css
/* Container */
.tiptap-editor, .tiptap-content {
  min-height: 160px;
  width: 100%;
}

/* Paragraphs */
.tiptap-editor p,
.tiptap-content p {
  margin: 0.5em 0;
}

.tiptap-editor p:first-child,
.tiptap-content p:first-child {
  margin-top: 0;
}

.tiptap-editor p:last-child,
.tiptap-content p:last-child {
  margin-bottom: 0;
}

/* Headings */
.tiptap-editor h1,
.tiptap-content h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.tiptap-editor h2,
.tiptap-content h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
}

.tiptap-editor h3,
.tiptap-content h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
}

.tiptap-editor h4,
.tiptap-content h4 {
  font-size: 1em;
  font-weight: bold;
  margin: 1em 0;
}

.tiptap-editor h5,
.tiptap-content h5 {
  font-size: 0.83em;
  font-weight: bold;
  margin: 1.17em 0;
}

.tiptap-editor h6,
.tiptap-content h6 {
  font-size: 0.67em;
  font-weight: bold;
  margin: 1.5em 0;
}

/* Lists */
.tiptap-editor ul,
.tiptap-editor ol,
.tiptap-content ul,
.tiptap-content ol {
  padding-left: 1.5rem;
  margin: 0.5em 0;
  list-style-position: outside;
}

.tiptap-editor ul,
.tiptap-content ul {
  list-style-type: disc;
}

.tiptap-editor ol,
.tiptap-content ol {
  list-style-type: decimal;
}

.tiptap-editor li,
.tiptap-content li {
  margin: 0.25em 0;
  display: list-item;
  list-style-position: outside;
  padding-left: 0.5rem;
}

/* Text formatting */
.tiptap-editor strong,
.tiptap-content strong {
  font-weight: 700;
}

.tiptap-editor em,
.tiptap-content em {
  font-style: italic;
}

.tiptap-editor s,
.tiptap-content s {
  text-decoration: line-through;
}

.tiptap-editor u,
.tiptap-content u {
  text-decoration: underline;
}

/* Code */
.tiptap-editor code,
.tiptap-content code {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.tiptap-editor pre,
.tiptap-content pre {
  background-color: #f4f4f4;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
}

.tiptap-editor pre code,
.tiptap-content pre code {
  background-color: transparent;
  padding: 0;
}

/* Blockquote */
.tiptap-editor blockquote,
.tiptap-content blockquote {
  border-left: 4px solid #ccc;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
}

/* Horizontal Rule */
.tiptap-editor hr,
.tiptap-content hr {
  border: none;
  border-top: 2px solid #ccc;
  margin: 2em 0;
}

/* Table */
.tiptap-editor table,
.tiptap-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.tiptap-editor table td,
.tiptap-editor table th,
.tiptap-content table td,
.tiptap-content table th {
  border: 1px solid #ccc;
  padding: 0.5em;
}

.tiptap-editor table th,
.tiptap-content table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

/* Images */
.tiptap-editor img,
.tiptap-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.tiptap-editor .tiptap-image,
.tiptap-content .tiptap-image {
  cursor: pointer;
  transition: opacity 0.2s;
  position: relative;
}

/* Image alignment */
.tiptap-editor .tiptap-image.align-left,
.tiptap-content .tiptap-image.align-left {
  float: left;
  margin-right: 1em;
  margin-bottom: 0.5em;
}

.tiptap-editor .tiptap-image.align-right,
.tiptap-content .tiptap-image.align-right {
  float: right;
  margin-left: 1em;
  margin-bottom: 0.5em;
}

.tiptap-editor .tiptap-image.align-center,
.tiptap-content .tiptap-image.align-center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  clear: both;
}

.tiptap-editor .tiptap-image.align-inline,
.tiptap-content .tiptap-image.align-inline {
  display: inline-block;
  vertical-align: middle;
}

/* Clear floats */
.tiptap-editor::after,
.tiptap-content::after {
  content: "";
  display: table;
  clear: both;
}

/* YouTube Embed */
.tiptap-editor .youtube-embed,
.tiptap-content .youtube-embed {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 ratio */
  height: 0;
  overflow: hidden;
  margin: 1em 0;
}

.tiptap-editor .youtube-embed iframe,
.tiptap-content .youtube-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Columns */
.tiptap-editor .tiptap-columns,
.tiptap-content .tiptap-columns {
  display: flex;
  gap: 1rem;
  margin: 1em 0;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-editor .tiptap-column,
.tiptap-content .tiptap-column {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  box-sizing: border-box;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Responsive columns */
@media (max-width: 768px) {
  .tiptap-editor .tiptap-columns,
  .tiptap-content .tiptap-columns {
    flex-direction: column;
  }
  
  .tiptap-editor .tiptap-column,
  .tiptap-content .tiptap-column {
    width: 100%;
    max-width: 100%;
  }
}

/* Content trong columns */
.tiptap-editor .tiptap-column img,
.tiptap-editor .tiptap-column video,
.tiptap-content .tiptap-column img,
.tiptap-content .tiptap-column video {
  max-width: 100% !important;
  height: auto !important;
  width: 100% !important;
}

.tiptap-editor .tiptap-column .youtube-embed,
.tiptap-content .tiptap-column .youtube-embed {
  position: relative;
  padding-bottom: 56.25% !important;
  height: 0 !important;
  overflow: hidden !important;
  margin: 1em 0;
  max-width: 100% !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.tiptap-editor .tiptap-column .youtube-embed iframe,
.tiptap-content .tiptap-column .youtube-embed iframe {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  border: 0 !important;
}

.tiptap-editor .tiptap-column table,
.tiptap-content .tiptap-column table {
  width: 100% !important;
  max-width: 100%;
  table-layout: auto;
}

/* Button */
.tiptap-editor .tiptap-button,
.tiptap-content .tiptap-button {
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.tiptap-editor .tiptap-button:hover,
.tiptap-content .tiptap-button:hover {
  opacity: 0.9;
}
```

## 🔍 Cách Parse và Render HTML

### Bước 1: Sanitize HTML (nếu cần)
Loại bỏ các script tags và unsafe attributes. Sử dụng DOMPurify hoặc tương tự.

### Bước 2: Parse HTML
Parse HTML string thành DOM elements để apply styles.

### Bước 3: Apply CSS Classes và Styles
Đảm bảo tất cả CSS classes và inline styles được giữ nguyên.

### Bước 4: Handle Custom Elements
- **Button**: Tìm `a[data-type="button"]` và apply button styles
- **Columns**: Tìm `div[data-type="columns"]` và apply flexbox layout
- **Images**: Parse `data-align` attribute và apply alignment styles

### Bước 5: Responsive Handling
- Columns: Chuyển sang column layout trên mobile (< 768px)
- Images: `max-width: 100%` để responsive
- YouTube: Giữ aspect ratio 16:9

## 📝 Ví dụ HTML Output hoàn chỉnh

```html
<div class="tiptap-content">
  <h1 style="text-align: center;">Tiêu đề chính</h1>
  
  <p>Đoạn văn bản bình thường với <strong>bold</strong> và <em>italic</em>.</p>
  
  <div data-type="columns" data-column-count="2" class="tiptap-columns" style="display: flex; gap: 1rem; margin: 1em 0; width: 100%; box-sizing: border-box;">
    <div data-type="column" class="tiptap-column" style="flex: 1; min-width: 0; padding: 0.5rem; box-sizing: border-box;">
      <p>Cột 1 với <span style="color: #ff0000;">màu đỏ</span></p>
      <img src="https://example.com/image.jpg" alt="Image" class="tiptap-image align-center" style="display: block; margin-left: auto; margin-right: auto; max-width: 100%; height: auto;" />
    </div>
    <div data-type="column" class="tiptap-column" style="flex: 1; min-width: 0; padding: 0.5rem; box-sizing: border-box;">
      <p>Cột 2 với <a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 underline cursor-pointer">link</a></p>
    </div>
  </div>
  
  <a data-type="button" href="https://example.com" class="tiptap-button" style="display: inline-block; padding: 8px 16px; background: #1890ff; color: #ffffff; border-radius: 4px; border: none; font-size: 14px; font-weight: 500; text-decoration: none; cursor: pointer;">Đăng ký</a>
  
  <div class="youtube-embed">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="640" height="480" frameborder="0" allowfullscreen></iframe>
  </div>
  
  <table class="border-collapse border border-gray-300 w-full my-4">
    <tr>
      <th class="border border-gray-300 px-4 py-2">Header 1</th>
      <th class="border border-gray-300 px-4 py-2">Header 2</th>
    </tr>
    <tr>
      <td class="border border-gray-300 px-4 py-2">Cell 1</td>
      <td class="border border-gray-300 px-4 py-2">Cell 2</td>
    </tr>
  </table>
</div>
```

## ⚠️ Lưu ý quan trọng

1. **Data attributes**: Luôn giữ nguyên `data-type`, `data-align`, `data-column-count` - chúng cần thiết để identify custom elements
2. **Inline styles**: Không loại bỏ inline styles - chúng chứa thông tin quan trọng về formatting
3. **CSS Classes**: Giữ nguyên tất cả classes như `tiptap-image`, `tiptap-button`, `tiptap-columns`, `tiptap-column`
4. **Responsive**: Đảm bảo columns chuyển sang column layout trên mobile
5. **Font loading**: Google Fonts đã được load tự động từ CDN trong `app/layout.tsx`. Tất cả fonts trong danh sách đã được preconnect và load với `display=swap` để tối ưu performance.
6. **Image src**: Có thể cần xử lý CORS hoặc proxy cho images từ external sources
7. **YouTube embed**: Video ID được extract từ URL, nếu có div wrapper với `data-youtube-video`, cần apply tương tự styles

## 🔧 Quick Reference

### Identify Custom Elements
- **Button**: `a[data-type="button"]`
- **Columns**: `div[data-type="columns"]`
- **Column**: `div[data-type="column"]`
- **Image**: `img.tiptap-image` hoặc `img[data-align]`
- **YouTube**: `div.youtube-embed` hoặc `div[data-youtube-video]`

### Key CSS Classes
- `.tiptap-image` - Image element
- `.tiptap-button` - Button element
- `.tiptap-columns` - Columns container
- `.tiptap-column` - Single column
- `.youtube-embed` - YouTube wrapper

### Key Data Attributes
- `data-type="button"` - Identify button
- `data-type="columns"` - Identify columns container
- `data-type="column"` - Identify column
- `data-column-count` - Number of columns (2-6)
- `data-align` - Image alignment (inline|left|right|center)

## 📄 File Location
- Editor: `features/cms/components/CmsTiptapEditor.tsx`
- Documentation: `features/cms/components/TIPTAP_FEATURES.md`
