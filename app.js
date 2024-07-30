const express = require("express");
// const cors = require("cors");

const KemilingRoute = require("./src/Routes/KemilingRoute");
const GadingRoute = require("./src/Routes/GadingRoute");
const BugisRoute = require("./src/Routes/BugisRoute");
const RajabasaRoute = require("./src/Routes/RajabasaRoute");
const UripRoute = require("./src/Routes/UripRoute");
const TuguRoute = require("./src/Routes/TuguRoute");
const TirtayasaRoute = require("./src/Routes/TirtayasaRoute");
const PanjangRoute = require("./src/Routes/PanjangRoute");
const TelukRoute = require("./src/Routes/TelukRoute");
const PalapaRoute = require("./src/Routes/PalapaRoute");
const RunRoute = require("./src/Routes/RunAllRoute");
const GtsTirtaRoute = require("./src/Routes/GtsTirtayasaRoute");
const GtsKemilingRoute = require("./src/Routes/GtsKemilingRoute");

const port = 5005;
const cors = require("cors");
const app = express();

app.use(cors());
// app.use(cors());
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

app.listen(port, () => {
  console.log(`Server berjalan di port: ${port}`);
});
