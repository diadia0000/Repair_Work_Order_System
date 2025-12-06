# Web UI 設計文件

## 專案概述

**專案名稱:** Lab Service Portal - 實驗室維修工單系統  
**技術棧:** React 19 + TypeScript + Tailwind CSS + Vite  
**設計風格:** 現代化、簡潔、專業  
**目標使用者:** 大學實驗室學生與管理員

---

## 🎨 設計系統

### 色彩配置

#### 主色調
```css
--color-primary: #2563EB        /* 主要藍色 */
--color-primary-hover: #1D4ED8   /* 主要藍色 hover */
--color-primary-light: #DBEAFE   /* 淺藍色背景 */
```

#### 輔助色
```css
--color-secondary: #64748B       /* 次要灰色 */
--color-secondary-dark: #475569  /* 深灰色 */
```

#### 狀態色
```css
--color-success: #10B981    /* 綠色 - 成功/已關閉 */
--color-warning: #F59E0B    /* 黃色 - 警告/進行中 */
--color-danger: #EF4444     /* 紅色 - 錯誤/高優先級 */
```

#### 背景與邊框
```css
--color-background: #F8FAFC  /* 頁面背景 */
--color-card: #FFFFFF        /* 卡片背景 */
--color-border: #E2E8F0      /* 邊框顏色 */
```

### 字體系統

```css
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### 字體大小
- **h1:** 2rem (32px) - 主標題
- **h2:** 1.5rem (24px) - 次標題
- **h3:** 1.25rem (20px) - 卡片標題
- **h4:** 1.125rem (18px) - 小標題
- **p:** 1rem (16px) - 內文
- **small:** 0.875rem (14px) - 輔助文字

### 間距系統

```css
--spacing-xs: 0.5rem   /* 8px */
--spacing-sm: 0.75rem  /* 12px */
--spacing-md: 1rem     /* 16px */
--spacing-lg: 1.5rem   /* 24px */
--spacing-xl: 2rem     /* 32px */
--spacing-2xl: 3rem    /* 48px */
```

### 圓角

```css
--radius-sm: 0.375rem  /* 6px */
--radius-md: 0.5rem    /* 8px */
--radius-lg: 0.75rem   /* 12px */
--radius-xl: 1rem      /* 16px */
```

### 陰影

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

---

## 📐 頁面結構

### 1. 登入頁面 (LoginPage)

#### 設計特點
- 全螢幕置中設計
- 漸層背景 (藍色到淺藍)
- 卡片式表單容器
- 品牌識別 Logo
- 響應式設計

#### 畫面元素

```
┌─────────────────────────────────────┐
│     [漸層背景: 藍 -> 淺藍]           │
│                                     │
│    ┌─────────────────────┐         │
│    │  [Logo Icon]        │         │
│    │  Lab Service Portal │         │
│    │                     │         │
│    │  Email Address      │         │
│    │  [輸入框]           │         │
│    │                     │         │
│    │  Password           │         │
│    │  [輸入框] [👁]      │         │
│    │                     │         │
│    │  Forgot Password?   │         │
│    │                     │         │
│    │  [Sign In 按鈕]     │         │
│    │                     │         │
│    │  Contact admin...   │         │
│    └─────────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

#### 互動行為
- **密碼顯示切換:** 點擊眼睛圖示切換密碼可見性
- **表單驗證:** Email 和密碼必填
- **Enter 鍵提交:** 支援 Enter 鍵登入
- **Hover 效果:** 按鈕有 hover 放大和陰影效果

#### 響應式設計
- **手機 (<640px):** 卡片佔滿寬度，padding 減少
- **平板 (640px-1024px):** 卡片固定最大寬度
- **桌面 (>1024px):** 卡片居中，最佳閱讀寬度

---

### 2. 主控台頁面 (Dashboard)

#### 頁面布局

```
┌────────────────────────────────────────────┐
│ [Logo] Lab Service Portal  [+New] [User▼]│ ← Navigation Bar
├────────────────────────────────────────────┤
│                                            │
│  [Total] [Open] [Processing] [Closed]     │ ← Statistics Cards
│                                            │
│  All Tickets          [Filter▼]           │ ← Title & Filter
│                                            │
│  ┌──────┐ ┌──────┐ ┌──────┐              │
│  │Ticket│ │Ticket│ │Ticket│              │ ← Ticket Grid
│  │ #1   │ │ #2   │ │ #3   │              │
│  └──────┘ └──────┘ └──────┘              │
│                                            │
└────────────────────────────────────────────┘
```

#### Navigation Bar

**固定在頂部，包含:**
- Logo 與應用名稱
- 「Create New Ticket」按鈕 (主要 CTA)
- 使用者選單 (顯示 email, 登出選項)

