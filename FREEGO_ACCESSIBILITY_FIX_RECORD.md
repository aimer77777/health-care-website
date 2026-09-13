# Freego 無障礙修補紀錄

## 修補版本

- GitHub Repository: `aimer77777/health-care-website`
- Branch: `main`
- 本次 Freego 無障礙程式修正版本: `82f557a fix: address Freego accessibility findings`
- 修正依據: `health20260912140348.htm` Freego 全網站無障礙檢測報告
- 檢測網址: `https://health.ncu.edu.tw/`
- 本紀錄用途: 保留稽核與後續 Freego 複測追蹤依據

## 修正範圍

本次修正已於 commit `82f557a` 完成，主要處理 Freego A 等級報告中可由程式自動修正的問題：

| Freego 檢測碼 | 修正內容 |
|---|---|
| `HM1240401C` | 補足共用社群連結可辨識文字，修正 Instagram / Facebook 純圖示連結無文字問題。 |
| `HM1410200C` | 補足共用圖示按鈕可辨識名稱，修正 Instagram / Facebook button 無名稱問題。 |
| `HM1130104C` | 補足搜尋列、文字欄位、單選、檔案上傳與 select 等表單控制元件的 label 或 aria-label。 |
| `HM1110100C` | 在富文字內容渲染時，替缺少 alt 的圖片依頁面標題補上替代文字。 |
| `HM1130100C` | 清理富文字內容中的空白標題，例如 `<h4><br></h4>`。 |
| `HM1240200C` | 調整頁面 metadata title 設定，避免頁面 title 無效或空白。 |
| `HM1310100C` | 調整 `html lang` 與多語系區塊語言標示。 |

## 主要修改檔案

本次修正共異動 20 個前端檔案，包含：

- `frontend/src/app/layout.tsx`
- `frontend/src/app/[locale]/layout.tsx`
- `frontend/src/app/[locale]/navigation-bar.tsx`
- `frontend/src/app/[locale]/drawer.tsx`
- `frontend/src/app/[locale]/footer.tsx`
- `frontend/src/components/button.tsx`
- `frontend/src/components/search-bar.tsx`
- `frontend/src/components/text-field.tsx`
- `frontend/src/components/radio-field.tsx`
- `frontend/src/components/quill-viewer.tsx`
- `frontend/src/middleware.ts`
- 以及後台 carousel、download、permission、post、restaurant 等表單頁面

完整異動請查：

```bash
git show --stat 82f557a
git show 82f557a
```

## 驗證紀錄

本機已完成下列檢查：

```bash
cd frontend
npm run lint
npm run build

cd ../backend
python -m pytest
```

結果：

- `npm run lint`: 通過；仍有原專案既有 React Hook dependency warnings。
- `npm run build`: 通過；仍有原專案既有 next-intl deprecation / Edge Runtime warnings。
- `python -m pytest`: 通過，`4 passed`。

## 部署與複測注意事項

1. 正式主機部署前，請確認主機拉到 `main` 的 `82f557a` 或更新版本，且 `git show 82f557a` 可查到本次無障礙修正。
2. 部署後請開啟正式網址 `https://health.ncu.edu.tw/zh` 確認首頁、公告、商家資料與 API 正常。
3. 部署完成後需重新執行 Freego 全網站檢測。
4. 若 Freego 新報告仍出現錯誤，請以新報告作為第二輪修正依據。
5. `/walkingSys` 屬同網域下另一套子系統；若 Freego 全站掃描納入公開頁面，需另取得該子系統原始碼後處理。

## 後續申請狀態

本紀錄僅代表網站程式已完成第一輪 Freego 報告修正。無障礙標章仍需：

1. 完成正式部署。
2. 以正式網址重新跑 Freego 全網站檢測。
3. 確認通過 A 等級。
4. 由網站負責人以我的 E 政府公務帳號提出標章申請。
5. 於期限內完成自我評量並等待人工抽測。
