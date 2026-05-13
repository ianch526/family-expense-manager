# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-10

### Added — MVP 初版

依《家庭支出管理系統_Design_Spec.md》v1.0 完成 MVP，涵蓋全部 8 個 user stories（US-101 ~ US-402）。

#### 交易管理 (Epic 1)
- US-101 新增交易：類型/金額/項目/分類/成員/日期/備註，含 Zod 驗證
- US-102 查詢與篩選：關鍵字 (debounce 300ms)、分類、成員、日期區間、類型切換、排序
- US-103 編輯與刪除：點擊列編輯、刪除前確認 Dialog

#### 預算管理 (Epic 2)
- US-201 各分類月度預算：進度條、70% 橘色 / 90% 紅色警示
- US-202 預算超支警示：Dashboard 上方警示卡片

#### 統計分析 (Epic 3)
- US-301 分類統計：圓餅圖、近 6 個月趨勢折線、消費排行
- US-302 成員統計：圓餅圖、堆疊柱狀圖、可展開分類明細

#### 管理設定 (Epic 4)
- US-401 分類管理：新增/刪除、10 色預設色盤、關聯交易遷移
- US-402 成員管理：新增/刪除、6 字元名稱限制、關聯交易遷移

#### 共通
- Dashboard 總覽：4 個摘要卡 + 警示區 + 趨勢圖 + 圓餅圖 + 最近交易 + 預算進度
- 響應式：桌機 Sidebar / 手機底部 5-tab 導覽 + 中央懸浮新增按鈕
- 設計系統：依規格 §9 落實色彩、字型 (Noto Sans TC)、圓角、陰影
- 預設範例資料：首次啟動自動 seed 預設分類、成員、本月交易與預算
- 「設定 > 重設為預設資料」一鍵還原內建範例

### Tech Stack
- React 18 + TypeScript 5 + Vite 5
- Tailwind CSS 3
- Zustand 4 (狀態管理)
- React Router 6 (路由)
- Recharts 2 (圖表)
- React Hook Form + Zod (表單與驗證)
- date-fns 3 (日期處理)

### Backend
- v1.0 採用 localStorage 作為持久層，service 層介面對應規格 §7 REST API
- 未來可無縫切換到 Express + PostgreSQL 後端，前端零改動

### CI/CD
- GitHub Actions：PR/push 自動執行 type-check + build
- 推 `v*` tag 自動建立 GitHub Release 並上傳 dist.zip

[1.0.0]: https://github.com/REPLACE_WITH_YOUR_USER/family-expense-app/releases/tag/v1.0.0
