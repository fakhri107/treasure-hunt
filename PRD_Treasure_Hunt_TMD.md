# Product Requirements Document (PRD)
## Web App Treasure Hunt Perkaderan (TMD) — Edisi Kepemimpinan

| Metadata Dokumen | Detail |
| :--- | :--- |
| **Nama Produk** | Treasure Hunt Perkaderan (TMD) Web App |
| **Tema Visual UI** | Marvel Cinematic Tactical Dossier (Dark Editorial) |
| **Arsitektur & Tech Stack** | **Supabase** (PostgreSQL + Realtime DB), **Vercel** (Cloud Hosting HTTPS), **Leaflet.js + OpenStreetMap** |
| **Target Pengguna** | Siswa Peserta Perkaderan (via HP), Penjaga Pos, & Panitia/Admin |
| **Status Dokumen** | **Final Specification** — Siap Dilaporkan & Diimplementasikan |
| **Tanggal** | 18 November 2026 |

---

## 1. Latar Belakang & Tujuan Produk
Kegiatan **Treasure Hunt Perkaderan (TMD)** dirancang untuk melatih kepemimpinan, integritas, solidaritas, dan pemecahan masalah peserta secara berkelompok di lapangan menggunakan perangkat *smartphone* (HP). Untuk mencegah penumpukan peserta di satu titik (*anti-crowding*) serta memberikan fleksibilitas penuh bagi panitia, aplikasi web ini dibangun dengan ketentuan utama:
1. **100% Dinamis & Dapat Diisi Manual oleh Pengguna (Panitia)**: Jumlah kelompok, daftar pos, titik koordinat peta, soal pilihan ganda, *clue* rute, hingga *password/token* setiap pos dapat dibuat, diisi, diubah, dan dihapus langsung melalui antarmuka aplikasi tanpa menyentuh kode program.
2. **Verifikasi Pos Berbasis Password/Token (Tanpa Scan QR)**: Menghilangkan ketergantungan pada kamera HP di lapangan; peserta cukup memasukkan *Password/Token Pos* dari penjaga pos untuk membuka soal tantangan.
3. **Peta Rute Realtime Berbasis OpenStreetMap**: Menggunakan GPS HP peserta (`navigator.geolocation`) yang dipetakan langsung di atas kanvas **OpenStreetMap (Leaflet.js)** untuk memandu rute kelompok dan memantau posisi peserta secara *live*.
4. **Database Cloud Supabase & Hosting Vercel**: Menjamin aplikasi dapat diakses dari HP mana pun dengan koneksi `HTTPS` (syarat wajib izin GPS di browser HP) dan sinkronisasi data *realtime* antar-perangkat.

---

## 2. Peran Pengguna (*User Roles*)

| Peran | Hak Akses & Aktivitas Utama |
| :--- | :--- |
| **Panitia / Admin (Pembuat Acara)** | Mengisi secara manual seluruh data kegiatan melalui **Panel Kelola (Admin Builder)**: menambah/mengedit kelompok, menentukan jumlah pos beserta titik koordinatnya di peta **OpenStreetMap**, mengisi soal & kunci jawaban, mengatur *clue* & *password/token* pos, serta memantau progres & lokasi GPS kelompok secara *realtime*. |
| **Penjaga Pos** | Memegang *Password/Token* pos sesuai yang diatur panitia di sistem dan memberikannya kepada kelompok yang telah tiba di titik pos serta menyelesaikan instruksi lapangan. |
| **Peserta (Kelompok di HP)** | Mengakses URL **Vercel** melalui browser HP, memilih kelompok, mengaktifkan lokasi GPS *realtime* di **OpenStreetMap**, memasukkan *Password/Token Pos*, menjawab kuis untuk mengumpulkan XP, dan membaca *clue* menuju pos berikutnya hingga pos puncak. |

---

## 3. Spesifikasi Fitur Utama (*Functional Requirements*)

### 3.1 Self-Service Builder: Input Manual Kelompok, Pos, Soal & Clue (CRUD Penuh)
Aplikasi menyediakan halaman/panel **Kelola Kegiatan (Admin Mode)** sehingga pengguna dapat mengatur seluruh konten secara mandiri:
1. **Input & Edit Kelompok Manual**:
   - Pengguna dapat menambah, mengubah, atau menghapus kelompok secara bebas (nama kelompok, nama divisi/karakter, warna tema/aksen, kode rute, dan URL gambar/avatar).
   - Dilengkapi tombol *"Muat Template Default (4 Skuad Marvel)"* jika pengguna ingin memulai cepat dari template awal.
