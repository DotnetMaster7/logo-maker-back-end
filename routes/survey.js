const express              = require("express");
const router               = express.Router();
const { surveyController } = require("../controller/survey");

router.post("/", surveyController);

module.exports = router;
