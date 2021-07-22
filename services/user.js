const { randomString } = require("../utils/common-functions");
/**
 * EXPORT FUNCTIONS
 */
exports.newSessionService = newSessionService;

/**
 * FUNCTION DEFINITIONS
 */
async function newSessionService(req) {
  try {
    const sessionId = await randomString(64);

    return new Promise((resolve, reject) => {
      con.query(
        `
        INSERT INTO user (user_session)
        VALUES (?)
      `,
        [sessionId],
        (err, result) => {
          console.log(err, result)
          resolve(sessionId);
        }
      );
    })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });
  } catch (error) {
    return "";
  }
}
