# AB Stream Goal

Widget subscriber goal ringan untuk channel YouTube AnasBex. Server lokal Express menyajikan dashboard dan overlay OBS, menyimpan konfigurasi ke JSON, serta menyebarkan pembaruan melalui WebSocket. Frontend memakai HTML, CSS, dan JavaScript vanilla.

## Menjalankan

Memerlukan Node.js 20 atau lebih baru.

```sh
npm install
```

Salin `.env.example` menjadi `.env`. `PORT` opsional (default `3000`). Untuk mode otomatis, isi `YOUTUBE_API_KEY` dan `YOUTUBE_CHANNEL_ID`; key hanya dibaca backend dan tidak dikirim ke browser. Jalankan:

```sh
npm start
```

Buka dashboard di [http://localhost:3000/dashboard](http://localhost:3000/dashboard) dan overlay di [http://localhost:3000/](http://localhost:3000/). Untuk pengembangan gunakan `npm run dev`.

## OBS Studio

1. Tambahkan **Browser Source** dan centang **Local file** dalam pengaturan sumber.
2. Masukkan URL `http://localhost:3000/` (tanpa memilih Local file, karena overlay disajikan server HTTP lokal).
3. Mulai dengan ukuran **500 × 180 px**, lalu posisikan di canvas. Halaman overlay memiliki latar transparan di luar widget.
4. Biarkan server berjalan selama livestream berlangsung.

## Penggunaan

Dashboard mengubah nama channel, target, jumlah manual, aksen/teks, ukuran tipografi, tinggi progress bar, dan mode pembaruan. Perubahan tersimpan pada `data/config.json` dan langsung dikirim ke overlay. Ganti mode ke **YouTube API otomatis** setelah kredensial tersedia. Interval default 5 menit dan minimum 60 detik untuk membatasi pemakaian quota. Jika API gagal atau quota habis, jumlah terakhir tetap terlihat dan status error muncul di overlay/dashboard; mode manual tetap dapat digunakan.

YouTube dapat membulatkan angka subscriber publik. Angka otomatis yang diterima widget tidak selalu merupakan hitungan eksak.

## Struktur

```text
public/                 UI dashboard dan overlay
src/server/             Express server, konfigurasi dan persistence
src/services/           YouTube Data API service
src/websocket/          Siaran state real-time
data/                   Konfigurasi lokal (diabaikan Git)
test/                   Tes unit Node.js
```

Jalankan tes dengan `npm test`.
