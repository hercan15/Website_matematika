# Raja Jawab

Website latihan matematika kelas V SD untuk siswa, tanpa akun, nilai, kunci jawaban, atau koreksi.

## Menjalankan

```sh
npm install
npm run dev
```

Build produksi: `npm run build`. Hasil berada di `dist/` dan dapat dipublikasikan ke hosting statis. Jalankan `npm run preview` untuk memeriksa build.

## Isi Aplikasi

- 9 bab dengan tepat 25 soal per bab, total 225 soal orisinal.
- Setiap bab terdiri atas 8 soal mudah, 10 sedang, dan 7 menantang.
- Empat pilihan A-D, ilustrasi bangun, tabel, piktogram, dan diagram batang.
- Halaman beranda, daftar bab, petunjuk, persiapan, latihan, tinjauan, selesai, dan progres.
- Semua jawaban merupakan respons siswa. Tidak ada sistem pemeriksaan atau penyimpanan kunci jawaban.

Topik mengikuti daftar materi Matematika SD/MI Kelas V (2022) yang diberikan. Soal disusun mandiri sebagai latihan pendamping; bukan salinan soal dari buku.

## Timer dan Penyimpanan

Setiap soal memiliki 60.000 ms. Hanya soal yang terlihat memiliki deadline aktif. Perpindahan soal menyimpan sisa waktu yang tepat; kembali ke soal tidak mengulang timer. Satu interval membaca deadline, bukan mengurangi counter dengan asumsi interval selalu tepat satu detik.

Jawaban, posisi, sisa waktu, dan status per bab tersimpan di Local Storage dengan key `raja-jawab:progress:v1`. Deadline juga disimpan untuk pemulihan jika halaman tertutup mendadak. Timer dijeda saat keluar, membuka dialog/menu, atau tab tidak terlihat. Soal kedaluwarsa dapat dibaca kembali, tetapi responsnya terkunci.

Bab dapat diselesaikan setelah semua 25 soal dijawab atau waktunya habis. Soal yang hanya dikunjungi tetapi belum dijawab dan masih memiliki waktu belum dianggap tuntas. Tinjauan mencantumkan jumlah terisi dan kosong, bukan skor. Siswa harus menekan `Selesaikan Latihan` untuk menandai bab selesai.

Penyimpanan berlaku di browser/perangkat yang sama. Menghapus data browser akan menghapus progres. Aplikasi memberi peringatan jika penyimpanan diblokir.

## Struktur

- `src/App.tsx`: halaman dan navigasi hash, tanpa kebutuhan konfigurasi rewrite server.
- `src/data/questions.ts`: seluruh soal, metadata bab, dan validasi integritas konten.
- `src/hooks/usePractice.ts`: timer, sesi, pemulihan, dan penyimpanan.
- `src/components/MathVisual.tsx`: ilustrasi SVG serta tabel dan diagram yang aksesibel.
- `src/index.css`: tipografi lokal, desain responsif, dan pengurangan gerakan.
- `tests/practice.spec.ts`: validasi seluruh 225 soal dan pengujian browser.

## Pengujian

```sh
npx playwright install --with-deps chromium
npm run dev
npx playwright test
npx tsc --noEmit
npm run build
```

Pengujian mencakup akses dan pemilihan jawaban untuk seluruh 225 soal, penyelesaian 9 bab, distribusi tingkat kesulitan, timer terpisah, muat ulang, waktu habis, jeda, syarat penyelesaian, pengulangan bab, pencarian, petunjuk, dan lebar layar 320-1440 piksel.