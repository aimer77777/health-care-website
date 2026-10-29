// Test-only browser bundle: actual editor, validators, Radix, usecase and API repo.
// Only translations/navigation are local stubs; axios uses an in-memory adapter.
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const compiled = require('next/dist/compiled/webpack/webpack');
compiled.init();
const webpack = compiled.webpack;
const root = path.resolve(__dirname, '../..');
const output = path.join(__dirname, '.browser');
webpack({
  mode: 'development', devtool: false, context: root,
  entry: path.join(__dirname, 'browser.tsx'),
  output: { path: output, filename: 'test.js' },
  resolve: { extensions: ['.tsx', '.ts', '.js'], symlinks: false, alias: {
    '@/navigation$': path.join(__dirname, 'navigation.ts'),
    'next-intl$': path.join(__dirname, 'intl.ts'),
    '@': path.join(root, 'src'),
  } },
  module: { rules: [
    { test: /\.tsx?$/, exclude: /node_modules/, use: path.join(__dirname, 'transpile.cjs') },
    { test: /\.css$/, type: 'asset/source' },
  ] },
  plugins: [new webpack.DefinePlugin({ 'process.env.NEXT_PUBLIC_BACKEND_HOST': JSON.stringify('http://127.0.0.1:4173') })],
}, (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }));
    process.exitCode = 1;
    return;
  }
  console.log('Browser test bundle built.');
  if (!process.argv.includes('--serve')) return;
  const css = fs.readFileSync(path.join(root, 'node_modules/@radix-ui/themes/styles.css'), 'utf8');
  http.createServer((req, res) => {
    if (req.url === '/test.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(fs.readFileSync(path.join(output, 'test.js'))); }
    else if (req.url === '/theme.css') { res.setHeader('Content-Type', 'text/css'); res.end(css); }
    else if (req.url === '/app.css') { res.setHeader('Content-Type', 'text/css'); res.end(fs.readFileSync(path.join(output, 'app.css'))); }
    else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="connect-src \'none\'"><title>Insurance confirmation tests — synthetic data</title><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/theme.css"><style>body{margin:24px;font-family:sans-serif}#app{max-width:1000px;margin:auto}#results{white-space:pre-wrap;font-size:12px;margin-bottom:20px}</style><div id="results" role="status">Running synthetic tests…</div><div id="manual"></div><div id="app"></div><script src="/test.js"></script></html>');
    }
  }).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
});
