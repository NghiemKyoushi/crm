# Selector Config Page

## Overview
Trang config CSS selectors cho các source website với UI thân thiện, layout 2 cột.

## Features
- **2-column layout**:
  - Cột trái: Danh sách configs với priority tags
  - Cột phải: Form edit chi tiết selector fields

- **Horizontal layout cho selector fields**: Mỗi field (productName, price, etc.) được hiển thị dạng card trong grid 2 cột

- **Easy-to-use UI**:
  - Drag-free config switching (click to select)
  - Visual priority indicators
  - Icon-based field labels
  - Inline switches for options
  - Quick add/remove selectors

## Usage
1. Navigate từ Website Management table -> Click "Config" button
2. Page sẽ load tại route: `/website-manage/selector-config?id={websiteId}`
3. Select config từ sidebar trái
4. Edit selector fields ở main area bên phải
5. Click "Save" để lưu tất cả changes

## Layout Structure
```
┌─────────────────────────────────────────────────┐
│  Header: Website Name + Save Button            │
├────────────┬────────────────────────────────────┤
│ Configs    │  Config Info (name, priority)     │
│ ┌────────┐ │  ────────────────────────────────  │
│ │Config 1│ │  Selector Fields (Grid 2 cols)    │
│ └────────┘ │  ┌───────────┐ ┌───────────┐      │
│ ┌────────┐ │  │productName│ │   price   │      │
│ │Config 2│ │  └───────────┘ └───────────┘      │
│ └────────┘ │  ┌───────────┐ ┌───────────┐      │
│            │  │  quantity │ │   images  │      │
│ + Add      │  └───────────┘ └───────────┘      │
│            │                                     │
│ Cache      │  + Add field...                    │
│ Duration   │                                     │
└────────────┴────────────────────────────────────┘
```

## Selector Field Card Layout (Horizontal)
```
┌─────────────────────────────────┐
│ 📝 Product Name            [X]  │
├─────────────────────────────────┤
│ CSS Selector: [_______________] │
│ Attribute: [text ▼] Transform: [removeNonDigits ▼] │
│ □ Multiple  □ Last  Index: [__] │
└─────────────────────────────────┘
```

## Benefits vs Modal
- ✅ More space for editing
- ✅ Easier to see multiple selector fields at once
- ✅ Better for complex configurations
- ✅ No modal overflow issues
- ✅ URL-based navigation (bookmarkable)