2. **Input & Edit Pos Manual (Dinamis)**:
   - Pengguna dapat menentukan sendiri jumlah pos (misalnya 3, 4, 5 pos, atau lebih).
   - Setiap pos dapat diatur: Nomor Urut Pos, Nama Pos, Kategori Tantangan, Bobot Poin XP, Status Pos Konvergensi/Titik Kumpul Akhir, serta titik koordinat **Latitude & Longitude** (bisa diketik manual atau **klik langsung di atas peta OpenStreetMap**).
3. **Input & Edit Soal, Clue & Password/Token Manual**:
   - Pengguna dapat mengisi soal pilihan ganda (Teks Soal, Opsi A, B, C, D, dan Kunci Jawaban) untuk setiap pos — baik soal yang berlaku umum di pos tersebut maupun soal khusus per kelompok.
   - Pengguna dapat mengisi **Password/Token Pembuka Pos** (misal: `POS2-MERAH`, `STARK-02`, `GARUDA-1`) dan **Teks Clue / Teka-teki Lokasi** menuju pos berikutnya untuk masing-masing kelompok.

### 3.2 Verifikasi Kehadiran Pos dengan Password / Token (Tanpa QR)
- Fitur kamera/scan QR dihapus sepenuhnya.
- Saat kelompok tiba di suatu pos, layar HP menampilkan kolom **Input Password / Token Pos**.
- Setelah token yang dimasukkan cocok dengan data token pos di **Supabase**, soal kuis pos tersebut terbuka.
- Setelah soal dijawab dengan benar, poin XP kelompok bertambah secara otomatis dan *clue* beserta titik arah menuju pos berikutnya terbuka.

### 3.3 Rute & Pelacakan Lokasi Realtime (OpenStreetMap + Leaflet.js)
- **Peta Interaktif OpenStreetMap**:
  - Menggunakan *library* **Leaflet.js** dengan layer peta **OpenStreetMap** yang ringan diakses dari jaringan seluler HP.
  - Menampilkan *marker* posisi kelompok saat ini (*live pulse dot*), *marker* titik pos yang sudah terbuka/diselesaikan, serta garis bantu arah (*polyline*) dan kalkulasi jarak lurus otomatis (dalam satuan meter) dari posisi HP peserta ke titik pos tujuan.
- **Pelacakan GPS Realtime (`watchPosition`)**:
  - Saat peserta menekan tombol **"Aktifkan Lokasi"**, aplikasi membaca koordinat GPS HP secara kontinu dan mengirim titik lokasi terbaru ke tabel `teams` di **Supabase** sehingga panitia dapat memantau pergerakan tiap kelompok di peta utama.

### 3.4 Sinkronisasi Realtime & Penyimpanan Cloud (Supabase + Vercel)
- **Supabase Database**: Seluruh konfigurasi kelompok, pos, soal, clue, skor XP, dan koordinat GPS disimpan di PostgreSQL Supabase (dengan cadangan *fallback* ke `localStorage` apabila koneksi internet di lapangan sempat terputus).
- **Vercel Hosting**: Aplikasi di-*deploy* ke Vercel sehingga memiliki domain `https://...vercel.app` yang cepat, gratis, dan mendukung izin Geolocation API di Android maupun iOS.

---

## 4. Rancangan Skema Database (Supabase PostgreSQL)

1. **`teams`**: `id`, `sort_order`, `name`, `division_title`, `color_name`, `accent_hex`, `route_code`, `hero_first`, `hero_second`, `image_url`, `last_lat`, `last_lng`, `last_seen_at`
2. **`checkpoints`**: `id`, `pos_number`, `title`, `category_label`, `xp_reward`, `lat`, `lng`, `is_convergence`
3. **`questions`**: `id`, `checkpoint_id`, `team_id` (opsional jika soal berbeda per tim), `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`
4. **`route_clues`**: `id`, `checkpoint_id`, `team_id`, `access_token` (Password/Token Pos), `next_clue_text`, `distance_label`
5. **`team_progress`**: `id`, `team_id`, `checkpoint_id`, `token_verified`, `quiz_solved`, `selected_option`, `verified_at`, `solved_at`

---

## 5. Tahapan Implementasi (*Roadmap*)

1. **Tahap 1 (Selesai)**: UI Marvel Cinematic, Alur Kuis & Gate Password/Token Pos, Modul Dasar Geolocation GPS (`index.html`).
2. **Tahap 2 (Berikutnya)**: **Panel Admin / Builder Manual (CRUD)** untuk tambah/edit Kelompok, Pos, Soal, Clue & Token + Integrasi **Supabase**.
3. **Tahap 3**: **Integrasi Peta OpenStreetMap (Leaflet.js)** untuk peserta (rute & jarak GPS *live*) dan untuk Admin (*klik peta untuk pasang titik koordinat pos*).
4. **Tahap 4**: **Deployment ke Vercel** & Pengujian End-to-End di Browser HP.
