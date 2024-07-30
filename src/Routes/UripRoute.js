const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/UripController.js");

const router = express.Router();

router.get("/urip/pendapatan", getPendapatan);
router.get("/urip/pendapatan/harian/store", storeHarian);

module.exports = router;
