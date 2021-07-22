/**
 * MODULES
 */
const nodemailer = require("nodemailer");
const async = require("async");

/**
 * EXPORT FUNCTIONS
 */
exports.surveyService = surveyService;

/**
 * FUNCTION DEFINITIONS
 */

function surveyService(req) {
  const { email, experience, mostLiked, improvements } = req.body;
  const session_id = req.headers['set-cookie'][0].split("=")[1];

  return new Promise((resolve, reject) => {
    async.series([saveUserDetails, sendEmail], (error, result) => {
      return resolve({ status: 200 });
    });
  })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return error;
    });

  function saveUserDetails(cb) {
    con.query(
      `
      INSERT INTO survey (session_id, email, experience, most_like, improvement)
      VALUES (?, ?, ?, ?, ?)
    `,
      [session_id, email, experience, mostLiked, improvements],
      (err, result) => {
        if (err) cb(null);
        else cb(null);
      }
    );
  }

  function sendEmail(cb) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // secure:true for port 465, secure:false for port 587
      auth: {
        user: "dopelogos123@gmail.com", // TODO replace with support@logomator.com email address
        pass: "Awesomelogos123!",
      },
    });

    // setup email data with unicode symbols
    const mailOptions = {
      from: "noreply@logomator.com", // sender address
      to: email, // list of receivers
      subject: `Survey response from ${email}`, // Subject line
      html: `<h1 style="color:black;">Experience</h1> <br />
              <p style="color: black;">${experience}</p> <br /> 
              <h1 style="color:black;">Most liked</h1> <br />
              <p style="color: black;">${mostLiked}</p> <br />
              <h1 style="color:black;">Improvements</h1> <br />
              <p style="color: black;">${improvements}</p>`, // plain text body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      cb(null);
      if (error) {
        console.log("Error:", error);
      }
      console.log("Message %s sent: %s", info);
    });
  }
}
