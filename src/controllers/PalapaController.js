const axios = require("axios");
const { connectionPalapa } = require("../config/Database.js");
const {
  getDataBulan,
  getDataHarian,
  handleAddBulanan,
  sendMessage,
  getTanggalInfo,
} = require("../functions/Utils.js");

const port = 5005;
const token = "wFcCXiNy1euYho73dBGwkPhjjTdODzv6";
const namaKlinik = "Klinik Pratama Kosasih Palapa";
const idCabang = [21];
const dataKlinik = [
  {
    nama: "Klinik Pratama Kosasih Palapa",
    id: 21,
    akun: "",
    jnsAkun: "Klinik",
  },
];
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
// Mengimpor pustaka moment.js
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

  const queryGetPendapatanBarangKlinik = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
      AND DATE(jtdate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      AND accountid = '${idPendapatanBarangKlinik}'
      AND division IN ('1');`;

  const queryGetPendapatanJasaKlinik = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
      AND DATE(jtdate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      AND accountid = '${idPendapatanJasaKlinik}'
      AND division IN ('1');`;

  try {
    const [resultPendapatanBarangKlinik] = await connectionPalapa.query(
      queryGetPendapatanBarangKlinik
    );
    const [resultPendapatanJasaKlinik] = await connectionPalapa.query(
      queryGetPendapatanJasaKlinik
    );

    const pendapatan = {
      barangKlinik: Math.abs(resultPendapatanBarangKlinik[0].balance) || 0,
      jasaKlinik: Math.abs(resultPendapatanJasaKlinik[0].balance) || 0,
    };

    res.json(pendapatan);
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
};

const storeHarian = async (req, res) => {
  const tanggalInfo = await getTanggalInfo(); // Gunakan nama klinik

  try {
    let mess = "";
    const promises = dataKlinik.map(async (klinik) => {
      // Fetch data untuk setiap akun
      const fetch = await import("node-fetch");

      const response = await fetch.default(
        `http://202.157.189.177/:5005/palapa/pendapatan/${klinik.akun}`
      );
      const dataResponse = await response.json();

      // Mengambil property yang mengandung kata "gigi" (diubah sesuai klinik.jnsAkun)
      const klinikJnsAkunLower = klinik.jnsAkun.toLowerCase();
      // Mengambil property yang mengandung kata "gigi"
      const dataIncome = Object.keys(dataResponse)
        .filter((key) => key.includes(`${klinik.jnsAkun}`))
        .reduce((obj, key) => {
          obj[key] = dataResponse[key];
          return obj;
        }, {});
      const dataJasa = Object.keys(dataIncome)
        .filter((key) => key.includes("jasa"))
        .reduce((obj, key) => {
          obj[key] = dataIncome[key]; // Keep the original property
          obj["jml"] = dataIncome[key]; // Add the new property 'jml' with the same value
          return obj;
        }, {});

      const dataBarang = Object.keys(dataIncome)
        .filter((key) => key.includes("barang"))
        .reduce((obj, key) => {
          obj[key] = dataIncome[key]; // Keep the original property
          obj["jml"] = dataIncome[key]; // Add the new property 'jml' with the same value
          return obj;
        }, {});
      console.log(dataIncome, "data Pendapatan");
      console.log(dataResponse, "data Semua Pendapatan");
      console.log(`barang${dataJasa} is 0`, dataJasa);
      if (dataJasa.jml == 0.0) {
        console.log(`jasa is 0`);
        const text = `Pendapatan ${klinik.nama}, Pada Tanggal ${tanggalInfo.tanggalKemarin}. Belum Terupdate Karena Data VPS Belum Tersedia Pada jam ${tanggalInfo.jamSekarang}`;
        await sendMessage(text);
        return {
          message: `jasa is 0, skipping execution for ${klinik.nama}`,
        };
      } else {
        const dataBulanKlinik = await getDataBulan(klinik.id, klinik.nama); // Gunakan nama klinik
        let idBulanan = 0;

        if (dataBulanKlinik.length > 0) {
          console.log("Data Bulan sudah ada");
          idBulanan = dataBulanKlinik[0];
        } else {
          console.log("menambah data");
          const addBulanan = await handleAddBulanan(klinik.nama, klinik.id); // Gunakan id klinik
          idBulanan = addBulanan;
        }

        // Siapkan omset data
        const omset = {
          pendapatanBarang: dataIncome[`barang${klinikJnsAkunLower}`],
          pendapatanJasa: dataIncome[`jasa${klinikJnsAkunLower}`],
        };

        const cekDataHarian = await getDataHarian(idBulanan.id); // Gunakan nama klinik dan id

        if (cekDataHarian.length > 0) {
          return {
            message: "Data Penjualan Harian sudah Ada",
            data: cekDataHarian,
          };
        } else {
          // POST request untuk setiap klinik
          const result = await axios({
            method: "POST",
            url: "http://202.157.189.177:8080/api/database/rows/table/665/?user_field_names=true",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            data: {
              Judul: `Penjualan ${klinik.nama} Tanggal ${tanggalInfo.tanggalKemarin}`,
              "Id Cabang": klinik.id,
              "Id Penjualan Bulanan": [idBulanan.id],
              "Dari Tanggal": tanggalInfo.tanggalKemarinISO,
              "Sampai Tanggal": tanggalInfo.tanggalKemarinISO,
              "Penjualan Barang": dataBarang.jml || "0.00",
              "Penjualan Jasa": dataJasa.jml || "0.00",
              Diskon: 0,
              "Created At": new Date().toISOString(),
            },
          });
          const text = `Pendapatan ${klinik.nama}, Pada Tanggal ${tanggalInfo.tanggalKemarin}. Telah Berhasil Di Tambahkan Ke Baserow Pada jam ${tanggalInfo.jamSekarang}`;
          await sendMessage(text);
          return {
            message: "Data successfully inserted",
            data: result.data,
          };
        }
      }
    });

    const results = await Promise.all(promises);
    res.json({
      message: "Data successfully processed for all cabang",
      results: results,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};
module.exports = {
  getPendapatan,
  storeHarian,
};
