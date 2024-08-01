const axios = require("axios");
const moment = require("moment");
const { connectionTeluk } = require("../config/Database.js");

require("moment/locale/id"); // Mengimpor bahasa Indonesia untuk moment.js

// Mengatur locale ke bahasa Indonesia
moment.locale("id");

// // Mendapatkan tanggal hari ini
// const tanggalHariIni = moment();

// // Mendapatkan tanggal awal bulan ini
// const tanggalAwalBulan = tanggalHariIni.clone().startOf("month");

// // Mendapatkan tanggal akhir bulan ini
// const tanggalAkhirBulan = tanggalHariIni.clone().endOf("month");

// // Format tanggal awal dan akhir bulan
// const tanggalAwalBulanFormatted = tanggalAwalBulan.format("DD MMMM YYYY");
// const tanggalAkhirBulanFormatted = tanggalAkhirBulan.format("DD MMMM YYYY");

// console.log(`Tanggal awal bulan ini: ${tanggalAwalBulanFormatted}`);
// console.log(`Tanggal akhir bulan ini: ${tanggalAkhirBulanFormatted}`);

// Format YYYY-MM-DD
const formatTanggal = (tanggal) => {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0"); // Bulan mulai dari 0
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
};

const getTanggalInfo = async () => {
  const queryGetTanggalHariIni = `SELECT CURDATE() AS today`;

  try {
    const [resultTanggalHariIni] = await connectionTeluk.query(
      queryGetTanggalHariIni
    );

    // Mendapatkan tanggal hari ini dari hasil query
    const tanggalHariIni = moment(resultTanggalHariIni[0].today);

    // Mendapatkan tanggal sehari sebelum tanggal hari ini
    const tanggalKemarin = tanggalHariIni.clone().subtract(1, "days");

    // Mendapatkan tanggal awal bulan ini
    const tanggalAwalBulan = tanggalHariIni.clone().startOf("month");

    // Mendapatkan tanggal akhir bulan ini
    const tanggalAkhirBulan = tanggalHariIni.clone().endOf("month");

    // Mendapatkan jam sekarang
    const jamSekarang = moment().format("HH:mm");

    // Format tanggal awal dan akhir bulan
    const tanggalAwalBulanFormatted = tanggalAwalBulan.format("YYYY-MM-DD");
    const tanggalAkhirBulanFormatted = tanggalAkhirBulan.format("YYYY-MM-DD");
    const tanggalKemarinFormatted = tanggalKemarin.format("DD MMMM YYYY");
    const tanggalKemarinISOFormatted = tanggalKemarin.format("YYYY-MM-DD");
    const bulan = tanggalKemarin.format("MMMM");
    const tahun = tanggalKemarin.format("YYYY");

    const tanggalInfo = {
      tanggalHariIni: tanggalHariIni.format("DD MMMM YYYY"),
      tanggalKemarin: tanggalKemarinFormatted,
      tanggalKemarinISO: tanggalKemarinISOFormatted,
      tanggalAwalBulan: tanggalAwalBulanFormatted,
      tanggalAkhirBulan: tanggalAkhirBulanFormatted,
      bulan: bulan,
      tahun: tahun,
      jamSekarang: jamSekarang,
    };

    return tanggalInfo;
  } catch (error) {
    throw new Error(error.message);
  }
};

const filterPendapatanBulanan = (dataArray, judulArray) => {
  if (!Array.isArray(dataArray) || !Array.isArray(judulArray)) {
    throw new Error("Parameter harus berupa array.");
  }

  const lowerCaseJudulArray = judulArray.map((judul) => judul.toLowerCase());

  return dataArray.filter((item) =>
    lowerCaseJudulArray.includes(item.Judul.toLowerCase())
  );
};

