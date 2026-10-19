Catatan Freelancer

Nama: Muhammad Hanif Nasrullah
NRP: 5053251022

 Tautan

- Repo GitHub: https://github.com/etrltnxz/pweb-5053251022-ets
- GitHub Pages: https://etrltnxz.github.io/pweb-5053251022-ets

 Fitur yang Selesai
 Fitur minimum (W1-W6)

| ID | Fitur | Keterangan |
|---|---|---|
| W1 | Tambah transaksi | Form berisi klien, proyek, tanggal, status, kategori (5 pilihan tetap), nominal, dan catatan opsional |
| W2 | Daftar transaksi | Dirender dinamis dari JavaScript, terbaru di atas, nominal berformat Rupiah |
| W3 | Hapus transaksi | Ada konfirmasi sebelum data dihapus |
| W4 | Data persisten | Disimpan di `localStorage`, tetap ada setelah refresh atau browser ditutup |
| W5 | Ringkasan | Total pemasukan, total piutang, dan saldo, diperbarui otomatis setiap data berubah |
| W6 | Validasi form | Field wajib terisi dan nominal harus lebih dari 0; pesan error tampil di halaman |

Fitur khas (sesuai persona freelancer)

- Tagihan ke klien berstatus **Belum dibayar** atau **Lunas**.
- Tombol **Tandai lunas** dan **Batalkan lunas**; tagihan lunas otomatis menjadi pemasukan.
- Tanggal pelunasan tercatat otomatis.
- **Total piutang** ditampilkan di kartu ringkasan.
- Filter daftar: Semua, Belum dibayar, Lunas.
- Tombol **Hapus semua data** dengan konfirmasi.
- Migrasi otomatis data lama (`income`/`unpaid`/`expense`) ke format baru.
- Filter aktif disimpan di `sessionStorage`.
- Tampilan responsif untuk layar kecil dan tema latar biru gelap.
