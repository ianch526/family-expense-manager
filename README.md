# 家庭支出管理系統 (Family Expense Manager)

依據《家庭支出管理系統_Design_Spec.md》v1.0 實作的 MVP 版本。

## 技術棧

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3**（含設計規格 §9 的色彩系統與字型）
- **Zustand 4**（狀態管理，`store/` 目錄）
- **React Router 6**（路由）
- **Recharts 2**（圖表）
- **React Hook Form + Zod**（表單驗證）
- **date-fns 3**（日期處理）

## 後端策略

由於規格中後端（Node.js + Express + PostgreSQL + Redis）需要額外部署環境，
本實作將「後端」抽象到 `src/services/` 下，以 `localStorage` 作為持久層。
介面對應規格 §7 的 REST API（list / create / update / remove / summary / overview / stats），
未來可將 `services/storage.ts` 替換為 Axios 呼叫實際後端，前端零改動。

## 已實作功能（對應規格 §2）

- ✅ **US-101 ~ US-103** 交易管理：新增、編輯、刪除、篩選、搜尋、排序
- ✅ **US-201 ~ US-202** 預算管理：分類預算設定、進度條、警示卡
- ✅ **US-301 ~ US-302** 統計分析：分類圓餅 / 折線、成員堆疊柱、交叉分析
- ✅ **US-401 ~ US-402** 管理設定：分類 / 成員 CRUD、刪除時關聯交易處理
- ✅ Dashboard 摘要、近 6 個月趨勢、最近交易、預算進度
- ✅ 響應式（手機底部 TabBar、桌機 Sidebar、中型平板自動切換）
- ✅ 預設範例資料（首次開啟即有內容）

## 啟動

```bash
cd family-expense-app
npm install
npm run dev
```

預設於 <http://localhost:5173> 開啟。

## 建置

```bash
npm run build
npm run preview
```

## 目錄結構

```
src/
├── components/
│   ├── charts/           # Recharts 圖表元件
│   ├── layout/           # AppLayout / Sidebar / TopBar / MobileNav
│   └── shared/           # SummaryCard / TransactionModal / Badge / Avatar / Toast / ProgressBar / ConfirmDialog
├── pages/                # 7 個頁面（Dashboard / Transactions / Budget / Analytics x2 / Settings x2）
├── store/                # 5 個 Zustand store
├── services/             # API 抽象層（目前用 localStorage）
├── types/                # TypeScript 型別 + Zod schema
├── utils/                # formatCurrency / formatDate / calcStats
├── constants/            # 色盤、預設資料、storage keys
└── router/               # React Router 路由設定
```

## 推上 GitHub 並建立 Release

專案內建一鍵腳本 `scripts/setup-github.sh`：自動 `git init`、首次 commit、打 `v1.0.0` tag、用 `gh` 建立 GitHub repo、push、觸發 release workflow。

```bash
# 前置：需先登入 gh CLI
brew install gh        # 若尚未安裝
gh auth login          # 互動式登入

# 一鍵推上 GitHub（預設 public、repo 名稱 family-expense-app）
bash scripts/setup-github.sh

# 自訂名稱與 visibility
bash scripts/setup-github.sh my-budget-app private
```

腳本完成後：

- `main` branch 已 push，`v1.0.0` tag 也已 push
- GitHub Actions 的 **Release** workflow 會自動建置並建立 GitHub Release，附上 `family-expense-app-v1.0.0.zip`
- **CI** workflow 會在每次 PR / push 跑 type-check + build

### 後續發版流程

```bash
# 修改 CHANGELOG.md，加一個新的 ## [1.1.0] 區塊
git commit -am "chore: release v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
# → release.yml 自動建置 + 建立 v1.1.0 GitHub Release
```

### 手動操作（不想用腳本）

```bash
git init -b main
git add .
git commit -m "feat: 家庭支出管理系統 v1.0 MVP"
git tag -a v1.0.0 -m "Release v1.0.0"
gh repo create family-expense-app --public --source=. --remote=origin --push
git push origin v1.0.0
```

## 注意事項

- 資料儲存於瀏覽器 `localStorage`（key 前綴 `fea:`），清除瀏覽器資料會清空所有交易
- 「設定 > 重設為預設資料」可一鍵還原內建範例
- 表單驗證採 Zod schema（`src/types/index.ts`）：金額 > 0、日期不可超過今日、名稱字數限制等
