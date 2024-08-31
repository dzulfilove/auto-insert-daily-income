const axios = require("axios");

const { connectionBugis } = require("../config/Database.js");
const {
  getDataBulan,
  handleAddBulanan,
  getDataHarian,
  sendMessage,
  getTanggalInfo,
  getLastThreeDates,
} = require("../functions/Utils.js");

const port = 5005;
const token = "wFcCXiNy1euYho73dBGwkPhjjTdODzv6";
const namaKlinik = "Klinik Pratama Kosasih Amanah";
// const namaLab = "Laboratorium Kosasih bugis";
const idCabang = [20];

const bulanIndonesia = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const dataKlinik = [
  {
    nama: "Klinik Pratama Kosasih Amanah",
    id: 20,
    akun: "",
    jnsAkun: "klinik",
  },
];
const getPendapatan = async (req, res) => {
  const idPendapatanBarangKlinik = 401.001;
  const idPendapatanJasaKlinik = 402.001;
  const idPendapatanBarangLab = 401.007;
  const idPendapatanJasaLab = 402.007;

  const dates = getLastThreeDates();
  const pendapatanResults = [];

  for (const date of dates) {
    const queryGetPendapatanBarangKlinik = `
      SELECT SUM(debit - credit) AS balance
      FROM journaltrans
      WHERE approved = 1
        AND DATE(jtdate) = '${date.format1}'
        AND accountid = '${idPendapatanBarangKlinik}'
        AND division IN ('1');`;

    const queryGetPendapatanJasaKlinik = `
      SELECT SUM(debit - credit) AS balance
      FROM journaltrans
      WHERE approved = 1
        AND DATE(jtdate) = '${date.format1}'
        AND accountid = '${idPendapatanJasaKlinik}'
        AND division IN ('1');`;

    // Uncomment if needed for Lab
    // const queryGetPendapatanBarangLab = `
    //   SELECT SUM(debit - credit) AS balance
    //   FROM journaltrans
    //   WHERE approved = 1
    //     AND DATE(jtdate) = '${date.format1}'
    //     AND accountid = '${idPendapatanBarangLab}'
    //     AND division IN ('1');`;

    // const queryGetPendapatanJasaLab = `
    //   SELECT SUM(debit - credit) AS balance
    //   FROM journaltrans
    //   WHERE approved = 1
    //     AND DATE(jtdate) = '${date.format1}'
    //     AND accountid = '${idPendapatanJasaLab}'
    //     AND division IN ('1');`;

    try {
      const [resultPendapatanBarangKlinik] = await connectionBugis.query(
        queryGetPendapatanBarangKlinik
      );
      const [resultPendapatanJasaKlinik] = await connectionBugis.query(
        queryGetPendapatanJasaKlinik
      );
      // const [resultPendapatanBarangLab] = await connectionBugis.query(queryGetPendapatanBarangLab);
      // const [resultPendapatanJasaLab] = await connectionBugis.query(queryGetPendapatanJasaLab);

      pendapatanResults.push({
        tanggal: date, // Menyimpan semua format tanggal
        barangKlinik: Math.abs(resultPendapatanBarangKlinik[0].balance) || 0,
        jasaKlinik: Math.abs(resultPendapatanJasaKlinik[0].balance) || 0,
        // barangLab: Math.abs(resultPendapatanBarangLab[0].balance) || 0,
        // jasaLab: Math.abs(resultPendapatanJasaLab[0].balance) || 0,
      });
    } catch (error) {
      res.json({
        error: error.message,
      });
      return;
    }
  }

  res.json(pendapatanResults);
};

