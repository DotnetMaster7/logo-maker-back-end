const express                  = require("express");
const router                   = express.Router();
const { newSessionController } = require("../controller/user");

router.get("/new-session", newSessionController);

module.exports = router;
