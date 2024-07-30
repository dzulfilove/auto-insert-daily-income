const axios = require("axios");

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

// Mendapatkan tanggal hari ini
const tanggalHariIni = new Date();

// Mendapatkan tahun dan bulan dari tanggal hari ini
const tahun = tanggalHariIni.getFullYear();
const bulanIndex = tanggalHariIni.getMonth(); // Bulan mulai dari 0
const bulan = bulanIndonesia[bulanIndex];

// Mendapatkan tanggal awal bulan ini
const tanggalAwalBulan = new Date(tahun, bulanIndex, 1); // 1 hari dari bulan ini

// Mendapatkan tanggal akhir bulan ini
const tanggalAkhirBulan = new Date(tahun, bulanIndex + 1, 0); // 0 hari dari bulan berikutnya, yang berarti tanggal terakhir bulan ini

// Format YYYY-MM-DD
const formatTanggal = (tanggal) => {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0"); // Bulan mulai dari 0
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
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

function encodeFilter(id, namaKlinik) {
  const filter = {
    user_field_names: true,
    filters: {
      filter_type: "AND",
      filters: [
        {
          type: "contains",
          field: "Judul",
          value: `Penjualan ${namaKlinik} ${bulan} ${tahun}`,
        },
        // {
        //   type: "link_row_contains",
        //   field: "Id Cabang",
        //   value: `${id}`,
        // },
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
    },
  };
  const params = new URLSearchParams();
  params.append("user_field_names", filter.user_field_names);

  // Mengubah filter menjadi string JSON
  const filtersJson = JSON.stringify(filter.filters);
  params.append("filters", filtersJson);

  return params.toString();
}

function encodeFilterHarian(id) {
  const filter = {
    user_field_names: true,
    filters: {
      filter_type: "AND",
      filters: [
        {
          type: "date_is",
          field: "Dari Tanggal",
          value: "Asia/Jakarta??yesterday",
        },
        {
          type: "date_is",
          field: "Sampai Tanggal",
          value: "Asia/Jakarta??yesterday",
        },
        {
          type: "link_row_contains",
          field: "Id Penjualan Bulanan",
          value: `${id}`,
        },
      ],
      groups: [],
    },
  };

  const params = new URLSearchParams();
  params.append("user_field_names", filter.user_field_names);

  // Mengubah filter menjadi string JSON
  const filtersJson = JSON.stringify(filter.filters);
  params.append("filters", filtersJson);

  return params.toString();
}
const getDataHarian = async (idBulanan) => {
  const param = encodeFilterHarian(idBulanan);
  console.log(param);
  try {
    const response = await axios({
      method: "GET",
      url: "http://202.157.189.177:8080/api/database/rows/table/665/?" + param,

      headers: {
        Authorization: "Token wFcCXiNy1euYho73dBGwkPhjjTdODzv6",
      },
    });
    return response.data.results; // Kembalikan hasil
  } catch (error) {
    console.error("Error saat mengambil data Harian:", error.message);
    throw error; // Lempar error untuk ditangkap di storeHarian
  }
};
const getDataBulan = async (id, namaKlinik) => {
  const param = encodeFilter(id, namaKlinik);
  console.log(param);
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
    const data = {
      Judul: `Penjualan ${namaKlinik} ${bulan} ${tahun}`,
      "Id Cabang": [idCabang], // Pastikan idCabang adalah string
      Tahun: [`${tahun}`], // Pastikan tahun adalah string
      Bulan: [`${bulan}`], // Pastikan bulan adalah string
      "Tanggal Mulai": formatTanggal(tanggalAwalBulan), // Format YYYY-MM-DD
      "Tanggal Berakhir": formatTanggal(tanggalAkhirBulan), // Format YYYY-MM-DD
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
    const response = await fetch(
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
};