const getCurrentDateArray = (parameter = null) => {
  const months = [
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

  const today = new Date();
  const date = today.getDate();
  const month = months[today.getMonth()];
  const year = today.getFullYear();

  switch (parameter) {
    case "tanggal":
      return date.toString();
    case "bulan":
      return month;
    case "tahun":
      return year.toString();
    default:
      return [date.toString(), month, year.toString()];
  }
};

const getTanggalInterval = (bulan, tahun) => {
  const bulanMap = {
    Januari: 1,
    Februari: 2,
    Maret: 3,
    April: 4,
    Mei: 5,
    Juni: 6,
    Juli: 7,
    Agustus: 8,
    September: 9,
    Oktober: 10,
    November: 11,
    Desember: 12,
  };
  const month = bulanMap[bulan];
  const year = parseInt(tahun);

  if (!month || isNaN(year)) {
    throw new Error("Bulan atau tahun tidak valid");
  }
  const tanggalMulai = new Date(year, month - 1, 1);
  const tanggalBerakhir = new Date(year, month, 0);

  const formatTanggal = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  return {
    tanggalMulai: formatTanggal(tanggalMulai),
    tanggalBerakhir: formatTanggal(tanggalBerakhir),
  };
};

function encodeFilter(id, bulan, tahun) {
  const filters = {
    filter_type: "AND",
    filters: [
      {
        type: "link_row_has",
        field: "Id Cabang",
        value: id,
      },
      {
        type: "contains",
        field: "Tahun",
        value: tahun,
      },
      {
        type: "contains",
        field: "Bulan",
        value: bulan,
      },
    ],
    groups: [],
  };

  const encodedFilters = encodeURIComponent(JSON.stringify(filters));
  return `user_field_names=true&filters=${encodedFilters}`;
}

function encodeFilterHarian(id) {
  // Contoh penggunaan
  const filters = [
    {
      type: "link_row_has",
      field: "Id Penjualan Bulanan",
      value: `${id}`,
    },
    {
      type: "date_is",
      field: "Dari Tanggal",
      value: "Asia/Jakarta??yesterday",
    },
  ];
  const filterObject = {
    filter_type: "AND",
    filters: filters,
    groups: [],
  };

  const encodedFilters = encodeURIComponent(JSON.stringify(filterObject));
  return `user_field_names=true&filters=${encodedFilters}`;
}
const getDataHarian = async (idBulanan, judul) => {
  const param = encodeFilterHarian(idBulanan);
  console.log(param, "param harian");
  try {
    const response = await axios({
      method: "GET",
      url: "http://202.157.189.177:8080/api/database/rows/table/665/?" + param,
      headers: {
        Authorization: "Token wFcCXiNy1euYho73dBGwkPhjjTdODzv6",
      },
    });
    console.log(response.data.results, "data harian");
    console.log(idBulanan, "idbulan");
    return response.data.results; // Kembalikan hasil
  } catch (error) {
    console.error("Error saat mengambil data Harian:", error.message);
    throw error; // Lempar error untuk ditangkap di storeHarian
  }
};
const getDataBulan = async (id, namaKlinik) => {
  const tanggalInfo = await getTanggalInfo();
  const bulan = tanggalInfo.bulan;
  const tahun = tanggalInfo.tahun;
  const param = encodeFilter(id, bulan, tahun);
  // console.log(param);
  try {
    const response = await axios({
      method: "GET",
      url: "http://202.157.189.177:8080/api/database/rows/table/663/?" + param,

      headers: {
        Authorization: "Token wFcCXiNy1euYho73dBGwkPhjjTdODzv6",
      },
    });

    console.log("data Bulan Coy", response.data.results);
    return response.data.results; // Kembalikan hasil
  } catch (error) {
    console.error("Error saat mengambil data bulanan:", error.message);
    throw error; // Lempar error untuk ditangkap di storeHarian
  }
};

const handleAddBulanan = async (namaKlinik, idCabang) => {
  try {
    const tanggalInfo = await getTanggalInfo();
    const { bulan, tahun, tanggalAwalBulan, tanggalAkhirBulan } = tanggalInfo;

    const data = {
      Judul: `Penjualan ${namaKlinik} ${bulan} ${tahun}`,
      "Id Cabang": [idCabang], // Pastikan idCabang adalah string
      Tahun: [`${tahun}`], // Pastikan tahun adalah string
      Bulan: [`${bulan}`], // Pastikan bulan adalah string
      "Tanggal Mulai": tanggalAwalBulan, // Format YYYY-MM-DD
      "Tanggal Berakhir": tanggalAkhirBulan, // Format YYYY-MM-DD
      "Target Omset": 0, // Target sebagai angka
    };

    console.log(data, "Data being sent");

    const response = await axios({
      method: "POST",
      url: "http://202.157.189.177:8080/api/database/rows/table/663/?user_field_names=true",
      headers: {
        Authorization: "Token wFcCXiNy1euYho73dBGwkPhjjTdODzv6",
        "Content-Type": "application/json",
      },
      data: data,
    });

    console.log("Data successfully saved", response.data);

    // Mengembalikan data yang baru ditambahkan
    return response.data; // Kembalikan data dari server
  } catch (error) {
    if (error.response) {
      console.error("Server responded with an error:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
};

const sendMessage = async (text) => {
  try {
    const fetch = await import("node-fetch");

    const response = await fetch.default(
      "https://api.telegram.org/bot6823587684:AAE4Ya6Lpwbfw8QxFYec6xAqWkBYeP53MLQ/sendMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: "6546310886",

          text: text,
          parse_mode: "html",
        }),
      }
    );

    // Cek apakah respons dari fetch adalah OK (status code 200)
    if (response.ok) {
      console.log("berhasilllllll");
    } else {
      console.log("gagalllllll");
    }
  } catch (error) {
    // Tangani kesalahan yang terjadi selama fetch
    console.error("Error:", error);
    // alert("Terjadi kesalahan. Silakan coba lagi.");
  }
};
module.exports = {
  filterPendapatanBulanan,
  getCurrentDateArray,
  getTanggalInterval,
  encodeFilter,
  getDataBulan,
  getDataHarian,
  handleAddBulanan,
  sendMessage,
  getTanggalInfo,
};
