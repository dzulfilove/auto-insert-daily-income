const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/PanjangController.js");

const router = express.Router();

router.get("/panjang/pendapatan", getPendapatan);
router.get("/panjang/pendapatan/harian/store", storeHarian);

module.exports = router;
