const axios = require("axios");
const { connectionUrip } = require("../config/Database.js");
const {
  getDataBulan,
  getDataHarian,
  handleAddBulanan,
  sendMessage,
} = require("../functions/Utils.js");
const fetch = require("node-fetch");

const port = 5005;
const token = "wFcCXiNy1euYho73dBGwkPhjjTdODzv6";

const dataKlinik = [
  {
    nama: "Klinik Kosasih Rawat Inap Urip",
    id: 9,
    akun: "",
    jnsAkun: "Klinik",
  },
  {
    nama: "Laboratorium Kosasih Urip",
    id: 10,
    akun: "",
    jnsAkun: "Lab",
  },
  {
    nama: "Klinik Rawat Inap Kosasih Urip (Gigi)",
    id: 11,
    akun: "",
    jnsAkun: "Gigi",
  },
];
const namaKlinik = "Klinik Kosasih Rawat Inap Urip";
const namaLab = "Laboratorium Kosasih Urip";
const namaGigi = "Klinik Rawat Inap Kosasih Urip (Gigi)";
const idCabang = [9, 10, 11];

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

const tanggalHariIni = new Date();

// Mengurangi satu hari dari tanggal hari ini untuk mendapatkan tanggal kemarin
tanggalHariIni.setDate(tanggalHariIni.getDate() - 1);

// Mendapatkan hari, tahun, dan bulan dari tanggal kemarin
const hari = tanggalHariIni.getDate(); // Mendapatkan tanggal (1-31)
const tahun = tanggalHariIni.getFullYear(); // Mendapatkan tahun
const bulanIndex = tanggalHariIni.getMonth(); // Bulan mulai dari 0
const bulan = String(bulanIndex + 1).padStart(2, "0"); // Mendapatkan bulan (1-12)

// Mendapatkan jam dan menit dari tanggal hari ini
const jam = String(tanggalHariIni.getHours()).padStart(2, "0");
const menit = String(tanggalHariIni.getMinutes()).padStart(2, "0");

const tanggalFormat = `${tahun}-${bulan}-${hari}`;
const bulanString = bulanIndonesia[bulanIndex];
const waktuFormat = `${jam}:${menit}`;
const getPendapatan = async (req, res) => {
  const idPendapatanBarangKlinik = 401.001;
  const idPendapatanJasaKlinik = 402.001;
  const idPendapatanBarangLab = 401.007;
  const idPendapatanJasaLab = 402.007;
  const idPendapatanBarangGigi = 401.004;
  const idPendapatanJasaGigi = 402.004;

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

  const queryGetPendapatanBarangLab = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
      AND DATE(jtdate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      AND accountid = '${idPendapatanBarangLab}'
      AND division IN ('1');`;

  const queryGetPendapatanJasaLab = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
      AND DATE(jtdate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      AND accountid = '${idPendapatanJasaLab}'
      AND division IN ('1');`;

  const queryGetPendapatanBarangGigi = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
      AND DATE(jtdate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      AND accountid = '${idPendapatanBarangGigi}'
      AND division IN ('1');`;

  const queryGetPendapatanJasaGigi = `
    SELECT SUM(debit - credit) AS balance
    FROM journaltrans
    WHERE approved = 1
      AND DATE(jtdate) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      AND accountid = '${idPendapatanJasaGigi}'
      AND division IN ('1');`;

  try {
    const [resultPendapatanBarangKlinik] = await connectionUrip.query(
      queryGetPendapatanBarangKlinik
    );
    const [resultPendapatanJasaKlinik] = await connectionUrip.query(
      queryGetPendapatanJasaKlinik
    );
    const [resultPendapatanBarangLab] = await connectionUrip.query(
      queryGetPendapatanBarangLab
    );
    const [resultPendapatanJasaLab] = await connectionUrip.query(
      queryGetPendapatanJasaLab
    );
    const [resultPendapatanBarangGigi] = await connectionUrip.query(
      queryGetPendapatanBarangGigi
    );
    const [resultPendapatanJasaGigi] = await connectionUrip.query(
      queryGetPendapatanJasaGigi
    );

    const pendapatan = {
      barangKlinik: Math.abs(resultPendapatanBarangKlinik[0].balance) || 0,
      jasaKlinik: Math.abs(resultPendapatanJasaKlinik[0].balance) || 0,
      barangLab: Math.abs(resultPendapatanBarangLab[0].balance) || 0,
      jasaLab: Math.abs(resultPendapatanJasaLab[0].balance) || 0,
      barangGigi: Math.abs(resultPendapatanBarangGigi[0].balance) || 0,
      jasaGigi: Math.abs(resultPendapatanJasaGigi[0].balance) || 0,
    };

    res.json(pendapatan);
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
};

const storeHarian = async (req, res) => {
  try {
    let mess = "";
    const promises = dataKlinik.map(async (klinik) => {
      // Fetch data untuk setiap akun
      const response = await fetch(
        `http://202.157.189.177:5005/urip/pendapatan/${klinik.akun}`
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
        const text = `Pendapatan ${klinik.nama}, Pada Tanggal ${hari} ${bulanString} ${tahun}. Belum Terupdate Karena Data VPS Belum Tersedia Pada jam ${waktuFormat}`;
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

        const cekDataHarian = await getDataHarian(klinik.nama, idBulanan.id); // Gunakan nama klinik dan id

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
              Judul: `Penjualan ${klinik.nama} Tanggal ${hari} ${bulanString} ${tahun}`,
              "Id Cabang": klinik.id,
              "Id Penjualan Bulanan": [idBulanan.id],
              "Dari Tanggal": tanggalFormat,
              "Sampai Tanggal": tanggalFormat,
              "Penjualan Barang": dataBarang.jml || "0.00",
              "Penjualan Jasa": dataJasa.jml || "0.00",
              Diskon: 0,
              "Created At": new Date().toISOString(),
            },
          });
          const text = `Pendapatan ${klinik.nama}, Pada Tanggal ${hari} ${bulanString} ${tahun}. Telah Berhasil Di Tambahkan Ke Baserow Pada jam ${waktuFormat}`;
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
