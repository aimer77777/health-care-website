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

---

## 2026-11-09 人工退件第二輪修正

- 修正分支：`fix/accessibility-local`
- 修正依據：無障礙標章人工檢測退件項目（HM1110100E、HM1110103E、HM1130104E、GN3140600E、GN1210100E、GN1220200E、GN1220202E、GN1240100E、HM1240200E、HM1240402E、HM1240404E、GN1240500E、CS2240700E、HM3240800E、GN1410200E、AR2410300E）
- 範圍：以 frontend 為主；backend 僅在下載項目既有 JSON 回應增加 `file_extension`，未變更資料庫、驗證、上傳或下載行為。

### 本輪完成內容

1. Logo 圖片改為完整的「國立中央大學衛生保健組 logo」替代文字。
2. 首頁輪播以標題或內容摘要產生有意義的替代文字，避免只報讀數字；非目前顯示圖片不重複報讀。
3. 輪播新增位於動態內容之前的暫停／播放控制；鍵盤焦點位於輪播內時自動暫停，並補足上一張、下一張、圓點與詳細內容連結名稱。
4. 校園 AED 圖片改為「國立中央大學校園 AED 位置圖」，並以 `aria-describedby` 關聯含 15 個點位及方位概述的完整文字說明。
5. 首頁補上唯一 `h1`，側邊選單與抽屜標題階層調整為循序的 `h2`／`h3`。
6. 公告與下載分類改為 `tablist`／`tab`／`tabpanel`，加入 `aria-selected`、`aria-controls`、方向鍵、Home、End 與一般按鍵操作；清單更新以 `role="status"` 通知。
7. 全站加入「跳至主要內容」、`main` landmark、U/C/Z 定位點快速鍵、高可見焦點樣式及網站導覽頁。
8. 全站共用麵包屑導覽；目前頁使用 `aria-current="page"`，其餘路徑均為連結。
9. 靜態頁、公告、商家、橫幅、下載、傳染病與隱私頁加入描述性 metadata title；詳細頁以實際內容標題命名。
10. 修正導覽與側邊選單的巢狀互動元件，關閉的行動版抽屜不再留下不可見焦點；抽屜支援 Esc 關閉並回復焦點。
11. 「查看更多」改為「更多公告」及「更多商家檢查報告」；另開新視窗連結補充文字。
12. 下載連結顯示由伺服器檔名取得的實際副檔名，並說明另開新視窗。
13. 頁面切換與分類結果更新使用 ARIA live status 通知螢幕報讀軟體。
14. 頁尾連結色改為 `text-amber-950`，在 `#FBBF24` 背景上達到 AAA 文字對比要求。

### 本輪驗證

```bash
cd frontend
npm run lint
npm run build

cd ..
git diff --check
```

- `npm run lint`：通過；仍有原專案既有的 React Hook dependency warnings。
- `npm run build`：通過；仍有原專案既有的 next-intl deprecation 與 Edge Runtime warnings。
- `git diff --check`：通過。
- Backend `pytest`：本機未安裝 `pytest`，無法執行；本輪 backend 變更已以 Python AST 語法檢查，且不涉及資料庫或下載流程控制。

### 複測建議

1. 以鍵盤依序檢查首頁輪播、公告 tabs、下載 tabs、行動版選單、skip link 與 U/C/Z 定位點。
2. 使用螢幕報讀軟體確認輪播狀態、頁籤選取狀態、頁面切換提示、AED 長描述及下載副檔名。
3. 重新量測頁尾電話、Email、網站導覽及隱私權連結在黃色背景上的對比值。
4. 以正式複測資料確認後台每個輪播標題與下載檔案副檔名皆符合內容；本次未部署、未 push。

### 2026-11-09 送審前複驗補強

依人工退件項目再次逐項檢視原始碼、ARIA 關聯、鍵盤焦點順序與 production build，另發現並修正下列風險：

1. 關閉中的語言下拉選單原先僅以透明度與 `pointer-events` 隱藏，內部連結仍可能進入 Tab 順序；現改為關閉時使用 `hidden` 與 `aria-hidden`，不可見項目不再取得鍵盤焦點，並支援 Escape 關閉。
2. 行動版主題群組原先使用可點擊的 `div`；現改為原生 `button`，加入 `aria-expanded`、`aria-controls`，收合內容使用 `hidden`，避免鍵盤停在不可見連結。
3. 行動版抽屜補上焦點循環、Escape 關閉、開啟後初始焦點、關閉後焦點回復，以及導覽後自動關閉。
4. 桌面語言選單及行動版主選單按鈕補上 `aria-expanded`、`aria-controls` 與 `aria-haspopup` 狀態。

複驗執行結果：

- `npm run lint`：通過；僅剩原專案既有的後台／表單 React Hook dependency warnings。
- `npm run build`：通過，TypeScript 與 production compilation 均成功；仍有既有 next-intl 設定棄用提示。
- 本機瀏覽器動態頁面：此隔離環境中 Next.js locale middleware 將請求改寫至 `http://localhost:3100` 後無法自我連線，回傳 500，因此無法在本機完成實際螢幕報讀器操作；已改以原始碼逐項斷言、lint、型別檢查與 production build 複驗。此限制不代表正式站錯誤，部署後仍須以實際網址完成鍵盤及螢幕報讀器驗收。
- 本輪仍未部署、未 push、未修改 `main`，亦未使用正式站帳密或憑證。
