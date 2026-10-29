import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { Theme } from '@radix-ui/themes';
import axios from 'axios';
import InsuranceEditor from '../../src/app/[locale]/admin/insurance/insurance-editor';
import { navigations } from './navigation';

// No student data and no network adapter: every API call is captured here.
const calls: { method?: string; url?: string; data: any; headers: any }[] = [];
const responses: { resolve: (response: any) => void; reject: (error: any) => void }[] = [];
axios.defaults.adapter = (config) => new Promise((resolve, reject) => {
  if (!config.url?.startsWith('http://127.0.0.1:4173/api/insurance')) {
    reject(new Error('Unexpected API URL in isolated test'));
    return;
  }
  calls.push({ method: config.method, url: config.url, data: JSON.parse(config.data), headers: config.headers });
  responses.push({ resolve, reject });
});
document.cookie = 'csrf_access_token=synthetic-csrf-only; SameSite=Strict; path=/';
const root = createRoot(document.getElementById('app')!);
const output = document.getElementById('results')!;
const results: string[] = [];
const fixture = {
  applicationDate: new Date(2026, 9, 30), incidentDate: new Date(2026, 9, 29),
  name: 'Modal Test Student', studentId: '000000001', idNumber: 'TEST-ONLY',
  address: 'Synthetic address', phoneNumber: '0000000000', email: 'test@example.invalid',
  incidentCause: 'Synthetic incident', receipt: 'Synthetic clinic 1',
  diagnosisCertificate: 'Synthetic certificate 1', applicationAmount: 100,
};
let instance = 0;
// Allow the real Radix enter/exit animations to finish before checking focus.
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 240));
async function change(action: () => void) {
  await act(async () => { action(); await tick(); });
  await act(async () => { await tick(); });
}
async function mount(defaultValues: any = fixture, updateId?: number, locale = 'zh') {
  calls.length = 0; responses.length = 0; navigations.length = 0;
  document.documentElement.lang = locale;
  await change(() => root.render(<Theme><InsuranceEditor key={++instance} locale={locale} defaultValues={defaultValues} updateId={updateId} /></Theme>));
}
function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function button(text: string) {
  const result = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === text);
  assert(result, `Missing button ${text}`);
  return result;
}
function dialog() { return document.querySelector<HTMLElement>('[role="dialog"]'); }
async function save() { await change(() => button('儲存保險記錄').click()); }
async function acknowledge() { await change(() => document.querySelector<HTMLInputElement>('#personal_data_consent')!.click()); }
function input(label: string) {
  const target = Array.from(document.querySelectorAll('label')).find((l) => l.textContent === label);
  assert(target?.htmlFor, `Missing label ${label}`);
  return document.getElementById(target.htmlFor) as HTMLInputElement;
}
async function setInput(label: string, value: string) {
  await change(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input(label), value);
    input(label).dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function test(name: string, action: () => Promise<void>) {
  try { await action(); results.push(`PASS ${name}`); }
  catch (error) { results.push(`FAIL ${name}: ${String(error)}`); }
  output.textContent = results.join('\n');
}
async function run() {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  await test('Empty form: original validation blocks dialog and API', async () => {
    await mount({}); await save();
    assert(!dialog() && calls.length === 0, 'Invalid form opened dialog or submitted');
    assert(document.body.textContent?.includes('欄位不可為空'), 'Original field errors missing');
  });
  await test('Email and optional number validation remain in effect', async () => {
    await mount({ ...fixture, email: 'invalid', claimAmount: 'abc' }); await save();
    assert(!dialog() && calls.length === 0, 'Invalid email/number bypassed validators');
    assert(document.body.textContent?.includes('Email 格式不正確'), 'Email error missing');
    assert(document.body.textContent?.includes('請輸入數字'), 'Numeric error missing');
  });
  await test('Valid form: labelled modal, all 22 data rows, full statement; zero API calls', async () => {
    await mount(); await save();
    const modal = dialog(); assert(modal, 'Modal missing');
    assert(calls.length === 0, 'Validation sent API');
    assert(modal.querySelectorAll('dt').length === 22, 'Missing confirmation fields');
    assert(modal.textContent?.includes(fixture.name), 'Snapshot missing');
    assert(modal.textContent?.includes('五、準據法與管轄法院'), 'Last consent section missing');
    assert(modal.textContent?.includes('本校利用申請人個人資料期間為即日起十年內'), 'Statement incomplete');
    assert(modal.getAttribute('aria-labelledby') && modal.getAttribute('aria-describedby'), 'Accessible modal labels missing');
    assert(modal.contains(document.activeElement) && document.activeElement?.textContent === '學生保險資料確認及個資聲明', 'Initial focus not on title');
    assert(button('確認送出').disabled, 'Consent not required');
  });
  await test('Return preserves values; reopen resets consent; neither action sends API', async () => {
    await acknowledge(); await change(() => button('返回修改').click());
    assert(!dialog() && calls.length === 0, 'Return submitted data');
    assert(input('姓名').value === fixture.name, 'Return cleared form');
    assert(document.activeElement === button('儲存保險記錄'), 'Return focus missing');
    await save();
    assert(button('確認送出').disabled && !document.querySelector<HTMLInputElement>('#personal_data_consent')!.checked, 'Old consent reused');
  });
  await test('Escape closes and restores focus without submitting', async () => {
    await change(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert(!dialog() && calls.length === 0, 'Escape submitted or did not close');
    assert(document.activeElement === button('儲存保險記錄'), 'Escape focus missing');
  });
  await test('Modify after return: confirmation and submitted payload use updated value', async () => {
    await setInput('姓名', 'Edited Synthetic Student'); await save();
    assert(dialog()?.textContent?.includes('Edited Synthetic Student'), 'Old snapshot reused');
    await acknowledge(); await change(() => { button('確認送出').click(); button('確認送出').click(); });
    assert(calls.length === 1 && calls[0].data.name === 'Edited Synthetic Student', 'Duplicate or stale submission');
    assert(calls[0].method === 'post' && calls[0].headers.get('X-CSRF-Token') === 'synthetic-csrf-only', 'API contract/CSRF changed');
    assert(button('確認送出').disabled, 'Submitting button enabled');
  });
  await test('API failure stays in modal, announces error, preserves values and supports retry', async () => {
    await change(() => responses[0].reject({ response: { data: { message: 'Synthetic API failure' } } }));
    assert(dialog() && document.querySelector('[role="alert"]')?.textContent === 'Synthetic API failure', 'Failure handling missing');
    assert(!button('確認送出').disabled, 'Retry permanently locked');
    await change(() => button('確認送出').click());
    assert(calls.length === 2, 'Retry did not send once');
    assert(JSON.stringify(calls[0].data) === JSON.stringify(calls[1].data), 'Retry changed payload');
  });
  await test('Success uses original redirect and remains locked before navigation', async () => {
    await change(() => responses[1].resolve({ status: 201, data: {} }));
    assert(navigations.length === 1 && navigations[0] === '/admin/insurance', 'Success redirect changed');
    await change(() => button('確認送出').click());
    assert(calls.length === 2, 'Resubmitted after success');
  });
  await test('Form Enter/submit opens confirmation only', async () => {
    await mount();
    await change(() => document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    assert(dialog() && calls.length === 0, 'Form submission bypassed confirmation');
  });
  await test('Existing edit page retains PATCH and optional dates/stamp payload', async () => {
    await mount({ ...fixture, claimAmount: 20, claimDate: new Date(2026, 9, 30), insuranceCompanyStamp: true, insuranceCompanyTime: new Date(2026, 9, 30) }, 42);
    await save(); await acknowledge(); await change(() => button('確認送出').click());
    assert(calls.length === 1 && calls[0].method === 'patch' && calls[0].url?.endsWith('/42'), 'Edit API changed');
    assert(calls[0].data.claim_amount === 20 && calls[0].data.insurance_company_stamp === true && calls[0].data.insurance_company_timestamp, 'Optional data lost');
    await change(() => responses[0].resolve({ status: 204, data: {} }));
    assert(navigations[0] === '/admin/insurance', 'Edit redirect missing');
  });
  await test('Closing an in-flight request cannot start a duplicate; failure unlocks form', async () => {
    await mount(); await save(); await acknowledge(); await change(() => button('確認送出').click());
    await change(() => button('返回修改').click());
    assert(!dialog() && button('儲存保險記錄').disabled && calls.length === 1, 'In-flight request unlocked');
    assert(document.activeElement === input('申請日期'), 'Closing while saving lost keyboard focus');
    await change(() => responses[0].reject(new Error('Synthetic offline failure')));
    assert(!button('儲存保險記錄').disabled && document.querySelector('[role="alert"]')?.textContent === 'Synthetic offline failure', 'Closed-dialog error/recovery missing');
    await save(); assert(dialog() && button('確認送出').disabled, 'Recovery lost validation/consent');
  });
  await test('English modal preserves full English statement and consent gating', async () => {
    await mount(fixture, undefined, 'en');
    await change(() => button('Save Insurance Record').click());
    assert(dialog()?.textContent?.includes('Governing law and jurisdiction'), 'English statement incomplete');
    assert(button('Confirm and submit').disabled && calls.length === 0, 'English consent bypass');
    await acknowledge(); assert(!button('Confirm and submit').disabled, 'English consent failed');
    await change(() => button('Return to edit').click());
    assert(!dialog() && calls.length === 0, 'English return submitted');
  });
  await change(() => handleManualFixture());
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
  output.textContent = `${results.join('\n')}\n${results.filter(r => r.startsWith('PASS')).length}/${results.length} passed. API: in-memory only.\nManual keyboard fixture ready below.`;
}
function handleManualFixture() {
  calls.length = 0; navigations.length = 0;
  const locale = new URLSearchParams(location.search).get('locale') === 'en' ? 'en' : 'zh';
  document.documentElement.lang = locale;
  root.render(<Theme><InsuranceEditor key={++instance} locale={locale} defaultValues={fixture} /></Theme>);
}
run().catch((error) => { output.textContent += `\nFATAL ${String(error)}`; });
