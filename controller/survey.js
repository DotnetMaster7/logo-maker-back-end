const { surveyService }  = require("../services/survey");

exports.surveyController = surveyController;

async function surveyController(req, res) {
  const response = await surveyService(req);

  console.log(response)
  res.json(response);
}
