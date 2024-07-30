const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/TuguController.js");

const router = express.Router();

router.get("/tugu/pendapatan", getPendapatan);
router.get("/tugu/pendapatan/harian/store", storeHarian);

module.exports = router;
