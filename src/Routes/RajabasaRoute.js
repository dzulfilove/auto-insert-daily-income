const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/RajabasaController.js");

const router = express.Router();

router.get("/rajabasa/pendapatan", getPendapatan);
router.get("/rajabasa/pendapatan/harian/store", storeHarian);

module.exports = router;
