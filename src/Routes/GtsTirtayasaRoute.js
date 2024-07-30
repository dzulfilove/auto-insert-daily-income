const express = require("express");
const {
  getPendapatan,
  // indexBulanan,
  // storeBulanan,
  storeHarian,
  // updateBulanan,
  // run,
} = require("../controllers/GTSTirtayasaController");

const router = express.Router();

router.get("/gts-tirtayasa/pendapatan", getPendapatan);
// router.get("/tirtayasa/pendapatan/bulanan", indexBulanan);
// router.get("/tirtayasa/pendapatan/bulanan/store", storeBulanan);
// router.get("/tirtayasa/pendapatan/bulanan/update", updateBulanan);
router.get("/gts-tirtayasa/pendapatan/harian/store", storeHarian);
// router.get("/kemiling/run", run);

module.exports = router;
