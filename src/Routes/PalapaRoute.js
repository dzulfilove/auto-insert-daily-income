const express = require("express");
const {
  getPendapatan,
  storeHarian,
} = require("../controllers/PalapaController.js");

const router = express.Router();

router.get("/palapa/pendapatan", getPendapatan);
router.get("/palapa/pendapatan/harian/store", storeHarian);

module.exports = router;