**顏色:** 白色背景，灰色邊框  
**高度:** 64px  
**陰影:** shadow-sm

#### 統計卡片 (Statistics Cards)

**四個統計指標:**
1. **Total Tickets** - 總工單數 (無顏色標記)
2. **Open** - 待處理 (黃色左側邊框)
3. **Processing** - 處理中 (藍色左側邊框)
4. **Closed** - 已關閉 (綠色左側邊框)

**設計規格:**
- 白色卡片背景
- 數字大標題 (h2)
- 標籤小字 (small)
- 左側彩色邊框 (4px)
- shadow-sm + hover 效果

#### 篩選器 (Filter)

**下拉選單選項:**
- All Status (預設)
- Open
- Processing
- Closed

**位置:** 右上角，搭配 Filter 圖示  
**行為:** 即時篩選工單列表

#### 工單卡片網格

**響應式網格:**
- **手機:** 1 列
- **平板:** 2 列
- **桌面:** 3 列

**間距:** gap-4 (16px)

---

### 3. 工單卡片 (TicketCard)

#### 卡片結構

```
┌─────────────────────────────────────┐
│ Title of Ticket...      [Status]    │ ← Header
├─────────────────────────────────────┤
│ Description text here...            │ ← Body
│ Lorem ipsum dolor sit amet...       │
├─────────────────────────────────────┤
│ 🕐 2025/12/06    ⚠️ High           │ ← Footer
├─────────────────────────────────────┤
│ By john.doe                         │ ← User
└─────────────────────────────────────┘
```

#### 狀態標籤設計

**Open (待處理)**
- 背景: #FEF3C7 (淺黃)
- 文字: #92400E (深棕)
- 邊框: #FDE68A (黃)

**Processing (處理中)**
- 背景: #DBEAFE (淺藍)
- 文字: #1E40AF (深藍)
- 邊框: #93C5FD (藍)

**Closed (已關閉)**
- 背景: #D1FAE5 (淺綠)
- 文字: #065F46 (深綠)
- 邊框: #6EE7B7 (綠)

#### 優先級顏色

