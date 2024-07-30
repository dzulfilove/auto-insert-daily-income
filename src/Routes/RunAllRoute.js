const express = require("express");
const { RunAll } = require("../controllers/sendAll");

const router = express.Router();

router.get("/run", RunAll);

module.exports = router;
