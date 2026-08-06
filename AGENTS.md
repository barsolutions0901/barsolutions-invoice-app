## Objective
- Memperbaiki performa aplikasi Barsolutions Invoice (lemot, loading spinner lama) dan meningkatkan PageSpeed score (saat ini 65% Railway, 55% Vercel)

## Important Details
- Data masih sedikit (< 100 records), jadi bottleneck bukan volume data
- Backend di Railway (US - sfo), frontend di Vercel
- Frontend SPA monolithic inline (~3881 baris index.html) dengan banyak library CDN
- Ada dua kopi index.html: root (Vercel) dan `Backend/public/index.html` (Railway/Docker)
- JWT_SECRET harus sama antara deployment agar token tidak invalid; user perlu login ulang setelah redeploy
- `railway up` dijalankan dari direktori `Backend/` (build context terbatas)

## Work State
### Completed
- Installed & enabled `compression` middleware (gzip) di Express
- Hapus `include: { items: true }` dari query list bootstrap, invoice.service, quotation.service (items hanya di query detail/get)
- Naikkan cache TTL: bootstrap 15s→60s, client invoice/quot 5s→300s
- Branding (logo, bg) dibuat non-blocking (`.then()` bukan `await`)
- Hapus handler `dashboard` redundant dari api.controller
- Tambah 15 database indexes di schema.prisma + migration SQL
- PrismaClient constructor: hapus `connectionTimeout` (tidak valid di Prisma v6)
- Fix path Express static/sendFile ke `Backend/public/index.html` untuk Docker
- Tambah `preconnect` + `preload` untuk DataTables CSS
- Tambah `width`/`height` pada semua elemen gambar statis & di template JS strings
- Tambah `loading="lazy" decoding="async"` pada gambar di template
- Tambah `<meta name="description">` di head
- Hapus `apexcharts`, `qrcodejs`, `html2pdf.js` dari static script loading (HTML)
- Tambah `defer` pada DataTables JS
- Tambah lazy loading helpers: `loadScript()`, `ensureApexCharts()`, `ensureQRCode()`, `ensureHtml2pdf()`
- Modifikasi `loadDashboard()` → `await ensureApexCharts()` sebelum render grafik
- Modifikasi `renderQr()` → async, lazy load QRCodeJS jika belum tersedia
- Modifikasi `downloadInvoicePdf()` / `downloadQuotationPdf()` → async, `await ensureHtml2pdf()` diawal
- Modifikasi `viewInvoicePdf()`, `viewQuotationPdf()`, `showPublicInvoice()`, `showPublicQuotation()`, `renderTplPreview()` → `await renderQr(...)` (since renderQr now async)
- Sync `index.html` → `Backend/public/index.html`
- Fase 1 perf: `defer` pada jQuery/Bootstrap JS/SweetAlert2; Google Fonts turun ke wght 400-800 (buang 300)
- Fase 1 perf: `Promise.all` untuk services/clients/invoices di `loadInvoices`, `loadQuotations`, `loadPayments`
- Fase 1 perf: cache `settings.list` (TTL 60s, invalidasi di update/upload); sanitize `settings` (hapus base64 gambar) di `getPublic`/`getPdfData`
- Fase 2 aset: model `Asset` + migration `add_asset_table`; `scripts/migrate-assets.js` (idempotent, jalan saat startup server) memindah base64 dari `Setting.data` ke tabel Asset
- Fase 2 aset: `file.service` dukung key name (`getFile`, `sendFile` via GET `/api/file/:key` + Cache-Control), `settings.upload`/`update` normalisasi ke Asset
- Fase 2 aset: frontend pakai helper `assetUrl()` untuk semua `<img src>` aset; login branding/bg langsung pakai URL (tanpa round-trip `file/get`)
- Fase 2: `auth.middleware` cache user lookup per id (TTL 30s)
- Fase 2: PgBouncer AKTIF — `DATABASE_URL` = transaction pooler Supabase (ap-southeast-1, port 6543, `?pgbouncer=true&connection_limit=5`); `directUrl` dipakai `prisma migrate deploy` (port 5432). Wajib set `DIRECT_URL` di semua host.

### Active
- (none)

### Blocked
- Konsolidasi 4 backend → 1: butuh akses dashboard Railway/Vercel/Render/Koyeb
- Set env di semua host: `DATABASE_URL` (pooler), `DIRECT_URL` (direct 5432), `JWT_SECRET` sama

## Next Move
1. Review & commit & push
2. `railway up` dari `Backend/` (migration `add_asset_table` + `migrate-assets` otomatis saat start)
3. Deploy ulang frontend ke Vercel
4. Login ulang (JWT_SECRET berubah)
5. Tes akses, cek DevTools Network (payload settings harus kecil), lalu PageSpeed

## Relevant Files
- `index.html` (root): Frontend SPA utama — semua modifikasi PageSpeed dilakukan di sini
- `Backend/public/index.html`: Kopi untuk Railway/Docker — harus di-sync setelah perubahan
- `Backend/src/config/prisma.js`: PrismaClient config
- `Backend/src/services/bootstrap.service.js`: Query bootstrap tanpa items; cache TTL 60s
- `Backend/src/services/invoice.service.js` & `quotation.service.js`: list query tanpa items
- `Backend/src/app.js`: Compression + static path
- `Backend/Dockerfile`: Build container, copy `public/` dan jalankan migrations
- `Backend/prisma/schema.prisma`: +15 indexes
- `Backend/prisma/migrations/add_performance_indexes/migration.sql`: Migration SQL untuk indexes
