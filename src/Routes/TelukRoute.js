const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/TelukController.js");

const router = express.Router();

router.get("/teluk/pendapatan", getPendapatan);
router.get("/teluk/pendapatan/harian/store", storeHarian);

module.exports = router;
