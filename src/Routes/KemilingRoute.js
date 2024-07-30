const express = require("express");
const {
  getPendapatan,
  // indexBulanan,
  // storeBulanan,
  storeHarian,
  // updateBulanan,
  // run,
} = require("../controllers/KemilingController.js");

const router = express.Router();

router.get("/kemiling/pendapatan", getPendapatan);
// router.get("/kemiling/pendapatan/bulanan", indexBulanan);
// router.get("/kemiling/pendapatan/bulanan/store", storeBulanan);
// router.get("/kemiling/pendapatan/bulanan/update", updateBulanan);
router.get("/kemiling/pendapatan/harian/store", storeHarian);
// router.get("/kemiling/run", run);

module.exports = router;
