const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/TirtayasaController.js");

const router = express.Router();

router.get("/tirtayasa/pendapatan", getPendapatan);
router.get("/tirtayasa/pendapatan/harian/store", storeHarian);

module.exports = router;
