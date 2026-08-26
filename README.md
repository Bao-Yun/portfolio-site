# 作品集網站

黑白＋莫蘭迪色系的個人行銷作品集，內容透過 [Decap CMS](https://decapcms.org/) 後台編輯，部署在 GitHub Pages。

## 目錄結構

- `index.html` / `js/main.js` — 網站本體，讀取 `data/*.json` 渲染內容
- `data/theme.json` `hero.json` `about.json` `services.json` `footer.json` — 各區塊文字與色彩內容
- `data/works/*.md` — 作品集，每篇一個檔案
- `data/works-index.json` — 由 `scripts/build-works-index.mjs` 自動彙整 `data/works/*.md` 產生，**不要手動編輯**（每次推送到 `main` 時 GitHub Actions 會自動重新產生）
- `admin/` — Decap CMS 後台（`config.yml` 定義欄位）
- `.github/workflows/deploy.yml` — 推送到 `main` 時自動建置並部署到 GitHub Pages

## 部署前要回填的設定（`admin/config.yml`）

- `backend.repo`：你的 `GitHub帳號/repo名稱`
- `backend.base_url`：Cloudflare Workers 上的 Decap OAuth proxy 網址

## 如何編輯內容

1. 前往 `https://<你的網址>/admin/`，用 GitHub 帳號登入
2. 「網站設定」可編輯色彩主題、首頁文字、關於我、服務項目、頁尾
3. 「作品集」可新增／刪除／排序作品，每篇可選擇呈現方式（IG 嵌入／上傳圖片／影片連結／PDF／外部連結），並填寫目標、角色、成效與詳細說明
4. 儲存後會自動提交到 GitHub，GitHub Actions 跑完（約 1–2 分鐘）網站就會更新