const storeHarian = async (req, res) => {
  try {
    const tanggalInfo = await getTanggalInfo(); // Gunakan nama klinik

    const fetch = await import("node-fetch");
    // Fetch data untuk setiap akun
    const response = await fetch.default(
      `http://202.157.189.177:5005/bugis/pendapatan/`
    );
    const dataResponse = await response.json();

    // Tentukan header respon agar data dapat di-stream
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // Looping 3 hari
    for (let dates of dataResponse) {
      for (let klinik of dataKlinik) {
        // Mengambil property yang mengandung kata "gigi" (diubah sesuai klinik.jnsAkun)
        // Pisahkan properti `tanggal` dari objek `dates`
        const { tanggal, ...klinikData } = dates;

        // Kata kunci klinik
        const klinikJnsAkunLower = klinik.jnsAkun.toLowerCase();

        // Log untuk debugging
        console.log("Klinik Jns Akun Lower:", klinikJnsAkunLower);
        console.log(
          "Available keys in klinikData object:",
          Object.keys(klinikData)
        );

        // Debug: Log kunci dan apakah termasuk klinikJnsAkunLower
        Object.keys(klinikData).forEach((key) => {
          console.log(
            `Key: ${key}, includes '${klinikJnsAkunLower}'? ${key
              .toLowerCase()
              .includes(klinikJnsAkunLower)}`
          );
        });

        // Mengambil property yang sesuai dengan akun klinik
        const dataIncome = Object.keys(klinikData)
          .filter((key) => key.toLowerCase().includes(klinikJnsAkunLower)) // convert key to lower case before includes
          .reduce((obj, key) => {
            obj[key] = klinikData[key];
            return obj;
          }, {});

        // Output
        console.log("Tanggal:", tanggal);
        console.log("Data Income:", dataIncome);

        // Mengambil pendapatan jasa
        const dataJasa = Object.keys(dataIncome)
          .filter((key) => key.includes("jasa"))
          .reduce((obj, key) => {
            obj[key] = dataIncome[key];
            obj["jml"] = dataIncome[key];
            return obj;
          }, {});

        // Mengambil pendapatan barang
        const dataBarang = Object.keys(dataIncome)
          .filter((key) => key.includes("barang"))
          .reduce((obj, key) => {
            obj[key] = dataIncome[key];
            obj["jml"] = dataIncome[key];
            return obj;
          }, {});

        // Mengecek apakah jasa adalah 0
        if (dataJasa.jml == 0.0) {
          const text = `Pendapatan ${klinik.nama}, Pada Tanggal ${dates.tanggal.format3}. Belum Terupdate Karena Data VPS Belum Tersedia Pada jam ${tanggalInfo.jamSekarang}`;
          await sendMessage(text);
          res.write(`<p>${text}</p>`);
          continue; // Lanjutkan ke klinik berikutnya jika jasa 0
        }

        // Mengambil atau membuat data bulanan klinik
        let dataBulanKlinik = await getDataBulan(klinik.id, klinik.nama);
        let idBulanan = 0;

        if (dataBulanKlinik.length > 0) {
          idBulanan = dataBulanKlinik[0].id;
        } else {
          const addBulanan = await handleAddBulanan(klinik.nama, klinik.id);
          idBulanan = addBulanan.id;
        }

        // Mengecek data harian
        const cekDataHarian = await getDataHarian(
          idBulanan,
          dates.tanggal.format2
        );

        if (cekDataHarian.length > 0) {
          const message = `Data Penjualan Harian sudah ada untuk tanggal ${dates.tanggal.format3}`;
          res.write(`<p>${message}</p>`);
          console.log(message);
          continue; // Lanjutkan ke klinik berikutnya jika data harian sudah ada
        }

        // POST request untuk menambahkan data harian
        const result = await axios({
          method: "POST",
          url: "http://202.157.189.177:8080/api/database/rows/table/665/?user_field_names=true",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            Judul: `Penjualan ${klinik.nama} Tanggal ${dates.tanggal.format3}`,
            "Id Cabang": klinik.id,
            "Id Penjualan Bulanan": [idBulanan],
            "Dari Tanggal": dates.tanggal.format1,
            "Sampai Tanggal": dates.tanggal.format1,
            "Penjualan Barang": dataBarang.jml || "0.00",
            "Penjualan Jasa": dataJasa.jml || "0.00",
            Diskon: 0,
            "Created At": new Date().toISOString(),
          },
        });

        // Kirim pesan sukses
        const text = `Pendapatan ${klinik.nama}, Pada Tanggal ${dates.tanggal.format3}. Telah Berhasil Ditambahkan Ke Baserow Pada jam ${tanggalInfo.jamSekarang}`;
        await sendMessage(text);
        res.write(`<p>${text}</p>`);
      }
    }

    // Akhiri respon
    res.write(`<p>Data successfully processed for all cabang</p>`);
    res.end();
  } catch (error) {
    res.write(`<p>Error: ${error.message}</p>`);
    res.end();
  }
};

module.exports = {
  getPendapatan,
  storeHarian,
};
