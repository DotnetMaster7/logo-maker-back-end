/**
 * MODULES
 */
const express = require("express");
const router  = express.Router();

/**
 * ROUTES
 */
const user    = require("./user");
const logo    = require("./logo");
const survey  = require("./survey");

router.use("/user", user);
router.use("/logo", logo);
router.use("/survey", survey);

module.exports = router;