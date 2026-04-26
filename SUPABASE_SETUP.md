# Setup Data Online

Website ini tetap bisa jalan di GitHub Pages. Agar edit dari dashboard ikut berubah di device lain, isi `cloud-config.js` dengan data Supabase.

## 1. Buat project Supabase

1. Buka Supabase, buat project baru.
2. Ambil `Project URL` dan `anon public key` dari menu API.
3. Masukkan ke `cloud-config.js`.

```js
window.StoreCloudConfig = {
  provider: "supabase",
  supabaseUrl: "https://PROJECT_ID.supabase.co",
  supabaseAnonKey: "ANON_PUBLIC_KEY",
  table: "site_store",
  rowId: "threadline",
};
```

## 2. Buat tabel

Jalankan SQL ini di Supabase SQL Editor.

```sql
create table if not exists public.site_store (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.site_store enable row level security;

create policy "Public can read store"
on public.site_store
for select
to anon
using (id = 'threadline');

create policy "Public can save store"
on public.site_store
for insert
to anon
with check (id = 'threadline');

create policy "Public can update store"
on public.site_store
for update
to anon
using (id = 'threadline')
with check (id = 'threadline');
```

## Catatan penting

Dashboard ini masih frontend-only. Username dan password di `dashboard.js` bisa dilihat oleh orang yang membuka source website. Untuk toko produksi, sebaiknya nanti login dan penyimpanan dipindah ke backend/serverless function.
