const axios = require("axios");
const { connectionGading } = require("../config/Database.js");
const {
  getDataBulan,
  getDataHarian,
  handleAddBulanan,
  sendMessage,
  getTanggalInfo,
  getLastThreeDates,
} = require("../functions/Utils.js");

const port = 5005;
const token = "wFcCXiNy1euYho73dBGwkPhjjTdODzv6";
const namaKlinik = "Klinik Kosasih Rawat Inap Sumber Waras";
const namaLab = "Laboratorium Sumber Waras";
const dataKlinik = [
  {
    nama: "Klinik Kosasih Rawat Inap Sumber Waras",
    id: 4,
    akun: "",
    jnsAkun: "klinik",
  },
  {
    nama: "Laboratorium Sumber Waras",
    id: 5,
    akun: "",
    jnsAkun: "lab",
  },
];
const idCabang = [5, 4];
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

// Mendapatkan tanggal hari ini// Mengimpor pustaka moment.js
const moment = require("moment");

// Mendapatkan tanggal hari ini
const tanggalHariIni = moment();

// Mengurangi satu hari untuk mendapatkan tanggal kemarin
const tanggalKemarin = tanggalHariIni.subtract(1, "days");

// Mendapatkan hari, tahun, dan bulan dari tanggal kemarin
const hari = tanggalKemarin.date();
const tahun = tanggalKemarin.year();
const bulan = tanggalKemarin.format("MM"); // Mendapatkan bulan dalam format dua digit

// Mendapatkan jam dan menit dari tanggal kemarin
const jam = tanggalKemarin.format("HH");
const menit = tanggalKemarin.format("mm");

const tanggalFormat = `${tahun}-${bulan}-${hari}`;
const bulanString = tanggalKemarin.format("MMMM"); // Mendapatkan nama bulan dalam bahasa Indonesia
const waktuFormat = `${jam}:${menit}`;

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

    const queryGetPendapatanBarangLab = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
        AND DATE(jtdate) = '${date.format1}'
      AND accountid = '${idPendapatanBarangLab}'
      AND division IN ('1');`;

    const queryGetPendapatanJasaLab = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
        AND DATE(jtdate) = '${date.format1}'
      AND accountid = '${idPendapatanJasaLab}'
      AND division IN ('1');`;

    try {
      const [resultPendapatanBarangKlinik] = await connectionGading.query(
        queryGetPendapatanBarangKlinik
      );
      const [resultPendapatanJasaKlinik] = await connectionGading.query(
        queryGetPendapatanJasaKlinik
      );
      const [resultPendapatanBarangLab] = await connectionGading.query(
        queryGetPendapatanBarangLab
      );
      const [resultPendapatanJasaLab] = await connectionGading.query(
        queryGetPendapatanJasaLab
      );

      pendapatanResults.push({
        tanggal: date, // Menyimpan semua format tanggal
        barangKlinik: Math.abs(resultPendapatanBarangKlinik[0].balance) || 0,
        jasaKlinik: Math.abs(resultPendapatanJasaKlinik[0].balance) || 0,
        barangLab: Math.abs(resultPendapatanBarangLab[0].balance) || 0,
        jasaLab: Math.abs(resultPendapatanJasaLab[0].balance) || 0,
      });
    } catch (error) {
      res.json({
        error: error.message,
      });
    }
  }
  res.json(pendapatanResults);
};

const storeHarian = async (req, res) => {
  const tanggalInfo = await getTanggalInfo(); // Gunakan nama klinik

  try {
    const fetch = await import("node-fetch");

    const response = await fetch.default(
      `http://202.157.189.177:5005/gading/pendapatan/`
    );
    const dataResponse = await response.json();
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // Looping untuk setiap tanggal dalam dataResponse
    for (let dates of dataResponse) {
      for (let klinik of dataKlinik) {
        // Pisahkan properti `tanggal` dari objek `dates`
        const { tanggal, ...klinikData } = dates;

        // Mengambil property yang mengandung kata sesuai dengan klinik.jnsAkun
        const klinikJnsAkunLower = klinik.jnsAkun.toLowerCase();

        // Debugging logs
        console.log("Klinik Jns Akun Lower:", klinikJnsAkunLower);
        console.log(
          "Available keys in klinikData object:",
          Object.keys(klinikData)
        );

        // Mengambil property yang sesuai dengan akun klinik
        const dataIncome = Object.keys(klinikData)
          .filter((key) => key.toLowerCase().includes(klinikJnsAkunLower))
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
          continue;
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
          const message = `Data Penjualan Harian ${klinik.nama} sudah ada untuk tanggal ${dates.tanggal.format3}`;
          res.write(`<p>${message}</p>`);
          console.log(message);
          continue;
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
