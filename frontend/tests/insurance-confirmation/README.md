# 保險資料確認 Modal 隔離測試

測試使用真正的 InsuranceEditor、13 個欄位驗證器、Radix Dialog、InsuranceUsecase 與 InsuranceRepoImpl。僅替換翻譯／導覽介面，並以 Axios 記憶體 adapter 攔截所有 API；另外以 CSP `connect-src 'none'` 阻止瀏覽器連線。資料全部為虛構，沒有啟動後端或讀取正式資料庫。

在 `frontend` 執行（使用現有 dependencies，沒有新增套件）：

```powershell
node --preserve-symlinks --preserve-symlinks-main node_modules/typescript/bin/tsc --noEmit --incremental false
node --preserve-symlinks --preserve-symlinks-main node_modules/tailwindcss/lib/cli.js -i src/app/globals.css -o tests/insurance-confirmation/.browser/app.css --minify
node --preserve-symlinks --preserve-symlinks-main tests/insurance-confirmation/build.cjs --serve
```

開啟 http://127.0.0.1:4173，等到測試結果顯示。十二項案例涵蓋：

1. 空表單不開 Modal、不送 API，保留原本欄位錯誤。
2. 電子郵件及選填數字欄位的原有驗證。
3. 有效資料開啟有名稱／描述的 Modal，顯示 22 欄摘要、完整同意書，焦點位於標題；此時 API 次數為零。
4. 返回修改保留資料及回復焦點；再次開啟須重新勾選。
5. Esc 關閉、回復焦點，不送 API。
6. 修改後摘要及提交內容同步；連點只送一次 POST，沿用 CSRF header。
7. API 失敗顯示可被輔助工具讀取的錯誤，保留內容並允許重試。
8. 成功沿用原本返回列表的導覽，完成導覽前持續防止重複提交。
9. 表單 submit 事件仍先驗證／確認，不能繞過 Modal。
10. 共用編輯頁沿用 PATCH，保留選填日期、金額及收件核章資料。
11. 送出中關閉視窗仍保有焦點與提交鎖；失敗後可重新確認。
12. 英文完整聲明、同意控制及返回修改。

完成後下方提供填入虛構資料的操作頁，供人工檢查 Tab／Shift+Tab 焦點循環、Space 勾選、Enter 按鈕操作與 Esc 關閉。加上 `?locale=en` 可檢視英文操作頁。測試不會連上正式 API。

模擬成功僅記錄導覽要求，不會實際離開測試頁。模擬失敗會產生預期的 console.error。`.browser` 為測試產物，不需納入部署。
