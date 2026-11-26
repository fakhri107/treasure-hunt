# Treasure Hunt TMD — Design System Rules (`CLAUDE.md`)

Panduan sistem desain untuk integrasi Figma MCP dan pengembangan UI **Treasure Hunt TMD**, mencakup arsitektur kode saat ini serta referensi tema baru **Pirate / Treasure Hunt** (berdasarkan referensi visual yang diunggah).

---

## 1. Token Definitions

Token didefinisikan langsung di `tailwind.config` dan `<style>` pada [index.html](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/index.html#L14-L79) serta [admin.html](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/admin.html) (tanpa *token compiler* atau CSS preprocessor).

### 1.1 Token Aktif Saat Ini (Marvel Rivals)
```js
// index.html (tailwind.config.theme.extend.colors)
colors: {
  'slate-base': '#1D212B',
  'slate-nav': '#14171F',
  'slate-card': '#252A37',
  'slate-hover': '#2E3444',
  'rivals-yellow': '#FACC15',
  'rivals-silver': '#D8DCE6',
  'rivals-mint': '#10B981',
  'rivals-red': '#EF4444',
  'muted': '#9CA3AF'
}
```

### 1.2 Referensi Token Tema Baru (Pirate / Treasure Hunt)
Pemetaan langsung dari referensi UI Pirate/Treasure agar dapat menggantikan palet aktif tanpa mengubah struktur komponen:

| Token | Hex | Peran pada Referensi Tema Baru |
| :--- | :--- | :--- |
| `treasure-base` | `#261F29` | Canvas utama gelap bernuansa ungu-arang (*dark plum-slate*). |
| `treasure-nav` | `#1C161F` | Top bar navigasi & footer gelap. |
| `treasure-card` | `#342B38` | Permukaan kartu misi, senjata/pos, dan panel kuis. |
| `treasure-hover` | `#423747` | Hover state kartu & opsi jawaban. |
| `treasure-crimson` | `#A61024` | Kartu unggulan / bos pos / banner kapal bajak laut (*featured card*). |
| `treasure-gold` | `#E69B19` | CTA utama (`Play Now` / `Jawab` / `Buy Now`) & aksen peti harta. |
| `treasure-gold-hover` | `#F5B82E` | Hover state tombol CTA emas. |
| `gem-green` | `#10B981` | Indikator XP / Green Diamond / status pos selesai. |
| `gem-blue` | `#38BDF8` | Indikator Clue / Blue Diamond / info rute. |
| `gem-red` | `#EF4444` | Indikator peringatan / Red Diamond / tantangan berisiko. |
| `treasure-muted` | `#B8AEB9` | Teks deskripsi sekunder di atas permukaan gelap. |

### 1.3 Typography & Shape Tokens
- **Display (`font-display`)**: `Montserrat` (`700`–`900`, uppercase untuk judul pos & tombol aksi).
- **Body (`font-body`)**: `Plus Jakarta Sans` (`400`–`700`, untuk narasi soal & clue rute).
- **Shape**: Tema aktif memakai sudut miring `clip-path` (`.rivals-btn`, `.rivals-diagonal-bg`). Untuk tema Pirate/Treasure, ganti ke sudut membulat lembut (`rounded-xl` / `12px` pada kartu, `rounded-lg` / `8px` pada tombol CTA emas) dengan border tipis `1px solid rgba(255,255,255,0.08)`.

---

## 2. Component Library & Architecture

Tidak menggunakan framework komponen eksternal; seluruh UI dirender melalui DOM/template literal di `js/app.js` dan `js/admin-builder.js`:
- **Peserta ([index.html](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/index.html) + [app.js](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/js/app.js))**:
  - Top bar navigasi & pemilih tim (`.squad-thumb`).
  - Kartu *Checkpoint / Pos* (4 pos: `POS 1`–`POS 4`, status terkunci/terbuka, reward XP).
  - Modal/panel **Kuis Pilihan Ganda** (opsi A–D) & **Clue Rute Berikutnya**.
- **Admin ([admin.html](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/admin.html) + [admin-builder.js](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/js/admin-builder.js))**:
  - Tab `teams`, `checkpoints`, `content`, `monitor`, `supabase`.

---

## 3. Frameworks & Libraries

- **UI & Logic**: Vanilla JavaScript (IIFE pada namespace global `window.TMD`), tanpa React/Vue/bundler.
- **Styling**: Tailwind CSS via CDN (`https://cdn.tailwindcss.com`) + inline `<style>`.
- **Backend & Realtime**: `@supabase/supabase-js@2` via CDN, dikelola oleh [store.js](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/js/store.js).
- **Hosting**: Static site di Vercel ([vercel.json](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/vercel.json)).

---

## 4. Asset Management

- Aset statis disimpan di [assets/](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/assets) (saat ini `logo.png`), direferensikan relatif (`assets/logo.png`).
- Tidak ada pipeline optimasi build; gunakan format ringan (`webp`/`svg`) untuk ilustrasi tema baru (peti harta, kapal, berlian, pedang/kompas).

---

## 5. Icon System

1. **UI Icons**: Google `Material Symbols Outlined` via CDN (`<span class="material-symbols-outlined">...</span>`).
2. **Team / Emblem SVG**: Didefinisikan sebagai array objek pada [icons.js](file:///c:/Users/Bloem/Documents/Treasure%20Hunt%20TMD/js/icons.js) (`id`, `label`, `first`, `second`, `accent`, `svg`). Untuk tema Pirate/Treasure, cukup ganti/tambah entri SVG bertema bajak laut/kapal/kompas di file ini dengan `id` yang sama atau baru.

---

## 6. Styling Approach & Responsiveness

- **Utility-First + Custom CSS**: Kelas Tailwind di HTML/JS dikombinasikan dengan kelas kustom di `<style>` (`index.html`).
- **Responsiveness**: *Mobile-first* menggunakan breakpoint standar Tailwind (`sm:`, `md:`, `lg:`) dengan `viewport-fit=cover` dan `-webkit-tap-highlight-color: transparent` untuk penggunaan HP di lapangan.

---

## 7. Project Structure

```text
├── index.html            # Halaman utama peserta & konfigurasi Tailwind/CSS
├── admin.html            # Panel admin (kelola tim, pos, soal, monitor, Supabase)
├── supabase_schema.sql   # Skema tabel PostgreSQL & RLS publik
├── vercel.json           # Konfigurasi deploy statis
├── assets/
│   └── logo.png
└── js/
    ├── default-data.js   # Dataset default (5 tim, 4 pos, 31 soal, clue rute)
    ├── icons.js          # Koleksi emblem SVG tim
    ├── store.js          # State lokal + sinkronisasi realtime Supabase
    ├── app.js            # Logika & render UI peserta
    └── admin-builder.js  # Logika & render UI admin
```
