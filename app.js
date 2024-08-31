const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");

const KemilingRoute = require("./src/Routes/KemilingRoute");
const GtsKemilingRoute = require("./src/Routes/GtsKemilingRoute");
const GtsTirtaRoute = require("./src/Routes/GtsTirtayasaRoute");
const GadingRoute = require("./src/Routes/GadingRoute");
const BugisRoute = require("./src/Routes/BugisRoute");
const RajabasaRoute = require("./src/Routes/RajabasaRoute");
const RunRoute = require("./src/Routes/RunAllRoute");
const UripRoute = require("./src/Routes/UripRoute");
const TuguRoute = require("./src/Routes/TuguRoute");
const TirtayasaRoute = require("./src/Routes/TirtayasaRoute");
const PanjangRoute = require("./src/Routes/PanjangRoute");
const TelukRoute = require("./src/Routes/TelukRoute");
const PalapaRoute = require("./src/Routes/PalapaRoute");

const port = 5005;
const app = express();

app.use(cors());
app.use(express.json());

// Menambahkan handler untuk root path
app.get("/", (req, res) => {
  res.send("Selamat datang di server Express!");
});

// Menggunakan route yang telah diimport
app.use(KemilingRoute);
app.use(GtsKemilingRoute);
app.use(GtsTirtaRoute);
app.use(GadingRoute);
app.use(BugisRoute);
app.use(RajabasaRoute);
app.use(RunRoute);
app.use(UripRoute);
app.use(TuguRoute);
app.use(TirtayasaRoute);
app.use(PanjangRoute);
app.use(TelukRoute);
app.use(PalapaRoute);

// Menjadwalkan cron job

const urls = [
  `http://202.157.189.177:5005/bugis/pendapatan/harian/store`,
  `http://202.157.189.177:5005/gading/pendapatan/harian/store`,
  `http://202.157.189.177:5005/kemiling/pendapatan/harian/store`,
  `http://202.157.189.177:5005/palapa/pendapatan/harian/store`,
  `http://202.157.189.177:5005/panjang/pendapatan/harian/store`,
  `http://202.157.189.177:5005/rajabasa/pendapatan/harian/store`,
  `http://202.157.189.177:5005/teluk/pendapatan/harian/store`,
  `http://202.157.189.177:5005/tirtayasa/pendapatan/harian/store`,
  `http://202.157.189.177:5005/tugu/pendapatan/harian/store`,
  `http://202.157.189.177:5005/urip/pendapatan/harian/store`,
  `http://202.157.189.177:5005/gts-kemiling/pendapatan/harian/store`,
  `http://202.157.189.177:5005/gts-tirtayasa/pendapatan/harian/store`,
];

const startTimes = [8, 13, 17, 23]; // Jam mulai 08:00, 13:00, 17:00, dan 23:00

startTimes.forEach((startTime) => {
  urls.forEach((url, index) => {
    const scheduleTime = `${index * 10} ${startTime} * * *`; // Interval 10 menit untuk setiap URL
    cron.schedule(scheduleTime, () => {
      axios
        .get(url)
        .then((response) => {
          console.log(`Success: ${url} at ${startTime}:00 - ${response.data}`);
        })
        .catch((error) => {
          console.error(`Error: ${url} at ${startTime}:00 - ${error.message}`);
        });
    });
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di port: ${port}`);
});