- **Low:** 灰色 (#64748B)
- **Medium:** 橙色 (#F59E0B)
- **High:** 紅色 (#EF4444)

#### 互動效果

**Hover 狀態:**
```css
transform: translateY(-2px);
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
transition: all 0.2s ease;
```

**點擊效果:**
- cursor: pointer
- 整張卡片可點擊 (預留未來查看詳情功能)

---

### 4. 建立工單彈窗 (CreateTicketModal)

#### 彈窗設計

```
          ┌─────────────────────────┐
          │ Create New Ticket   [X] │
          ├─────────────────────────┤
          │                         │
          │ Issue Title *           │
          │ [___________________]   │
          │                         │
          │ Description *           │
          │ [___________________]   │
          │ [___________________]   │
          │ [___________________]   │
          │                         │
          │ Priority Level *        │
          │ [Low ▼]                │
          │                         │
          │ [Cancel] [Submit]       │
          │                         │
          └─────────────────────────┘
```

#### 彈窗規格

**尺寸:**
- 最大寬度: 640px (2xl)
- 最小寬度: 360px
- 最大高度: 90vh (支援滾動)

**背景遮罩:**
- 黑色 50% 不透明度
- 毛玻璃效果 (backdrop-blur-sm)

**動畫:**
- 淡入效果
- 從中心展開

#### 表單欄位

**1. Issue Title (必填)**
- 類型: 單行文字輸入
- Placeholder: "e.g., PC not working"
- 最大長度: 建議 100 字元

**2. Description (必填)**
- 類型: 多行文字輸入 (textarea)
- 行數: 6 行
- Placeholder: "Please describe the issue in detail..."
- 輔助文字: "Be as specific as possible..."

**3. Priority Level (必填)**
- 類型: 下拉選單
- 選項:
  - Low - Can wait a few days
  - Medium - Should be addressed soon
  - High - Urgent, blocking work

#### 按鈕設計

**Cancel (取消)**
- 次要按鈕
- 灰色邊框
- 白色背景
- Hover: 淺灰背景

**Submit Ticket (提交)**
- 主要按鈕
- 藍色背景 (#2563EB)
- 白色文字
- Hover: 深藍 + 陰影提升

#### 響應式布局

**手機版:**
- 按鈕垂直排列
- Submit 在上，Cancel 在下

**桌面版:**
- 按鈕水平排列
- Cancel 在左，Submit 在右

---

## 🧩 組件架構

### 組件樹狀圖

```
App
├── LoginPage
│   └── [Email Input, Password Input, Button]
└── Dashboard
    ├── Navigation
    │   ├── Logo
    │   ├── NewTicketButton
    │   └── UserMenu
    ├── StatisticsCards
    │   ├── TotalCard
    │   ├── OpenCard
    │   ├── ProcessingCard
    │   └── ClosedCard
    ├── FilterBar
    ├── TicketGrid
    │   └── TicketCard (multiple)
    │       ├── TicketHeader
    │       ├── TicketBody
    │       └── TicketFooter
    └── CreateTicketModal
        └── [Form Inputs, Buttons]
```

### 組件說明

#### 1. App.tsx
**職責:** 應用主容器、路由管理、狀態管理  
**狀態:**
- `isLoggedIn` - 登入狀態
- `userEmail` - 使用者 email
- `tickets` - 工單列表

**主要方法:**
- `handleLogin()` - 處理登入
- `handleLogout()` - 處理登出
- `handleCreateTicket()` - 建立新工單
- `handleUpdateTicketStatus()` - 更新工單狀態

---

#### 2. LoginPage.tsx

**Props:**
```typescript
interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}
```

**內部狀態:**
- `email` - Email 輸入值
- `password` - 密碼輸入值
- `showPassword` - 密碼可見性

**功能:**
- 表單驗證
- 密碼顯示切換
- Enter 鍵提交

---

#### 3. Dashboard.tsx

**Props:**
```typescript
interface DashboardProps {
  tickets: Ticket[];
  onCreateTicket: (ticket: { 
    title: string; 
    description: string; 
    priority: string 
  }) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onLogout: () => void;
  userEmail: string;
}
```

**內部狀態:**
- `isCreateModalOpen` - 彈窗開關
- `filterStatus` - 當前篩選狀態

**計算屬性:**
- `filteredTickets` - 篩選後的工單
- `stats` - 統計數據 (total, open, processing, closed)

---

#### 4. TicketCard.tsx

**Props:**
```typescript
interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

interface Ticket {
  ticket_id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'Open' | 'Processing' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  created_at: string;  // ISO 8601
}
```

**輔助方法:**
- `getStatusStyle()` - 取得狀態樣式
- `getPriorityColor()` - 取得優先級顏色
- `formatDate()` - 格式化時間顯示

---

#### 5. CreateTicketModal.tsx

**Props:**
```typescript
interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: { 
    title: string; 
    description: string; 
    priority: PriorityLevel 
  }) => void;
}
```

**內部狀態:**
- `title` - 標題輸入值
- `description` - 描述輸入值
- `priority` - 優先級選擇 (預設: Medium)

**行為:**
- 提交後自動重置表單
- ESC 鍵關閉彈窗
- 點擊遮罩關閉彈窗

---

## 🎯 使用者體驗 (UX)

### 互動流程

#### 首次使用流程
```
1. 開啟網頁
   ↓
2. 看到登入頁面
   ↓
3. 輸入 Email 和密碼
   ↓
4. 點擊 "Sign In"
   ↓
5. 進入主控台，看到統計卡片
   ↓
6. 點擊 "New Ticket" 按鈕
   ↓
7. 填寫工單表單
   ↓
8. 提交工單
   ↓
9. 工單出現在列表最上方
```

#### 篩選工單流程
```
1. 在主控台頁面
   ↓
2. 點擊右上角篩選下拉選單
   ↓
3. 選擇狀態 (Open/Processing/Closed)
   ↓
4. 列表即時更新顯示對應工單
```

### 載入狀態

#### 目前實作
- 使用 Mock 資料，無載入延遲

#### 未來整合 API 時建議
- 顯示骨架屏 (Skeleton) 或 Spinner
- 按鈕顯示 Loading 狀態
- 錯誤提示 Toast 訊息

### 空狀態設計

**無工單時顯示:**
```
┌─────────────────────────────┐
│       [灰色圖示]            │
│   No tickets found          │
│   Create your first ticket  │
│   to get started            │
│                             │
│   [Create New Ticket]       │
└─────────────────────────────┘
```

**篩選無結果時:**
```
┌─────────────────────────────┐
│       [灰色圖示]            │
│   No tickets found          │
│   No tickets with status    │
│   "Processing"              │
└─────────────────────────────┘
```

---

## 📱 響應式設計

### 斷點定義

```css
/* Tailwind CSS 斷點 */
sm: 640px   /* 手機橫向 */
md: 768px   /* 平板直向 */
lg: 1024px  /* 平板橫向/小筆電 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大螢幕 */
```

### 各裝置適配

#### 手機 (<640px)
- 單列卡片布局
- 隱藏次要文字
- 按鈕全寬
- Navigation 精簡顯示 (隱藏部分文字)

#### 平板 (640px-1024px)
- 雙列卡片布局
- 顯示完整內容
- 按鈕適中寬度

#### 桌面 (>1024px)
- 三列卡片布局
- 最佳閱讀體驗
- 完整功能顯示

---

## 🔧 開發指南

### 新增工單卡片功能

**範例: 添加「編輯」按鈕**

```typescript
// TicketCard.tsx
interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  onEdit?: (ticketId: string) => void;  // 新增
}

export function TicketCard({ ticket, onClick, onEdit }: TicketCardProps) {
  return (
    <div className="card">
      {/* ...existing code... */}
      
      {onEdit && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(ticket.ticket_id);
          }}
          className="mt-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Edit
        </button>
      )}
    </div>
  );
}
```

### 添加新的狀態篩選

**步驟:**
1. 更新 `TicketStatus` 類型
2. 添加狀態樣式到 `getStatusStyle()`
3. 更新 Dashboard 的篩選選項
4. 更新統計卡片計算

### 自訂主題色彩

**修改 `globals.css`:**
```css
:root {
  --color-primary: #your-color;
  --color-primary-hover: #your-hover-color;
}
```

所有使用主色的元件會自動更新。

---

## 🎨 UI 元件庫

### 使用的 UI 組件

**Radix UI:**
- Dialog (彈窗基礎)
- Dropdown Menu (下拉選單)
- Select (選擇器)
- 其他 40+ 組件 (可擴展使用)

**Lucide React (圖示庫):**
- Plus (新增)
- LogOut (登出)
- User (使用者)
- Filter (篩選)
- Clock (時間)
- AlertCircle (警告)
- Eye / EyeOff (顯示/隱藏)
- X (關閉)

### 可重用的樣式類別

**卡片:**
```css
.card {
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}
```

**卡片 Hover:**
```css
.card-hover {
  transition: all 0.2s ease;
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

---

## 🚀 效能優化建議

### 目前實作
- ✅ React 19 最新效能優化
- ✅ Vite 快速建置
- ✅ Tailwind CSS JIT 編譯
- ✅ Tree-shaking

### 未來優化方向

1. **Code Splitting**
   ```typescript
   const Dashboard = lazy(() => import('./components/Dashboard'));
   ```

2. **圖片優化**
   - 使用 WebP 格式
   - Lazy loading
   - 響應式圖片

3. **虛擬滾動**
   - 當工單數量超過 100 時
   - 使用 react-window 或 react-virtualized

4. **Memoization**
   ```typescript
   const stats = useMemo(() => ({
     total: tickets.length,
     // ...
   }), [tickets]);
   ```

---

## 📊 可訪問性 (Accessibility)

### ARIA 標籤

**已實作:**
- 按鈕有明確的 `aria-label`
- 表單輸入有關聯的 `<label>`
- Modal 使用適當的 ARIA roles

### 鍵盤導航

**支援:**
- ✅ Tab 鍵導航
- ✅ Enter 鍵提交表單
- ✅ ESC 鍵關閉彈窗
- ✅ 所有互動元素可聚焦

### 顏色對比

**所有文字符合 WCAG AA 標準:**
- 正常文字: 4.5:1
- 大文字: 3:1
- 狀態標籤有足夠對比

---

## 🔮 未來功能規劃

### Phase 1 - 基礎功能 ✅
- [x] 登入頁面
- [x] 工單列表
- [x] 建立工單
- [x] 狀態篩選

### Phase 2 - 增強功能 🚧
- [ ] 工單詳情頁面
- [ ] 編輯工單
- [ ] 刪除工單
- [ ] 狀態更新
- [ ] 評論系統

### Phase 3 - 進階功能 📋
- [ ] 即時通知
- [ ] 搜尋功能
- [ ] 排序功能
- [ ] 匯出報表
- [ ] 管理員儀表板

### Phase 4 - 協作功能 💡
- [ ] 工單指派
- [ ] 團隊聊天
- [ ] 附件上傳
- [ ] 工作流程自動化

---

## 📝 設計原則

### 一致性
- 統一的色彩系統
- 一致的間距規則
- 統一的互動模式

### 簡潔性
- 減少不必要的視覺元素
- 清晰的資訊層級
- 適當的留白

### 回饋性
- Hover 狀態明確
- 點擊有視覺回饋
- 載入狀態顯示

### 效率性
- 減少點擊次數
- 快速存取常用功能
- 鍵盤快捷鍵支援

---

## 🛠️ 工具與資源

### 設計工具
- **Figma** - UI 設計與原型
- **Tailwind CSS IntelliSense** - VS Code 擴充
- **React DevTools** - 除錯工具
