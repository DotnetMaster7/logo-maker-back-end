const express  = require("express");
const router   = express.Router();

const { 
  getLogoController, 
  getConceptController,
  logoDownloadController,
}              = require("../controller/logo");

router.post('/chars', getLogoController); // TODO: Change URL to something more semantic

router.post('/concepts', getConceptController);

router.post('/download', logoDownloadController);

router.get('/:filename', (req, res) => {
  return res.download('logos.zip');
});

module.exports = router;