#!/usr/bin/env bash
#
# 一鍵將本專案推上 GitHub 並建立 v1.0.0 release。
#
# 使用方式：
#   bash scripts/setup-github.sh [REPO_NAME] [VISIBILITY]
#
#   REPO_NAME   GitHub repo 名稱（預設：family-expense-app）
#   VISIBILITY  public | private（預設：public）
#
# 前置條件：
#   - 已安裝 git、gh CLI
#   - 已執行 `gh auth login` 完成 GitHub 認證
#
set -euo pipefail

REPO_NAME="${1:-family-expense-app}"
VISIBILITY="${2:-public}"
TAG="v1.0.0"

# 確保在專案根目錄
cd "$(dirname "$0")/.."

echo "==> 檢查工具"
command -v git >/dev/null || { echo "✗ 需要 git"; exit 1; }
command -v gh  >/dev/null || { echo "✗ 需要 gh CLI（brew install gh）"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "✗ 請先執行 gh auth login"; exit 1; }

# 清理可能殘留的 .git
if [ -d .git ]; then
  echo "==> 偵測到既有 .git，刪除以重新初始化"
  rm -rf .git
fi

# 清理沙盒殘留的中間檔
rm -f tsconfig*.tsbuildinfo vite.config.d.ts vite.config.js

echo "==> git init"
git init -q -b main
git config user.email "${GIT_USER_EMAIL:-$(git config --global user.email)}"
git config user.name  "${GIT_USER_NAME:-$(git config --global user.name)}"

echo "==> 首次 commit"
git add .
git commit -q -m "feat: 家庭支出管理系統 v1.0 MVP

依《家庭支出管理系統_Design_Spec.md》v1.0 完成 MVP，涵蓋全部
8 個 user stories（US-101 ~ US-402）。

技術棧：React 18 + TypeScript + Vite + Tailwind + Zustand +
React Router + Recharts + React Hook Form + Zod + date-fns。

詳見 CHANGELOG.md。"

echo "==> 打 tag ${TAG}"
git tag -a "${TAG}" -m "Release ${TAG}"

echo "==> 在 GitHub 建立 repo（${VISIBILITY}）"
gh repo create "${REPO_NAME}" \
  --"${VISIBILITY}" \
  --source=. \
  --remote=origin \
  --description "家庭支出管理系統 — 依規格書實作的家庭記帳 Web App" \
  --push

echo "==> 推送 tag（觸發 Release workflow）"
git push origin "${TAG}"

REPO_URL=$(gh repo view --json url --jq .url)
echo
echo "✓ 完成"
echo "  Repo:       ${REPO_URL}"
echo "  Actions:    ${REPO_URL}/actions"
echo "  Releases:   ${REPO_URL}/releases"
echo
echo "Release workflow 約 1-2 分鐘後會自動建立 ${TAG} release，"
echo "並上傳 family-expense-app-${TAG}.zip。"
