const { newSessionService }  = require("../services/user");

exports.newSessionController = newSessionController;

async function newSessionController(req, res) {
  const response = await newSessionService(req);

  if (response) {
    res.cookie("LOGO_MAKER_SESSION", response, {
      maxAge: 1000 * 60 * 60 * 24 /* expire a week from today */,
      httpOnly: true /* document.cookie doesn't return this cookie */,
    });
  }
  res.json({ statusCode: 200, sessionId: response });
}
