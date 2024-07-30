const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/BugisController.js");

const router = express.Router();

router.get("/bugis/pendapatan", getPendapatan);
router.get("/bugis/pendapatan/harian/store", storeHarian);

module.exports = router;
