const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/GadingController.js");

const router = express.Router();

router.get("/gading/pendapatan", getPendapatan);
router.get("/gading/pendapatan/harian/store", storeHarian);

module.exports = router;
