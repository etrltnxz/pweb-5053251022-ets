1. Persona dan Masalahnya

Persona: Developer Freelance yang tidak memiliki pencatatan terhadap pembayaran dari projek projeknya

Masalahnya: pembayaran projek telat, dan tidak tercatat income dari projeknya

2. StrukDat

{
  id: 1760851200000,            // number, dari Date.now()
  client: "PT Maju Jaya",       // string
  project: "Web Saham",         // string
  category: "Pengembangan Web", // string, 5 pilihan tetap
  amount: 2500000,              // number, > 0
  status: "unpaid",             // "unpaid" | "paid"
  date: "2026-10-19",           // tanggal tagihan (yyyy-mm-dd)
  paidDate: null,               // tanggal lunas atau null
  notes: ""                     // string
}

3. Desain
Saya memakai localStorage sebagai media penyimpanan data transaksi. Karna ini masih berupa web sederhana yang tidak membutuhkan server
atau database eksternal. Data dapat disimpan langsung di browser sehingga implementasinya lebih
sederhana dan transaksi tetap tersedia setelah halaman dirender.

Bug : 
1. Prompt: Data transaksi yang sudah ditambahkan terkadang tidak muncul kembali setelah halaman dimuat ulang.
   AI : function load() {
        try {
          const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
          if (!Array.isArray(data)) return [];
   
      //Validasi dan penyesuaian data
   
            } catch {
          return [];
        }
      }
   
  kodeku: function load() {
           try {
              const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
              if (!Array.isArray(data)) return [];
          
              return data
                .map((t) => {
                  if (t.status === "paid" || t.status === "unpaid") return t;
                  if (t.type === "income") return { ...t, status: "paid" };
                  if (t.type === "unpaid") return { ...t, status: "unpaid" };
                  return null; 
                })
                .filter((t) => t && t.date && t.amount)
                .map((t) => ({
                  ...t,
                  client: t.client || "-",
                  project: t.project || t.desc || "(tanpa nama)",
                  category: t.category || "Lainnya",
                  notes: t.notes || "",
                }));
            } catch {
              return [];
            }
          }
  2.  Prompt : kenapa Ringkasan pemasukan, piutang, dan saldo terkadang menunjukkan nilai yang tidak sesuai dengan data transaksi. 
          (Saya beirkan kode bagian Summary di js)
      
      AI : 
        function updateSummary() {
          const income = transactions
            .filter((t) => t.status === "paid")
            .reduce((total, t) => total + t.amount, 0);

          const receivable = transactions
            .filter((t) => t.status === "unpaid")
            .reduce((total, t) => total + t.amount, 0);

          document.getElementById("income").textContent = income;
          document.getElementById("receivable").textContent = receivable;
          document.getElementById("balance").textContent = income;
        }

      kodeku : 

            const sum = (status) =>
        transactions
          .filter((t) => t.status === status)
          .reduce((s, t) => s + (t.amount || 0), 0);

      const income = sum("paid");
      const receivable = sum("unpaid");

      document.getElementById("income").textContent = rupiah(income);
      document.getElementById("receivable").textContent = rupiah(receivable);
      document.getElementById("balance").textContent = rupiah(income);
      
3. render() error karena elemen tidak ditemukan Halaman tidak menampilkan daftar dan konsol browser menampilkan error Cannot set properties of null (setting 'textContent').
4. 
