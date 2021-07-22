const {
  getLogoService,
  getConceptService,
  logoDownloadService
}                              = require("../services/logo");

exports.getLogoController      = getLogoController;
exports.getConceptController   = getConceptController;
exports.logoDownloadController = logoDownloadController;

async function getLogoController(req, res) {

  const response = await getLogoService(req);

  res.set({
    'Content-Type': 'image/svg+xml',
    Vary: 'Accept-Encoding',
  }).json(response)
}

async function getConceptController(req, res) {
  const response = await getConceptService(req);
  // Randomize logos TODO refactor this
  // for (let i = logos.length; i; i++) {
  //   const j = Math.floor(Math.random() * i);
  //   [logos[i - 1], logos[j]] = [logos[j], logos[i - 1]];
  // }

  // const returnedLogos = [];
  //
  // for (let i = 0; i < 6; i++) {
  //   returnedLogos.push(logos[i].generate());
  // }
  res.set({
    'Content-Type': 'image/svg+xml',
    Vary: 'Accept-Encoding',
  }).send(response)
}

async function logoDownloadController(req, res) {
  const response = await logoDownloadService(req);
  res.json({status: 200, blob: response})
  // res.download('logos.zip');
}